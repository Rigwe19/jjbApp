import { Http } from '@capacitor-community/http';
import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonIcon, IonInput, IonItem, IonLabel, IonList, IonModal, IonPage, IonToolbar, useIonActionSheet, useIonLoading } from '@ionic/react';
import { format } from 'date-fns';
import { arrowBack, closeCircleOutline, closeOutline, logInOutline, save } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';

import Toolbar from '../../components/toolbar';
import { useRecoilValue } from 'recoil';
import { urlAtom } from '../../recoil/urlAtom';
import { User, userAtom } from '../../recoil/userAtom';

const ItemReceived: React.FC = () => {
    const user = useRecoilValue<User>(userAtom);
    const href = useRecoilValue<string>(urlAtom);
    const [items, setItems] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const initialValue = {
        // id: 0,
        quantity: 0,
        item_id: 0,
        reference: "",
        reference_id: 0,
        date: format(new Date(), "yyyy-MM-dd"),
        location_id: user.location_id
    };
    const [state, setState] = useState(initialValue);
    const isClean = useRef(false);
    const [present, dismiss] = useIonLoading();
    const [action] = useIonActionSheet();
    useEffect(() => {
        isClean.current = true;
        present("Loading Items");
        Http.request({
            method: "GET",
            url: href + "/api/get/security/received",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            }
        }).then(({ data }) => {
            if (isClean.current && data.success) {
                setItems(data.items);
                // setFilter(data.employee);
            }
        }).finally(() => {
            dismiss();
        });
        return () => {
            isClean.current = false;
        }
    }, []);
    const handleDismiss = () => {
        setState(initialValue);
        setIsOpen(false);
    }
    const handleChange = (value: number, key: string) => {
        setState(pvz => ({ ...pvz, [key]: value }));
    }
    const handleClick = (index: any, id: number, reference: string) => {
        action({
            buttons: [
                { text: "Arrived", icon: logInOutline, role: "destructive", handler: () => handleArrived(index, id, reference) },
                { text: "Cancel", icon: closeOutline, role: "cancel" }
            ]
        })
    }
    const handleArrived = (index: number, id: number, reference: string) => {
        setState(pvz => (
            {
                ...pvz,
                item_id: id,
                reference,
                reference_id: id
            }));
        setIsOpen(true);
    }
    const handleSave = () => {
        if (state.quantity !== 0) {
            present("Saving...")
            Http.request({
                method: "POST",
                url: href + "/api/security/add/received",
                headers: {
                    'Content-Type': 'application/json',
                    'Data-Type': 'json',
                    'Authorization': 'Bearer ' + user.token
                },
                data: state
            }).then(({ data }) => {
                if (data.success) {
                    setItems(data.items);
                    handleDismiss();
                }
            }).finally(() => {
                dismiss();
            });
        }
    }
    return (
        <IonPage>
            <Toolbar title="Items Recieved" />
            <IonContent className="ion-padding">
                <IonList>
                    {items.map((value, index) => (<IonItem key={value.id} fill='solid' className='mb-1' button onClick={() => handleClick(index, value.id, "purchases")}>
                        <IonLabel>
                            <p>{value.name}</p>
                        </IonLabel>
                    </IonItem>))}
                </IonList>
                <div className="w-full h-full">
                    {items.length === 0 && <div className="w-full h-full flex justify-center items-center">
                        <div className='flex flex-col justify-center'>
                            <IonIcon icon={closeCircleOutline} color="medium" size='large' className='mx-auto' />
                            <IonLabel color="medium">No available items
                            </IonLabel>
                        </div>
                    </div>}
                </div>

                <IonModal isOpen={isOpen} onDidDismiss={handleDismiss}>
                    <IonCard>
                        <IonCardHeader>
                            <IonToolbar>
                                <IonButtons slot='start'>
                                    <IonButton onClick={handleDismiss}>
                                        <IonIcon slot='icon-only' icon={arrowBack} />
                                    </IonButton>
                                </IonButtons>
                                <IonCardTitle>Save Quantity</IonCardTitle>
                            </IonToolbar>
                        </IonCardHeader>
                        <IonCardContent>
                            <IonItem fill='solid'>
                                <IonLabel position="stacked">Quantity</IonLabel>
                                <IonInput value={state.quantity || 0} onIonChange={e => handleChange(parseInt(e.detail.value), "quantity")} />
                            </IonItem>
                            <IonButton expand="block" color="green" onClick={handleSave}>
                                <IonIcon slot="start" icon={save} />
                                Save
                            </IonButton>
                        </IonCardContent>
                    </IonCard>
                </IonModal>
            </IonContent>
        </IonPage>
    );
};

export default ItemReceived;