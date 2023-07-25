import { Http } from '@capacitor-community/http';
import { IonAvatar, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonList, IonModal, IonNote, IonPage, IonToolbar, useIonLoading } from '@ionic/react';
import { arrowBack, closeCircleOutline, personOutline, saveOutline } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';

import Toolbar from '../../components/toolbar';
import { useRecoilValue } from 'recoil';
import { urlAtom } from '../../recoil/urlAtom';
import { User, userAtom } from '../../recoil/userAtom';
interface State {
    customer_id: number;
    items: Items[]
}
interface Items {
    brand_id: number,
    item_id: number;
    quantity: number;
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

}
const ItemLeft: React.FC = () => {
    const user = useRecoilValue<User>(userAtom);
    const href = useRecoilValue<string>(urlAtom);
    const [present, dismiss] = useIonLoading();
    const [customers, setCustomers] = useState([]);
    const [filters, setFilters] = useState([]);
    const [itemErrors, setItemErrors] = useState({
        brand_id: false,
        item_id: false,
        quantity: false,
    });
    const [itemFirst, setItemFirst] = useState(true);
    const initialValue: any = {
        sale_id: 0,
        customer_id: 0,
        items: []
    };
    const initialItems = {
        brand_id: 0,
        item_id: 0,
        quantity: 0,
    };
    const [isOpen, setIsOpen] = useState(false);
    const [item, setItem] = useState(initialItems)
    const isClean = useRef(false);
    const [state, setState] = useState<State>(initialValue);
    const [brands, setBrands] = useState([]);
    const [items, setItems] = useState([]);
    const [itemFilters, setItemFilters] = useState([]);
    const [isFirst, setIsFirst] = useState(true);
    const [sales, setSales] = useState<Sales[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const [errors, setErrors] = useState({
        customer_id: false,
        items: false,
    })
    const handleDocumentClick = () => {
        if (popOpen) {
            setPopOpen(false);
        }
    }
    useEffect(() => {
        isClean.current = true;
        document.addEventListener("click", handleDocumentClick);
        present("Loading...");
        Http.request({
            method: "GET",
            url: href + "/api/get/security/left",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            }
        }).then(({ data }) => {
            if (isClean.current && data.success) {
                setCustomers(data.customers);
                setBrands(data.brands);
                setItems(data.items);
                setSales(data.sales);
            }
        }).finally(() => {
            dismiss();
        });
        return () => {
            document.removeEventListener("click", handleDocumentClick);
            isClean.current = false;
        }
    }, []);
    useEffect(() => {
        if (item.brand_id > 0) {
            let newItem = items.filter(value => {
                return value.brand_id === item.brand_id;
            });
            if (newItem !== undefined) {
                setItemFilters(newItem);
            }
        } else {
            setItemFilters([]);
        }
    }, [item.brand_id]);
    const [customer, setCustomer] = useState("");
    const [popOpen, setPopOpen] = useState(false);
    useEffect(() => {
        isClean.current = true;
        if (customer.length > 0) {
            let filt = customers.filter(value => {
                return value.name.toLowerCase().includes(customer.toLowerCase());
            });
            setFilters(filt);
            if (filt.length > 0) {
                if (filt[0].name !== customer) {
                    setPopOpen(true);
                }
            }
        } else {
            setPopOpen(false);
        }
        return () => {
            isClean.current = false;
        }
    }, [customer]);
    const getItem = (value: number) => {
        let findItem = items.find(val => {
            return val.id === value;
        });
        if (findItem !== undefined) {
            return findItem.type;
        }
    }

    const handleChange = (value:number, index: number) => {
        let item = [...state.items];
        item[index].quantity = value;
        setState(prevState => ({...prevState, items: item}));
    }
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
            present("Saving...")
            Http.request({
                method: "POST",
                url: href + "/api/security/add/left",
                headers: {
                    'Content-Type': 'application/json',
                    'Data-Type': 'json',
                    'Authorization': 'Bearer ' + user.token
                },
                data: state
            }).then(({ data }) => {
                if (data.success) {
                    setState(initialValue);
                    setSales(data.sales);
                    handleDismiss();
                }
            }).finally(() => {
                dismiss();
            });
        }
    }
    const handleDismiss = () => {
        setState(initialValue);
        setItem(initialItems);
        setIsFirst(true);
        setItemFirst(true);
        setIsOpen(false);
    }
    const doExpand = (value: React.SetStateAction<number>, index: number) => {
        setSelectedIndex(index);
        let item: { brand_id: any; item_id: any; quantity: number; }[] = [];
        sales[index].sales.forEach(element => {
            item.push({
                brand_id: element.brand_id,
                item_id: element.item_id,
                quantity: 0
            })
        });
        setState(prevState => ({ ...prevState, sale_id: sales[index].id, customer_id: sales[index].customer_id, items: item, id: sales[index].id }))
        setIsOpen(true);
    }
    return (
        <IonPage>
            <Toolbar title="Items Left" />
            <IonContent className="ion-padding">
                {/* <pre>{JSON.stringify(item, null, 2)}</pre> */}
                <IonList>
                    {sales.map((value, index) => (
                        <IonItem fill='solid' className="mb-1" key={value.id} button onClick={() => doExpand(value.id, index)}>
                            <IonIcon slot='start' icon={personOutline} />
                            <IonLabel color='medium'>{value.customer_name}</IonLabel>
                            <IonNote slot='end'>{value.date}</IonNote>
                            {/* <IonNote slot='end'>{value.total} breads</IonNote> */}
                        </IonItem>
                    ))}
                </IonList>
                {sales.length===0&&<div className="w-full h-full flex justify-center items-center">
                    <div className='flex flex-col justify-center'>
                        <IonIcon icon={closeCircleOutline} color="medium" size='large' className='mx-auto' />
                        <IonLabel color="medium">No available sales</IonLabel>
                    </div>
                </div>}
                {/* <IonButton color="green" onClick={e => setIsOpen(true)}>Customer Left</IonButton> */}
            </IonContent>
            <IonModal isOpen={isOpen} onIonDidDismiss={handleDismiss}>
                <IonCard>
                    <IonCardHeader>
                        <IonToolbar>
                            <IonButtons slot="start">
                                <IonButton onClick={handleDismiss}>
                                    <IonIcon slot="icon-only" icon={arrowBack} />
                                </IonButton>
                            </IonButtons>
                            <IonCardTitle>Customer Left</IonCardTitle>
                        </IonToolbar>
                    </IonCardHeader>
                    <IonCardContent>
                        {/* <pre>{JSON.stringify(state, null, 2)}</pre> */}
                        <IonList>
                            {state.items.map((value, index) => (
                                <IonItem className='mb-1' key={value.item_id}>
                                    <IonAvatar slot="start">
                                        <IonImg />
                                    </IonAvatar>
                                    <IonLabel position='stacked'>
                                        <p>{getItem(value.item_id)}</p>
                                    </IonLabel>
                                    <IonInput value={value.quantity || 0} onIonChange={e => handleChange(parseInt(e.detail.value), index)}  />
                                    {/* <IonNote slot="end">{value.quantity}</IonNote> */}
                                </IonItem>))}
                        </IonList>
                        <IonButton expand="block" color="green" onClick={handleSave}>
                            <IonIcon icon={saveOutline} slot="start" />
                            Save
                        </IonButton>
                    </IonCardContent>
                </IonCard>
            </IonModal>
        </IonPage>
    );
};

export default ItemLeft;