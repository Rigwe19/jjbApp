import { Http } from '@capacitor-community/http';
import { IonAlert, IonContent, IonPage, IonRefresher, IonRefresherContent, IonSegment, IonSegmentButton, RefresherEventDetail, useIonLoading } from '@ionic/react';
import React, { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router';

import Toolbar from '../../components/toolbar';
import { App } from '@capacitor/app';
import { useRecoilValue } from 'recoil';
import { urlAtom } from '../../recoil/urlAtom';
import { User, userAtom } from '../../recoil/userAtom';

const DispatchDashboard: React.FC = () => {
    const user = useRecoilValue<User>(userAtom);
    const href = useRecoilValue<string>(urlAtom);
    const [dashboard, setDashboard] = useState([]);
    const [filters, setFilters] = useState([]);
    const [present, dismiss] = useIonLoading();
    const arr = [
        { text: [{ name: "my name" }] },
        { text: "your name" }
    ];
    const [segments, setSegments] = useState([]);
    const [segment, setSegment] = useState(0);
    const [showAlert, setShowAlert] = useState(false);
    const isClean = useRef(false);
    const history = useHistory();
    useEffect(() => {
        isClean.current = true;
        document.addEventListener('ionBackButton', (ev: any) => {
            ev.detail.register(-1, () => {
                // when in home last page
                if (history.location.pathname === "/dispatch/dashboard") {
                    // calling alert box
                    setShowAlert(true);
                }
            });
        });
        handleRefresh();
        return () => {
            isClean.current = false;
        }
    }, []);
    useEffect(() => {
        let newFilter = dashboard.filter(value => {
            return value.brand_id === segment;
        });
        if (newFilter !== undefined) {
            setFilters(newFilter);
        }
    }, [segment]);
    const handleRefresh = (e?: CustomEvent<RefresherEventDetail>) => {
        present("Loading...");
        Http.request({
            method: "GET",
            url: href + "/api/get/dispatch/dashboard",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            }
        }).then(({ data }) => {
            if (isClean.current && data.success) {
                setSegments(data.segments);
                setDashboard(data.dashboard);
                setSegment(data.segments[0].id);
            }
        }).finally(() => {
            if(e){
                e.detail.complete();
            }
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
                <IonRefresher slot="fixed" onIonRefresh={e => handleRefresh(e)}>
                    <IonRefresherContent />
                </IonRefresher>
                <IonSegment onIonChange={e => setSegment(parseInt(e.detail.value))} value={segment.toString()}>
                    {segments.map(value => (<IonSegmentButton key={value.id} value={value.id}>{value.name}</IonSegmentButton>))}
                </IonSegment>
                {filters.length > 0 && <table className='ledger-tb'>
                    <thead>
                        <tr>
                            <th className='vertical'>item</th>
                            <th className='vertical'>Opening Stock</th>
                            <th className='vertical'>Sold</th>
                            <th className='vertical'>Restocked</th>
                            <th className='vertical'>Balance</th>
                        </tr>
                    </thead>
                    {/* <tfoot>
                        <tr>
                            <th className='vertical'>item</th>
                            <th className='vertical'>Opening Stock</th>
                            <th className='vertical'>Sold</th>
                            <th className='vertical'>Restocked</th>
                            <th className='vertical'>Balance</th>
                        </tr>
                    </tfoot> */}
                    <tbody>
                        {filters.map(value => (<tr key={value.id} className="stripe">
                            <td>{value.type}</td>
                            <td>{value.opening_stock}</td>
                            <td>{value.sold}</td>
                            <td>{value.restocked}</td>
                            <td>{value.balance}</td>
                        </tr>))}
                    </tbody>
                </table>}
                {/* <pre>
                    {JSON.stringify(arr.flat(5), null, 2)}
                </pre> */}
            </IonContent>
        </IonPage>
    );
};

export default DispatchDashboard;
