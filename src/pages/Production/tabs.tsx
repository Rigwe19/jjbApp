import { IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/react';
import { documentText, home, logIn } from 'ionicons/icons';
import React from 'react';
import { Redirect, Route } from 'react-router';
import ProductionDashboard from './dashboard';
import Input from './Input';
import ProductionReport from './Report';

const ProductionTab: React.FC = () => {

    return (
        <IonTabs>
            <IonRouterOutlet>
                <Route exact path="/production/input" component={Input} />
                <Route exact path="/production/dashboard" component={ProductionDashboard} />
                <Route exact path="/production/report" component={ProductionReport} />
                <Route exact path="/production/">
                    <Redirect to="/production/dashboard" />
                </Route>
            </IonRouterOutlet>
            <IonTabBar slot='bottom'>
                {/* <IonTabButton tab='left' href='/production/left'>
                    <IonIcon icon={logOut} />
                    <IonLabel>Left</IonLabel>
                </IonTabButton> */}
                <IonTabButton tab='input' href='/production/input'>
                    <IonIcon icon={logIn} />
                    <IonLabel>Input</IonLabel>
                </IonTabButton>
                <IonTabButton tab='dashboard' href='/production/dashboard'>
                    <IonIcon icon={home} />
                    <IonLabel>Dashboard</IonLabel>
                </IonTabButton>
                <IonTabButton tab='report' href='/production/report'>
                    <IonIcon icon={documentText} />
                    <IonLabel>Report</IonLabel>
                </IonTabButton>
            </IonTabBar>
        </IonTabs>
    );
};

export default ProductionTab;