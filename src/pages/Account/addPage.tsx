import { IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/react';
import { cart, cartOutline, people, peopleOutline, person, personOutline } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';
import { Route, Redirect, useLocation } from 'react-router';
import AddEmployee from './addEmployer';
import Customers from './customers';
import Supplier from './supplier';

const AddPage: React.FC = () => {
    const [segment, setSegment] = useState("Employee");
    const [selected, setSelected] = useState("customer");
    const location = useLocation();
    const isClean = useRef(false);
    useEffect(() => {
        isClean.current = true;
        let name = location.pathname;
        let tabs = ["employee", "customer", "supplier"];
        tabs.forEach(value => {
            if (name.includes(value)) {
                setSelected(value);
            }
        });
        return () => {
            isClean.current = false
        }
    }, []);
    const handleDidChange = (e: CustomEvent<{ tab: string; }>) => {
        setSelected(e.detail.tab);
    }

    return (
        // <IonPage>
        //     <IonHeader>
        //         <IonToolbar color='green'>
        //             <IonButtons slot="start">
        //                 <IonMenuButton />
        //             </IonButtons>
        //             <IonTitle>{segment}</IonTitle>
        //         </IonToolbar>
        //         <IonSegment value={segment} onIonChange={e => setSegment(e.detail.value)}>
        //             <IonSegmentButton value="Employee">Employee</IonSegmentButton>
        //             <IonSegmentButton value="Customer">Customer</IonSegmentButton>
        //             <IonSegmentButton value="Supplier">Supplier</IonSegmentButton>
        //         </IonSegment>
        //     </IonHeader>
        //     {segment === "Employee" && <AddEmployee />}
        //     {segment === "Customer" && <Customers />}
        //     {segment === "Supplier" && <Supplier />}
        // </IonPage>
        <IonTabs>
            <IonRouterOutlet>
                <Route exact path='/account/add/:tab(employee)' component={AddEmployee} />
                <Route exact path='/account/add/:tab(customer)' component={Customers} />
                <Route exact path='/account/add/:tab(supplier)' component={Supplier} />
                <Route exact path="/account/add/">
                    <Redirect to="/account/add/customer" />
                </Route>
            </IonRouterOutlet>
            <IonTabBar slot="bottom" onIonTabsDidChange={e => handleDidChange(e)}>
                <IonTabButton tab='employee' href='/account/add/employee'>
                    {selected ==="employee" && <IonIcon color="red" icon={person} /> }
                    {selected !=="employee" && <IonIcon color="medium" icon={personOutline} /> }
                    <IonLabel color={selected === "employee" ? "red" : "medium"}>Employee</IonLabel>
                </IonTabButton>
                <IonTabButton tab='customer' href='/account/add/customer'>
                    {selected ==="customer" && <IonIcon color="red" icon={people} /> }
                    {selected !=="customer" && <IonIcon color="medium" icon={peopleOutline} /> }
                    <IonLabel color={selected === "customer" ? "red" : "medium"}>Customers</IonLabel>
                </IonTabButton>
                <IonTabButton tab='supplier' href='/account/add/supplier'>
                    {selected ==="supplier" && <IonIcon color="red" icon={cart} /> }
                    {selected !=="supplier" && <IonIcon color="medium" icon={cartOutline} /> }
                    <IonLabel color={selected === "supplier" ? "red" : "medium"}>Supplier</IonLabel>
                </IonTabButton>
            </IonTabBar>
        </IonTabs>
    );
};

export default AddPage;