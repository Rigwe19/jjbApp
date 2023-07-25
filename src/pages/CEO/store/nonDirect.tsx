import { Http } from '@capacitor-community/http';
import { IonContent, IonPage, useIonLoading, IonIcon, IonLabel } from '@ionic/react';
import { closeCircleOutline } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { utils, writeFile } from 'xlsx';
import Toolbar from '../../../components/toolbar';
import { useRecoilValue } from 'recoil';
import { urlAtom } from '../../../recoil/urlAtom';
import { User, userAtom } from '../../../recoil/userAtom';

const CeoNonDirect: React.FC = () => {
    const user = useRecoilValue<User>(userAtom);
    const href = useRecoilValue<string>(urlAtom);
    const [data, setData] = useState<any[]>([]);
    const [present, dismiss] = useIonLoading();
    const isClean = useRef(false);

    useEffect(() => {
        isClean.current = true;
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
                setData(data.cNonStore);
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

    return (
        <IonPage>
            <Toolbar title="Non Direct Inventory" />
            <IonContent className="ion-padding">
                {data.length>0&&<table ref={componentRef} className='ledger-tb'>
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
                </table>}
                {data.length === 0 && <div className='flex flex-col items-center mt-[25vh]'>
                    <IonIcon size='large' color='medium' icon={closeCircleOutline} />
                    <IonLabel color='medium'>No Record Found</IonLabel>
                </div>}
            </IonContent>
        </IonPage>
    );
};

export default CeoNonDirect;