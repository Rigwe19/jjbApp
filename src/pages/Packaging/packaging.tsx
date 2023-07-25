import { Http } from '@capacitor-community/http';
import { InputChangeEventDetail, IonButton, IonContent, IonIcon, IonInput, IonItem, IonItemDivider, IonLabel, IonNote, IonPage, useIonAlert, useIonLoading, useIonToast } from '@ionic/react';
import { send } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';

import Toolbar from '../../components/toolbar';
import { useRecoilValue } from 'recoil';
import { urlAtom } from '../../recoil/urlAtom';
import { User, userAtom } from '../../recoil/userAtom';

const Packaging: React.FC = () => {
    const user = useRecoilValue<User>(userAtom);
    const href = useRecoilValue<string>(urlAtom);
    const isClean = useRef(false);
    const [toasted] = useIonToast();
    const [present, dismiss] = useIonLoading();
    const [alerted] = useIonAlert();
    const [records, setRecords] = useState([]);
    const [items, setItems] = useState([{ id: 0, type: "", quantity: 0, isAdded: false, processed: false, first: true }]);
    useEffect(() => {
        isClean.current = true;
        present("Loading...");
        Http.request({
            method: "GET",
            url: href + "/api/get/packaging/send",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            }
        }).then(({ data }) => {
            if (isClean.current && data.success) {
                data.records.forEach((element: { first: boolean; amount: number; }) => {
                    element.first = true;
                    element.amount = 0;
                });
                setRecords(data.records);
            }
        }).finally(() => {
            dismiss();
        });
        return () => {
            isClean.current = false;
        }
    }, []);
    // useEffect(() => {
    //     isClean.current = true;
    //     // present("Loading...");
    //     Http.request({
    //         method: "GET",
    //         url: href + "/api/get/brand/items/" + brand,
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'Data-Type': 'json',
    //             'Authorization': 'Bearer ' + user.token
    //         }
    //     }).then(({ data }) => {
    //         if (isClean.current && data.success) {
    //             setItems(data.items);
    //             //   setUnits(data.units);
    //         }
    //     }).finally(() => {
    //         // dismiss();
    //     });
    //     return () => {
    //         isClean.current = false;
    //     }
    // }, [brand]);

    const handleChange = (index: number, e: CustomEvent<InputChangeEventDetail>) => {
        let item:any[] = [...records];
        item[index].amount = parseInt(e.detail.value);
        setItems([...item]);
    }

    const handleAdded = (index: number) => {
        let item:any[] = [...records];
        if (item[index].amount === 0 || item[index].amount === undefined) {
            item[index].first = false;
            setRecords([...item]);
            toasted(item[index].type + " quantity cannot be empty", 2000);
        } else {
            present();
            Http.request({
                method: "POST",
                url: href + "/api/production/send",
                headers: {
                    'Content-Type': 'application/json',
                    'Data-Type': 'json',
                    'Authorization': 'Bearer ' + user.token
                },
                data: { ...item[index] }
            }).then(({ data }) => {
                if (data.success) {
                    data.records.forEach((element: { first: boolean; amount: number; }) => {
                        element.first = true;
                        element.amount = 0;
                    });
                    setRecords(data.records);
                    alerted({
                        message: "Items sent to Dispatch",
                        header: "Success",
                        buttons: ["Ok"]
                })
                }
            }).finally(() => {
                dismiss();
            });
        }
    }

    return (
        <IonPage>
            <Toolbar title="Send to Dispatch" />
            <IonContent className="ion-padding">
                {/* <IonItem fill='solid'>
                    <IonLabel position='floating'>Brand</IonLabel>
                    <IonSelect interface='action-sheet' color='green' value={brand} onIonChange={e => setBrand(e.detail.value)}>
                        <IonSelectOption color="green" value={0}>Select Brand</IonSelectOption>
                        {brands.map(value => (
                            <IonSelectOption key={value.id} value={value.id}>{value.name}</IonSelectOption>
                        ))}
                    </IonSelect>
                </IonItem> */}
                <IonItemDivider>Items</IonItemDivider>
                {/* <pre>{JSON.stringify(items[0], null, 2)}</pre> */}
                {records.map((value, index) => (
                    <IonItem fill='solid' className='mb-1' key={value.id} disabled={value.isAdded || value.processed}>
                        <IonLabel position='floating'>{value.balance} {value.type} Available </IonLabel>
                        <IonInput value={value.amount || 0} type="number" inputmode="numeric" max={100} min={0} onIonChange={e => handleChange(index, e)} />
                        <IonButton slot='end' color='green' onClick={() => handleAdded(index)}>
                            <IonIcon slot="start" icon={send} />
                            Send
                        </IonButton>
                        {(function () {
                            if (!value.first && (value.amount === 0 || value.amount === undefined)) {
                                return <IonNote slot='helper' color='danger'>Please enter number of items sent</IonNote>
                            }
                        })()}
                        {/* { (value.processed === 0 || value.quantity === 0) && } */}
                    </IonItem>
                ))}
                
            </IonContent>
        </IonPage>
    );
};

export default Packaging;