import { Http } from '@capacitor-community/http';
import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonIcon, IonInput, IonItem, IonItemDivider, IonItemGroup, IonLabel, IonModal, IonNote, IonPage, IonSearchbar, IonSelect, IonSelectOption, useIonActionSheet, useIonLoading } from '@ionic/react';
import { format } from 'date-fns';
import { addCircleOutline, arrowBack, closeOutline, handLeftOutline, printOutline, removeCircleOutline, saveOutline } from 'ionicons/icons';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import Receipt from '../../components/receipt';
import Toolbar from '../../components/toolbar';
import { useRecoilState, useRecoilValue } from 'recoil';
import { urlAtom } from '../../recoil/urlAtom';
import { User, userAtom } from '../../recoil/userAtom';
import { AccountDashboard, accountDashboardAtom } from '../../recoil/accountDashboardAtom';
interface IState {
    invoice_no: string;
    payment_mode_id: number;
    customer_id: number;
    sales: any[];
    total: number;
    paid: number;
    balance: number;
}

interface IDetails {
    invoice: string,
    customer_name: string,
    mode: string,
    sales: SaleDetail[],
    total: number,
    paid: number,
    balance: Function,
}
interface SaleDetail {
    qty: number,
    name: string,
    price: number,
    total: number,
    index: number,
}
const Sales: React.FC = () => {
    const user = useRecoilValue<User>(userAtom);
    const href = useRecoilValue<string>(urlAtom);
    const [dashboard, setDashboard] = useRecoilState<AccountDashboard>(accountDashboardAtom);
    const [present, dismiss] = useIonLoading();
    const [popup, popout] = useIonActionSheet();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [brands, setBrands] = useState([]);
    const [items, setItems] = useState([]);
    const [filters, setFilters] = useState([]);
    const [modes, setModes] = useState([]);
    const [customers, setCustomers] = useState([]);
    const isClean = useRef(false);
    const isValid = useRef(false);
    const [isFirst, setIsFirst] = useState(true);
    const page = useRef(null);
    const [customer, setCustomer] = useState({
        name: "",
        phone: "",
    })
    const [isOpen, setIsOpen] = useState(false);
    const [sale, setSale] = useState({
        brand_id: 0,
        item_id: 0,
        quantity: 0,
        unit_price: 0,
        total_price: 0,
    });
    const [sales, setSales] = useState([]);
    const initialState: IState = {
        invoice_no: "",
        payment_mode_id: 0,
        customer_id: 0,
        sales: [],
        total: 0,
        paid: 0,
        balance: 0,
    }
    const [state, setState] = useState(initialState);
    const [presentingElement, setPresentingElement] = useState<HTMLElement | null>(null)
    useLayoutEffect(() => {
        present("Loading...");
        isClean.current = true;
        Http.request({
            method: "GET",
            url: href + "/api/account/get/sales",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            }
        }).then(({ data }) => {
            if (isClean.current && data.success) {
                setState(prevState => ({ ...prevState, invoice_no: data.invoice }));
                setItems(data.items);
                setModes(data.mode);
                setCustomers(data.customers);
                setBrands(data.brands);
                setDetails(prevState => ({ ...prevState, invoice: data.invoice }));
                setSales(data.sales);
                setPresentingElement(page.current);
            }
        }).finally(() => {
            dismiss();
        });
        return () => {
            isClean.current = false;
            dismiss();
        }
    }, []);
    const initialDetails: IDetails = {
        mode: "",
        total: 0,
        paid: 0,
        balance() {
            return this.total - this.paid;
        },
        invoice: "",
        sales: [],
        customer_name: ""
    }
    const [details, setDetails] = useState(initialDetails);

    const handleChange = (value: any, key: string) => {
        setState(prevState => ({ ...prevState, [key]: value }));
        switch (key) {
            case "customer_id":
                let name = customers.find(val => {
                    return val.id === value;
                });
                if (name !== undefined)
                    setDetails(prevState => ({ ...prevState, "customer_name": name.name }))
                break;
            case "sale_mode_id":
                let mode = modes.find(val => {
                    return val.id === value;
                });
                if (mode !== undefined)
                    setDetails(prevState => ({ ...prevState, mode: mode.mode }))
                break;
            // case "total":
            //     setDetails(prevState => ({ ...prevState, total: value }))
            //     break;
            case "paid":
                setDetails(prevState => ({ ...prevState, paid: value }))
                break;

            default:
                break;
        }
    }

    const handleSaleChange = (value: any, key: string) => {
        setSale(prevState => ({ ...prevState, [key]: value }));
    }

    const handleDismiss = () => {
        setIsOpen(false);
    }
    const handleAdd = () => {
        let newSale = { ...sale };
        newSale.total_price = newSale.quantity * newSale.unit_price;
        let sales = state.sales;
        let saleDetail = [...details.sales];
        let detail: SaleDetail = {
            index: saleDetail.length + 1,
            qty: newSale.quantity,
            price: newSale.unit_price,
            total: newSale.total_price,
            name: filters.find(val => {
                return val.id === newSale.item_id;
            }).type
        }
        console.log(sales);
        let isAvailable = false;
        sales.forEach(value => {
            if (value.item_id === newSale.item_id) {
                isAvailable = true;
                value.quantity += newSale.quantity;
                value.total_price += newSale.total_price
            }
        });
        saleDetail.forEach(value => {
            if (value.name === detail.name) {
                value.qty += detail.qty;
                value.total += detail.total
            }
        })

        if (!isAvailable) {
            sales.push(newSale);
            saleDetail.push(detail);
        }
        setFilters([]);
        setSale({
            brand_id: 0,
            item_id: 0,
            quantity: 0,
            total_price: 0,
            unit_price: 0
        });
        setState(prevState => ({ ...prevState, sales: sales }));
        setDetails(prevState => ({ ...prevState, sales: saleDetail }));
    }

    const getName = (id: number) => {
        let item = items.find(value => {
            return value.id === id;
        });
        if (item !== undefined)
            return item.type;
    }
    const handleRemove = (index: number) => {
        let sales = state.sales;
        sales.splice(index, 1);
        setState({ ...state, sales: sales });
    }
    useEffect(() => {
        isClean.current = true;
        let sum = 0;
        state.sales.forEach(element => {
            sum += element.total_price;
        });
        if (isClean.current) {
            setState(state => ({ ...state, total: sum }));
            setDetails(state => ({ ...state, total: sum }));
        }
        return () => {
            isClean.current = false
        }
    }, [JSON.stringify(state.sales)]);

    useEffect(() => {
        isClean.current = true;
        let balance = state.total - state.paid;
        if (isClean.current) {
            setState(state => ({ ...state, balance: balance }));
        }
        return () => {
            isClean.current = false
        }
    }, [state.paid]);

    useEffect(() => {
        isClean.current = true;
        let id = sale.brand_id;
        let filter = items.filter(value => {
            return value.brand_id === id;
        });
        if (isClean.current && filter !== null) {
            setFilters(filter);
        }
        return () => {
            isClean.current = false
        }
    }, [sale.brand_id]);
    useEffect(() => {
        isClean.current = true;
        if (sale.item_id !== 0) {
            let getPrice = items.find(value => {
                return value.id === sale.item_id
            });
            if (getPrice !== undefined)
                setSale(prevState => ({ ...prevState, unit_price: getPrice.price || 0 }));
        }
        return () => {
            isClean.current = false;
        }
    }, [sale.item_id])


    const handleCustomerSave = () => {
        isValid.current = true;
        Object.keys(customer).forEach((element: any) => {
            if (customer[element] === "" || customer[element] === null) {
                isValid.current = false;
                setIsFirst(false);
            }
        });
        if (isValid.current) {
            present("Saving Customer...")
            Http.request({
                method: "POST",
                url: href + "/api/account/add/customer",
                headers: {
                    'Content-Type': 'application/json',
                    'Data-Type': 'json',
                    'Authorization': 'Bearer ' + user.token
                },
                data: customer
            }).then(({ data }) => {
                if (data.success) {
                    setIsOpen(false);
                    setCustomer({
                        name: "",
                        phone: "",
                    });
                    setCustomers(data.customers);
                    setIsFirst(false);
                    isValid.current = false;
                }
            }).finally(() => {
                dismiss();
            });
        }
    }
    const handleSave = () => {
        isValid.current = true;
        Object.keys(state).forEach((element: any) => {
            if (element === "balance") {
                return;
            }
            if (element !== "sales" && state[element] === 0) {
                isValid.current = false;
                setIsFirst(false);
            } else if (element === "sales" && state[element].length === 0) {
                isValid.current = false;
                setIsFirst(false);
            }
        });
        if (isValid.current) {
            present("Saving Sale...")
            Http.request({
                method: "POST",
                url: href + "/api/account/add/sales",
                headers: {
                    'Content-Type': 'application/json',
                    'Data-Type': 'json',
                    'Authorization': 'Bearer ' + user.token
                },
                data: state
            }).then(({ data }) => {
                if (data.success) {
                    setState(prevState => ({
                        ...prevState,
                        invoice_no: data.invoice,
                    }));
                    setSales(data.sales);
                    handleSaleDismiss();
                    setDashboard(data.dashboard);
                    isValid.current = false;
                }
            }).finally(() => {
                dismiss();
            });
        }
    }
    const printRef = useRef(null);

    const printMe = useReactToPrint({
        content: () => printRef.current,
        copyStyles: true,
    });
    const [openSale, setOpenSale] = useState(false);
    const handleSaleDismiss = () => {
        setSale({
            brand_id: 0,
            item_id: 0,
            quantity: 0,
            total_price: 0,
            unit_price: 0
        });
        setDetails(prevState => ({
            ...prevState,
            customer_name: "",
            invoice: "",
            mode: "",
            paid: 0,
            sales: [],
        }));
        setState(prevState => ({
            ...prevState,
            balance: 0,
            customer_id: 0,
            paid: 0,
            payment_mode_id: 0,
            sales: [],
            total: 0
        }));
        setOpenSale(false);
    }

    const handleClick = (index: number) => {
        setSelectedIndex(index);
        let selected = { ...sales[index] };
        console.log(selected)
        // let saleDetail = [...selected.sales];
        let saleDetail: any = [...selected.sales].map((value, index) => {
            return {
                index: index + 1,
                qty: value.quantity,
                price: value.unit_price,
                total: value.total_price,
                name: items.find(val => {
                    return val.id === value.item_id;
                }).type
            }
        });
        let det = {
            mode: selected.mode,
            paid: selected.paid,
            sales: selected.sales,
            customer_name: selected.name,
            date: format(new Date(selected.date), "dd/MM/yyyy"),
            // balance: selected.balance
        };
        setDetails(prevState => ({ ...prevState, ...det, sales: saleDetail }));
        setState(selected);
        // let ids = value.brand.map(val => {
        //     return val.id
        // });
        // setPayment({ ...payment, id: value.id, ids: ids });
        let button = [];
        button = [
            { text: 'Edit', color: "theme", icon: handLeftOutline, role: 'destructive', handler: () => handleOpenSale("edit") },
            { text: 'Reprint', color: "theme", icon: printOutline, role: 'destructive', handler: () => printMe() },
            { text: 'Cancel', icon: closeOutline, role: 'destructive', handler: () => popout() }
        ];
        popup({
            buttons: button,
            header: sales[index].name
        });
    }
    const handleOpenSale = (type: string) => {
        if (type === "new") {
            setState(prevState => ({
                ...prevState,
                balance: 0,
                customer_id: 0,
                paid: 0,
                payment_mode_id: 0,
                sales: [],
                total: 0
            }));
            setDetails(prevState => ({
                ...prevState,
                customer_name: "",
                invoice: "",
                mode: "",
                paid: 0,
                sales: [],
                date: format(new Date(), "dd/MM/yyyy")
            }));
        }
        setOpenSale(true);
    }
    const keyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            handleAdd();
        }
    }
    return (
        <IonPage ref={page}>
            <Toolbar title="Daily Sales" />
            <IonContent className="ion-padding">
                {/* <pre>{JSON.stringify(details, null, 2)}</pre> */}
                <IonButton className='mb-1' color='green' onClick={() => handleOpenSale("new")}>New Sale</IonButton>
                <IonSearchbar placeholder='Search by customer/invoice no' />
                <IonItemGroup>
                    {sales.map((value, index) => (
                        <IonItem key={"sales_ionitem_" + value.id} fill="solid" button className='mb-1' onClick={() => handleClick(index)}>
                            {/* <IonNote slot='start'>{value.invoice_no}</IonNote> */}
                            <IonLabel>
                                <p>{value.name} paid ₦{value.paid} out of ₦{value.total}</p>
                                <p>Balance remains ₦{value.balance}</p>
                            </IonLabel>
                            <IonNote slot="end">{format(new Date(value.date), "EEEE, dd LLLL yyyy")}</IonNote>
                        </IonItem>))}
                </IonItemGroup>
                <div className="hidden">
                    <Receipt ref={printRef} details={details} />
                </div>
                <IonModal isOpen={openSale} onDidDismiss={handleSaleDismiss}>
                    {/* <IonHeader>
                        <IonToolbar>
                            <IonTitle>New Sale</IonTitle>
                            <IonButtons slot='start'>
                                <IonButton onClick={() => handleSaleDismiss()}>
                                    <IonIcon slot='icon-only' icon={arrowBack} />
                                </IonButton>
                            </IonButtons>
                        </IonToolbar>
                    </IonHeader>
                    <IonContent className='ion-padding'>
                        
                    </IonContent> */}
                    <IonCard className='overflow-auto' scrol>
                        <IonCardHeader>
                            <IonCardTitle>
                                <IonItem lines='none'>
                                    <IonButtons slot='start'>
                                        <IonButton onClick={() => handleSaleDismiss()}>
                                            <IonIcon slot='icon-only' icon={arrowBack} />
                                        </IonButton>
                                    </IonButtons>
                                    <IonLabel color='medium'>New Sale</IonLabel>
                                </IonItem>
                            </IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            <IonItem fill='solid' className='mb-1'>
                            <IonLabel color='medium' position="stacked">Invoice Number</IonLabel>
                            <IonInput readonly value={state.invoice_no} onIonChange={(e) => handleChange(e.detail.value, "invoice_no")} />
                        </IonItem>
                        <IonItem fill='solid' className='mb-1'>
                            <IonLabel color='medium' position="stacked">Sale mode</IonLabel>
                            <IonSelect interface='action-sheet' placeholder='select sale mode' value={state.payment_mode_id} onIonChange={(e: { detail: { value: any; }; }) => handleChange(e.detail.value, "payment_mode_id")}>
                                {modes.map(value => (<IonSelectOption key={value.id} value={value.id}>{value.mode} Mode</IonSelectOption>))}
                            </IonSelect>
                        </IonItem>
                        <IonItem fill='solid' className='mb-1'>
                            <IonLabel color='medium' position="stacked">Customer Name</IonLabel>
                            <IonSelect interface='action-sheet' placeholder='select customer' value={state.customer_id} onIonChange={(e: { detail: { value: any; }; }) => handleChange(e.detail.value, "customer_id")}>
                                {customers.map(value => (<IonSelectOption key={value.id} value={value.id}>{value.name}</IonSelectOption>))}
                            </IonSelect>
                            <IonButtons slot='end'>
                                <IonButton onClick={() => setIsOpen(true)}>
                                    <IonIcon color='success' slot="icon-only" icon={addCircleOutline} />
                                </IonButton>
                            </IonButtons>
                        </IonItem>
                        <IonItemGroup>
                            <IonItemDivider>Items</IonItemDivider>
                            <div className="flex">
                                <IonItem fill='solid' className='mb-1 w-1/2'>
                                    <IonLabel color='medium' position="stacked">Brand</IonLabel>
                                    <IonSelect interface='action-sheet' placeholder='select brand' value={sale.brand_id} onIonChange={(e: { detail: { value: any; }; }) => handleSaleChange(e.detail.value, "brand_id")}>
                                        {brands.map(value => (<IonSelectOption key={value.id} value={value.id}>{value.name}</IonSelectOption>))}
                                    </IonSelect>
                                </IonItem>
                                <IonItem fill='solid' className='mb-1 w-1/2'>
                                    <IonLabel color='medium' position="stacked">Item Name</IonLabel>
                                    <IonSelect interface='action-sheet' placeholder='select item' value={sale.item_id} onIonChange={(e: { detail: { value: any; }; }) => handleSaleChange(e.detail.value, "item_id")}>
                                        {filters.map(value => (<IonSelectOption key={value.id} value={value.id}>{value.type}</IonSelectOption>))}
                                    </IonSelect>
                                </IonItem>
                            </div>

                            <div className="flex">
                                <IonItem fill='solid' className='mb-1 w-1/2'>
                                    <IonLabel color='medium' position="stacked">Item Quantity</IonLabel>
                                    <IonInput inputmode='numeric' value={sale.quantity || 0} onIonChange={(e) => handleSaleChange(parseInt(e.detail.value), "quantity")} />
                                </IonItem>
                                <IonItem fill='solid' className='mb-1 w-1/2'>
                                    <IonLabel color='medium' position="stacked">Item Unit Price</IonLabel>
                                    <IonInput /* onKeyDown={e => keyPress(e)} */ inputmode='numeric' value={sale.unit_price || 0} onIonChange={(e) => handleSaleChange(parseInt(e.detail.value), "unit_price")} />
                                </IonItem>
                            </div>
                            <IonButton expand='block' color='warning' onClick={handleAdd}>
                                <IonIcon slot="start" icon={addCircleOutline} />
                                Add</IonButton>
                        </IonItemGroup>
                        <IonItemDivider>Item Lists</IonItemDivider>
                        {state.sales.map((value, index) => (
                            <IonItem key={index} className="mb-1">
                                <IonNote slot="start">{"₦" + value.total_price}</IonNote>
                                <IonLabel color='medium'>
                                    <p>{getName(value.item_id)}</p>
                                    <p>{value.quantity} {getName(value.item_id)} at ₦{value.unit_price} each</p>
                                </IonLabel>
                                <IonButtons slot="end">
                                    <IonButton onClick={() => handleRemove(index)}>
                                        <IonIcon slot="icon-only" color='danger' icon={removeCircleOutline} />
                                    </IonButton>
                                </IonButtons>
                            </IonItem>))}
                        <IonItemGroup className='flex'>
                            <IonItem fill='solid' className='w-1/3'>
                                <IonLabel color='medium' position='stacked'>Total</IonLabel>
                                <IonInput readonly value={"₦" + (state.total || 0)} />
                            </IonItem>
                            <IonItem className='w-1/3' fill='solid'>
                                <IonLabel color='medium' position="stacked">Paid</IonLabel>
                                <IonInput value={state.paid || 0} max={state.total} onIonChange={(e) => handleChange(parseInt(e.detail.value), "paid")} />
                            </IonItem>
                            <IonItem className='w-1/3' fill='solid'>
                                <IonLabel color='medium' position="stacked">Balance</IonLabel>
                                <IonInput readonly value={"₦" + (state.balance || 0)} />
                            </IonItem>
                        </IonItemGroup>
                        <div className="flex">
                            <IonButton color='green' expand='block' className='w-1/2' onClick={handleSave}>
                                <IonIcon slot="start" icon={saveOutline} />
                                Save
                            </IonButton>
                            <IonButton onClick={printMe} className='w-1/2'>
                                <IonIcon slot='start' icon={printOutline} />
                                Print
                            </IonButton>
                        </div>

                        </IonCardContent>
                    </IonCard>
                </IonModal>

                <IonModal onDidDismiss={handleDismiss} isOpen={isOpen}>
                    <IonCard>
                        <IonCardHeader>
                            <IonCardTitle>
                                <IonItem lines='none'>
                                    <IonButtons slot='start'>
                                        <IonButton onClick={() => setIsOpen(false)}>
                                            <IonIcon slot='icon-only' icon={arrowBack} />
                                        </IonButton>
                                    </IonButtons>
                                    <IonLabel color='medium'>Create new client</IonLabel>
                                </IonItem>
                            </IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            <IonItem fill='solid' className='mb-1'>
                                <IonLabel color='medium' position="stacked">Customer Name</IonLabel>
                                <IonInput value={customer.name} onIonChange={(e) => setCustomer({ ...customer, name:e.detail.value })} />
                            </IonItem>
                            <IonItem fill='solid' className='mb-1'>
                                <IonLabel color='medium' position="stacked">Customer Phone Number</IonLabel>
                                <IonInput inputmode='numeric' value={customer.phone} onIonChange={(e) => setCustomer({ ...customer, phone:e.detail.value })} />
                            </IonItem>
                            <IonButton expand='block' color='green' onClick={handleCustomerSave}>
                                <IonIcon slot="start" icon={saveOutline} />
                                Save
                            </IonButton>
                        </IonCardContent>
                    </IonCard>
                </IonModal>
            </IonContent>
            {/* <IonFooter className='px-4'>
            </IonFooter> */}
        </IonPage>
    );
};

export default Sales;