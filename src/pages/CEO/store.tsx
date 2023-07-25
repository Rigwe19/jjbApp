import { IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/react';
import { fastFood, fastFoodOutline, book, bookOutline, shareSocial, shareSocialOutline } from 'ionicons/icons';
import React, { useState } from 'react';
import { Redirect } from 'react-router';
import PrivateRoute from '../../components/privateRoute';
import CeoDirect from './store/direct';
import CeoIssueance from './store/issueance';
import CeoNonDirect from './store/nonDirect';

const CeoStore: React.FC = () => {
    const [ selected, setSelected ] = useState("direct");
    // const history = useHistory();
    const handleDidChange = (e: CustomEvent<{ tab: string; }>) => {
        setSelected(e.detail.tab);
    }

    return (
        <IonTabs>
            <IonRouterOutlet>
                <PrivateRoute department="admin" exact path='/admin/store/:tab(direct)' component={CeoDirect} />
                <PrivateRoute department="admin" exact path='/admin/store/:tab(non)' component={CeoNonDirect} />
                <PrivateRoute department="admin" exact path='/admin/store/:tab(issueance)' component={CeoIssueance} />
                {/* <Route exact path='/admin/store/:tab(usage)' component={Usage} /> */}
                <PrivateRoute department="admin" exact path="/admin/store/">
                    <Redirect to="/admin/store/direct" />
                </PrivateRoute>
            </IonRouterOutlet>
            <IonTabBar slot="bottom" onIonTabsDidChange={e => handleDidChange(e)}>
                <IonTabButton tab='direct' href='/admin/store/direct'>
                    <IonIcon icon={selected==="direct"?fastFood:fastFoodOutline} color={selected==="direct"?"red":"medium"} />
                    <IonLabel color={selected==="direct"?"red":"medium"}>Direct</IonLabel>
                </IonTabButton>
                <IonTabButton tab='non' href='/admin/store/non'>
                    <IonIcon icon={selected==="non"?book:bookOutline} color={selected==="non"?"red":"medium"} />
                    <IonLabel color={selected==="non"?"red":"medium"}>Non-Direct</IonLabel>
                </IonTabButton>
                {/* <IonTabButton tab='dashboard' href='/admin/store/dashboard'>
                    <IonIcon icon={selected==="dashboard"?home:homeOutline} color={selected==="dashboard"?"red":"medium"} />
                    <IonLabel color={selected==="dashboard"?"red":"medium"}>Dashboard</IonLabel>
                </IonTabButton> */}
                <IonTabButton tab='issueance' href='/admin/store/issueance'>
                    <IonIcon icon={selected==="issueance"?shareSocial:shareSocialOutline} color={selected==="issueance"?"red":"medium"} />
                    <IonLabel color={selected==="issueance"?"red":"medium"}>Issueance</IonLabel>
                </IonTabButton>
                {/* <IonTabButton tab='usage' href='/admin/store/usage'>
                    <IonIcon icon={selected==="usage"?receipt:receiptOutline} color={selected==="usage"?"red":"medium"} />
                    <IonLabel color={selected==="usage"?"red":"medium"}>Usage</IonLabel>
                </IonTabButton> */}
            </IonTabBar>
        </IonTabs>
    );
};

export default CeoStore;