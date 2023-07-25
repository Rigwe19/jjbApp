import { Http } from '@capacitor-community/http';
import { DatetimeChangeEventDetail, IonButton, IonButtons, IonCard, IonCardContent, IonContent, IonDatetime, IonFooter, IonIcon, IonInput, IonItem, IonItemGroup, IonLabel, IonModal, IonNote, IonPage, IonRefresher, IonRefresherContent, IonSegment, IonSegmentButton, IonSelect, IonSelectOption, RefresherEventDetail, useIonLoading } from '@ionic/react';
import { format, parseISO } from 'date-fns';
import { searchOutline, cashOutline, refreshOutline } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';
import Toolbar from '../../components/toolbar';
import { useRecoilValue, useRecoilState } from 'recoil';
import { AccountDashboard, accountDashboardAtom } from '../../recoil/accountDashboardAtom';
import { urlAtom } from '../../recoil/urlAtom';
import { User, userAtom } from '../../recoil/userAtom';

interface State {
    type: number,
    end?: string;
    start?: string;
    date?: string;
}
const CeoAccount: React.FC = () => {
    const user = useRecoilValue<User>(userAtom);
    const href = useRecoilValue<string>(urlAtom);
    const [dashboard, setDashboard] = useRecoilState<AccountDashboard>(accountDashboardAtom);
    const [present, dismiss] = useIonLoading();
    const [state, setState] = useState<State>({
        type: 1,
        end: "",
        start: "",
        date: new Date().toISOString(),
    });
    type Dashboard = typeof dashboard;
    const [dash, setDash] = useState<Dashboard>({
        available: 0,
        expenses: 0,
        payment: 0,
        purchase: 0,
        sales: 0,
        total: 0,
    })
    const [isOpen, setIsOpen] = useState(false);
    const [dateType, setDateType] = useState("");
    const [formatDate, setFormatDate] = useState("");
    const [customers, setCustomers] = useState([]);
    const [filters, setFilters] = useState([]);
    const isClean = useRef(false);
    const [segment, setSegment] = useState("today");
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
                setState({ ...state, type: value, end: undefined, start: undefined });
            } else if (value === 5) {
                setState({ ...state, type: value, end: new Date().toISOString(), start: new Date().toISOString(), date: new Date().toISOString() });
            }
        }
    }
    useEffect(() => {
        isClean.current = true;
        let type = state.type;
        let isdate = state.date !== "" ? state.date : new Date().toISOString();
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
    }, [state.date, state.type]);
    const handleDateChange = (e: CustomEvent<DatetimeChangeEventDetail>) => {
        console.log(e.detail.value/* , format(parseISO(new Date().toISOString()), "EE MMM dd yyyy") */);
        // setState({...state, date: format(parseISO(e.detail.value), "EE MMM dd yyyy")});
        if (state.type < 5) {
            setState(prevState => ({ ...prevState, date:e.detail.value.toString() }));
        } else {
            if (dateType === "start") {
                setState({ ...state, start:e.detail.value.toString() });
            } else if (dateType === "end") {
                setState({ ...state, end:e.detail.value.toString() });
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
    // const [dashboard, setDashboard] = useState({
    //     available: 0,
    //     payment: 0,
    //     sales: 0,
    //     expenses: 0,
    //     purchase: 0,
    //     total: 0,
    // });
    useEffect(() => {
        isClean.current = true;
        if (isClean.current) {
            queryDb();
        }
        return () => {
            isClean.current = false;
        }
    }, []);
    const handleRefresh = (e?: CustomEvent<RefresherEventDetail>) => {
        queryDb();
        e.detail.complete();
    }
    const queryDb = () => {
        present("Loading...");
        Http.request({
            method: "GET",
            url: href + "/api/account/get/dashboard",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            },
        }).then(({ data }) => {
            if (data.success) {
                setDashboard(data.dashboard);
                // setDashboard(prevState => ({...prevState, ...data.dashboard}));
            }
        }).finally(() => {
            dismiss();
        });
    }
    const handleSearch = () => {
        present("Searching...");
        Http.request({
            method: "POST",
            url: href + "/api/search/account/dashboard",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            },
            data: state
        }).then(({ data }) => {
            if (data.success) {
                setDash(data.dashboard);
            }
        }).finally(() => {
            dismiss();
        });
    }
    const handleSegmentChange = (value: string) => {
        setSegment(value);
        setDash({
            available: 0,
            expenses: 0,
            payment: 0,
            purchase: 0,
            sales: 0,
            total: 0,
        });
        setState({
            date: new Date().toISOString(),
            type: 1
        })
    }
    return (
        <IonPage>
            <Toolbar title="Account Report" />
            <IonContent className="ion-padding">
            <IonRefresher slot="fixed" onIonRefresh={e => handleRefresh(e)}>
                    <IonRefresherContent /> 
                </IonRefresher>
                <IonSegment value={segment} onIonChange={e => handleSegmentChange(e.detail.value)} className="mb-1">
                    <IonSegmentButton value="today">Today</IonSegmentButton>
                    <IonSegmentButton value="search">Search</IonSegmentButton>
                </IonSegment>
                {segment === "search" && <><div className="flex w-full">
                    <IonItem fill='solid' className={state.type < 5 ? 'w-1/2' : "w-1/3"}>
                        <IonLabel position='floating'>Select type</IonLabel>
                        <IonSelect interface='action-sheet' value={state.type} placeholder="Select type" onIonChange={e => handleChange(e.detail.value, "type")}>
                            <IonSelectOption value={1}>Daily</IonSelectOption>
                            <IonSelectOption value={2}>Weekly</IonSelectOption>
                            <IonSelectOption value={3}>Monthly</IonSelectOption>
                            <IonSelectOption value={4}>Yearly</IonSelectOption>
                            <IonSelectOption value={5}>Custom</IonSelectOption>
                        </IonSelect>
                    </IonItem>
                    {state.type < 5 && <IonItem fill='solid' className='w-1/2'>
                        <IonLabel position="stacked">Choose Date</IonLabel>
                        <IonInput onClick={() => setIsOpen(true)} value={formatDate} />
                        {/* <IonButton onClick={() =>setIsOpen(true)}>Open Date</IonButton> */}
                    </IonItem>}
                    {state.type === 5 && <div className="flex w-2/3">
                        <IonItem fill='solid' className='w-1/2'>
                            <IonLabel position="stacked">Start Date</IonLabel>
                            <IonInput value={format(parseISO(state?.start || new Date().toISOString()), "EE MMM dd yyyy")} onClick={() => handleOpen("start")} />
                        </IonItem>
                        <IonItem fill='solid' className='w-1/2'>
                            <IonLabel position="stacked">End Date</IonLabel>
                            <IonInput value={format(parseISO(state?.end || new Date().toISOString()), "EE MMM dd yyyy")} onClick={() => handleOpen("end")} />
                        </IonItem>
                    </div>}
                    <IonModal className='date-modal' onDidDismiss={handleDismiss} isOpen={isOpen}>
                        <IonCard>
                            <IonCardContent>
                                {state.type < 5 && <IonDatetime value={state.date || new Date().toISOString()} color='green' showDefaultButtons presentation={date} min="2022-01-01T00:00:00" onIonChange={e => handleDateChange(e)} />}
                                {state.type === 5 && dateType === "start" && <IonDatetime value={state.start || new Date().toISOString()} color='green' showDefaultButtons presentation={date} min="2022-01-01T00:00:00" onIonChange={e => handleDateChange(e)} />}
                                {state.type === 5 && dateType === "end" && <IonDatetime value={state.end || new Date().toISOString()} color='green' showDefaultButtons presentation={date} max={new Date().toISOString()} onIonChange={e => handleDateChange(e)} />}
                            </IonCardContent>
                        </IonCard>
                    </IonModal>
                </div>
                    {/* <pre>{JSON.stringify(state, null, 2)}</pre> */}
                    <IonButton onClick={handleSearch} className="mb-1">
                        <IonIcon icon={searchOutline} slot="start" />
                        Search</IonButton></>}
                {segment === "today" && <IonItemGroup>
                    <IonItem className='mb-1' fill='solid'>
                        <IonIcon slot="start" icon={cashOutline} />
                        <IonLabel>
                            <p>Cash Available Now</p>
                        </IonLabel>
                        <IonNote slot='end'>₦{dashboard.available.toLocaleString()}</IonNote>
                    </IonItem>
                    <IonItem className='mb-1' fill='solid'>
                        <IonIcon slot="start" icon={cashOutline} />
                        <IonLabel>
                            <p>Debtor Payment So far</p>
                        </IonLabel>
                        <IonNote slot='end'>₦{dashboard.payment.toLocaleString()}</IonNote>
                    </IonItem>
                    <IonItem className='mb-1' fill='solid'>
                        <IonIcon slot="start" icon={cashOutline} />
                        <IonLabel>
                            <p>Sales so far</p>
                        </IonLabel>
                        <IonNote slot='end'>₦{dashboard.sales.toLocaleString()}</IonNote>
                    </IonItem>
                    <IonItem className='mb-1' fill='solid'>
                        <IonIcon slot="start" icon={cashOutline} />
                        <IonLabel>
                            <p>Expenses So far</p>
                        </IonLabel>
                        <IonNote slot='end'>₦{dashboard.expenses.toLocaleString()}</IonNote>
                    </IonItem>
                    <IonItem className='mb-1' fill='solid'>
                        <IonIcon slot="start" icon={cashOutline} />
                        <IonLabel>
                            <p>Cash purchase/Creditor</p>
                        </IonLabel>
                        <IonNote slot='end'>₦{(dashboard.total - dashboard.purchase).toLocaleString()}</IonNote>
                    </IonItem>
                </IonItemGroup>}
                {segment === "search" && <IonItemGroup>
                    <IonItem className='mb-1' fill='solid'>
                        <IonIcon slot="start" icon={cashOutline} />
                        <IonLabel>
                            <p>Cash Available</p>
                        </IonLabel>
                        <IonNote slot='end'>₦{dash.available.toLocaleString()}</IonNote>
                    </IonItem>
                    <IonItem className='mb-1' fill='solid'>
                        <IonIcon slot="start" icon={cashOutline} />
                        <IonLabel>
                            <p>Debtor Payment</p>
                        </IonLabel>
                        <IonNote slot='end'>₦{dash.payment.toLocaleString()}</IonNote>
                    </IonItem>
                    <IonItem className='mb-1' fill='solid'>
                        <IonIcon slot="start" icon={cashOutline} />
                        <IonLabel>
                            <p>Sales</p>
                        </IonLabel>
                        <IonNote slot='end'>₦{dash.sales.toLocaleString()}</IonNote>
                    </IonItem>
                    <IonItem className='mb-1' fill='solid'>
                        <IonIcon slot="start" icon={cashOutline} />
                        <IonLabel>
                            <p>Expenses</p>
                        </IonLabel>
                        <IonNote slot='end'>₦{dash.expenses.toLocaleString()}</IonNote>
                    </IonItem>
                    <IonItem className='mb-1' fill='solid'>
                        <IonIcon slot="start" icon={cashOutline} />
                        <IonLabel>
                            <p>Cash purchase/Creditor</p>
                        </IonLabel>
                        <IonNote slot='end'>₦{(dash.total - dash.purchase).toLocaleString()}</IonNote>
                    </IonItem>
                </IonItemGroup>}
                
            </IonContent>
            <IonFooter className='flex justify-center' style={{ backgroundColor: "var(--ion-background-color, #fff)", color: "var(--ion-text-color, #000)" }}>
                <IonButtons>
                    <IonButton color='green' onClick={queryDb}>
                        <IonIcon slot="icon-only" icon={refreshOutline} />
                    </IonButton>
                </IonButtons>
            </IonFooter>
        </IonPage>
    );
};

export default CeoAccount;