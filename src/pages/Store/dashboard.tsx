import { Http } from '@capacitor-community/http';
import { DatetimeChangeEventDetail } from '@ionic/core';
import { IonAlert, IonButton, IonCard, IonCardContent, IonContent, IonDatetime, IonFooter, IonIcon, IonInput, IonItem, IonLabel, IonModal, IonPage, IonRefresher, IonRefresherContent, IonSegment, IonSegmentButton, IonSelect, IonSelectOption, RefresherEventDetail, SegmentChangeEventDetail, useIonLoading, useIonToast } from '@ionic/react';
import { sparkles, printOutline, shareSocial, searchOutline } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { utils, writeFile } from 'xlsx';

import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { enGB } from 'date-fns/locale';
import { format, parseISO } from 'date-fns';
import Toolbar from '../../components/toolbar';
import { App } from '@capacitor/app';
import { useHistory } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { urlAtom } from '../../recoil/urlAtom';
import { User, userAtom } from '../../recoil/userAtom';
interface IIssuance {
    brand_id: number;
    type: number;
    date?: string;
    start?: string | undefined;
    end?: string | undefined;
    year?: number | undefined;
    month?: string | undefined;
}
const StoreDashboard: React.FC = () => {
    const user = useRecoilValue<User>(userAtom);
    const href = useRecoilValue<string>(urlAtom);
    const [segment, setSegment] = useState("direct");
    const [brands, setBrands] = useState([]);
    const [showAlert, setShowAlert] = useState(false);
    const history = useHistory();
    const [data, setData] = useState<any[]>([]);
    const [formatDate, setFormatDate] = useState("");
    const [isOpen, setIsOpen] = useState(false)
    const [date, setDate] = useState<"date" | "time" | "month" | "year" | "date-time" | "time-date" | "month-year">('date');
    const [issuance, setIssuance] = useState<IIssuance>({
        brand_id: 0,
        type: 0,
        date: new Date().toISOString(),
        start: new Date().toISOString(),
        end: new Date().toISOString(),
        year: parseInt(format(new Date(), "yyyy")),
        month: format(new Date(), "LLLL"),
    });
    const [cStore, setCStore] = useState<any[]>([]);
    const [cNonStore, setCNonStore] = useState<any[]>([]);
    const [toasted] = useIonToast();
    const [present, dismiss] = useIonLoading();
    const [inventories, setInventories] = useState([]);
    const isClean = useRef(false);

    const years: any[] = [];
    for (let i = parseInt(format(new Date(), "yyyy")); i >= 2020; i--) {
        years.push(i);
    }
    let months: any[] = [];
    for (let i = 0; i < 12; i++) {
        if (enGB.localize !== undefined)
            months.push({ month: enGB.localize.month(i), id: i + 1 });
    }

    useEffect(() => {
        isClean.current = true;
        document.addEventListener('ionBackButton', (ev: any) => {
            ev.detail.register(-1, () => {
                // when in home last page
                if (history.location.pathname === "/store/dashboard") {
                    // calling alert box
                    setShowAlert(true);
                }
            });
        });
        present("Loading...");
        Http.request({
            method: "GET",
            url: href + "/api/get/store/dashboard",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            }
        }).then(({ data }) => {
            if (isClean.current && data.success) {
                setCStore(data.cStore);
                setCNonStore(data.cNonStore);
                if (segment === "direct") {
                    setData(data.cStore);
                } else if (segment === "non") {
                    setData(data.cNonStore);
                }
                setBrands(data.brands);
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
        let type = issuance.type;
        let data: "date" | "time" | "month" | "year" | "date-time" | "time-date" | "month-year" = "date";
        switch (type) {
            case 1:
                data = "date";
                break;
            case 2:
                data = "date";
                break;
            case 3:
                data = "month-year";
                break;
            case 4:
                data = "year";
                break;
            // case 5:
            //     data = "date";
            //     break;

            default:
                break;
        }
        if (isClean.current) {
            setDate(data);
        }
        return () => {
            isClean.current = false;
        }
    }, [issuance.type]);

    const segmentChanged = (e: CustomEvent<SegmentChangeEventDetail>) => {
        let id =e.detail.value;
        let table: React.SetStateAction<any[]> = [];
        if (id === "non") {
            setIssuance({ brand_id: 0, type: 1, date: new Date().toISOString(), start: undefined, end: undefined });
            table = [...cNonStore];
        } else if (id === "direct") {
            setIssuance({ brand_id: 0, type: 1, date: new Date().toISOString(), start: undefined, end: undefined });
            table = [...cStore];
        } else if (id === "issuance") {
            setIssuance({ brand_id: 0, type: 1, date: "", start: undefined, end: undefined });
        }
        setData(table);
        setSegment(id);
        // present();
        // Http.request({
        //     method: "GET",
        //     url: href + "/api/get/production/dashboard/" + id,
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Data-Type': 'json',
        //         'Authorization': 'Bearer ' + user.token
        //     }
        // }).then(({ data }) => {
        //     if (isClean.current && data.success) {
        //         // setHeaders(data.headers);
        //         // setData(data.data);
        //         // setTotal(data.total);
        //     }
        // }).finally(() => {
        //     dismiss();
        // });
    }


    const exportToExcel = () => {
        let rows: any[] = [];
        let newD: string[] = [];
        let newHeaders: any[] = ["S/N", "Items", "Quantity"];
        // newHeaders.push("");
        // headers.forEach(value => {
        //     newHeaders.push(value.type);
        // });
        data.forEach((value, index: number) => {
            newD = [];
            newD.push(`${index + 1}`);
            newD.push(value.type);
            newD.push(value.quantity);
            // Object.keys(value).forEach((val) => {
            //     newD.push(value[value]);
            // });
            rows = [...rows, [...newD]];
        });
        // newD = [];
        // newD.push("Total");
        // total.forEach(value => {
        //     newD.push(value.total);
        // });
        // rows = [...rows, [...newD]];

        // console.log(rows);
        const worksheet = utils.json_to_sheet(rows);
        const workBook = utils.book_new();
        utils.book_append_sheet(workBook, worksheet, "Store Inventory Report");

        // fix headers
        utils.sheet_add_aoa(worksheet, [newHeaders], { origin: "A1" });

        // calculate the column width
        const max_width = rows.reduce((w, r) => Math.max(w, r.length), 10);
        worksheet["!cols"] = [{ wch: max_width }];

        // create an xslx file and try tosave to production report
        writeFile(workBook, "Store Report.xlsx");
    }
    const componentRef = useRef(null);

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        copyStyles: true,
    });
    const handlePull = (e: CustomEvent<RefresherEventDetail>) => {
        present("");
        Http.request({
            method: "GET",
            url: href + "/api/get/store/dashboard",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            }
        }).then(({ data }) => {
            if (data.success) {
                setCStore(data.cStore);
                setCNonStore(data.cNonStore);
                setData(data.cStore);
            }
        }).finally(() => {
            e.detail.complete();
            dismiss();
        });
    }
    const handleChange = (value: any, key: string) => {
        if (key === "type") {
            if (value < 5) {
                setIssuance({ ...issuance, type: value, end: undefined, start: undefined, date: "" });
            } else if (value === 5) {
                setIssuance({ ...issuance, type: value, end: new Date().toISOString(), start: new Date().toISOString(), date: new Date().toISOString() });
            }
        }
    }
    const handleDateChange = (e: CustomEvent<DatetimeChangeEventDetail>) => {
        console.log(e.detail.value/* , format(parseISO(new Date().toISOString()), "EE MMM dd yyyy") */);
        // setIssuance({...issuance, date: format(parseISO(e.detail.value), "EE MMM dd yyyy")});
        if (issuance.type < 5) {
            setIssuance({ ...issuance, date:e.detail.value.toString() });
        } else {
            if (dateType === "start") {
                setIssuance({ ...issuance, start:e.detail.value.toString() });
            } else if (dateType === "end") {
                setIssuance({ ...issuance, end:e.detail.value.toString() });
            }
        }

    }
    const handleDismiss = () => {
        setIsOpen(false);
    }
    useEffect(() => {
        isClean.current = true;
        let type = issuance.type;
        let isdate = issuance.date !== "" ? issuance.date : new Date().toISOString();
        let data = "";
        switch (type) {
            case 0:
                data = format(parseISO(isdate), "EE MMM dd yyyy");
                break;
            case 1:
                data = format(parseISO(isdate), "EE MMM dd yyyy");
                break;
            case 2:
                data = "week " + format(parseISO(isdate), "ww yyyy");
                break;
            case 3:
                data = format(parseISO(isdate), "MMM yyyy");
                break;
            case 4:
                data = format(parseISO(isdate), "yyyy");
                break;
            default:
                break;
        }
        if (isClean.current) {
            setFormatDate(data);
        }
        return () => {
            isClean.current = false;
        }
    }, [issuance.date, issuance.type]);
    const [dateType, setDateType] = useState("");
    const handleOpen = (type: string) => {
        setDateType(type);
        setIsOpen(true);
    }
    const handleSearch =() => {
        present("Searching...");
        Http.request({
            method: "POST",
            url: href + "/api/store/search/issuance",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            },
            data: issuance
        }).then(({ data }) => {
            if (data.success) {
                setInventories(data.inventory);
                // setCNonStore(data.cNonStore);
                // if (segment === "direct") {
                //     setData(data.cStore);
                // } else if (segment === "non") {
                //     setData(data.cNonStore);
                // }
                // setBrands(data.brands);
            }
        }).finally(() => {
            dismiss();
        });
    }
    return (
        <IonPage>
            <Toolbar title="Dashboard" />
            <IonContent className="ion-padding">
                <IonAlert isOpen={showAlert} header="please confirm" message="Do you really want to  exit?" buttons={[
                    { text: 'No', role: 'cancel', cssClass: 'secondary' },
                    { text: 'Yes', role: 'destructive', handler: () => App.exitApp() }
                ]} onDidDismiss={() => setShowAlert(false)} />
                <IonRefresher slot='fixed' onIonRefresh={e => handlePull(e)} pullFactor={0.5} pullMin={100} pullMax={200} closeDuration="200ms">
                    <IonRefresherContent pullingText="pull to refresh"></IonRefresherContent>
                </IonRefresher>
                <IonSegment className='mb-1' color='green' value={segment} swipeGesture onIonChange={e => segmentChanged(e)}>
                    <IonSegmentButton value='direct'>
                        <IonLabel>Direct</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value='non'>
                        <IonLabel>Non-Direct</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value='issuance'>
                        <IonLabel>Issuance</IonLabel>
                    </IonSegmentButton>
                </IonSegment>
                <div className='mx-auto'>
                    {segment !== "issuance" && data.length > 0 && <div>
                        <table ref={componentRef} className='ledger-tb'>
                            <thead>
                                <tr>
                                    <th>S/N</th>
                                    <th>Item</th>
                                    <th>Quantity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((value, index) => (
                                    <tr key={"table_row_" + value.type} className='stripe'>
                                        <td>{index + 1}</td>
                                        <td>{value.type}</td>
                                        <td>{value.quantity.toLocaleString() + (value.base !== undefined ? value.base : '')}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <th>S/N</th>
                                    <th>Item</th>
                                    <th>Quantity</th>
                                </tr>
                            </tfoot>
                        </table>
                    </div>}
                    {segment === "issuance" && <div>
                        {/* <pre>{JSON.stringify(issuance, null, 2)}</pre> */}
                        <IonItem fill='solid'>
                            <IonLabel position="stacked">Brand</IonLabel>
                            <IonSelect interface='action-sheet' placeholder='Select Brand' value={issuance.brand_id} onIonChange={e => setIssuance({ ...issuance, brand_id:e.detail.value })}>
                                {brands.map(value => (
                                    <IonSelectOption key={value.id} value={value.id}>{value.name}</IonSelectOption>
                                ))}
                            </IonSelect>
                        </IonItem>
                        {issuance.brand_id > 0 && <div className="flex">
                            <IonItem fill='solid' className={issuance.type < 5 ? 'w-1/2' : "w-1/3"}>
                                <IonLabel position='floating'>Select type</IonLabel>
                                <IonSelect interface='action-sheet' value={issuance.type} placeholder="Select type" onIonChange={e => handleChange(e.detail.value, "type")}>
                                    <IonSelectOption value={1}>Daily</IonSelectOption>
                                    <IonSelectOption value={2}>Weekly</IonSelectOption>
                                    <IonSelectOption value={3}>Monthly</IonSelectOption>
                                    <IonSelectOption value={4}>Yearly</IonSelectOption>
                                    <IonSelectOption value={5}>Custom</IonSelectOption>
                                </IonSelect>
                            </IonItem>
                            {issuance.type < 5 && <IonItem fill='solid' className='w-1/2'>
                                <IonLabel position="stacked">Choose Date</IonLabel>
                                <IonInput onClick={() => setIsOpen(true)} value={formatDate} />
                                {/* <IonButton onClick={() =>setIsOpen(true)}>Open Date</IonButton> */}
                            </IonItem>}
                            {issuance.type === 5 && <div className="flex w-2/3">
                                <IonItem fill='solid' className='w-1/2'>
                                    <IonLabel position="stacked">Start Date</IonLabel>
                                    <IonInput value={format(parseISO(issuance?.start || new Date().toISOString()), "EE MMM dd yyyy")} onClick={() => handleOpen("start")} />
                                </IonItem>
                                <IonItem fill='solid' className='w-1/2'>
                                    <IonLabel position="stacked">End Date</IonLabel>
                                    <IonInput value={format(parseISO(issuance?.end || new Date().toISOString()), "EE MMM dd yyyy")} onClick={() => handleOpen("end")} />
                                </IonItem>
                            </div>}
                            <IonModal onDidDismiss={handleDismiss} isOpen={isOpen}>
                                <IonCard>
                                    <IonCardContent>
                                        {issuance.type < 5 && <IonDatetime value={issuance.date || new Date().toISOString()} color='green' showDefaultButtons presentation={date} min="2022-01-01T00:00:00" onIonChange={e => handleDateChange(e)} />}
                                        {issuance.type === 5 && dateType === "start" && <IonDatetime value={issuance.start || new Date().toISOString()} color='green' showDefaultButtons presentation={date} min="2022-01-01T00:00:00" onIonChange={e => handleDateChange(e)} />}
                                        {issuance.type === 5 && dateType === "end" && <IonDatetime value={issuance.end || new Date().toISOString()} color='green' showDefaultButtons presentation={date} max={new Date().toISOString()} onIonChange={e => handleDateChange(e)} />}
                                    </IonCardContent>
                                </IonCard>
                            </IonModal>
                            {/* {issuance.type === 3 &&<IonItem fill='solid' className='w-1/2'>
                                <IonLabel position="stacked">Select month</IonLabel>
                                <IonSelect interface='action-sheet' placeholder='Select month'>
                                    {months.map(value=>(<IonSelectOption key={value.id} value={value.id}>{value.month}</IonSelectOption>))}
                                </IonSelect>
                            </IonItem> }
                            {issuance.type >= 3 && issuance.type <= 4 &&<IonItem fill='solid' className='w-1/2'>
                                <IonLabel position="stacked">Select year</IonLabel>
                                <IonSelect interface='action-sheet' placeholder='Select year'>
                                    {years.map(value=>(<IonSelectOption key={value} value={value}>{value}</IonSelectOption>))}
                                </IonSelect>
                            </IonItem> } */}

                        </div>}
                        {/* <Calendar color="green" showDateDisplay date={issuance.date} onChange={(e: any) => setIssuance({ ...issuance, date: e })} /> */}

                        {/* <DateRange startDate={new Date()} endDate={new Date()} /> */}
                    </div>}
                    {segment === "issuance" && <>
                    <IonButton color="green" onClick={handleSearch}>
                        <IonIcon slot="start" icon={searchOutline} />
                        Search</IonButton>
                        {/* <pre>{JSON.stringify(inventories, null, 2)}</pre> */}
                        {inventories.length > 0 && <div className='mt-2'>
                            <table ref={componentRef} className='ledger-tb'>
                                <thead>
                                    <tr>
                                        <th>S/N</th>
                                        <th>Date</th>
                                        <th>Item</th>
                                        <th>Quantity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inventories.map((value, index) => (
                                        <tr key={"table_inventories_row_" + value.type} className='stripe'>
                                            <td>{index + 1}</td>
                                            <td>{format(new Date(value.date), "dd/MM/yyyy")}</td>
                                            <td>{value.type}</td>
                                            <td>{value.quantity.toLocaleString() + (value.base !== undefined ? value.base : '')}</td>
                                        </tr>
                                    ))}

                                </tbody>
                                <tfoot>
                                    <tr>
                                        <th>S/N</th>
                                        <th>Date</th>
                                        <th>Item</th>
                                        <th>Quantity</th>
                                    </tr>
                                </tfoot>

                            </table>
                        </div>}</>}
                </div>
            </IonContent>
            <IonFooter>
                <div className="flex justify-between w-11/12 mx-auto">
                    <IonButton color="green" onClick={exportToExcel}>
                        <IonIcon icon={sparkles} slot="start" />
                        Export</IonButton>
                    <IonButton color="green" onClick={handlePrint}>
                        <IonIcon icon={printOutline} slot="start" />
                        Print</IonButton>
                    <IonButton color="green" onClick={() => console.log("log")}>
                        <IonIcon icon={shareSocial} slot="start" />
                        Share</IonButton>
                </div>

            </IonFooter>
        </IonPage>
    );
};

export default StoreDashboard;