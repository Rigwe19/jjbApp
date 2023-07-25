import { IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from "@ionic/react";
import { personAdd, personAddOutline, storefront, storefrontOutline } from "ionicons/icons";
import { Route, Redirect } from "react-router-dom";
import { useState } from "react";
import PrivateRoute from "../components/privateRoute";
import Attendance from "./Security/attendance";
import Customers from "./Account/customers";
import Orders from "./Dispatch/orders";
import Cuts from "./Production/Cuts";
import Left from "./Production/Left";
import Visitor from "./Security/visitors";
import { useRecoilValue } from "recoil";
import { User, userAtom } from "../recoil/userAtom";

const TabRoot: React.FC = () => {
    const user = useRecoilValue<User>(userAtom);
    const [selected, setSelected] = useState("home");
    const handleDidChange = (e: CustomEvent<{ tab: string; }>) => {
        setSelected(e.detail.tab);
    }
    let tab;
    if (user.department.toLowerCase() === "dispatch") {
        tab = <div>

        </div>
    }

    return (
        <IonTabs>
            <IonRouterOutlet>
                {/* <Route path="/tabs/products/:prod" component={Products}></Route> */}
                <Route path="/tabs" render={() => <Redirect to="/tabs/home" />} exact={true}></Route>
                <PrivateRoute exact path="/tabs/attendance" component={Attendance} department="security" />
                <PrivateRoute exact path="/tabs/visitors" component={Visitor} department="security" />
                <PrivateRoute exact path="/tabs/customers" component={Customers} department="dispatch" />
                <PrivateRoute exact path="/tabs/orders" component={Orders} department="dispatch" />
                <PrivateRoute exact path="/production/cuts" component={Cuts} department="production" />
                <PrivateRoute exact path="/production/left" component={Left} department="production" />


            </IonRouterOutlet>
            {user.department.toLowerCase() === "dispatch" &&
                <IonTabBar slot="bottom" onIonTabsDidChange={e => handleDidChange(e)}>
                    <IonTabButton tab="orders" href="/tabs/orders">
                        <IonIcon color="green" icon={selected === "orders" ? storefront : storefrontOutline} />
                        <IonLabel color="green">Orders</IonLabel>
                    </IonTabButton>
                    <IonTabButton tab="customers" href="/tabs/customers">
                        <IonIcon color="green" icon={selected === "customers" ? personAdd : personAddOutline} />
                        <IonLabel color="green">Customers</IonLabel>
                    </IonTabButton>
                </IonTabBar>}
            {user.department.toLowerCase() === "security" &&
                <IonTabBar slot="bottom" onIonTabsDidChange={e => handleDidChange(e)}>
                    <IonTabButton tab="attendance" href="/tabs/attendance">
                        <IonIcon color="green" icon={selected === "attendance" ? storefront : storefrontOutline} />
                        <IonLabel color="green">Orders</IonLabel>
                    </IonTabButton>
                    <IonTabButton tab="visitors" href="/tabs/visitors">
                        <IonIcon color="green" icon={selected === "visitors" ? personAdd : personAddOutline} />
                        <IonLabel color="green">Customers</IonLabel>
                    </IonTabButton>
                </IonTabBar>}
        </IonTabs>
    )
}
export default TabRoot;