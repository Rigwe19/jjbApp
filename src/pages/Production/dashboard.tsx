import { Http } from '@capacitor-community/http';
import { IonAlert, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonNote, IonPage, IonSegment, IonSegmentButton, IonText, IonTitle, IonToolbar, SegmentChangeEventDetail, useIonAlert, useIonLoading, useIonToast } from '@ionic/react';
import { closeCircleOutline } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';

import { utils, writeFile } from 'xlsx';
import { useReactToPrint } from 'react-to-print';
import TableComponent from '../../components/Table';
import '../../components/Table.css';
import Toolbar from '../../components/toolbar';
import { useHistory } from 'react-router-dom';
import { App } from '@capacitor/app';
import { useRecoilValue } from 'recoil';
import { urlAtom } from '../../recoil/urlAtom';
import { User, userAtom } from '../../recoil/userAtom';

interface IInventory {
    id: number;
    quantity: number;
    type: string;
}

interface IHeader {
    id: number;
    type: string;
}
const ProductionDashboard: React.FC = () => {
    // const { useDownloadExcel } = require('react-export-table-to-excel');
    const user = useRecoilValue<User>(userAtom);
    const href = useRecoilValue<string>(urlAtom);
    const isClean = useRef(false);
    const [inventory, setInventory] = useState<IInventory[]>([]);
    const [showAlert, setShowAlert] = useState(false);
    const [headers, setHeaders] = useState<IHeader[]>([]);
    const [data, setData] = useState<any[]>([]);
    const [total, setTotal] = useState<any[]>([]);
    const [segment, setSegment] = useState("all");
    const [segHead, setSegHead] = useState<IHeader[]>([]);
    const [toasted] = useIonToast();
    const [present, dismiss] = useIonLoading();
    const [alerted] = useIonAlert();
    const tableRef = useRef(null);
    const history = useHistory();
    useEffect(() => {
        isClean.current = true;
        document.addEventListener('ionBackButton', (ev: any) => {
            ev.detail.register(-1, () => {
                // when in home last page
                if (history.location.pathname === "/production/dashboard") {
                    // calling alert box
                    setShowAlert(true);
                }
            });
        });
        present("Loading...");
        Http.request({
            method: "GET",
            url: href + "/api/get/production/dashboard",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            }
        }).then(({ data }) => {
            if (isClean.current && data.success) {
                setHeaders(data.headers);
                setSegHead(data.headers);
                setData(data.data);
                setTotal(data.total);
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
            method: "GET",
            url: href + "/api/get/production/dashboard/" + id,
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            }
        }).then(({ data }) => {
            if (isClean.current && data.success) {
                setHeaders(data.headers);
                setData(data.data);
                setTotal(data.total);
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
                {inventory.map(value => (
                    <IonItem fill='solid'>
                        <IonText>{value.type}</IonText>
                        <IonNote slot="end">{value.quantity} breads</IonNote>
                    </IonItem>
                ))}
                {/* <div className="flex justify-center mb-1">
                    <IonChip color='green'>Sliver</IonChip>
                </div> */}
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>{user.brand}</IonTitle>
                    </IonToolbar>
                </IonHeader>
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
                </>}
                <div className="w-full h-[70vh] flex justify-center items-center">
                    <div className="flex flex-col">
                        <IonIcon icon={closeCircleOutline} className="mx-auto" size="large" color="medium" />
                        <IonText color="medium">No record for today</IonText>
                    </div>
                </div>
                {/* <ReactHTMLTableToExcel filename="production report" sheet="production" table="reportTable" buttonText="Download as XSL"
                    className="p-2 border border-green-700 bg-green-700 rounded-md mt-3"
                /> */}
                {/* <IonButton color="green" onClick={exportToExcel}>
                    <IonIcon icon={sparkles} slot="start" />
                    Export To Excel</IonButton>
                <IonButton color="green" onClick={handlePrint}>
                    <IonIcon icon={printOutline} slot="start" />
                    Print</IonButton>
                <IonButton color="green" onClick={() => console.log("log")}>
                    <IonIcon icon={shareSocial} slot="start" />
                    Share</IonButton> */}
            </IonContent>
        </IonPage>
    );
};

export default ProductionDashboard;