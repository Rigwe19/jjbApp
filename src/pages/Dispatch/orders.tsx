import { Http } from '@capacitor-community/http';
import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonIcon, IonInput, IonItem, IonLabel, IonModal, IonNote, IonPage, IonToolbar, useIonActionSheet, useIonLoading, IonItemDivider, useIonToast, IonToggle } from '@ionic/react';
import { arrowBack, closeCircleOutline, personOutline } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';

import Toolbar from '../../components/toolbar';
import { useRecoilValue } from 'recoil';
import { urlAtom } from '../../recoil/urlAtom';
import { User, userAtom } from '../../recoil/userAtom';
interface IBrands {
    id: number;
    name: string;
}
interface Sales {
    customer_id: number;
    customer_name: string;
    date: string;
    invoice_no: string;
    id: number;
    payement_mode: number;
    total: number;
    paid: number;
    balance: number;
    sales: Sale[],
}
interface Sale {
    item_id: any;
    brand_id: any;
    quantity: number;
    dispatch: string | number;
    type: string;
    name: string;
    amount: number;
    id: number;
    balance: number;

}
interface State {
    customer_id: number;
    items: Items[]
}
interface Items {
    brand_id: number,
    item_id: number;
    quantity: number;
}
const Dispatches: React.FC = () => {
    const user = useRecoilValue<User>(userAtom);
    const href = useRecoilValue<string>(urlAtom);
    const [popup, popout] = useIonActionSheet();
    const [toasted] = useIonToast();
    const [showDispatch, setShowDispatch] = useState(false);
    const isClean = useRef(false);
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const [isDispatch, setIsDispatch] = useState(true);
    const [sales, setSales] = useState<Sales[]>([]);
    const [itemErrors, setItemErrors] = useState({
        brand_id: false,
        item_id: false,
        quantity: false,
    });
    const [items, setItems] = useState([]);
    const [errors, setErrors] = useState({
        customer_id: false,
        items: false,
    });
    const initialItems = {
        brand_id: 0,
        item_id: 0,
        quantity: 0,
    };
    const [item, setItem] = useState(initialItems);
    const [show, hide] = useIonLoading();
    const [filter, setFilter] = useState([{
        id: 0,
        name: "",
        customer_id: "54",
        phone: "",
    }]);
    const [customer, setCustomer] = useState("");
    const initialValue: any = {
        sale_id: 0,
        customer_id: 0,
        items: []
    };
    const [state, setState] = useState<State>(initialValue);

    useEffect(() => {
        isClean.current = true;
        show("Loading...");
        Http.request({
            method: "GET",
            url: href + "/api/get/dispatch/dispatches",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            }
        }).then(({ data }) => {
            if (isClean.current && data.success) {
                setSales(data.sales);
            }
        }).finally(() => {
            hide();
        });
        return () => {
            isClean.current = false;
        }
    }, []);

    const handleSave = () => {
        let isValid = true;
        Object.entries(state).forEach((element: any) => {
            if (element[0] === "customer_id" && element[1] === 0) {
                isValid = false;
                errors.customer_id = true;
            }
            if (element[0] === "items" && element[1].length === 0) {
                isValid = false;
                errors.items = true;
            }
        });

        if (isValid) {
            show("Saving Dispatch...");
            Http.request({
                method: "POST",
                url: href + "/api/dispatch/add/dispatches",
                headers: {
                    'Content-Type': 'application/json',
                    'Data-Type': 'json',
                    'Authorization': 'Bearer ' + user.token
                },
                data: state
            }).then(({ data }) => {
                if (data.success) {
                    setSales(data.sales);
                    handleDismiss();
                }
            }).finally(() => {
                hide();
            });
        }
    }
    const handleDismiss = () => {
        setState(initialValue);
        setItem(initialItems);
        setShowDispatch(false);
    }
    const doExpand = (value: React.SetStateAction<number>, index: number) => {
            setSelectedIndex(index);
            let item: { brand_id: any; item_id: any; quantity: number; }[] = [];
            sales[index].sales.forEach(element => {
                item.push({
                    brand_id: element.brand_id,
                    item_id: element.item_id,
                    quantity: 0,
                    available: element.balance
                })
            });
            setState(prevState =>({...prevState, sale_id: sales[index].id, customer_id: sales[index].customer_id, items: item, id: sales[index].id}))
            setShowDispatch(true);
    }

    const handleChange = (value:number, index: number) => {
        let item = [...state.items];
        item[index].quantity = value;
        setState(prevState => ({...prevState, items: item}));
    }

    const handleCheck = (e: boolean, index: number, value: number) => {
        let item = [...state.items];
        if(e){
            item[index].quantity = value;
        }else{
            item[index].quantity = 0;
        }
        setState(prevState => ({...prevState, items: item}));
    }

    const handleDispatchAll = (value: boolean) => {
        setIsDispatch(value);
        let item = [...state.items];
        if(value){
            item.forEach((element, index) => {
            element.quantity = sales[selectedIndex].sales[index].quantity;
        });
        }else{
            item.forEach((element) => {
                element.quantity = 0;
            });
        }
        
        setState(prevState => ({...prevState, items: item}));
    }

    return (
        <IonPage>
            <Toolbar title="Dispatch" />
            <IonContent className="ion-padding">
                <div>
                    {sales.map((value, index) => (
                        <IonItem fill='solid' className="mb-1" key={value.id} button onClick={() => doExpand(value.id, index)}>
                            <IonIcon slot='start' icon={personOutline} />
                            <IonLabel color='medium'>{value.customer_name}</IonLabel>
                            <IonNote slot='end'>{value.date}</IonNote>
                            {/* <IonNote slot='end'>{value.total} breads</IonNote> */}
                        </IonItem>
                    ))}
                </div>
                {sales.length===0&&<div className="w-full h-full flex justify-center items-center">
                    <div className='flex flex-col justify-center'>
                        <IonIcon icon={closeCircleOutline} color="medium" size='large' className='mx-auto' />
                        <IonLabel color="medium">No available sales</IonLabel>
                    </div>
                </div>}
                <IonModal isOpen={showDispatch} onDidDismiss={handleDismiss} className="">
                    <IonCard>
                        <IonCardHeader>
                            <IonToolbar fill='solid' lines='none'>
                                <IonButtons slot='start'>
                                    <IonButton onClick={() => setShowDispatch(false)}>
                                        <IonIcon slot='icon-only' icon={arrowBack} />
                                    </IonButton>
                                </IonButtons>
                                <IonCardTitle>Dispatch product</IonCardTitle>
                            </IonToolbar>
                        </IonCardHeader>
                        <IonCardContent>
                            <pre>
                                {JSON.stringify(state.items, null, 2)}
                            </pre>
                            <IonItem fill='solid'>
                                <IonLabel>Dispatch All</IonLabel>
                                <IonToggle color='green' onIonChange={e => handleDispatchAll(e.detail.checked)} checked={isDispatch} slot='end' />
                            </IonItem>
                            {!isDispatch && <IonItemDivider>Indvidual Items</IonItemDivider>}
                            {!isDispatch && sales?.[selectedIndex]?.sales.map((value, index) => {
                                return (
                                    <IonItem fill='solid' className='mb-1' key={`dispatch_orders_${value.id}`}>
                                        <IonNote slot="start">10 Available</IonNote>
                                        <IonLabel color='medium' position='stacked'>{`${value.quantity} ${value.type}`}</IonLabel>
                                        <IonInput type='number' inputMode='numeric' inputmode='numeric' onIonChange={e => handleChange(parseInt(e.detail.value), index)} value={state?.items?.[index]?.quantity||0} max={value.quantity} min={0} />
                                        <IonToggle slot='end' color='green' onIonChange={e => handleCheck(e.detail.checked, index, value.quantity)}></IonToggle>
                                        {/* <IonButton></IonButton> */}
                                    </IonItem>
                                )
                            })}
                            <IonButton color='green' expand='block' className='mt-2' onClick={handleSave}>Dispatch</IonButton>
                        </IonCardContent>
                    </IonCard>
                </IonModal>
            </IonContent>
        </IonPage>
    );
};

export default Dispatches;