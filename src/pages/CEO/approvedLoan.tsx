import { Http } from '@capacitor-community/http';
import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonIcon, IonItem, IonItemGroup, IonLabel, IonList, IonModal, IonNote, IonPage, IonSearchbar, IonSegment, IonSegmentButton, IonTextarea, IonToolbar, useIonActionSheet, useIonLoading } from '@ionic/react';
import { formatDistanceToNow, format } from 'date-fns';
import { enGB } from 'date-fns/locale';
import { handLeftOutline, closeOutline, arrowBack, checkmarkCircleOutline, closeCircleOutline } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';

import Toolbar from '../../components/toolbar';
import { useRecoilValue } from 'recoil';
import { urlAtom } from '../../recoil/urlAtom';
import { User, userAtom } from '../../recoil/userAtom';

const ApproveLoan: React.FC = () => {
    const user = useRecoilValue<User>(userAtom);
    const href = useRecoilValue<string>(urlAtom);
    const [isOpen, setIsOpen] = useState(false);
    const [popup, popout] = useIonActionSheet();
    const [searchTerm, setSearchTerm] = useState("");
    const isClean = useRef(false);
    const [loans, setLoans] = useState([]);
    const [ious, setIous] = useState([]);
    const [paids, setPaids] = useState([]);
    const [collectors, setCollectors] = useState([]);
    const [present, dismiss] = useIonLoading();
    const [filters, setFilters] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [loan, setLoan] = useState({
        receipt_no: 0,
        name: "",
        amount: 0,
        due_date: "",
        reason: "",
    })

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
            }
        }).finally(() => {
            dismiss();
        });
        return () => {
            isClean.current = false;
        }
    }, []);

    const processSegment = (data: any[]) => {
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
            setFilters(loans)
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

    const handleClick = (index: number) => {
        setSelectedIndex(index);
        let loaner = { ...filters[index] };
        // let ids = value.brand.map(val => {
        //     return val.id
        // });
        // setPayment({ ...payment, id: value.id, ids: ids });
        let button = [
            { text: 'View', color: "theme", icon: handLeftOutline, role: 'destructive', handler: async () => doView(index) },
            { text: 'Cancel', icon: closeOutline, role: 'destructive', handler: () => popout() }
        ];
        // if(loaner.approved && loaner.pay){
        //     // button.push()
        // }else if(loaner.approved && !loaner.pay){
        //     button.push({ text: 'Give Loan', color: "theme", icon: handLeftOutline, role: 'destructive', handler: async () => doGive(index) })
        // }
        // button.push();
        if (segment === "loan") {
            popup({
                buttons: button,
                header: loaner.name
            });
        }

    }

    const doView = (index: number) => {
        // setPayment(prevState => ({ ...prevState, id: filters[index].id }));
        // setModal("payment");
        setLoan({...filters[index]});
        setIsOpen(true);
    }
    const handleDismiss = () => {
        setIsOpen(false);
        // setLoan({ ...initalLoan });
        // setPaidError(false);
        // setPayment({
        //     id: 0,
        //     paid: false,
        // });
    }

    const handleApproved = () => {
        present("Processing...");
        Http.request({
            method: "GET",
            url: href + "/api/ceo/approve/loan/"+filters[selectedIndex].id,
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            },
        }).then(({ data }) => {
            if (data.success) {
                processSegment(data.loans)
                setIsOpen(false);
            }
        }).finally(() => {
            dismiss();
        });
    }

    const handleReject = () => {
        present("Processing...");
        Http.request({
            method: "POST",
            url: href + "/api/ceo/reject/loan/",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            },
            data: loan
        }).then(({ data }) => {
            if (data.success) {
                processSegment(data.loans)
                setIsOpen(false);
            }
        }).finally(() => {
            dismiss();
        });
    }

    const doGive = (index: number) => {
        // present("Processing...");
        // Http.request({
        //     method: "GET",
        //     url: href + "/api/account/give/loan/"+filters[index].id,
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Data-Type': 'json',
        //         'Authorization': 'Bearer ' + user.token
        //     },
        // }).then(({ data }) => {
        //     if (data.success) {
        //         // setLoan({ ...loan, receipt_no: data.receipt_no });
        //     }
        // }).finally(() => {
        //     dismiss();
        // });
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
            <Toolbar title="Approve Loan" />
            <IonContent className="ion-padding">
                <IonSearchbar value={searchTerm} onIonChange={e => setSearchTerm(e.detail.value)} placeholder='Search by name / loan id' />
                <IonSegment value={segment} onIonChange={e => handleSegmentChange(e.detail.value)}>
                    <IonSegmentButton value="loan">Loans</IonSegmentButton>
                    <IonSegmentButton value="iou">IOU's</IonSegmentButton>
                    <IonSegmentButton value="paid">Paid</IonSegmentButton>
                </IonSegment>
                <IonItemGroup></IonItemGroup>
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
                            {value.approved && value.loan_type_id !== 1 && <IonNote slot="end" color={value.paid ? "success" : computeColor(value.due_date)}>
                                {value.paid ? "Paid" : formatDistanceToNow(new Date(value.due_date), {
                                    addSuffix: true,
                                    locale: enGB
                                })}
                            </IonNote>}
                            {!value.approved && value.loan_type_id !== 1 && <IonNote slot="end" color={value.paid ? "success" : computeColor(value.due_date)}>
                                Not Approved
                            </IonNote>}
                            {value.loan_type_id === 1 && <IonNote slot="end">
                                {format(new Date(value.date), "LLLL, yyyy")}
                            </IonNote>}
                            {/* {value.paid===1&&<IonNote slot="end" color="green">Paid</IonNote> } */}
                        </IonItem>))}
                </IonItemGroup>

                <IonModal isOpen={isOpen} onDidDismiss={handleDismiss}>
                    <IonCard>
                        <IonCardHeader>
                            <IonCardTitle>
                                <IonToolbar>
                                    <IonButtons slot='start'>
                                        <IonButton onClick={handleDismiss}>
                                            <IonIcon slot='icon-only' icon={arrowBack} />
                                        </IonButton>
                                    </IonButtons>
                                    <IonLabel>Approve Loan</IonLabel>
                                </IonToolbar>
                            </IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            <IonList>
                                <IonItem>
                                    <IonLabel>
                                        <p>Loan Receipt</p>
                                    </IonLabel>
                                    <IonNote slot="end">{loan.receipt_no}</IonNote>
                                </IonItem>
                                <IonItem>
                                    <IonLabel>
                                        <p>Name</p>
                                    </IonLabel>
                                    <IonNote slot="end">{loan.name}</IonNote>
                                </IonItem>
                                <IonItem>
                                    <IonLabel>
                                        <p>Amount</p>
                                    </IonLabel>
                                    <IonNote slot="end">₦{loan.amount}</IonNote>
                                </IonItem>
                                <IonItem>
                                    <IonLabel>
                                        <p>Due Date</p>
                                    </IonLabel>
                                    <IonNote slot="end">{loan.due_date}</IonNote>
                                </IonItem>
                                <IonItem>
                                    <IonLabel position='stacked'>Reason for Rejection</IonLabel>
                                    <IonTextarea value={loan.reason} onIonChange={e=>setLoan(pv=>({...pv, reason:e.detail.value}))}></IonTextarea>
                                </IonItem>
                            </IonList>
                            <div className='flex'>
                                <IonButton className='w-1/2' color='green' expand='block' onClick={handleApproved}>
                                    <IonIcon slot="start" icon={checkmarkCircleOutline}></IonIcon>
                                    Approved
                                </IonButton>
                                <IonButton className='w-1/2' color='red' expand='block' onClick={handleReject}>
                                    <IonIcon slot="start" icon={closeCircleOutline}></IonIcon>
                                    Reject
                                </IonButton>
                            </div>
                        </IonCardContent>
                    </IonCard>
                </IonModal>
            </IonContent>
        </IonPage >
    );
};

export default ApproveLoan;