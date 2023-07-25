import { IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/react';
import { home, receipt, send } from 'ionicons/icons';
import React from 'react';
import { Redirect, Route } from 'react-router';
import AcceptProduction from './accept';
import PackagingDashboard from './dashboard';
import Packaging from './packaging';

const PackagingTab: React.FC = () => {

    return (
        <IonTabs>
            <IonRouterOutlet>
                <Route exact path="/packaging/dashboard" component={PackagingDashboard} />
                <Route exact path="/packaging/send" component={Packaging} />
                <Route exact path="/packaging/accept" component={AcceptProduction} />
                <Route exact path='/packaging'>
                    <Redirect to="/packaging/dashboard" />
                </Route>
            </IonRouterOutlet>
            <IonTabBar slot='bottom'>
                <IonTabButton tab='accept' href='/packaging/accept'>
                    <IonLabel>Accept</IonLabel>
                    <IonIcon icon={receipt} />
                </IonTabButton>
                <IonTabButton tab='dashboard' href='/packaging/dashboard'>
                    <IonLabel>Dashboard</IonLabel>
                    <IonIcon icon={home} />
                </IonTabButton>
                <IonTabButton tab='send' href='/packaging/send'>
                    <IonLabel>Send</IonLabel>
                    <IonIcon icon={send} />
                </IonTabButton>
            </IonTabBar>
        </IonTabs>
    );
};

export default PackagingTab;