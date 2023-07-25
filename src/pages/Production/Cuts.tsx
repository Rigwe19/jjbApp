import { Http } from '@capacitor-community/http';
import { IonButton, IonContent, IonFooter, IonIcon, IonImg, IonInput, IonLabel, IonNote, IonPage, IonSelect, IonSelectOption, useIonLoading } from '@ionic/react';
import { alertCircleOutline, checkmarkCircleOutline } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';
import { useIonFormState } from 'react-use-ionic-form';

import Toolbar from '../../components/toolbar';
import { useRecoilValue } from 'recoil';
import { urlAtom } from '../../recoil/urlAtom';
import { User, userAtom } from '../../recoil/userAtom';

const Cuts: React.FC = () => {
    const user = useRecoilValue<User>(userAtom);
    const href = useRecoilValue<string>(urlAtom);
    const isClean = useRef(false);
    const [isFirst, setIsFirst] = useState(true);
    const [types, setTypes] = useState([]);
    const isValid = useRef(false);
    const [show, hide] = useIonLoading();
    let { setState, state, reset, item } = useIonFormState({
        id: 0,
        type_id: "",
        cut: 0,
    });
    const set = {
        type_id: { name: "Product Type", type: "select" },
        cut: { name: "Number of Dough Cut", type: "number", key: "type", inputmode: "numeric" },
        // date: { name: "Employee Date of Birth", type: "date" },
    }
    const [fieldSet, setFieldSet] = useState<any>(set);
    useEffect(() => {
        isClean.current = true;
        show("Loading Attendance");
        Http.request({
            method: "GET",
            url: href + "/api/get/production/cuts",
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
    const handleSubmit = () => {
        isValid.current = true;
        Object.keys(state).forEach((element: any) => {
            if (state[element] === "" || state[element] === null) {
                isValid.current = false;
                setIsFirst(false);
            }
        });
        if (isValid.current) {
            show("Saving...")
            Http.request({
                method: "POST",
                url: href + "/api/production/add/cuts",
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
                    reset();
                }
            }).finally(() => {
                hide();
            });
        }
    }
    return (
        <IonPage>
            <Toolbar title="Cuts" />
            <IonContent className="ion-padding">
                <div className="h-[30vh] w-full flex justify-center items-center">
                    <IonImg alt='brand' className='w-32 h-32' />
                </div>
                {Object.keys(state).map((key: any) => {
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
                                                        <IonSelectOption key={index.id} value={index.id}>{index.type}</IonSelectOption>
                                                    )
                                                })}
                                            </IonSelect>}

                                            {!isFirst && (state[key] === "" || state[key] === null) && <>
                                                <IonNote slot="helper" color="red">{fieldSet[key].name} is a required field</IonNote>
                                                <IonIcon slot="end" icon={alertCircleOutline} color="red" />
                                            </>}
                                            {!isFirst && state[key] && <IonIcon slot="end" icon={checkmarkCircleOutline} color="green" />}
                                        </>),
                                })}</div>)
                    }

                })}
 
            </IonContent>
            <IonFooter className='h-16 flex items-center justify-center'>
                <IonButton onClick={handleSubmit} expand='block' className='w-[90%]' color='green'>Save</IonButton>
            </IonFooter>
        </IonPage>
    );
};

export default Cuts;