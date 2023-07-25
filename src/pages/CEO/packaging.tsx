import { Http } from '@capacitor-community/http';
import { DatetimeChangeEventDetail, IonButton, IonCard, IonCardContent, IonContent, IonDatetime, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonModal, IonPage, IonSegment, IonSegmentButton, IonSelect, IonSelectOption, useIonLoading, useIonToast } from '@ionic/react';
import { format, parseISO } from 'date-fns';
import { printOutline, searchOutline, shareSocial, sparkles } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { utils, writeFile } from 'xlsx';

import Toolbar from '../../components/toolbar';
import { useRecoilValue } from 'recoil';
import { urlAtom } from '../../recoil/urlAtom';
import { User, userAtom } from '../../recoil/userAtom';

const CeoPackaging: React.FC = () => {
    const user = useRecoilValue<User>(userAtom);
    const href = useRecoilValue<string>(urlAtom);
    const [sent, setSent] = useState([]);
    const [toasted] = useIonToast();
    const [present, dismiss] = useIonLoading();
    const [brands, setBrands] = useState([]);
    const [locations, setLocations] = useState([]);
    const isClean = useRef(false);
    useEffect(() => {
        isClean.current = true;
        present("Loading...");
        Http.request({
            method: "GET",
            url: href + "/api/ceo/get/packaging",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            }
        }).then(({ data }) => {
            if (isClean.current && data.success) {
                setBrands(data.brands);
                setLedger(prevState => ({ ...prevState, brand_id: data.brands[0].id }));
                setLocations(data.locations);
            }
        }).finally(() => {
            dismiss();
        });
        return () => {
            isClean.current = false;
        }
    }, []);
    const [ledger, setLedger] = useState({
        type: 1,
        end: "",
        start: "",
        date: new Date().toISOString(),
        location_id: 0,
        brand_id: "",
        id: "all",
    });
    const [date, setDate] = useState<"date" | "time" | "month" | "year" | "date-time" | "time-date" | "month-year">('date');

    const [dateType, setDateType] = useState("");
    const [formatDate, setFormatDate] = useState("");
    const [isOpen, setIsOpen] = useState(false);
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
        }else if(key === "location_id"){
            setLedger(prevState => ({...prevState, [key]: value}));
        }
    }
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
                setLedger({ ...ledger, end:e.detail.value.toString() });
            }
        }
    }

    const handleSearch = () => {
        present("Searching...");
        Http.request({
            method: "POST",
            url: href + "/api/ceo/search/packaging",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            },
            data: ledger
        }).then(({ data }) => {
            if (data.success) {
                setSent(data.reports);
                // setSegHead(data.headers);
                // setData(data.data);
                // setTotal(data.total);
                // setVisitors(data.visitors);
                // setFilters(data.visitors);
            }
        }).finally(() => {
            dismiss();
        });
    }

    const exportToExcel = () => {
        let rows: any[] = [];
        let newD: string[] = [];
        let newHeaders: any[] = ["S/N", "Bread Type", "Quantity"];
        sent.forEach((value, index: number) => {
            newD = [index + 1, value.name, value.quantity];
            rows = [...rows, [...newD]];
        });
        const worksheet = utils.json_to_sheet(rows);
        const workBook = utils.book_new();
        utils.book_append_sheet(workBook, worksheet, "Packaging Report");

        // fix headers
        utils.sheet_add_aoa(worksheet, [newHeaders], { origin: "A1" });

        // calculate the column width
        const max_width = rows.reduce((w, r) => Math.max(w, r.length), 10);
        worksheet["!cols"] = [{ wch: max_width }];

        // create an xslx file and try tosave to production report
        let now = new Date();
        writeFile(workBook, `Packaging Report-${now.getDate()}${now.getMonth()}${now.getFullYear()}.xlsx`);
    }
    const componentRef = useRef(null);

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        copyStyles: true,
    });


    return (
        <IonPage>
            <Toolbar title="Packaging Report" />
            <IonContent className="ion-padding">
                <IonHeader>
                    <IonSegment value={ledger.brand_id} onIonChange={e => setLedger(prevState => ({ ...prevState, brand_id:e.detail.value }))}>
                        {brands.map(value => (<IonSegmentButton key={value.id} value={value.id}>{value.name}</IonSegmentButton>))}
                    </IonSegment>
                </IonHeader>
            <IonItem fill='solid' className='my-2'>
                    <IonLabel position="stacked">Location</IonLabel>
                    <IonSelect interface='action-sheet' placeholder="Select Location" value={ledger.location_id} onIonChange={e=>handleChange(e.detail.value, "location_id")}>
                        {locations.map(value => (<IonSelectOption key={value.id} value={value.id}>{value.name}</IonSelectOption>))}
                    </IonSelect>
                </IonItem>
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
                <div className="my-4">
                    <IonButton onClick={handleSearch} fill="solid" shape="round" color='green' size='small'>
                        <IonIcon icon={searchOutline} slot="start" />
                        Search
                    </IonButton>
                </div>
                {/* <IonItem fill='solid'>
                    <IonLabel position='floating'>Brand</IonLabel>
                    <IonSelect interface='action-sheet' color='green' value={ledger.brand_id} onIonChange={e => setLedger(ps => ({...ps, brand_e.detail.value}))}>
                        <IonSelectOption color="green" value={0}>Select Brand</IonSelectOption>
                        {brands.map(value => (
                            <IonSelectOption key={value.id} value={value.id}>{value.name}</IonSelectOption>
                        ))}
                    </IonSelect>

                </IonItem> */}
                {sent.length > 0 &&
                        <div ref={componentRef} className="my-2 w-full">
                            <table className='border-collapse border color:border-[--ion-border-color] w-full rounded-md'>
                                <thead>
                                    <tr>
                                        <th className='border bdcolor p-2'>Date</th>
                                        <th className='border bdcolor p-2'>Shift</th>
                                        <th className='border bdcolor p-2'>Item</th>
                                        <th className='border bdcolor p-2'>Quantity</th>
                                        <th className='border bdcolor p-2'>Dispatched</th>
                                        <th className='border bdcolor p-2'>Balance</th>
                                    </tr>
                                </thead>
                                <tfoot>
                                    <tr>
                                        <th className='border bdcolor p-2'>Date</th>
                                        <th className='border bdcolor p-2'>Shift</th>
                                        <th className='border bdcolor p-2'>Item</th>
                                        <th className='border bdcolor p-2'>Quantity</th>
                                        <th className='border bdcolor p-2'>Dispatched</th>
                                        <th className='border bdcolor p-2'>Balance</th>
                                    </tr>
                                </tfoot>
                                <tbody>
                                    {sent.map((value, index) => (
                                        <tr key={value.id} className='stripe'>
                                            <td className='border bdcolor p-2'>{format(new Date(value.date), "dd/MM/yyyy")}</td>
                                            <td className='border bdcolor p-2 text-left'>{value.shift}</td>
                                            <td className='border bdcolor p-2'>{value.type}</td>
                                            <td className='border bdcolor p-2'>{value.quantity}</td>
                                            <td className='border bdcolor p-2 text-left'>{value.dispatched}</td>
                                            <td className='border bdcolor p-2'>{value.balance}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>}
                <IonButton color="green" onClick={exportToExcel}>
                    <IonIcon icon={sparkles} slot="start" />
                    Export To Excel
                </IonButton>
                <IonButton color="green" onClick={handlePrint}>
                    <IonIcon icon={printOutline} slot="start" />
                    Print
                </IonButton>
                <IonButton color="green" onClick={() => console.log("log")}>
                    <IonIcon icon={shareSocial} slot="start" />
                    Share
                </IonButton>
            </IonContent>
        </IonPage>
    );
};

export default CeoPackaging;