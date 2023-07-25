import { Http } from '@capacitor-community/http';
import { IonAlert, IonButton, IonContent, IonIcon, IonPage, IonRefresher, IonRefresherContent, useIonLoading } from '@ionic/react';
import { sparkles, printOutline, shareSocial } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { utils, writeFile } from 'xlsx';

import '../../components/Table.css';
import Toolbar from '../../components/toolbar';
import { useHistory } from 'react-router-dom';

import { App } from '@capacitor/app';
import { useRecoilValue } from 'recoil';
import { urlAtom } from '../../recoil/urlAtom';
import { User, userAtom } from '../../recoil/userAtom';

const PackagingDashboard: React.FC = () => {
    const user = useRecoilValue<User>(userAtom);
    const href = useRecoilValue<string>(urlAtom);
    const isClean = useRef(false);
    const [inventories, setInventories] = useState([]);
    const [showAlert, setShowAlert] = useState(false);
    const [sent, setSent] = useState([]);
    const [brands, setBrands] = useState([{ id: 0, name: "" }]);
    const [brand, setBrand] = useState(0);
    const [present, dismiss] = useIonLoading();
    const history = useHistory();
    useEffect(() => {
        isClean.current = true;
        document.addEventListener('ionBackButton', (ev: any) => {
            ev.detail.register(-1, () => {
                // when in home last page
                if (history.location.pathname === "/packaging/dashboard") {
                    // calling alert box
                    setShowAlert(true);
                }
            });
        });
        refreshPage();
        return () => {
            isClean.current = false;
        }
    }, []);
    useEffect(() => {
        isClean.current = true;

        return () => {
            isClean.current = false;
        }
    }, [brand]);

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
    const refreshPage = (e?: any) => {
        present("Loading...");
        Http.request({
            method: "GET",
            url: href + "/api/get/packaging/dashboard/",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            }
        }).then(({ data }) => {
            if (isClean.current && data.success) {
                setSent(data.sent);
                setInventories(data.inventory);
            }
        }).finally(() => {
            if (e !== undefined) {
                e.detail.complete();
            }
            dismiss();
        });
    }
    const doRefresh = (e: any) => {
        refreshPage(e);
    }


    return (
        <IonPage>
            <Toolbar title="Dashboard" />
            <IonContent className="ion-padding">
                <IonRefresher slot='fixed' onIonRefresh={e => doRefresh(e)}>
                    <IonRefresherContent></IonRefresherContent>
                </IonRefresher>
                <IonAlert isOpen={showAlert} header="please confirm" message="Do you really want to  exit?" buttons={[
                    { text: 'No', role: 'cancel', cssClass: 'secondary' },
                    { text: 'Yes', role: 'destructive', handler: () => App.exitApp() }
                ]} onDidDismiss={() => setShowAlert(false)} />
                {/* <IonItem fill='solid'>
                    <IonLabel position='floating'>Brand</IonLabel>
                    <IonSelect interface='action-sheet' color='green' value={brand} onIonChange={e => setBrand(e.detail.value)}>
                        <IonSelectOption color="green" value={0}>Select Brand</IonSelectOption>
                        {brands.map(value => (
                            <IonSelectOption key={value.id} value={value.id}>{value.name}</IonSelectOption>
                        ))}
                    </IonSelect>

                </IonItem> */}
                {inventories.length > 0 &&
                    <>
                        <div ref={componentRef} className="my-2 w-full">
                            <table className='border-collapse border color:border-[--ion-border-color] w-full rounded-md'>
                                <thead>
                                    <tr>
                                        <th className='border bdcolor p-2'>S/N</th>
                                        <th className='border bdcolor p-2 vertical'>Bread Type</th>
                                        <th className='border bdcolor p-2 vertical'>Quantity</th>
                                        <th className='border bdcolor p-2 vertical'>Dispatched</th>
                                        <th className='border bdcolor p-2 vertical'>Remaining</th>
                                    </tr>
                                </thead>
                                <tfoot>
                                    <tr>
                                        <th className='border bdcolor p-2'>S/N</th>
                                        <th className='border bdcolor p-2 vertical'>Bread Type</th>
                                        <th className='border bdcolor p-2 vertical'>Quantity</th>
                                        <th className='border bdcolor p-2 vertical'>Dispatched</th>
                                        <th className='border bdcolor p-2 vertical'>Remaining</th>
                                    </tr>
                                </tfoot>
                                <tbody>
                                    {inventories.map((value, index) => (
                                        <tr key={value.id} className='stripe'>
                                            <td className='border bdcolor p-2'>{index + 1}</td>
                                            <td className='border bdcolor p-2'>{value.type}</td>
                                            <td className='border bdcolor p-2'>{value.quantity}</td>
                                            <td className='border bdcolor p-2'>{value.dispatched}</td>
                                            <td className='border bdcolor p-2'>{value.balance}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
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
            </IonContent>
        </IonPage>
    );
};

export default PackagingDashboard;