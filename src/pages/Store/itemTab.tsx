import { IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/react';
import { Route, Redirect } from "react-router-dom";
import React, { useState } from 'react';
import { book, bookOutline, fastFood, fastFoodOutline, home, homeOutline, receipt, receiptOutline, send, sendOutline } from 'ionicons/icons';
import Items from './items';
import NonItems from './nonItems';
import StoreDashboard from './dashboard';
import Issueance from './issueance';
import Usage from './usage';

const ItemTab: React.FC = () => {
    const [ selected, setSelected ] = useState("dashboard");
    const handleDidChange = (e: CustomEvent<{ tab: string; }>) => {
        setSelected(e.detail.tab);
    }
    return (
        <IonTabs>
            <IonRouterOutlet>
                <Route exact path='/store/:tab(direct)' component={Items} />
                <Route exact path='/store/:tab(non)' component={NonItems} />
                <Route exact path='/store/:tab(dashboard)' component={StoreDashboard} />
                <Route exact path='/store/:tab(issueance)' component={Issueance} />
                <Route exact path='/store/:tab(usage)' component={Usage} />
                <Route exact path="/store/">
                    <Redirect to="/store/dashboard" />
                </Route>
            </IonRouterOutlet>
            <IonTabBar slot="bottom" onIonTabsDidChange={e => handleDidChange(e)}>
                <IonTabButton tab='direct' href='/store/direct'>
                    <IonIcon icon={selected==="direct"?fastFood:fastFoodOutline} color={selected==="direct"?"red":"medium"} />
                    <IonLabel color={selected==="direct"?"red":"medium"}>Direct</IonLabel>
                </IonTabButton>
                <IonTabButton tab='non' href='/store/non'>
                    <IonIcon icon={selected==="non"?book:bookOutline} color={selected==="non"?"red":"medium"} />
                    <IonLabel color={selected==="non"?"red":"medium"}>Non-Direct</IonLabel>
                </IonTabButton>
                <IonTabButton tab='dashboard' href='/store/dashboard'>
                    <IonIcon icon={selected==="dashboard"?home:homeOutline} color={selected==="dashboard"?"red":"medium"} />
                    <IonLabel color={selected==="dashboard"?"red":"medium"}>Dashboard</IonLabel>
                </IonTabButton>
                <IonTabButton tab='issueance' href='/store/issueance'>
                    <IonIcon icon={selected==="issueance"?send:sendOutline} color={selected==="issueance"?"red":"medium"} />
                    <IonLabel color={selected==="issueance"?"red":"medium"}>Issueance</IonLabel>
                </IonTabButton>
                <IonTabButton tab='usage' href='/store/usage'>
                    <IonIcon icon={selected==="usage"?receipt:receiptOutline} color={selected==="usage"?"red":"medium"} />
                    <IonLabel color={selected==="usage"?"red":"medium"}>Usage</IonLabel>
                </IonTabButton>
            </IonTabBar>
        </IonTabs>
    );
};

export default ItemTab;