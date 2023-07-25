import { Http } from '@capacitor-community/http';
import { DatetimeChangeEventDetail, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCheckbox, IonChip, IonContent, IonDatetime, IonIcon, IonInput, IonItem, IonItemGroup, IonLabel, IonModal, IonNote, IonPage, IonSearchbar, IonSegment, IonSegmentButton, IonSelect, IonSelectOption, IonToolbar, useIonActionSheet, useIonLoading } from '@ionic/react';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { enGB } from 'date-fns/locale';
import { addOutline, arrowBack, closeCircleOutline, closeOutline, handLeftOutline, saveOutline } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';

import Toolbar from '../../components/toolbar';
import { useRecoilValue } from 'recoil';
import { urlAtom } from '../../recoil/urlAtom';
import { User, userAtom } from '../../recoil/userAtom';

const LoanAcquisition: React.FC = () => {
    const user = useRecoilValue<User>(userAtom);
    const href = useRecoilValue<string>(urlAtom);
    const [isOpen, setIsOpen] = useState(false);
    const [isDateOpen, setIsDateOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [popup, popout] = useIonActionSheet();
    const [searchTerm, setSearchTerm] = useState("");
    const [modal, setModal] = useState("");
    const [filters, setFilters] = useState([]);
    const [modes, setModes] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [loanTypes, setLoanTypes] = useState([]);
    const [salary, setSalary] = useState<number>(0);
    const [ious, setIous] = useState([]);
    const [paids, setPaids] = useState([]);
    const [payment, setPayment] = useState({
        id: 0,
        paid: false
    });
    const isClean = useRef(false);
    const [loans, setLoans] = useState([]);
    const [collectors, setCollectors] = useState([]);
    const [present, dismiss] = useIonLoading();
    const isValid = useRef(false);
    const [grantor, setGrantor] = useState({
        name: "",
        employee_id: 0,
    });
    const [errors, setErrors] = useState({
        due_date: false,
        receipt_no: false,
        collector_id: false,
        mode_id: false,
        loan_type_id: false,
        account_id: false,
        granted_by: false,
        amount: false,
    });
    const initalLoan = {
        due_date: new Date().toISOString(),
        receipt_no: "",
        collector_id: 0,
        loan_type_id: 0,
        mode_id: 0,
        account_id: 0,
        granted_by: 0,
        amount: 0,
    }
    const [loan, setLoan] = useState(initalLoan);

    useEffect(() => {
        isClean.current = true;
        present("Loading...");
        Http.request({
            method: "GET",
            url: href + "/api/account/get/loan",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            }
        }).then(({ data }) => {
            if (isClean.current && data.success) {
                processSegment(data.loans);
                // setLoans(data.loans);
                setCollectors(data.collectors);
                setModes(data.modes);
                setAccounts(data.accounts);
                setGrantor(data.grantor);
                setLoan({ ...initalLoan, granted_by: data.grantor.employee_id });
                setLoanTypes(data.loanTypes);
            }
        }).finally(() => {
            dismiss();
        });
        return () => {
            isClean.current = false;
        }
    }, []);

    const processSegment = (data:any[]) => {
        let dbloans = [...data];
        let iou: any[] = [], lan: any[] = [], pad: any[] = [];
        dbloans.forEach(element => {
            if (element.paid) {
                pad.push(element);
            } else if (element.loan_type_id === 1) {
                iou.push(element);
            } else if (element.loan_type_id === 2) {
                lan.push(element);
            }
        });
        setIous(iou);
        setPaids(pad);
        setLoans(lan);
        if (segment === "iou") {
            setFilters(iou);
        } else if (segment === "loan") {
            setFilters(lan);
        } else {
            setFilters(pad);
        }
        
    }
    

    useEffect(() => {
        if (loan.loan_type_id === 1) {
            if (loan.amount > salary / 2) {
                setLoan(pv => ({ ...pv, amount: salary / 2 }));
            }
        }
    }, [loan.amount, loan.loan_type_id, loan.collector_id]);

    useEffect(() => {
        if (loan.collector_id > 0) {
            let employee = collectors.find(value => {
                return value.id === loan.collector_id;
            });
            if (employee !== undefined) {
                setSalary(employee.salary);
            }
        }
    }, [loan.collector_id]);

    const handleDateChange = (e: CustomEvent<DatetimeChangeEventDetail>) => {
        setLoan(prevState => ({ ...prevState, due_date:e.detail.value.toString() }));
    }

    const handleChange = (value: any, key: string) => {
        setLoan(prevState => ({ ...prevState, [key]: value }))
    }
    const handleDismiss = () => {
        setIsOpen(false);
        setLoan({ ...initalLoan });
        setPaidError(false);
        setPayment({
            id: 0,
            paid: false,
        });
    }
    const handleDateDismiss = () => {
        setIsDateOpen(false);
    }

    const handleClick = (index:number) => {
        setSelectedIndex(index);
        let loaner = {...filters[index]};
        // let ids = value.brand.map(val => {
        //     return val.id
        // });
        // setPayment({ ...payment, id: value.id, ids: ids });
        let button = [];
        if(loaner.approved && loaner.pay){
            button.push({ text: 'Pay Loan', color: "theme", icon: handLeftOutline, role: 'destructive', handler: async () => doPay(index) })
        }else if(loaner.approved && !loaner.pay){
            button.push({ text: 'Give Loan', color: "theme", icon: handLeftOutline, role: 'destructive', handler: async () => doGive(index) })
        }
        button.push({ text: 'Cancel', icon: closeOutline, role: 'destructive', handler: () => popout() });
        if (segment === "loan") {
            popup({
                buttons: button,
                header: loaner.name
            });
        }

    }

    const doPay = (index: number) => {
        setPayment(prevState => ({ ...prevState, id: filters[index].id }))
        setModal("payment");
        setIsOpen(true);
    }

    const doGive = (index: number) => {
        present("Processing...");
        Http.request({
            method: "GET",
            url: href + "/api/account/give/loan/"+filters[index].id,
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            },
        }).then(({ data }) => {
            if (data.success) {
                setLoan({ ...loan, receipt_no: data.receipt_no });
            }
        }).finally(() => {
            dismiss();
        });
    }

    const handleOpen = (type: string) => {
        Http.request({
            method: "GET",
            url: href + "/api/account/add/loan",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            }
        }).then(({ data }) => {
            if (data.success) {
                setLoan({ ...loan, receipt_no: data.receipt_no });
            }
        }).finally(() => {
            setModal(type);
            setIsOpen(true);
        });
    }

    const handleSave = () => {
        isValid.current = true;
        type IError = typeof errors;
        let initialError: IError = {
            due_date: false,
            receipt_no: false,
            collector_id: false,
            loan_type_id: false,
            mode_id: false,
            account_id: false,
            granted_by: false,
            amount: false,
        };
        let error = { ...initialError };
        Object.entries(loan).forEach(value => {
            if (value[0] === "receipt_no") {
                return;
            }
            if (value[0] === "due_date") {
                let val1 = format(new Date(value[1]), "dd/MM/yyyy");
                let val2 = format(new Date(), "dd/MM/yyyy");
                if (val1 === val2) {
                    error[value[0]] = true;
                    isValid.current = false;
                }
            }
            if (value[1] === 0) {
                error[value[0]] = true;
                isValid.current = false;
            }
        });
        if (isValid.current) {
            let formData = { ...loan };
            formData.due_date = format(new Date(formData.due_date), ("yyyy-MM-dd"));
            present("Saving...");
            Http.request({
                method: "POST",
                url: href + "/api/account/save/loan",
                headers: {
                    'Content-Type': 'application/json',
                    'Data-Type': 'json',
                    'Authorization': 'Bearer ' + user.token
                },
                data: { ...formData, date: format(new Date(), ("yyyy-MM-dd")) }
            }).then(({ data }) => {
                if (data.success) {
                    processSegment(data.loans);
                    setFilters(data.loans);
                    setErrors(initialError);
                    handleDismiss();
                }
            }).finally(() => {
                dismiss();
            });
        } else {
            setErrors(error);
        }
    }
    const [paidError, setPaidError] = useState(false);
    const handlePaid = () => {
        if (payment.paid) {
            present("Processing...");
            Http.request({
                method: "POST",
                url: href + "/api/account/pay/loan",
                headers: {
                    'Content-Type': 'application/json',
                    'Data-Type': 'json',
                    'Authorization': 'Bearer ' + user.token
                },
                data: payment
            }).then(({ data }) => {
                if (data.success) {
                    processSegment(data.loans);
                    setFilters(data.loans);
                    setPaidError(false);
                    setModal("");
                    setIsOpen(false);
                }
            }).finally(() => {
                dismiss();
            });
        } else {
            setPaidError(true);
        }
    }

    const computeColor = (value: any) => {
        value = formatDistanceToNow(new Date(value));
        let check = ["days", "day", "months", "month"];
        let last = value.split(" ").pop();
        value = value.match(/(\d+)/);
        if (check.includes(last)) {
            if (value[0] > 10) {
                return "success";
            } else if (value[0] > 5 && value[0] <= 10) {
                return "warning";
            } else {
                return "danger";
            }
        } else {
            return "danger";
        }
    }
    useEffect(() => {
        isClean.current = true;
        let filt: any[] = [];
        if (searchTerm.length > 0) {
            let result: any = [];
            if (segment === "iou") {
                filt = [...ious];
            } else if (segment === "loan") {
                filt = [...loans];
            } else {
                filt = [...paids];
            }
            // setFilter([]);
            if (/\d/.test(searchTerm)) {
                filt.forEach(value => {
                    if (value.receipt_no.toString().includes(searchTerm)) {
                        result.push(value);
                    }
                });
            } else {
                filt.forEach(value => {
                    if (value.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                        result.push(value);
                    }
                });
            }

            setFilters(result)
        } else {
            setFilters(filt)
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
    const [segment, setSegment] = useState<string>("iou");
    const handleSegmentChange = (value: string) => {
        setSegment(value);
        setSearchTerm("");
    }
    useEffect(() => {
        if (segment === "iou") {
            setFilters(ious);
        } else if (segment === "loan") {
            setFilters(loans);
        } else {
            setFilters(paids);
        }
    }, [segment]);

    return (
        <IonPage>
            <Toolbar title="Loans" />
            <IonContent className="ion-padding">
                <IonButton color='green' onClick={() => handleOpen("loan")}>
                    <IonIcon slot="start" icon={addOutline} />
                    Add Loan
                </IonButton>
                {filters.length > 0 && <IonSearchbar value={searchTerm} onIonChange={e => setSearchTerm(e.target.value)} placeholder='Search by name / loan id' />}
                {/* <pre>{JSON.stringify(filters, null, 2)}</pre> */}
                <IonSegment value={segment} onIonChange={e => handleSegmentChange(e.detail.value)}>
                    <IonSegmentButton value="loan">Loans</IonSegmentButton>
                    <IonSegmentButton value="iou">IOU's</IonSegmentButton>
                    <IonSegmentButton value="paid">Paid</IonSegmentButton>
                </IonSegment>
                <IonItemGroup>
                    {filters.map((value, index) => (
                        <IonItem key={value.id} fill='solid' className='mb-1' button onClick={() => handleClick(index)}>
                            <div className='flex flex-col text-[10px]' slot="start">
                                <span className='mb-1'>{replace(value.receipt_no, new RegExp(searchTerm, "gi"))}</span>
                                <p>collected ₦{value.amount}</p>
                            </div>
                            <IonLabel>
                                <p>{replace(value.name, new RegExp(searchTerm, "gi"))}</p>
                                <p>{formatDistanceToNow(new Date(value.created_at), {
                                    addSuffix: true,
                                    locale: enGB
                                })}</p>
                            </IonLabel>
                            {value.approved&&value.loan_type_id !== 1&&<IonNote slot="end" color={value.paid ? "success" : computeColor(value.due_date)}>
                                {value.paid ? "Paid" : formatDistanceToNow(new Date(value.due_date), {
                                    addSuffix: true,
                                    locale: enGB
                                })}
                            </IonNote>}
                            {!value.approved&&value.loan_type_id !== 1&&<IonNote slot="end" color={value.paid ? "success" : computeColor(value.due_date)}>
                                Not Approved
                            </IonNote>}
                            {value.loan_type_id === 1&&<IonNote slot="end">
                                {format(new Date(value.date), "LLLL, yyyy")}
                            </IonNote>}
                            {/* {value.paid===1&&<IonNote slot="end" color="green">Paid</IonNote> } */}
                        </IonItem>))}
                </IonItemGroup>
                {filters.length === 0 && <div className='flex flex-col items-center mt-[25vh]'>
                    <IonIcon size='large' color='medium' icon={closeCircleOutline} />
                    <IonLabel color='medium'>No Loan Record</IonLabel>
                </div>}

                <IonModal isOpen={isOpen} onDidDismiss={handleDismiss}>
                    <IonCard>
                        <IonCardHeader>
                            <IonCardTitle>
                                <IonToolbar>
                                    <IonButtons slot='start'>
                                        <IonButton onClick={() => handleDismiss()}>
                                            <IonIcon slot='icon-only' icon={arrowBack} />
                                        </IonButton>
                                    </IonButtons>
                                    <IonLabel>{/* filters.length > 0 && filters[selectedIndex].name */}Add Loan</IonLabel>
                                </IonToolbar>
                            </IonCardTitle>
                        </IonCardHeader>
                        {modal === "loan" && <IonCardContent>
                            <IonItem fill='solid' className='mb-1'>
                                <IonLabel color="medium" position="stacked">Loan Receipt Number</IonLabel>
                                <IonInput readonly value={loan.receipt_no} />
                                {errors.receipt_no && <IonNote slot="helper" color='danger'>Loan Receipt Number cannot be empty</IonNote>}
                            </IonItem>
                            <IonItem fill='solid' className='mb-1'>
                                <IonLabel color="medium" position="stacked">Collector Name</IonLabel>
                                <IonSelect interface='action-sheet' value={loan.collector_id} onIonChange={e => handleChange(e.detail.value, "collector_id")}>
                                    {collectors.map(value => (
                                        <IonSelectOption key={value.id} value={value.id}>{value.name}</IonSelectOption>))}
                                </IonSelect>
                                {errors.collector_id && <IonNote slot="helper" color='danger'>Collector Name cannot be empty</IonNote>}
                            </IonItem>
                            <IonItem fill='solid' className='mb-1'>
                                <IonLabel color="medium" position="stacked">Loan type</IonLabel>
                                <IonSelect interface='action-sheet' value={loan.loan_type_id} onIonChange={e => handleChange(e.detail.value, "loan_type_id")}>
                                    {loanTypes.map(value => (<IonSelectOption key={value.id} value={value.id}>{value.type}</IonSelectOption>))}
                                </IonSelect>
                                {errors.mode_id && <IonNote slot="helper" color='danger'>Loan Type cannot be empty</IonNote>}
                            </IonItem>
                            <IonItem fill='solid' className='mb-1'>
                                <IonLabel color="medium" position="stacked">Amount Collected</IonLabel>
                                <IonInput inputmode='numeric' value={loan.amount || 0} onIonChange={e => handleChange(parseInt(e.detail.value), "amount")} />
                                {errors.amount && <IonNote slot="helper" color='danger'>Amount Collected cannot be empty</IonNote>}
                            </IonItem>
                            <IonItem fill='solid' className='mb-1'>
                                <IonLabel color="medium" position="stacked">Payment Mode</IonLabel>
                                <IonSelect interface='action-sheet' value={loan.mode_id} onIonChange={e => handleChange(e.detail.value, "mode_id")}>
                                    {modes.map(value => (<IonSelectOption key={value.id} value={value.id}>{value.mode}</IonSelectOption>))}
                                </IonSelect>
                                {errors.mode_id && <IonNote slot="helper" color='danger'>Payment Mode cannot be empty</IonNote>}
                            </IonItem>
                            {/* <IonItem fill='solid' className='mb-1'>
                                <IonLabel color="medium" position="stacked">Cheque Number</IonLabel>
                                <IonInput />
                            </IonItem> */}
                            <IonItem fill='solid' className='mb-1'>
                                <IonLabel color="medium" position="stacked">Account Name</IonLabel>
                                <IonSelect interface='action-sheet' value={loan.account_id} onIonChange={e => handleChange(e.detail.value, "account_id")}>
                                    {accounts.map(value => (
                                        <IonSelectOption key={value.id} value={value.id}>{value.name} Account ₦{value.balance}</IonSelectOption>))}
                                </IonSelect>
                                {errors.account_id && <IonNote slot="helper" color='danger'>Account Name cannot be empty</IonNote>}
                            </IonItem>
                            <IonItem fill='solid' className='mb-1'>
                                <IonLabel color="medium" position="stacked">Granted By</IonLabel>
                                <IonInput value={grantor.name} readonly />
                                {errors.granted_by && <IonNote slot="helper" color='danger'>Granted By cannot be empty</IonNote>}
                            </IonItem>
                            <IonItem fill='solid' className='mb-1'>
                                <IonLabel color="medium" position="stacked">Due Date</IonLabel>
                                <IonInput value={format(parseISO(loan.due_date), "EE MMM dd yyyy")} onClick={() => setIsDateOpen(true)} />
                                {errors.due_date && <IonNote slot="helper" color='danger'>Due Date cannot be today</IonNote>}
                            </IonItem>
                            <IonButton color='green' expand='block' onClick={handleSave}>
                                <IonIcon slot="start" icon={saveOutline}></IonIcon>
                                Save
                            </IonButton>
                        </IonCardContent>}
                        {modal === "payment" && <IonCardContent>
                            {/* <pre>{JSON.stringify(payment, null, 2)}</pre> */}
                            <IonChip color="green">Amount to Pay: ₦{filters[selectedIndex].amount}</IonChip>
                            <IonItem fill='solid'>
                                <IonLabel>Amount Paid?</IonLabel>
                                <IonCheckbox value={payment.paid} onIonChange={e => setPayment(prevState => ({ ...prevState, paid: e.detail.checked }))} color='green' />
                                {paidError && <IonNote color='danger' slot="helper">Please Tick the checknox</IonNote>}
                            </IonItem>
                            <IonButton color='green' expand='block' onClick={handlePaid}>
                                <IonIcon slot="start" icon={saveOutline}></IonIcon>
                                Save
                            </IonButton>
                        </IonCardContent>}
                    </IonCard>
                </IonModal>
                <IonModal className='date-modal' onDidDismiss={handleDateDismiss} isOpen={isDateOpen}>
                    <IonCard>
                        <IonCardContent>
                            <IonDatetime value={loan.due_date || new Date().toISOString()} color='green' max='2055-12-12T23:59:59' showDefaultButtons presentation="date" min="2022-01-01T00:00:00" onIonChange={e => handleDateChange(e)} />
                        </IonCardContent>
                    </IonCard>
                </IonModal>
            </IonContent>
            {/* <IonFooter className="ion-padding">
            </IonFooter> */}
        </IonPage>
    );
};

export default LoanAcquisition;