import { IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/react';
import { fingerPrintOutline, logInOutline, logOutOutline, person } from 'ionicons/icons';
import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import Attendance from './attendance';
import ItemReceived from './itemRecieved';
import ItemLeft from './left';
import Visitor from './visitors';

const SecurityTab: React.FC = () => {

    return (
        <IonTabs>
            <IonRouterOutlet>
                <Route exact path="/security/visitors" component={Visitor} />
                <Route exact path="/security/attendance" component={Attendance} />
                <Route exact path="/security/left" component={ItemLeft} />
                <Route exact path="/security/received" component={ItemReceived} />
                <Route exact path="/security/">
                    <Redirect to="/security/visitors" />
                </Route>
            </IonRouterOutlet>
            <IonTabBar slot='bottom'>
                <IonTabButton tab='received' href='/security/received'>
                    <IonLabel>Items Received</IonLabel>
                    <IonIcon icon={logInOutline} />
                </IonTabButton>
                <IonTabButton tab='visitor' href='/security/visitors'>
                    <IonLabel>Visitor</IonLabel>
                    <IonIcon icon={person} />
                </IonTabButton>
                <IonTabButton tab='attendance' href='/security/attendance'>
                    <IonLabel>Attendance</IonLabel>
                    <IonIcon icon={fingerPrintOutline} />
                </IonTabButton>
                <IonTabButton tab='left' href='/security/left'>
                    <IonLabel>Items Left</IonLabel>
                    <IonIcon icon={logOutOutline} />
                </IonTabButton>
            </IonTabBar>
        </IonTabs>
    );
};

export default SecurityTab;