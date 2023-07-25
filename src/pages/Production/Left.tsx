import { Http } from '@capacitor-community/http';
import { IonButton, IonContent, IonFooter, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonNote, IonPage, IonSelect, IonSelectOption, IonToggle, useIonLoading, useIonToast } from '@ionic/react';
import { alertCircleOutline } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';

import { FilePicker } from '@robingenz/capacitor-file-picker';
import Toolbar from '../../components/toolbar';
import { useRecoilValue } from 'recoil';
import { urlAtom } from '../../recoil/urlAtom';
import { User, userAtom } from '../../recoil/userAtom';

interface ICuts {
    id: number;
    date: string,
    type_id: number;
    cut: number;
    employee_id: number;

}
const Left: React.FC = () => {
    const user = useRecoilValue<User>(userAtom);
    const href = useRecoilValue<string>(urlAtom);
    const isClean = useRef(false);
    const [isFirst, setIsFirst] = useState(true);
    const [types, setTypes] = useState([]);
    const isValid = useRef(false);
    const result = useRef<any>({});
    const [toasted] = useIonToast();
    const [cuts, setCuts] = useState<ICuts>({
        id: 0,
        date: "",
        type_id: 0,
        cut: 0,
        employee_id: 0,
    });
    const [message, setMessage] = useState("");
    const [show, hide] = useIonLoading();
    const [state, setState] = useState({
        id: 0,
        type_id: 0,
        left: 0,
        damages: 0,
    })
    // let { setState, state, reset, item } = useIonFormState({

    // });
    const set = {
        type_id: { name: "Product Type", type: "select" },
        left: { name: "Number of Bread Baked", type: "number", key: "type", inputmode: "numeric" },
        // date: { name: "Employee Date of Birth", type: "date" },
    }
    const [fieldSet, setFieldSet] = useState<any>(set);
    useEffect(() => {
        isClean.current = true;
        show("Loading Attendance");
        Http.request({
            method: "GET",
            url: href + "/api/get/production/lefts",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            }
        }).then(({ data }) => {
            if (isClean.current && data.success) {
                setTypes(data.types);
                // setFilter(data.customers);
            }
        }).finally(() => {
            hide();
        });
        return () => {
            isClean.current = false;
        }
    }, []);
    useEffect(() => {
        isClean.current = true;
        if (state.type_id !== 0) {
            Http.request({
                method: "GET",
                url: href + "/api/get/production/cutted/" + state.type_id,
                headers: {
                    'Content-Type': 'application/json',
                    'Data-Type': 'json',
                    'Authorization': 'Bearer ' + user.token
                }
            }).then(({ data }) => {
                if (isClean.current && data.success) {
                    setCuts({ ...data.cuts });
                } else if (isClean.current && !data.success) {
                    setCuts({ ...data.cuts });
                }
            });
        }

        return () => {
            isClean.current = false;
        }
    }, [state.type_id])

    const handleSubmit = () => {
        isValid.current = true;
        Object.keys(state).forEach((element: any) => {
            if (state[element] === 0) {
                isValid.current = false;
                setIsFirst(false);
            }
        });
        if (isValid.current) {
            show("Saving...")
            Http.request({
                method: "POST",
                url: href + "/api/production/add/lefts",
                headers: {
                    'Content-Type': 'application/json',
                    'Data-Type': 'json',
                    'Authorization': 'Bearer ' + user.token
                },
                data: state
            }).then(({ data }) => {
                if (data.success) {
                    // setShowModal(false);
                    // setCustomer(data.customers);
                    setIsFirst(true);
                    setState({
                        id: 0,
                        type_id: 0,
                        left: 0,
                        damages: 0,
                    });
                    // reset();
                }
            }).finally(() => {
                hide();
            });
        } else {
            toasted("Some field(s) can not be empty!", 3000);
        }
    }
    const select = async () => {
        let image: any[] = [];
        result.current = await FilePicker.pickFiles({
            types: ['image/*'],
            multiple: false,
            readData: true
        });
        result.current.files.forEach((element: any) => {
            setState({...state, passport: "data:" + element.mimeType + ";base64," + element.data});
        });
    }
    return (
        <IonPage>
            <Toolbar title="Bread Left Production" />
            <IonContent className="ion-padding">
                <div className="h-[30vh] w-full flex justify-center items-center">
                    <IonImg alt='brand' className='w-32 h-32 rounded-full border' />
                </div>
                {/* {Object.keys(state).map((key: any) => {
                    if (Object.keys(fieldSet).includes(key)) {
                        return (
                            <div className="form mb-1" key={key}>
                                {item({
                                    name: key,
                                    label: fieldSet[key].name,
                                    // override default Label renderer
                                    renderLabel: (props) => (
                                        <IonLabel color="medium" position="floating">
                                            {props.label}
                                        </IonLabel>
                                    ),
                                    renderContent: (props) => (
                                        <>
                                            {(fieldSet[key].type === "number") && <IonInput type={fieldSet[key].type} {...props} inputmode={fieldSet[key].inputmode} />}
                                            {fieldSet[key].type === "select" && <IonSelect interface='action-sheet' {...props}>
                                                <IonSelectOption>Select {fieldSet[key].name}</IonSelectOption>
                                                {key === "type_id" && types.map(index => {
                                                    return (
                                                        <IonSelectOption key={index.id} value={parseInt(index.id)}>{index.type}</IonSelectOption>
                                                    )
                                                })}
                                            </IonSelect>}

                                            {!isFirst && (state[key] === 0) && <>
                                                <IonNote slot="helper" color="red">{fieldSet[key].name} is a required field</IonNote>
                                                <IonIcon slot="end" icon={alertCircleOutline} color="red" />
                                            </>}
                                            {Object.keys(cuts).length === 0 && key === "type_id" && <>
                                                <IonNote slot='helper' color='red'>this bread was not cut today</IonNote>
                                            </>}
                                            {!isFirst && state[key] > 0 && <IonIcon slot="end" icon={checkmarkCircleOutline} color="green" />}
                                        </>),
                                })}</div>)
                    }

                })} */}
                <IonItem fill='solid' className='mb-1'>
                    <IonLabel color='medium' position='floating'>Product Type</IonLabel>
                    <IonSelect interface='action-sheet' value={state.type_id} onIonChange={e => setState({ ...state, type_id:e.detail.value })}>
                        <IonSelectOption value={0}>Select Product type</IonSelectOption>
                        {types.map(index => {
                            return (
                                <IonSelectOption key={index.id} value={parseInt(index.id)}>{index.type}</IonSelectOption>
                            )
                        })}
                    </IonSelect>

                    {!isFirst && (state.type_id === 0) && <>
                        <IonNote slot="helper" color="red">Product type is a required field</IonNote>
                        <IonIcon slot="end" icon={alertCircleOutline} color="red" />
                    </>}
                    {Object.keys(cuts).length === 0 && <>
                        <IonNote slot='helper' color='red'>this bread was not cut today</IonNote>
                    </>}
                </IonItem>
                {Object.keys(cuts).length > 0 &&<><IonItem fill='solid' className='mb-1'>
                    <IonLabel color='medium'>Same Number Cut?</IonLabel>
                    <IonToggle color='green' slot='end' onIonChange={e => setState({...state, left: e.detail.checked?cuts.cut:0})} />
                </IonItem>
                <IonItem fill='solid' className='mb-1'>
                    <IonLabel color='medium' position='floating'>Number of Bread that Left</IonLabel>
                    <IonInput type='number' inputmode='numeric' min={0} max={cuts.cut || 0} value={state.left} onIonChange={e => setState({ ...state, left: parseInt(e.detail.value), damages: cuts.cut-parseInt(e.detail.value) })} />
                </IonItem>
                <IonItem fill='solid' className='mb-1'>
                    <IonLabel color='medium' position='floating'>Number of Damages</IonLabel>
                    <IonInput type='number' inputmode='numeric' min={0}  value={state.damages} onIonChange={e => setState({ ...state, damages: parseInt(e.detail.value) })} />
                </IonItem>
                <IonItem fill='solid'>
                    <IonButton onClick={select}>Take Photo</IonButton>
                </IonItem>
                
                </>}
                {/* <pre>
                    {JSON.stringify(cuts, null, 2)}
                </pre> */}

            </IonContent>
            <IonFooter className='h-16 flex items-center justify-center'>
                <IonButton onClick={handleSubmit} expand='block' className='w-[90%]' color='green'>Save</IonButton>
            </IonFooter>
        </IonPage>
    );
};

export default Left;