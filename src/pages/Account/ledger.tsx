import { Http } from '@capacitor-community/http';
import { DatetimeChangeEventDetail, IonButton, IonCard, IonCardContent, IonContent, IonDatetime, IonIcon, IonInput, IonItem, IonLabel, IonList, IonModal, IonPage, IonSearchbar, IonSelect, IonSelectOption, useIonLoading } from '@ionic/react';
import { format, parseISO } from 'date-fns';
import { searchOutline, printOutline } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';

import Toolbar from '../../components/toolbar';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { useRecoilValue } from 'recoil';
import { urlAtom } from '../../recoil/urlAtom';
import { User, userAtom } from '../../recoil/userAtom';

pdfMake.vfs = pdfFonts.pdfMake.vfs;
const headers = [
    {text: "Customer Name", bold: true},
    {text: "Date", bold: true},
    {text: "Trans No", bold: true},
    {text: "Type", bold: true},
    {text: "Credit Amt", bold: true},
    {text: "Debit Amt", bold: true},
    {text: "Balance", bold: true},
];
const CustomerLedger: React.FC = () => {
    const [ledgers, setLedgers] = useState([]);
    const formatNumber = (value: number) => {
        if (value) {
            return "₦" + value.toLocaleString();
        } else {
            return value;
        }
    }
    const user = useRecoilValue<User>(userAtom);
    const href = useRecoilValue<string>(urlAtom);
    const [ledger, setLedger] = useState({
        customer: "",
        customer_id: 0,
        type: 1,
        end: "",
        start: "",
        date: new Date().toISOString(),
    });
    const isClean = useRef(false);
    const [date, setDate] = useState<"date" | "time" | "month" | "year" | "date-time" | "time-date" | "month-year">('date');

    const handleDismiss = () => {
        setIsOpen(false);
    }
    const handleOpen = (type: string) => {
        setDateType(type);
        setIsOpen(true);
    }
    const handleChange = (value: any, key: string) => {
        if (key === "type") {
            if (value < 5) {
                setLedger({ ...ledger, type: value, end: undefined, start: undefined });
            } else if (value === 5) {
                setLedger({ ...ledger, type: value, end: new Date().toISOString(), start: new Date().toISOString(), date: new Date().toISOString() });
            }
        }
    }
    const [isOpen, setIsOpen] = useState(false);
    const [dateType, setDateType] = useState("");
    const [formatDate, setFormatDate] = useState("");
    const [present, dismiss] = useIonLoading();
    const [customers, setCustomers] = useState([]);
    const [filters, setFilters] = useState([]);
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
            url: href + "/api/get/account/ledger",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            }
        }).then(({ data }) => {
            if (isClean.current && data.success) {
                setCustomers(data.customers);
                let x: any[] = [];
                x.push(headers);
                for (let i = 0; i < 200; i++) {
                    let m = Math.floor(Math.random()*10000); 
                    let cr = Math.floor(Math.random()*5001);
                    let dr = 5000-cr;
                    let val = [
                        i === 0 ? "Reinhard" : "",
                        format(new Date(), "dd/MM/yyyy"),
                        "JJB-Sale-"+m,
                        m%2===0?"Credit":"Debit",
                        formatNumber(cr),
                        formatNumber(dr),
                        formatNumber(cr-dr)
                    ];
                    x.push(val);
                }
                setLedgers(x);
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
        isClean.current = true;
        let type = ledger.type;
        let isdate = ledger.date !== "" ? ledger.date : new Date().toISOString();
        let datatype: "date" | "time" | "month" | "year" | "date-time" | "time-date" | "month-year" = "date";
        let data = "";
        switch (type) {
            case 0:
                data = format(parseISO(isdate), "EE MMM dd yyyy");
                datatype = "date";
                break;
            case 1:
                data = format(parseISO(isdate), "EE MMM dd yyyy");
                datatype = "date";
                break;
            case 2:
                data = "week " + format(parseISO(isdate), "ww yyyy");
                datatype = "date";
                break;
            case 3:
                data = format(parseISO(isdate), "MMM yyyy");
                datatype = "month-year";
                break;
            case 4:
                data = format(parseISO(isdate), "yyyy");
                datatype = "year";
                break;
            default:
                break;
        }
        if (isClean.current) {
            setFormatDate(data);
            setDate(datatype);
        }
        return () => {
            isClean.current = false;
        }
    }, [ledger.date, ledger.type]);
    const handleDateChange = (e: CustomEvent<DatetimeChangeEventDetail>) => {
        console.log(e.detail.value/* , format(parseISO(new Date().toISOString()), "EE MMM dd yyyy") */);
        // setLedger({...ledger, date: format(parseISO(e.detail.value), "EE MMM dd yyyy")});
        if (ledger.type < 5) {
            setLedger(prevState => ({ ...prevState, date:e.detail.value.toString() }));
        } else {
            if (dateType === "start") {
                setLedger({ ...ledger, start:e.detail.value.toString() });
            } else if (dateType === "end") {
                setLedger({ ...ledger, end:e.detail.toString() });
            }
        }

    }

    const [customer, setCustomer] = useState("");
    const [popOpen, setPopOpen] = useState(false);
    const [total, setTotal] = useState({
        credit: 0,
        debit: 0,
        balance: 0,
    })
    useEffect(() => {
        isClean.current = true;
        if (customer.length > 0) {
            let filt = customers.filter(value => {
                return value.name.toLowerCase().includes(customer.toLowerCase());
            });
            setFilters(filt);
            // if (filt.length > 0) {
            //     if (filt[0].name !== customer) {
            //         setPopOpen(true);
            //     }
            // }
        } else {
            setFilters([]);
        }
        return () => {
            isClean.current = false;
        }
    }, [customer]);
    const handleClick = (value: any) => {
        // setCustomer(value);
        let cust = customers.find(val => {
            return val.name === value;
        });
        if (cust !== undefined) {
            setLedger(prevState => ({ ...prevState, customer_id: cust.id, customer: cust.name }));
        }
        setPopOpen(false);
        setCustomer("");
    }

    /* const handleItemClick = (index: number) => {
        setState(pv => ({
            ...pv,
            name: searchNames[index].name,
            employee_id: searchNames[index].id,
        }));
        setSearchTerm("");
    } */
    const handleSearch = () => {
        present("Searching...");
        Http.request({
            method: "POST",
            url: href + "/api/search/account/ledger",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            },
            data: ledger
        }).then(({ data }) => {
            if (isClean.current && data.success) {
                // let led: any[] = [];
                // [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22].forEach(element => {
                //     data.ledgers.forEach((el: any) => {
                //         led.push(el);
                //     });
                // });
                // console.log(led)
                setLedgers(data.ledgers);
                setTotal(data.total);
            }
        }).finally(() => {
            dismiss();
        });
    }
    const componentRef = useRef(null);

    const period = () => {
        switch (ledger.type) {
            case 1:
                return format(new Date(ledger.date), "EEEE, MMMM do, yyyy");
            case 2:
                return format(new Date(ledger.date), "'Week' ww, yyyy");
            case 3:
                return format(new Date(ledger.date), "MMMM 'of' yyyy");
            case 4:
                return format(new Date(ledger.date), "'January to December of' yyyy");
            case 5:
                return format(new Date(ledger.start), "EE, MMMM do, yyyy") + " to " + format(new Date(ledger.end), "EE, MMMM do, yyyy");
            default:
                break;
        }
    }
    const docDefinition = {
        content: [
            {text: "JJB FOOD PROCESSING LIMITED", alignment: "center", bold: true},
            {text: "Customer Ledger", alignment: "center", bold: true},
            {text: `For the period from ${period()}`, alignment: "center"},
            {
                //layout: 'lightHorizontalLines', //Optional
                table: {
                    // header are automatically repeated if the table span over multiple page
                    // you can declare how many rows should be treated as headers
                    headerRows: 1,
                    widths: ["*", "auto", "auto", "auto", "auto", "auto", "auto"],
                    body: ledgers
                }
            }
        ],
        pageSize: 'A4',
        pageOrientation: 'portrait',
    };
    const printPdf = () => {
        pdfMake.createPdf(docDefinition).print();
    }
    return (
        <IonPage>
            <Toolbar title="Customer Ledger" />
            <IonContent className="ion-padding">
                <div className=''>
                    <IonSearchbar placeholder='Search Customers' value={customer} onIonChange={e => setCustomer(e.target.value)} />
                    <div className='relative'>
                        <div className="border rounded shadow -mt-2 mx-[8px] absolute top-0 left-0 right-0 z-[110]">
                            {filters.map((value) => (<IonItem key={value.id} button onClick={() => handleClick(value.name)}>
                                {/* <IonAvatar slot="start">
                                    <IonImg src={`${href}/${value.passport}`} />
                                </IonAvatar> */}
                                <IonLabel>
                                    <p>{value.name}</p>
                                </IonLabel>
                            </IonItem>))}
                        </div>
                    </div>
                </div>
                <div className='relative'>
                    <IonItem fill='solid' className='mb-1'>
                        <IonLabel position='stacked'>Customer</IonLabel>
                        <IonInput readonly value={ledger.customer} />
                    </IonItem>
                    {filters.length > 0 && popOpen && <IonList className='absolute top-16 z-50 w-full overflow-y-auto h-52 border-2 bg-slate-50'>
                        {filters.map(value => (<IonItem key={value.id} button onClick={() => handleClick(value.name)}>
                            <IonLabel>{value.name}</IonLabel>
                        </IonItem>))}
                    </IonList>}
                </div>
                <div className="flex w-full">
                    <IonItem fill='solid' className={ledger.type < 5 ? 'w-1/2' : "w-1/3"}>
                        <IonLabel position='floating'>Select type</IonLabel>
                        <IonSelect interface='action-sheet' value={ledger.type} placeholder="Select type" onIonChange={e => handleChange(e.detail.value, "type")}>
                            <IonSelectOption value={1}>Daily</IonSelectOption>
                            <IonSelectOption value={2}>Weekly</IonSelectOption>
                            <IonSelectOption value={3}>Monthly</IonSelectOption>
                            <IonSelectOption value={4}>Yearly</IonSelectOption>
                            <IonSelectOption value={5}>Custom</IonSelectOption>
                        </IonSelect>
                    </IonItem>
                    {ledger.type < 5 && <IonItem fill='solid' className='w-1/2'>
                        <IonLabel position="stacked">Choose Date</IonLabel>
                        <IonInput onClick={() => setIsOpen(true)} value={formatDate} />
                        {/* <IonButton onClick={() =>setIsOpen(true)}>Open Date</IonButton> */}
                    </IonItem>}
                    {ledger.type === 5 && <div className="flex w-2/3">
                        <IonItem fill='solid' className='w-1/2'>
                            <IonLabel position="stacked">Start Date</IonLabel>
                            <IonInput value={format(parseISO(ledger?.start || new Date().toISOString()), "EE MMM dd yyyy")} onClick={() => handleOpen("start")} />
                        </IonItem>
                        <IonItem fill='solid' className='w-1/2'>
                            <IonLabel position="stacked">End Date</IonLabel>
                            <IonInput value={format(parseISO(ledger?.end || new Date().toISOString()), "EE MMM dd yyyy")} onClick={() => handleOpen("end")} />
                        </IonItem>
                    </div>}
                    <IonModal className='date-modal' onDidDismiss={handleDismiss} isOpen={isOpen}>
                        <IonCard>
                            <IonCardContent>
                                {ledger.type < 5 && <IonDatetime value={ledger.date || new Date().toISOString()} color='green' showDefaultButtons presentation={date} min="2022-01-01T00:00:00" onIonChange={e => handleDateChange(e)} />}
                                {ledger.type === 5 && dateType === "start" && <IonDatetime value={ledger.start || new Date().toISOString()} color='green' showDefaultButtons presentation={date} min="2022-01-01T00:00:00" onIonChange={e => handleDateChange(e)} />}
                                {ledger.type === 5 && dateType === "end" && <IonDatetime value={ledger.end || new Date().toISOString()} color='green' showDefaultButtons presentation={date} max={new Date().toISOString()} onIonChange={e => handleDateChange(e)} />}
                            </IonCardContent>
                        </IonCard>
                    </IonModal>
                </div>
                {/* <pre>{JSON.stringify(ledger, null, 2)}</pre> */}
                <div className="my-4">
                    <IonButton onClick={handleSearch} fill="solid" shape="round" color='green' size='small'>
                        <IonIcon icon={searchOutline} slot="start" />
                        Search
                    </IonButton>
                    <IonButton color="green" fill="solid" shape="round" size="small" onClick={() => printPdf()}>
                        <IonIcon icon={printOutline} slot="start" />
                        Print
                    </IonButton>
                    {/* <IonButton color="green" fill="solid" shape="round" size="small" onClick={() => file.print()}>
                        <IonIcon icon={printOutline} slot="start" />
                        Print
                    </IonButton> */}
                </div>
                {/* <button onClick={() => file.print()}>Print PDF</button> */}
                {/* {ledgers.length > 0 && <div ref={componentRef} className="page-breaks">
                    <div className='text-center'>
                        <b>JJB FOOD PROCESSING LIMITED</b>
                        <b>Customer Ledger</b>
                        <b>For the period from {period()}</b>
                    </div>

                    <table className='ledger-tb'>
                        <thead>
                            <tr>
                                <th>Customer Name</th>
                                <th>Date</th>
                                <th>Trans No</th>
                                <th>Type</th>
                                <th>Credit Amt</th>
                                <th>Debit Amt</th>
                                <th>Balance</th>
                            </tr>
                        </thead>
                        <tfoot>
                            <tr>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th>Total</th>
                                <th>{formatNumber(total.credit)}</th>
                                <th>{formatNumber(total.debit)}</th>
                                <th>{formatNumber(total.balance)}</th>
                            </tr>
                        </tfoot>
                        <tbody>
                            {ledgers.map((value, index) => (
                                <tr key={value.id}>
                                    <td>{index === 0 ? value.name : ""}</td>
                                    <td>{value.date}</td>
                                    <td>{value.trans_no}</td>
                                    <td>{value.type}</td>
                                    <td>{formatNumber(value.credit)}</td>
                                    <td>{formatNumber(value.debit)}</td>
                                    <td>{formatNumber(value.balance)}</td>
                                </tr>))}
                        </tbody>
                    </table>
                </div>} */}

            </IonContent>
        </IonPage>
    );
};

export default CustomerLedger;