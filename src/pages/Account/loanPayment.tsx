import { DatetimeChangeEventDetail, IonButton, IonCard, IonCardContent, IonContent, IonDatetime, IonFooter, IonIcon, IonInput, IonItem, IonLabel, IonModal, IonPage, IonSelect, IonSelectOption } from '@ionic/react';
import { format, parseISO } from 'date-fns';
import { saveOutline } from 'ionicons/icons';
import React, { useState } from 'react';
import Toolbar from '../../components/toolbar';

const LoanPayment: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [state, setState] = useState({
        date: new Date().toISOString(),
    });
    const handleDateChange = (e: CustomEvent<DatetimeChangeEventDetail>) => {
        setState({ ...state, date:e.detail.value.toString() });

    }
    const handleDismiss = () => {
        setIsOpen(false);
    }

    return (
        <IonPage>
            <Toolbar title="Debts" />
            <IonContent className="ion-padding">
            <IonItem>
                    <IonLabel color="medium" position="stacked">Collector Name</IonLabel>
                    <IonSelect interface='action-sheet'>
                        <IonSelectOption></IonSelectOption>
                    </IonSelect>
                </IonItem>
                <IonItem>
                    <IonLabel color="medium" position="stacked">Amount Collected</IonLabel>
                    <IonInput />
                </IonItem>
                <IonItem>
                    <IonLabel color="medium" position="stacked">Payment Mode</IonLabel>
                    <IonSelect interface='action-sheet'>
                        <IonSelectOption></IonSelectOption>
                    </IonSelect>
                </IonItem>
                <IonItem>
                    <IonLabel color="medium" position="stacked">Load Receipt Number</IonLabel>
                    <IonInput />
                </IonItem>
                <IonItem>
                    <IonLabel color="medium" position="stacked">Cheque Number</IonLabel>
                    <IonInput />
                </IonItem>
                <IonItem>
                    <IonLabel color="medium" position="stacked">Account Name</IonLabel>
                    <IonSelect interface='action-sheet'>
                        <IonSelectOption></IonSelectOption>
                    </IonSelect>
                </IonItem>
                <IonItem>
                    <IonLabel color="medium" position="stacked">Granted By</IonLabel>
                    <IonInput />
                </IonItem>
                <IonItem>
                    <IonLabel color="medium" position="stacked">Due Date</IonLabel>
                    <IonInput readonly value={format(parseISO(state.date), "EE MMM dd yyyy")} onClick={() => setIsOpen(true)} />
                </IonItem>
                <IonModal onDidDismiss={handleDismiss} isOpen={isOpen}>
                    <IonCard>
                        <IonCardContent>
                            <IonDatetime value={state.date || new Date().toISOString()} color='green' showDefaultButtons presentation="date" min="2022-01-01T00:00:00" onIonChange={e => handleDateChange(e)} />                        </IonCardContent>
                    </IonCard>
                </IonModal>
            </IonContent>
            <IonFooter className="ion-padding">
                <IonButton color='green' expand='block'>
                    <IonIcon slot="start" icon={saveOutline}></IonIcon>
                    Save
                </IonButton>
            </IonFooter>
        </IonPage>
    );
};

export default LoanPayment;