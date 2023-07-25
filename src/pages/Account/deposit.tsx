import { IonButton, IonContent, IonFooter, IonIcon, IonInput, IonItem, IonLabel, IonSelect, IonSelectOption } from '@ionic/react';
import { saveOutline } from 'ionicons/icons';
import React from 'react';

const Deposit: React.FC = () => {

    return (
        <>
            <IonContent className="ion-padding">
                <IonItem className='mb-1' fill="solid">
                    <IonLabel color='medium' position="stacked">To Account</IonLabel>
                    <IonSelect interface='action-sheet'>
                        <IonSelectOption>Gtb bank</IonSelectOption>
                    </IonSelect>
                </IonItem>
                <IonItem className='mb-1' fill="solid">
                    <IonLabel color='medium' position="stacked">Account Name</IonLabel>
                    <IonInput />
                </IonItem>
                <IonItem className='mb-1' fill="solid">
                    <IonLabel color='medium' position="stacked">Account Balance</IonLabel>
                    <IonInput />
                </IonItem>
                <IonItem className='mb-1' fill="solid">
                    <IonLabel color='medium' position="stacked">Deposited Amount</IonLabel>
                    <IonInput />
                </IonItem>
                <IonItem className='mb-1' fill="solid">
                    <IonLabel color='medium' position="stacked">Depositor Name</IonLabel>
                    <IonInput />
                </IonItem>
                <IonItem className='mb-1' fill="solid">
                    <IonLabel color='medium' position="stacked">Depositor Slip Number</IonLabel>
                    <IonInput />
                </IonItem>
            </IonContent>
            <IonFooter className="ion-padding">
                <IonButton color='green' expand='block'>
                    <IonIcon slot="start" icon={saveOutline}></IonIcon>
                    Save
                </IonButton>
            </IonFooter>
        </>
    );
};

export default Deposit;