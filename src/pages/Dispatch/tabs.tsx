import { IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/react';
import { bag, cart, close, home, open } from 'ionicons/icons';
import React from 'react';
import { Redirect, Route } from 'react-router';

import Closing from './closing';
import DispatchDashboard from './dashboard';
import Intake from './intake';
import Opening from './opening';
import Dispatches from './orders';
import { useRecoilValue } from 'recoil';
import { User, userAtom } from '../../recoil/userAtom';

const DispatchTabs: React.FC = () => {
    const user = useRecoilValue<User>(userAtom);
    const handleWillChange = (value: string) => {
        return false;
    }
    return (
        <IonTabs>
            <IonRouterOutlet>
                <Route exact path="/dispatch/opening" component={Opening} />
                <Route exact path="/dispatch/dispatch" component={Dispatches} />
                <Route exact path="/dispatch/dashboard" component={DispatchDashboard} />
                <Route exact path="/dispatch/intake" component={Intake} />
                <Route exact path="/dispatch/closing" component={Closing} />
                <Route exact path="/dispatch/">
                    <Redirect to={user.setOpening?"/dispatch/dashboard":"/dispatch/opening"} />
                </Route>
            </IonRouterOutlet>
            <IonTabBar slot='bottom' onIonTabsWillChange={e => handleWillChange(e.detail.tab)}>
                <IonTabButton disabled={user.setClosing} tab='opening' href='/dispatch/opening'>
                    <IonLabel>Opening</IonLabel>
                    <IonIcon icon={open} />
                </IonTabButton>
                <IonTabButton disabled={!user.setOpening || user.setClosing} tab='dispatch' href='/dispatch/dispatch'>
                    <IonLabel>Dispatch</IonLabel>
                    <IonIcon icon={bag} />
                </IonTabButton>
                <IonTabButton disabled={!user.setOpening} tab='dashboard' href='/dispatch/dashboard'>
                    <IonLabel>Dashboard</IonLabel>
                    <IonIcon icon={home} />
                </IonTabButton>
                <IonTabButton disabled={!user.setOpening || user.setClosing} tab='intake' href='/dispatch/intake'>
                    <IonLabel>Intake</IonLabel>
                    <IonIcon icon={cart} />
                </IonTabButton>
                <IonTabButton disabled={!user.setOpening} tab='closing' href='/dispatch/closing'>
                    <IonLabel>Closing</IonLabel>
                    <IonIcon icon={close} />
                </IonTabButton>
            </IonTabBar>
        </IonTabs>
    );
};

export default DispatchTabs;