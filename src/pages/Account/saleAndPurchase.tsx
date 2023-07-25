import { IonButtons, IonHeader, IonMenuButton, IonPage, IonSegment, IonSegmentButton, IonTitle, IonToolbar } from '@ionic/react';
import React, { useEffect, useRef, useState } from 'react';
import Popup from '../../components/popup';
import AccountExpenses from './expenses';
import Sales from './sales';

const SalesAndPurchase: React.FC = () => {
    const [segment, setSegment] = useState("Sale");
    const segmentRef = useRef(null);
    // const params:{tab: string} = useParams();
    // console.log(params);
    const isClean = useRef(false);
    useEffect(() => {
      isClean.current = true;
        console.log(segmentRef.current.value)
      return () => {
        isClean.current = false;
      }
    }, [segmentRef.current]);
    
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color='green'>
                    <IonButtons slot="start">
                        <IonMenuButton />
                    </IonButtons>
                    <IonTitle>{segment}</IonTitle>
                    <Popup />
                </IonToolbar>
                <IonSegment  ref={segmentRef} value={segment} onIonChange={e => setSegment(e.detail.value)}>
                    <IonSegmentButton value="Sale">Sale</IonSegmentButton>
                    {/* <IonSegmentButton value="Purchase">Purchase</IonSegmentButton> */}
                    <IonSegmentButton value="Expenses">Expenses</IonSegmentButton>
                </IonSegment>
            </IonHeader>
            {segment === "Sale" && <Sales />}
            {/* {segment === "Purchase" && <Purchase />} */}
            {segment === "Expenses" && <AccountExpenses />}
        </IonPage>
    );
};

export default SalesAndPurchase;