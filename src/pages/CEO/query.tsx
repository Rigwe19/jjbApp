import { Http } from '@capacitor-community/http';
import { IonAvatar, IonButton, IonContent, IonFooter, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonNote, IonPage, IonSearchbar, IonTextarea, useIonAlert, useIonLoading } from '@ionic/react';
import { alertCircleOutline, saveOutline } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';

import Toolbar from '../../components/toolbar';
import { useRecoilValue } from 'recoil';
import { urlAtom } from '../../recoil/urlAtom';
import { User, userAtom } from '../../recoil/userAtom';
interface IError {
    name?: boolean;
    query?: boolean;
}
const Query: React.FC = () => {
    const user = useRecoilValue<User>(userAtom);
    const href = useRecoilValue<string>(urlAtom);
    const [names, setNames] = useState([]);
    const [searchNames, setSearchNames] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const isClean = useRef(false);
    const [isFirst, setIsFirst] = useState(true);
    const [present, dismiss] = useIonLoading();
    const [alerted] = useIonAlert();
    const initialState = {
        name: "",
        employee_id: 0,
        query: "",
        surcharge: 0,
    };
    const [state, setState] = useState(initialState);
    const [errors, setErrors] = useState<IError>({
        name: false,
        query: false
    });
    const handleDocumentClick = () => {
        if (searchTerm.length > 0) {
            setSearchTerm("");
        }
    }
    useEffect(() => {
        isClean.current = true;
        document.addEventListener("click", handleDocumentClick);
        present("Loading...");
        Http.request({
            method: "GET",
            url: href + "/api/ceo/get/query",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            }
        }).then(({ data }) => {
            if (isClean.current && data.success) {
                setNames(data.names);
            }
        }).finally(() => {
            dismiss();
        });
        return () => {
            document.removeEventListener("click", handleDocumentClick);
            isClean.current = false;
        }
    }, []);
    useEffect(() => {
        if (searchTerm.length > 0) {
            let result: any = [];
            // setFilter([]);
            if (/\d/.test(searchTerm)) {
                names.forEach(value => {
                    if (value.employee_id.toString().includes(searchTerm)) {
                        result.push(value);
                    }
                });
            } else {
                names.forEach(value => {
                    if (value.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                        result.push(value);
                    }
                });
            }

            setSearchNames(result)
        } else {
            setSearchNames([])
        }
    }, [searchTerm])

    const handleChange = (value: any, key: string) => {
        setState(pv => ({ ...pv, [key]: value }));
    }

    const handleItemClick = (index: number) => {
        setState(pv => ({
            ...pv,
            name: searchNames[index].name,
            employee_id: searchNames[index].id,
        }));
        setSearchTerm("");
    }

    const handleSave = () => {
        let isValid = true;
        let err = {};
        Object.entries(state).forEach(element => {
            // if (typeof element[1] === 'number' && element[1] === 0) {
            //     isValid = false;
            // }
            if (typeof element[1] === 'string' && element[1] === "") {
                isValid = false;
                err[element[0]] = true;
            }
        });
        if (isValid) {
            present("Loading...");
            Http.request({
                method: "POST",
                url: href + "/api/ceo/save/query",
                headers: {
                    'Content-Type': 'application/json',
                    'Data-Type': 'json',
                    'Authorization': 'Bearer ' + user.token
                },
                data: state
            }).then(({ data }) => {
                if (isClean.current && data.success) {
                    setIsFirst(true);
                    setState(initialState);
                    alerted({
                        message: "Saved Successfully",
                        buttons: [
                            {text: "Okay", role: "cancel"}
                        ]
                    });
                }
            }).finally(() => {
                dismiss();
            });
        } else {
            setErrors(err);
            setIsFirst(false);
        }
    }
    return (
        <IonPage>
            <Toolbar title="Query Employee" />
            <IonContent className="ion-padding">
                <div className=''>
                    <IonSearchbar placeholder='Search Employees' value={searchTerm} onIonChange={e => setSearchTerm(e.detail.value)} />
                    <div className='relative'>
                        <div className="border rounded shadow -mt-2 mx-[8px] absolute top-0 left-0 right-0 z-[110]">
                            {searchNames.map((value, index) => (<IonItem key={value.id} button onClick={() => handleItemClick(index)}>
                                <IonAvatar slot="start">
                                    <IonImg src={`${href}/${value.passport}`} />
                                </IonAvatar>
                                <IonLabel>
                                    <p>{value.name}</p>
                                </IonLabel>
                            </IonItem>))}
                        </div>
                    </div>
                </div>
                <IonItem fill='solid'>
                    <IonLabel position='stacked'>Employee Name</IonLabel>
                    <IonInput value={state.name} readonly />
                    {!isFirst && errors.name && <>
                        <IonNote slot="helper" color="danger">Employee Name cannot be empty</IonNote>
                        <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                    </>}
                </IonItem>
                <IonItem fill='solid' className='my-2'>
                    <IonLabel position='stacked'>Query</IonLabel>
                    <IonTextarea value={state.query} onIonChange={e => handleChange(e.detail.value, "query")} />
                    {!isFirst && errors.query && <>
                        <IonNote slot="helper" color="danger">Query cannot be empty</IonNote>
                        <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                    </>}
                </IonItem>
                <IonItem fill='solid'>
                    <IonLabel position='stacked'>Surcharge</IonLabel>
                    <IonInput value={state.surcharge || 0} onIonChange={e => handleChange(parseInt(e.detail.value), "surcharge")} />
                </IonItem>
            </IonContent>
            <IonFooter>
                <IonButton color='green' expand="block" onClick={handleSave}>
                    <IonIcon icon={saveOutline} slot="start" />
                    Save
                </IonButton>
            </IonFooter>
        </IonPage>
    );
};

export default Query;