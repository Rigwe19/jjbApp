import { Http } from '@capacitor-community/http';
import { DatetimeChangeEventDetail, IonButton, IonCard, IonCardContent, IonContent, IonDatetime, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonModal, IonPage, IonSegment, IonSegmentButton, IonSelect, IonSelectOption, SegmentChangeEventDetail, useIonAlert, useIonLoading, useIonToast } from '@ionic/react';
import { format, parseISO } from 'date-fns';
import { sparkles, printOutline, shareSocial, searchOutline, closeCircleOutline } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { utils, writeFile } from 'xlsx';

import TableComponent from '../../components/Table';
import Toolbar from '../../components/toolbar';
import { useRecoilValue } from 'recoil';
import { urlAtom } from '../../recoil/urlAtom';
import { User, userAtom } from '../../recoil/userAtom';

interface IInventory {
    id: Number;
    quantity: Number;
    type: String;
}

interface IHeader {
    id: number;
    type: string;
}
const CeoProduction: React.FC = () => {
    const user = useRecoilValue<User>(userAtom);
    const href = useRecoilValue<string>(urlAtom);
    const isClean = useRef(false);
    const [inventory, setInventory] = useState<IInventory[]>([]);
    const [headers, setHeaders] = useState<IHeader[]>([]);
    const [data, setData] = useState<any[]>([]);
    const [total, setTotal] = useState<any[]>([]);
    const [segment, setSegment] = useState("all");
    const [segHead, setSegHead] = useState<IHeader[]>([]);
    const [brands, setBrands] = useState([]);
    const [headSegment, setHeadSegment] = useState("");
    const [locations, setLocations] = useState([]);
    const [toasted] = useIonToast();
    const [present, dismiss] = useIonLoading();
    const [alerted] = useIonAlert();
    const tableRef = useRef(null);
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
        } else if (key === "location_id") {
            setLedger(prevState => ({ ...prevState, [key]: value }));
        }
    }
    useEffect(() => {
        isClean.current = true;
        present("Loading...");
        Http.request({
            method: "GET",
            url: href + "/api/ceo/get/production",
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

    const exportToExcel = () => {
        let rows: any[] = [];
        let newD: string[] = [];
        let newHeaders: any[] = [];
        newHeaders.push("");
        headers.forEach(value => {
            newHeaders.push(value.type);
        });
        data.forEach((value, index: number) => {
            newD = [];
            newD.push(`Batch ${index + 1}`);
            value.forEach((val: { value: string; }) => {
                newD.push(val.value);
            });
            rows = [...rows, [...newD]];
        });
        newD = [];
        newD.push("Total");
        total.forEach(value => {
            newD.push(value.total);
        });
        rows = [...rows, [...newD]];
        // console.log(rows);
        const worksheet = utils.json_to_sheet(rows);
        const workBook = utils.book_new();
        utils.book_append_sheet(workBook, worksheet, "Production Report");

        // fix headers
        utils.sheet_add_aoa(worksheet, [newHeaders], { origin: "A1" });

        // calculate the column width
        const max_width = rows.reduce((w, r) => Math.max(w, r.length), 10);
        worksheet["!cols"] = [{ wch: max_width }];

        // create an xslx file and try tosave to production report
        writeFile(workBook, "Production Report.xlsx");
    }
    const componentRef = useRef(null);

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        copyStyles: true,
    });

    const segmentChanged = (e: CustomEvent<SegmentChangeEventDetail>) => {
        let id =e.detail.value;
        setSegment(id);
        present();
        Http.request({
            method: "POST",
            url: href + "/api/ceo/get/production/",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            },
            data: { ...ledger, id }
        }).then(({ data }) => {
            if (data.success) {
                setHeaders(data.headers);
                // setSegHead(data.headers);
                setData(data.data);
                setTotal(data.total);
            }
        }).finally(() => {
            dismiss();
        });
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
            url: href + "/api/ceo/get/production",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            },
            data: ledger
        }).then(({ data }) => {
            if (data.success) {
                setHeaders(data.headers);
                setSegHead(data.headers);
                setData(data.data);
                setTotal(data.total);
                // setVisitors(data.visitors);
                // setFilters(data.visitors);
            }
        }).finally(() => {
            dismiss();
        });
    }

    return (
        <IonPage>
            <Toolbar title="Production Report" />
            <IonContent className="ion-padding">
                <IonHeader>
                    <IonSegment value={ledger.brand_id} onIonChange={e => setLedger(prevState => ({ ...prevState, brand_id:e.detail.value }))}>
                        {brands.map(value => (<IonSegmentButton key={value.id} value={value.id}>{value.name}</IonSegmentButton>))}
                    </IonSegment>
                </IonHeader>
                <IonItem fill='solid' className='my-2'>
                    <IonLabel position="stacked">Location</IonLabel>
                    <IonSelect placeholder="Select Location" value={ledger.location_id} onIonChange={e => handleChange(e.detail.value, "location_id")}>
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
                {/* {inventory.map(value => (
                    <IonItem fill='solid'>
                        <IonText>{value.type}</IonText>
                        <IonNote slot="end">{value.quantity} breads</IonNote>
                    </IonItem>
                ))} */}
                {data.length > 0 && <>
                    <IonSegment className='mb-1' color='green' value={segment} swipeGesture onIonChange={e => segmentChanged(e)}>
                        <IonSegmentButton value='all'>
                            <IonLabel>All</IonLabel>
                        </IonSegmentButton>
                        {Object.keys(segHead).map(index => (
                            <IonSegmentButton key={index} value={segHead[index].id}>
                                <IonLabel>{segHead[index].type}</IonLabel>
                            </IonSegmentButton>
                        ))}
                    </IonSegment>
                    <TableComponent ref={componentRef} headers={headers} data={data} total={total} segment={segment} />
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
                </>}
                {data.length === 0 && <div className="w-full h-full -z-10 absolute top-0 flex flex-col justify-center items-center">
                    <IonIcon color="medium" size="large" icon={closeCircleOutline} />
                    <IonLabel color="medium">Search returns Empty</IonLabel>
                </div>}
            </IonContent>
        </IonPage>
    );
};

export default CeoProduction;