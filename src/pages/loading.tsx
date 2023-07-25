import { IonContent, IonLoading, IonPage } from '@ionic/react';
import React from 'react';

const Loading: React.FC = () => {
    return (
        <IonPage>
            <IonContent className="ion-padding">
                <IonLoading isOpen message={"Loading Data"}></IonLoading>
            </IonContent>
        </IonPage>
    );
};

export default Loading;