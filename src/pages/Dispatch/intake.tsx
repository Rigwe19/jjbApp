import { Http } from '@capacitor-community/http';
import { InputChangeEventDetail, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonIcon, IonInput, IonItem, IonLabel, IonModal, IonNote, IonPage, IonSelect, IonSelectOption, IonToolbar, useIonActionSheet, useIonLoading } from '@ionic/react';
import { arrowBack, checkmarkCircle, closeCircle, removeCircle } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';

import Toolbar from '../../components/toolbar';
import { useRecoilValue } from 'recoil';
import { urlAtom } from '../../recoil/urlAtom';
import { User, userAtom } from '../../recoil/userAtom';

const Intake: React.FC = () => {
    const user = useRecoilValue<User>(userAtom);
    const href = useRecoilValue<string>(urlAtom);
    const [brands, setBrands] = useState([{ id: 0, name: "" }]);
    const [brand, setBrand] = useState(0);
    const [intakes, setIntakes] = useState([{ id: 0, type: "", send: 0, date: "" }]);
    const [showModal, setShowModal] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [present, dismiss] = useIonLoading();
    const [action, unaction] = useIonActionSheet();
    const isClean = useRef(false);
    useEffect(() => {
        isClean.current = true;
        present("Loading...");
        Http.request({
            method: "GET",
            url: href + "/api/get/dispatch/opening",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            }
        }).then(({ data }) => {
            if (isClean.current && data.success) {
                setBrands(data.brands);
                //   setUnits(data.units);
            }
        }).finally(() => {
            dismiss();
        });
        return () => {
            isClean.current = false;
        }
    }, []);
    useEffect(() => {
        isClean.current = true;
        // present("Loading...");
        Http.request({
            method: "GET",
            url: href + "/api/get/intake/" + brand,
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            }
        }).then(({ data }) => {
            if (isClean.current && data.success) {
                setIntakes(data.intakes);
                //   setUnits(data.units);
            }
        }).finally(() => {
            // dismiss();
        });
        return () => {
            isClean.current = false;
        }
    }, [brand]);
    const handleClick = (index: number) => {
        setSelectedIndex(index);
        action(
            {
                buttons: [
                    { text: 'Accept', color: "green", icon: checkmarkCircle, role: 'destructive', handler: () => doAccept() },
                    { text: 'Decline', color: "red", icon: closeCircle, role: 'destructive', handler: () => doDecline() },
                    { text: 'Cancel', icon: removeCircle, role: 'destructive', handler: () => unaction() }
                ],
                header: "Accept The number of bread brought"
            }
        )
    }

    const doAccept = () => {
        present();
        Http.request({
            method: "POST",
            url: href + "/api/accept/batch",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            },
            data: { ...intakes[selectedIndex], quantity: intakes[selectedIndex].send}
        }).then(({ data }) => {
            if (isClean.current && data.success) {
                setIntakes(data.intakes);
                setShowModal(false);
            }
        }).finally(() => {
            dismiss();
        });
    }

    const doDecline = () => {
        setShowModal(true)
    }

    const handleChange = (e: CustomEvent<InputChangeEventDetail>) => {
        let newIntakes = [...intakes];
        if (newIntakes.length > 0) {
            newIntakes[selectedIndex].send = parseInt(e.detail.value);
            setIntakes([...newIntakes]);
        }

    }
    return (
        <IonPage>
            <Toolbar title="Input from production" />
            <IonContent className="ion-padding">
                <IonItem fill='solid'>
                    <IonLabel position='floating'>Brand</IonLabel>
                    <IonSelect interface='action-sheet' value={brand} onIonChange={e => setBrand(e.detail.value)}>
                        <IonSelectOption value={0}>Select Brand</IonSelectOption>
                        {brands.map(value => (
                            <IonSelectOption key={value.id} value={value.id}>{value.name}</IonSelectOption>
                        ))}
                    </IonSelect>
                </IonItem>

                {intakes.map((value, index) => (
                    <IonItem fill='solid' key={value.id} className='mt-2' button onClick={() => handleClick(index)}>
                        <IonNote slot="start">{value.date}</IonNote>
                        <IonLabel>{value.type}</IonLabel>
                        <IonNote className='pt-3' slot='end'>{value.send}</IonNote>
                    </IonItem>
                ))}

                <IonModal isOpen={showModal}>
                    <IonCard>
                        <IonCardHeader>
                                <IonToolbar>
                                    <IonButtons slot='start'>
                                        <IonButton onClick={() => setShowModal(false)}>
                                            <IonIcon slot='icon-only' icon={arrowBack} />
                                        </IonButton>
                                    </IonButtons>
                            <IonCardTitle>
                                    <IonLabel>Input New Value</IonLabel>
                            </IonCardTitle>
                                </IonToolbar>
                        </IonCardHeader>
                        <IonCardContent>
                            <IonItem fill='solid'>
                                <IonLabel position='floating'>New Value</IonLabel>
                                <IonInput inputmode="numeric" value={intakes[selectedIndex]?.send || 0} onIonChange={e => handleChange(e)} />
                            </IonItem>
                            <IonButton color='green' expand='block' onClick={() => doAccept()}>Save</IonButton>
                        </IonCardContent>
                    </IonCard>
                </IonModal>
            </IonContent>
        </IonPage>
    );
};

export default Intake;
