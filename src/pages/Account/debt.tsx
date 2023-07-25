import { Http } from '@capacitor-community/http';
import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonIcon, IonInput, IonItem, IonItemGroup, IonLabel, IonModal, IonNote, IonPage, IonSearchbar, IonSegment, IonSegmentButton, IonToggle, IonToolbar, useIonActionSheet, useIonLoading } from '@ionic/react';
import { format } from 'date-fns';
import { arrowBack, cashOutline, chevronDownOutline, chevronForwardOutline, closeOutline, saveOutline, tvOutline } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';

import Toolbar from '../../components/toolbar';
import { useRecoilValue } from 'recoil';
import { urlAtom } from '../../recoil/urlAtom';
import { User, userAtom } from '../../recoil/userAtom';

const Debt: React.FC = () => {
    const user = useRecoilValue<User>(userAtom);
    const href = useRecoilValue<string>(urlAtom);
    const [isOpen, setIsOpen] = useState(false);
    const [debtors, setDebtors] = useState([]);
    const [filters, setFilters] = useState([]);
    const [creditors, setCreditors] = useState([]);
    const [credFilters, setCredFilters] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isFirst, setIsFirst] = useState(true);
    const isValid = useRef(false);
    const [open, setOpen] = useState({});
    const [payment, setPayment] = useState({
        ids: [],
        id: 0,
        amount: 0
    });
    const [segment, setSegment] = useState("debtor");
    const isClean = useRef(false);
    const [present, dismiss] = useIonLoading();
    const [popup, popout] = useIonActionSheet();
    useEffect(() => {
        isClean.current = true;
        present("Loading...");
        Http.request({
            method: "GET",
            url: href + "/api/account/get/debt",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            }
        }).then(({ data }) => {
            if (isClean.current && data.success) {
                setDebtors(data.debtors);
                setFilters(data.debtors);
                setCreditors(data.creditors);
                setCredFilters(data.creditors);
                let opened = {};
                Object.keys(data.creditors).forEach((element: string | number) => {
                    opened[element] = false;
                });
                setOpen(opened);
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
        if (isClean.current) {
            if (segment === "debtor") {
                setFilters(debtors);
            } else {
                // setFilters(creditors);
            }
        }
        return () => {
            isClean.current = false;
        }
    }, [segment])


    useEffect(() => {
        isClean.current = true;
        if (searchTerm.length > 0) {
            let data = segment === "debtor" ? [...debtors] : [...creditors];
            let result: any = [];
            // setFilter([]);
            if (/\d/.test(searchTerm)) {
                data.forEach(value => {
                    if (value.invoice_no.toString().includes(searchTerm)) {
                        result.push(value);
                    }
                });
            } else {
                data.forEach(value => {
                    if (value.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                        result.push(value);
                    }
                });
            }

            setFilters(result)
        } else {
            setFilters(debtors);
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
    const handleClick = (value: { id: number; name: string; brand: [{ id: number, sale_id: number }]; }, index: number) => {
        setSelectedIndex(index);
        let button: any = [];
        if (segment === "debtor") {
            let ids = value.brand.map(val => {
                return val.id
            });
            setPayment({ ...payment, id: value.id, ids: ids });
            button = [
                { text: 'View', color: "theme", icon: tvOutline, role: 'destructive', handler: () => doView(index) },
            ];
        } else {
            button = [

            ]
        }
        button.push({ text: 'Cancel', icon: closeOutline, role: 'cancel', handler: () => popout() });
        popup({
            buttons: button,
            header: value.name
        });

    }
    const doView = (index: number) => {
        setIsOpen(true);
    }
    const handleDismiss = () => {
        setPayment({
            ids: [],
            id: 0,
            amount: 0
        });
        setIsOpen(false);
    }
    const handleCredClick = (index: string) => {
        let opened = { ...open };
        Object.keys(opened).forEach(value => {
            if (value === index) {
                if (opened[value]) {
                    opened[value] = false;
                } else {
                    opened[value] = true;
                }
            } else {
                opened[value] = false;
            }
        });
        setOpen(opened);
    }
    const handleSave = () => {
        isValid.current = true;
        if (payment.amount === 0 && payment.id === 0 && payment.ids.length === 0) {
            isValid.current = false;
        }
        if (isValid.current) {
            present("Saving Customer...")
            Http.request({
                method: "POST",
                url: href + "/api/account/pay/debt",
                headers: {
                    'Content-Type': 'application/json',
                    'Data-Type': 'json',
                    'Authorization': 'Bearer ' + user.token
                },
                data: payment
            }).then(({ data }) => {
                if (data.success) {
                    handleDismiss();
                    setDebtors(data.debtors);
                    setFilters(data.debtors);
                    setIsFirst(false);
                    isValid.current = false;
                }
            }).finally(() => {
                dismiss();
            });
        }
    }
    const handleSegmentChange = (value: string) => {
        setSegment(value);
    }
    const [credIsOpen, setCredIsOpen] = useState(false);
    const handleInner = (index: number, key: string) => {
        console.log(credFilters[key][index]);
        setCredIsOpen(true);
    }
    function handleCredDismiss() {
        setCredIsOpen(false);
    }
    return (
        <IonPage>
            <Toolbar title="Debt" />
            <IonContent className="ion-padding">
                {/* <pre>{JSON.stringify(filters, null, 0)}</pre> */}
                <IonSegment value={segment} onIonChange={e => handleSegmentChange(e.detail.value)}>
                    <IonSegmentButton value="debtor">Debtors</IonSegmentButton>
                    <IonSegmentButton value="creditor">Creditors</IonSegmentButton>
                </IonSegment>
                <IonSearchbar value={searchTerm} onIonChange={e => setSearchTerm(e.detail.value)} />
                <IonItemGroup>
                    {segment === "debtor" && filters.map((value, index) => (<IonItem key={"debtor" + value.id} lines='none' fill='solid' className='mb-1' button onClick={() => handleClick(value, index)}>
                        <IonNote slot="start">{replace(value.invoice_no, new RegExp(searchTerm, "gi"))}</IonNote>
                        <IonLabel>
                            <p>{replace(value.name, new RegExp(searchTerm, "gi"))}</p>
                            <p> owes ₦{value.balance}{/*  Paid ₦{value.paid} */}</p>
                        </IonLabel>
                        <IonNote color="danger" slot="end">{format(new Date(value.date), "dd/MM/yyyy")}</IonNote>
                    </IonItem>))}
                    {segment === "creditor" && Object.keys(credFilters).map((index) => (
                        <IonItemGroup className="mb-1" key={index}>
                            <IonItem fill='solid' className='mb-1' button onClick={() => handleCredClick(index)}>
                                <IonLabel>{index}</IonLabel>
                                <IonIcon slot="end" icon={open[index] ? chevronDownOutline : chevronForwardOutline} />
                            </IonItem>
                            {open[index] && <div className="w-11/12 ml-auto">
                                {credFilters[index].map((value: any, i: number) => (
                                    <IonItem onClick={() => handleInner(i, index)} fill='solid' className='mb-1' key={value.invoice_no}>
                                        <IonLabel>
                                            <p>{value.name}</p>
                                            <p> owes ₦{value.balance}{/*  Paid ₦{value.paid} */}</p>
                                        </IonLabel>
                                    </IonItem>))}
                            </div>}
                        </IonItemGroup>
                    ))}
                </IonItemGroup>
                <IonModal isOpen={isOpen} onDidDismiss={handleDismiss}>
                    <IonCard>
                        <IonCardHeader>
                            <IonToolbar>
                                <IonButtons slot='start'>
                                    <IonButton onClick={handleDismiss}>
                                        <IonIcon slot='icon-only' icon={arrowBack} />
                                    </IonButton>
                                </IonButtons>
                                <IonCardTitle>
                                    {filters.length > 0 && filters?.[selectedIndex]?.name} debt
                                </IonCardTitle>
                            </IonToolbar>
                        </IonCardHeader>
                        <IonCardContent>
                            <IonItemGroup className='' slot="helper">
                                {filters.length > 0 && filters?.[selectedIndex]?.brand?.map((value: any) => (
                                    <IonItem key={"brand" + value.id} lines='none' fill='solid' className='mb-1'>
                                        <IonIcon slot='start' icon={cashOutline} />
                                        <IonLabel>
                                            <p>{`${value.quantity} ${value.type} at ₦${value.unit_price}`}</p>
                                            <p>{`paid ₦${value.paid}`}</p>
                                        </IonLabel>
                                        <IonNote color="danger" slot="end">₦{value.total_price - value.paid}</IonNote>
                                    </IonItem>))}
                            </IonItemGroup>
                            <IonItemGroup className="flex">
                                <IonItem className='w-2/3' fill='solid'>
                                    <IonLabel position='stacked'>Payment of {filters.length > 0 && filters?.[selectedIndex]?.balance}</IonLabel>
                                    <IonInput inputmode='numeric' value={payment.amount || 0} onIonChange={e => setPayment({ ...payment, amount: parseInt(e.detail.value) })} />
                                </IonItem>
                                <IonItem id='fullHeight' className='w-1/3' fill='solid'>
                                    <IonToggle color='green' onIonChange={e => setPayment({ ...payment, amount: e.detail.checked ? filters?.[selectedIndex]?.balance : 0 })} />
                                </IonItem>
                            </IonItemGroup>

                            <IonButton expand='block' color="green" onClick={handleSave}>
                                <IonIcon slot="start" icon={saveOutline} />
                                Pay
                            </IonButton>
                        </IonCardContent>
                    </IonCard>
                </IonModal>
                <IonModal isOpen={credIsOpen}>
                    <IonCardHeader>
                        <IonToolbar>
                            <IonButtons slot='start'>
                                <IonButton onClick={handleCredDismiss}>
                                    <IonIcon slot='icon-only' icon={arrowBack} />
                                </IonButton>
                            </IonButtons>
                            <IonCardTitle>
                                {filters.length > 0 && filters?.[selectedIndex]?.name} debt
                            </IonCardTitle>
                        </IonToolbar>
                    </IonCardHeader>
                </IonModal>
            </IonContent>
        </IonPage>
    );
};

export default Debt;