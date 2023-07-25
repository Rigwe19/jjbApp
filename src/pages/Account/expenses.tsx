import { Http } from '@capacitor-community/http';
import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonIcon, IonInput, IonItem, IonItemDivider, IonItemGroup, IonLabel, IonModal, IonNote, IonPage, IonSearchbar, IonSelect, IonSelectOption, IonTextarea, useIonLoading } from '@ionic/react';
import { format } from 'date-fns';
import { addCircleOutline, alertCircleOutline, arrowBack, saveOutline } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';
import convert from "convert-units";
import Toolbar from '../../components/toolbar';
import { useRecoilState, useRecoilValue } from 'recoil';
import { urlAtom } from '../../recoil/urlAtom';
import { User, userAtom } from '../../recoil/userAtom';
import { AccountDashboard, accountDashboardAtom } from '../../recoil/accountDashboardAtom';

const AccountExpenses: React.FC = () => {
    const user = useRecoilValue<User>(userAtom);
    const href = useRecoilValue<string>(urlAtom);
    const [dashboard, setDashboard] = useRecoilState<AccountDashboard>(accountDashboardAtom);
    const isClean = useRef(false);
    const [isFirst, setIsFirst] = useState(true);
    const [purErrors, setPurErrors] = useState({
        expense_id: false,
        expense_type: false,
        mode_id: false,
        brand_id: false,
        amount: false,
        bank_id: false,
        reason: false,
        distributor: false,
        purchase: false,
        quantity: false,
        supplier_id: false,
        unit_id: false,
        unit_price: false,
        unit_weight: false,
        total_weight: false,
        purchase_id: false,
    });
    const [present, dismiss] = useIonLoading();
    const [expenses, setExpenses] = useState([]);
    const [paymentMode, setPaymentMode] = useState([]);
    const [brands, setBrands] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [filters, setFilters] = useState([]);
    const modal = useRef<HTMLIonModalElement>(null);
    const modalSup = useRef<HTMLIonModalElement>(null);
    const [banks, setBanks] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [supErrors, setSupErrors] = useState({
        name: false,
        address: false,
        phone: false,
        location_id: false,
    });
    const [isSupFirst, setIsSupFirst] = useState(true);
    const [units, setUnits] = useState([]);
    const page = useRef(null);
    const [presentingElement, setPresentingElement] = useState<HTMLElement | null>(null);
    const initialState = {
        expense_id: 0,
        expense_type: "",
        mode_id: 0,
        brand_id: 0,
        amount: 0,
        bank_id: "",
        reason: "",
        paid: 0,
        purchase: 0,
        quantity: 0,
        supplier_id: 0,
        unit_id: 0,
        unit_price: 0,
        unit_weight: 0,
        total_weight: 0,
        purchase_id: "",
    };
    const initialSupplier = {
        code: 0,
        name: "",
        phone: "",
        address: "",
        location_id: 0,
    }
    const [supplier, setSupplier] = useState(initialSupplier);
    const [state, setState] = useState(initialState);
    const [locations, setLocations] = useState([]);
    const [balance, setBalance] = useState(false);
    useEffect(() => {
        isClean.current = true;
        present("Loading...");
        Http.request({
            method: "GET",
            url: href + "/api/account/get/expenses",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            }
        }).then(({ data }) => {
            if (isClean.current && data.success) {
                setExpenses(data.expenses);
                setPurchases(data.purchases);
                setFilters(data.purchases);
                setPaymentMode(data.payment_mode);
                setBrands(data.brands);
                setUnits(data.units);
                setSuppliers(data.suppliers);
                setLocations(data.locations);
                setAccounts(data.accounts);
                setBanks(data.banks);
            }
        }).finally(() => {
            dismiss();
        });
        return () => {
            isClean.current = false;
        }
    }, []);
    useEffect(() => {
        isClean.current = true;
        let newState = { ...state };
        let unit = units.find(function (item) {
            return item.id === state.unit_id;
        });
        if (state.unit_id !== 0) {
            if (unit !== undefined) {
                newState.total_weight = convert(newState.quantity * newState.unit_weight).from(unit.unit).to(unit.base);
            }
        }
        if (state.mode_id !== 0) {
            let mode = paymentMode.find(value => {
                return state.mode_id === value.id;
            });
            if (mode !== undefined) {
                setBalance(mode.balance === 1 ? true : false);
                newState.paid = newState.quantity * newState.unit_price;
            }
        }
        newState.amount = newState.quantity * newState.unit_price;
        setState({ ...newState });
        return () => {
            isClean.current = false;
        }
    }, [state.quantity, state.unit_weight, state.unit_id, state.unit_price]);
    useEffect(() => {
        isClean.current = true;
        let expense = expenses.find(value => {
            return value.id === state.expense_id
        });
        if (expense !== undefined) {
            setState(prevState => ({ ...prevState, expense_type: expense.type, purchase: expense.purchase }));
        }
        return () => {
            isClean.current = false;
        }
    }, [state.expense_id]);
    useEffect(() => {
        let mode = paymentMode.find(value => {
            return state.mode_id === value.id;
        });
        if (mode !== undefined) {
            setBalance(mode.balance === 1 ? true : false);
            setState(pv => ({ ...pv, paid: pv.amount }));
        }

    }, [state.mode_id]);

    const handleChange = (value: any, key: string) => {
        setState(prevState => ({ ...prevState, [key]: value }));
    }
    const handleSupChange = (value: any, key: string) => {
        setSupplier(prevState => ({ ...prevState, [key]: value }));
    }
    const [isOpen, setIsOpen] = useState(false);
    const [isSupOpen, setIsSupOpen] = useState(false);
    const handleOpenNew = (type: string, index: number) => {
        if (type === "new") {
            Http.request({
                method: "GET",
                url: href + "/api/account/new/expenses",
                headers: {
                    'Content-Type': 'application/json',
                    'Data-Type': 'json',
                    'Authorization': 'Bearer ' + user.token
                }
            }).then(({ data }) => {
                if (data.success) {
                    setState(prevState => ({ ...prevState, purchase_id: data.expense_id }))
                }
            }).finally(() => {
            });
        } else if (type === "edit") {
            let selected = filters[index];
            setState({
                id: selected.id,
                expense_id: selected.expense_id,
                expense_type: selected.expense_type,
                mode_id: selected.mode_id,
                brand_id: selected.brand_id,
                amount: selected.amount,
                bank_id: selected.bank_id,
                reason: selected.reason,
                paid: selected.paid,
                purchase: selected.purchase,
                quantity: selected.quantity,
                supplier_id: selected.supplier_id,
                unit_id: selected.unit_id,
                unit_price: selected.unit_price,
                unit_weight: selected.unit_weight,
                total_weight: selected.total_weight,
                purchase_id: selected.purchase_id,
                date: selected.date,
            });
        }
        setIsOpen(true);
    }
    const handleDismiss = () => {
        setState(initialState);
        setIsOpen(false);
    }

    const handleSupDismiss = () => {
        setSupplier(initialSupplier);
        setIsSupOpen(false);
    }

    const handleSupOpen = () => {
        Http.request({
            method: "GET",
            url: href + "/api/account/new/supplier",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            }
        }).then(({ data }) => {
            if (data.success) {
                setSupplier(prevState => ({ ...prevState, code: data.code }))
            }
        }).finally(() => {
            setIsSupOpen(true);
        });
    }

    const displayUnit = () => {
        let result = units.find(function (item) {
            return item.id === state.unit_id;
        });

        if (result !== undefined) {
            return result.base;
        } else {
            return "Unit";
        }
    }
    const handleSupSave = () => {
        const { isValid, errors } = validateState(supplier);
        if (isValid) {
            present("Saving Supplier...");
            Http.request({
                method: "POST",
                url: href + "/api/account/add/supplier",
                headers: {
                    'Content-Type': 'application/json',
                    'Data-Type': 'json',
                    'Authorization': 'Bearer ' + user.token
                },
                data: supplier
            }).then(({ data }) => {
                if (data.success) {
                    setSupplier(prevState => ({ ...initialSupplier }));
                    setSuppliers(data.suppliers);
                    setIsSupOpen(false);
                }
            }).finally(() => {
                dismiss();
            });
        } else {
            setSupErrors(prevState => ({ ...errors }));
            setIsSupFirst(false);
        }
    }
    const handleSave = () => {
        let options = {
            id: { required: false },
            date: { required: false },
            expense_id: { required: true },
            expense_type: { required: true },
            mode_id: { required: true },
            brand_id: { required: false },
            amount: { required: true },
            bank_id: { required: false },
            reason: { required: false },
            distributor: { required: false },
            purchase: { required: false },
            quantity: { required: state.purchase === 1 ? true : false },
            supplier_id: { required: state.purchase === 1 ? true : false },
            unit_id: { required: state.purchase === 1 ? true : false },
            unit_price: { required: state.purchase === 1 ? true : false },
            unit_weight: { required: state.purchase === 1 ? true : false },
            total_weight: { required: state.purchase === 1 ? true : false },
            purchase_id: { required: true },
            paid: { required: false },
        }
        const { isValid, errors } = validateState(state, options);
        if (isValid) {
            present("Saving Expense...");
            Http.request({
                method: "POST",
                url: href + "/api/account/add/purchase",
                headers: {
                    'Content-Type': 'application/json',
                    'Data-Type': 'json',
                    'Authorization': 'Bearer ' + user.token
                },
                data: state
            }).then(({ data }) => {
                if (data.success) {
                    setState(prevState => ({ ...initialState }));
                    setPurchases(data.purchases);
                    setFilters(data.purchases);
                    setDashboard(data.dashboard);
                    setIsOpen(false);
                }
            }).finally(() => {
                dismiss();
            });
        } else {
            setPurErrors(prevState => ({ ...errors }));
            setIsFirst(false);
        }
    }
    const validateState = (state: any, options?: any) => {
        let isValid = true;
        let errors: any = {};
        if (options === undefined) {
            Object.entries(state).forEach((element: any) => {
                if (typeof element[1] === "number" && element[1] === 0) {
                    isValid = false;
                    errors[element[0]] = true;
                }
                if (typeof element[1] === "string" && element[1] === "") {
                    isValid = false;
                    errors[element[0]] = true;
                }
            });
        } else {
            Object.entries(state).forEach(element => {
                if (options[element[0]].required) {
                    if (typeof element[1] === "number" && element[1] === 0) {
                        isValid = false;
                        errors[element[0]] = true;
                    }
                    if (typeof element[1] === "string" && element[1] === "") {
                        isValid = false;
                        console.log(element[0]);
                        errors[element[0]] = true;
                    }
                }
            });
        }
        return {
            isValid,
            errors
        };
    }
    const [searchTerm, setSearchTerm] = useState("");
    useEffect(() => {
        isClean.current = true;
        if (searchTerm.length > 0) {
            let result: any = [];
            // setFilter([]);
            if (/\d/.test(searchTerm)) {
                purchases.forEach(value => {
                    if (value.purchase_id.toString().includes(searchTerm)) {
                        result.push(value);
                    }
                });
            } else {
                purchases.forEach(value => {
                    if (value.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                        result.push(value);
                    }
                });
            }

            setFilters(result)
        } else {
            setFilters(purchases)
        }
        return () => {
            isClean.current = false;
        }
    }, [searchTerm]);
    const replace = (text: string, regex: RegExp) => {
        text = text.toString();
        let result = [];
        let matches = [];
        let results = text.matchAll(regex);
        for (let match of results) {
            matches.push(match[0]);
        }
        let parts = text.split(regex);
        for (let i = 0; i < parts.length; i++) {
            result.push(parts[i]);
            if (i !== parts.length - 1)
                result.push(<b key={`highlight_${i}`} className='text-green-500'>{matches[i]}</b>);
        }
        return result;
    }
    return (
        <IonPage>
            <Toolbar title="Expenses" />
            <IonContent ref={page} className="ion-padding">
                <IonButton className='mb-1' color='green' onClick={() => handleOpenNew("new", 0)}>New Expense</IonButton>
                <IonSearchbar value={searchTerm} onIonChange={e => setSearchTerm(e.detail.value)} placeholder='Search by expense / expense id' />
                <IonItemGroup>
                    {filters.map((value, index) => (
                        <IonItem key={"sales_ionitem_" + value.id} fill="solid" button className='mb-1' onClick={() => handleOpenNew("edit", index)}>
                            <IonNote slot='start'>{replace(value.purchase_id, new RegExp(searchTerm, "gi"))}</IonNote>
                            <IonLabel>
                                <p>{replace(value.name, new RegExp(searchTerm, "gi"))} paid ₦{value.paid} out of ₦{value.amount}</p>
                                <p>Balance remains ₦{value.amount - value.paid}</p>
                            </IonLabel>
                            <IonNote slot="end">{format(new Date(value.date), "EEEE, dd LLLL yyyy")}</IonNote>
                        </IonItem>))}
                </IonItemGroup>
                <IonModal isOpen={isOpen} onDidDismiss={handleDismiss}>
                    <IonCard className='overflow-auto'>
                        <IonCardHeader>
                            <IonCardTitle>
                                <IonItem lines='none'>
                                    <IonButtons slot='start'>
                                        <IonButton onClick={() => handleDismiss()}>
                                            <IonIcon slot='icon-only' icon={arrowBack} />
                                        </IonButton>
                                    </IonButtons>
                                    <IonLabel color='medium'>New Expense</IonLabel>
                                </IonItem>
                            </IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            <IonItem fill='solid' className='mb-1'>
                                <IonLabel color='medium' position='stacked'>Impress No</IonLabel>
                                <IonInput value={state.purchase_id} />
                            </IonItem>
                            <div className='flex'>
                                <IonItem fill='solid' className='mb-1 w-1/2 mr-1'>
                                    <IonLabel color='medium' position='stacked'>Expense</IonLabel>
                                    <IonSelect interface='action-sheet' interfaceOptions={{ header: "Expense" }} placeholder='select expense' value={state.expense_id} onIonChange={e => handleChange(e.detail.value, "expense_id")}>
                                        {expenses.map(value => (<IonSelectOption key={value.id} value={value.id}>{value.name}</IonSelectOption>))}
                                    </IonSelect>
                                    {!isFirst && purErrors.expense_id && <>
                                        <IonNote slot="helper" color="danger">Expense cannot be empty</IonNote>
                                        <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                                    </>}
                                </IonItem>
                                <IonItem fill='solid' className='mb-1 w-1/2'>
                                    <IonLabel color='medium' position='stacked'>Expense Type</IonLabel>
                                    <IonInput readonly value={state.expense_type} />
                                    {!isFirst && purErrors.expense_type && <>
                                        <IonNote slot="helper" color="danger">Expense Type cannot be empty</IonNote>
                                        <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                                    </>}
                                </IonItem>
                            </div>
                            {state.purchase === 1 && <IonItemGroup>
                                <IonItemDivider>Item Purchased</IonItemDivider>
                                <IonItem fill='solid' className='mb-1'>
                                    <IonLabel color='medium' position="stacked">Supplier Name</IonLabel>
                                    <IonSelect interface='action-sheet' interfaceOptions={{ header: "Supplier Name" }} placeholder='select supplier' value={state.supplier_id} onIonChange={e => handleChange(e.detail.value, "supplier_id")}>
                                        {suppliers.map(value => (<IonSelectOption key={value.id} value={value.id}>{value.name}</IonSelectOption>))}
                                    </IonSelect>
                                    <IonButtons slot='end'>
                                        <IonButton onClick={() => handleSupOpen()}>
                                            <IonIcon color='success' slot="icon-only" icon={addCircleOutline} />
                                        </IonButton>
                                    </IonButtons>
                                    {!isFirst && purErrors.supplier_id && <>
                                        <IonNote slot="helper" color="danger">Supplier Name cannot be empty</IonNote>
                                        <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                                    </>}
                                </IonItem>

                                <div className="flex">
                                    <IonItem fill='solid' className='mb-1 w-1/2 mr-1'>
                                        <IonLabel color='medium' position="stacked">Item Quantity</IonLabel>
                                        <IonInput value={state.quantity || 0} onIonChange={e => handleChange(parseInt(e.detail.value), "quantity")} />
                                        {!isFirst && purErrors.quantity && <>
                                            <IonNote slot="helper" color="danger">Item Quantity cannot be empty</IonNote>
                                            <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                                        </>}
                                    </IonItem>
                                    <IonItem fill='solid' className='mb-1 w-1/2'>
                                        <IonLabel color='medium' position="stacked">Item Unit Price</IonLabel>
                                        <IonInput value={state.unit_price || 0} onIonChange={e => handleChange(parseInt(e.detail.value), "unit_price")} />
                                        <IonNote slot='start'>₦</IonNote>
                                        {!isFirst && purErrors.unit_price && <>
                                            <IonNote slot="helper" color="danger">Item Unit cannot be empty</IonNote>
                                            <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                                        </>}
                                    </IonItem>
                                </div>
                                <div className='mb-1 flex'>
                                    <IonItem fill='solid' className='w-1/2 mr-1'>
                                        <IonLabel color='medium' position="floating">Unit/Weight</IonLabel>
                                        <IonInput value={state.unit_weight || 0} inputmode="numeric" onIonChange={e => handleChange(parseInt(e.detail.value), "unit_weight")} />
                                        {!isFirst && purErrors.unit_weight && <>
                                            <IonNote slot="helper" color="danger">Unit/Weight cannot be empty</IonNote>
                                            <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                                        </>
                                        }
                                    </IonItem>
                                    <IonItem fill='solid' className='w-1/2'>
                                        <IonLabel color='medium' position='floating'>Weight</IonLabel>
                                        <IonSelect interface='action-sheet' interfaceOptions={{ header: "Weight" }} value={state.unit_id} onIonChange={e => handleChange(parseInt(e.detail.value), "unit_id")} placeholder="Select Weight">
                                            {units.map(value => (
                                                <IonSelectOption key={"unit_key_" + value.id} value={value.id}>{value.name}</IonSelectOption>
                                            ))}
                                        </IonSelect>
                                        {!isFirst && purErrors.unit_id && <>
                                            <IonNote slot="helper" color="danger">Weight cannot be empty</IonNote>
                                            <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                                        </>
                                        }
                                    </IonItem>
                                </div>
                            </IonItemGroup>}
                            <div className="flex">
                                <IonItem fill='solid' className={state.purchase === 1 ? 'mb-1 w-1/2 mr-1' : 'mb-1 w-full'}>
                                    <IonLabel color='medium' position='stacked'>Amount</IonLabel>
                                    <IonInput inputmode='numeric' value={state.amount || 0} onIonChange={e => handleChange(parseInt(e.detail.value), "amount")} />
                                    <IonNote slot='start'>₦</IonNote>
                                    {!isFirst && purErrors.amount && <>
                                        <IonNote slot="helper" color="danger">Amount cannot be empty</IonNote>
                                        <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                                    </>}
                                </IonItem>
                                {state.purchase === 1 && <IonItem fill='solid' className='mb-1 w-1/2'>
                                    <IonLabel color='medium' position="floating">Total Weight</IonLabel>
                                    <IonInput readonly value={state.total_weight || 0} />
                                    {units !== undefined && <IonNote slot='end'>{displayUnit()}</IonNote>}
                                    {!isFirst && purErrors.total_weight && <>
                                        <IonNote slot="helper" color="danger">Total Weight cannot be empty</IonNote>
                                        <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                                    </>}
                                </IonItem>}
                            </div>
                            <IonItem fill='solid' className='mb-1'>
                                <IonLabel color='medium' position='stacked'>Brand</IonLabel>
                                <IonSelect interface='action-sheet' interfaceOptions={{ header: "Brand" }} placeholder='select brand account' value={state.brand_id} onIonChange={e => handleChange(e.detail.value, "brand_id")}>
                                    <IonSelectOption value={0}>None</IonSelectOption>
                                    {brands.map(value => (<IonSelectOption key={value.id} value={value.id}>{value.name}</IonSelectOption>))}
                                </IonSelect>
                                {!isFirst && purErrors.brand_id && <>
                                    <IonNote slot="helper" color="danger">Brand cannot be empty</IonNote>
                                    <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                                </>}
                            </IonItem>
                            <IonItem fill='solid' className='mb-1'>
                                <IonLabel color='medium' position='stacked'>Payment Mode</IonLabel>
                                <IonSelect interface='action-sheet' interfaceOptions={{ header: "Payment Mode" }} placeholder='select payment mode' value={state.mode_id} onIonChange={e => handleChange(e.detail.value, "mode_id")}>
                                    {paymentMode.map(value => (<IonSelectOption key={value.id} value={value.id}>{value.mode}</IonSelectOption>))}
                                </IonSelect>
                                {!isFirst && purErrors.mode_id && <>
                                    <IonNote slot="helper" color="danger">Payment Mode cannot be empty</IonNote>
                                    <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                                </>}
                            </IonItem>
                            <IonItem fill='solid' className='mb-1'>
                                <IonLabel color='medium' position='stacked'>Account Name</IonLabel>
                                <IonSelect interface='action-sheet' interfaceOptions={{ header: 'Account Name' }} placeholder="Select Account Name" value={state.bank_id} onIonChange={e => handleChange(e.detail.value, "bank_id")}>
                                    {banks.map(value => (<IonSelectOption key={value.id} value={value.id}>{value.bank + " ₦" + value.acc_balance.toLocaleString() + " balance"}</IonSelectOption>))}
                                </IonSelect>
                                {/* <IonInput /> */}
                                {!isFirst && purErrors.bank_id && <>
                                    <IonNote slot="helper" color="danger">Account Name cannot be empty</IonNote>
                                    <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                                </>}
                            </IonItem>
                            <IonItem fill='solid' className='mb-1'>
                                <IonLabel color='medium' position='stacked'>Reason for Expense</IonLabel>
                                <IonTextarea value={state.reason} onIonChange={e => handleChange(e.detail.value, "reason")} />
                            </IonItem>
                            {balance && <IonItem fill='solid' className='mb-1'>
                                <IonNote slot='start'>₦</IonNote>
                                <IonLabel color='medium' position='stacked'>Paid</IonLabel>
                                <IonInput value={state.paid || 0} onIonChange={e => handleChange(parseInt(e.detail.value), "paid")} />
                            </IonItem>}
                            <IonButton color='green' expand='block' onClick={handleSave}>
                                <IonIcon slot="start" icon={saveOutline} />
                                Save
                            </IonButton>
                        </IonCardContent>
                    </IonCard>
                </IonModal>
                <IonModal showBackdrop onDidDismiss={handleSupDismiss} isOpen={isSupOpen}>
                    <IonCard>
                        <IonCardHeader>
                            <IonCardTitle>
                                <IonItem lines='none'>
                                    <IonButtons slot='start'>
                                        <IonButton onClick={() => setIsSupOpen(false)}>
                                            <IonIcon slot='icon-only' icon={arrowBack} />
                                        </IonButton>
                                    </IonButtons>
                                    <IonLabel>Create new supplier</IonLabel>
                                </IonItem>
                            </IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            {/* <pre>{JSON.stringify(supplier, null, 2)}</pre> */}
                            <IonItem className='mb-1' fill='solid'>
                                <IonLabel color='medium' position="stacked">Supplier Code</IonLabel>
                                <IonInput readonly value={supplier.code} onIonChange={e => handleSupChange(e.detail.value, "code")} />
                            </IonItem>
                            <IonItem className='mb-1' fill='solid'>
                                <IonLabel color='medium' position="stacked">Supplier Name</IonLabel>
                                <IonInput value={supplier.name} onIonChange={e => handleSupChange(e.detail.value, "name")} />
                                {!isSupFirst && supErrors.name && <>
                                    <IonNote slot="helper" color="danger">Supplier Name cannot be empty</IonNote>
                                    <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                                </>}
                            </IonItem>
                            <IonItem className='mb-1' fill='solid'>
                                <IonLabel color='medium' position="stacked">Supplier Phone Number</IonLabel>
                                <IonInput value={supplier.phone} onIonChange={e => handleSupChange(e.detail.value, "phone")} />
                                {!isSupFirst && supErrors.phone && <>
                                    <IonNote slot="helper" color="danger">Supplier Phone Number cannot be empty</IonNote>
                                    <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                                </>}
                            </IonItem>
                            <IonItem className='mb-1' fill='solid'>
                                <IonLabel color='medium' position="stacked">Supplier Address</IonLabel>
                                <IonTextarea value={supplier.address} onIonChange={e => handleSupChange(e.detail.value, "address")} />
                                {!isSupFirst && supErrors.address && <>
                                    <IonNote slot="helper" color="danger">Supplier Address cannot be empty</IonNote>
                                    <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                                </>}
                            </IonItem>
                            <IonItem className='mb-1' fill='solid'>
                                <IonLabel color='medium' position="stacked">Branch Code</IonLabel>
                                <IonSelect interface='action-sheet' interfaceOptions={{ header: "Branch Code" }} value={supplier.location_id} onIonChange={e => handleSupChange(e.detail.value, "location_id")}>
                                    {locations.map(value => (<IonSelectOption key={value.id} value={value.id}>{value.name}</IonSelectOption>))}
                                </IonSelect>
                                {!isSupFirst && supErrors.location_id && <>
                                    <IonNote slot="helper" color="danger">Branch Code cannot be empty</IonNote>
                                    <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                                </>}
                            </IonItem>
                            <IonButton expand='block' color='green' onClick={handleSupSave}>
                                <IonIcon slot="start" icon={saveOutline} />
                                Save
                            </IonButton>
                        </IonCardContent>
                    </IonCard>
                </IonModal>
            </IonContent>
        </IonPage>
    );
};

export default AccountExpenses;