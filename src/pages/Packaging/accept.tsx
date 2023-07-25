import { Http } from '@capacitor-community/http';
import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonIcon, IonInput, IonItem, IonLabel, IonList, IonModal, IonNote, IonPage, IonRefresher, IonRefresherContent, IonToolbar, useIonActionSheet, useIonLoading } from '@ionic/react';
import { format } from 'date-fns';
import { arrowBack, checkmark, close, closeCircleOutline, remove } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';

import Toolbar from '../../components/toolbar';
import { useRecoilValue } from 'recoil';
import { urlAtom } from '../../recoil/urlAtom';
import { User, userAtom } from '../../recoil/userAtom';

const AcceptProduction: React.FC = () => {
    const user = useRecoilValue<User>(userAtom);
    const href = useRecoilValue<string>(urlAtom);
    const isClean = useRef(false);
    const [actionSheet] = useIonActionSheet();
    const [isOpen, setIsOpen] = useState(false);
    const [state, setState] = useState({
        id: 0,
        received: 0,
    });
    const [records, setRecords] = useState([]);
    const [present, dismiss] = useIonLoading();
    useEffect(() => {
        isClean.current = true;
        refreshPage();
        return () => {
            isClean.current = false;
        }
    }, []);
    const refreshPage = (e?:any) => {
        present("Loading...");
        Http.request({
            method: "GET",
            url: href + "/api/get/packaging/accepts",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            }
        }).then(({ data }) => {
            if (isClean.current && data.success) {
                setRecords(data.records);
            }
        }).finally(() => {
            if(e !== undefined){
                e.detail.complete();
            }
            dismiss();
        });
    }
    const handleDismiss = () => {
        setIsOpen(false);
    }
    const handleClick = (index: number) => {
        setState(pv=>({...pv, id: records[index].id}));
        actionSheet({
            buttons: [{
                text: "Accept", icon: checkmark, role: "destructive", handler: () => handleAccept(index)
            }, {
                text: "Reject", icon: remove, role: "destructive", handler: () => handleReject(index)
            }, {
                text: "Cancel", icon: close, role: "cancel"
            }]
        })
    }
    const handleReject = (index: number) => {
        setIsOpen(true);
    }
    const doRefresh = (e: any) => {
        refreshPage(e);
    }

    const handleAccept = (index:number) => {
        doSend({id: records[index].id, received: records[index].sent});
    }

    const doSend = (accept?:any) => {
        // console.log(accept);
        present("Loading...");
        Http.request({
            method: "POST",
            url: href + "/api/set/packaging/accepts",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            },
            data: accept!==undefined?accept:state,
        }).then(({ data }) => {
            if (data.success) {
                setRecords(data.records);
            }
        }).finally(() => {
            dismiss();
        });
    }
    return (
        <IonPage>
            <Toolbar title="Accept From Production" />
            <IonContent className="ion-padding">
                <IonRefresher slot='fixed' onIonRefresh={e => doRefresh(e)}>
                    <IonRefresherContent></IonRefresherContent>
                </IonRefresher>
                <IonList>
                    {records.map((value, index) => (<IonItem fill='solid' key={value.id} onClick={() => handleClick(index)}>
                        <IonNote slot="start">{format(new Date(value.date), "dd/MM/yyyy")}</IonNote>
                        <IonLabel>
                            <p>{value.type}</p>
                            <p>{value.shift} Shift</p>
                        </IonLabel>
                        <IonNote slot="end">{value.sent}</IonNote>
                    </IonItem>))}
                </IonList>
                    
                {records.length === 0 && <div className="w-full h-full -z-10 absolute top-0 flex flex-col justify-center items-center">
                    <IonIcon color="medium" size="large" icon={closeCircleOutline} />
                    <IonLabel color="medium">No item sent from packaging</IonLabel>
                </div>}
                <IonModal isOpen={isOpen} onDidDismiss={handleDismiss}>
                    <IonCard>
                        <IonCardHeader>
                            <IonToolbar>
                                <IonButtons slot='start'>
                                    <IonButton onClick={handleDismiss}>
                                        <IonIcon slot='icon-only' icon={arrowBack} />
                                    </IonButton>
                                    <IonCardTitle>Enter new value</IonCardTitle>
                                </IonButtons>
                            </IonToolbar>
                        </IonCardHeader>
                        <IonCardContent>
                            <IonItem fill='solid'>
                                <IonLabel position='stacked'>Enter new value</IonLabel>
                                <IonInput value={state.received || 0} onIonChange={e => setState({ ...state, received: parseInt(e.detail.value) })} />
                            </IonItem>
                            <IonButton color="green" expand="block" onClick={()=>doSend()}>Save</IonButton>
                        </IonCardContent>
                    </IonCard>
                </IonModal>
            </IonContent>
        </IonPage>
    );
};

export default AcceptProduction;