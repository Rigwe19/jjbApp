import { Http } from '@capacitor-community/http';
import { DatetimeChangeEventDetail, IonButton, IonCard, IonCardContent, IonContent, IonDatetime, IonIcon, IonInput, IonItem, IonLabel, IonModal, IonPage, IonSelect, IonSelectOption, useIonLoading } from '@ionic/react';
import { format, parseISO } from 'date-fns';
import { chevronDown, chevronUp, searchOutline } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';

import Toolbar from '../../components/toolbar';
import { useRecoilValue } from 'recoil';
import { urlAtom } from '../../recoil/urlAtom';
import { User, userAtom } from '../../recoil/userAtom';

const CeoLeft: React.FC = () => {
    const user = useRecoilValue<User>(userAtom);
    const href = useRecoilValue<string>(urlAtom);
    const isClean = useRef(false);
    const [present, dismiss] = useIonLoading();
    const [locations, setLocations] = useState([]);
    const [ledger, setLedger] = useState({
        location_id: 0,
        customer_id: 0,
        type: 1,
        end: "",
        start: "",
        date: new Date().toISOString(),
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
    const [lefts, setLefts] = useState([]);
    useEffect(() => {
      isClean.current = true;
      present("Loading...");
      Http.request({
          method: "GET",
          url: href + "/api/ceo/get/left",
          headers: {
              'Content-Type': 'application/json',
              'Data-Type': 'json',
              'Authorization': 'Bearer ' + user.token
          }
      }).then(({ data }) => {
          if (isClean.current && data.success) {
              setLocations(data.locations)
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
            url: href + "/api/search/ceo/left",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            },
            data: ledger
        }).then(({ data }) => {
            if (isClean.current && data.success) {
                setLefts(data.lefts);
                // setFilters(data.visitors);
            }
        }).finally(() => {
            dismiss();
        });
    }

    return (
        <IonPage>
            <Toolbar title="Product Left" />
            <IonContent className="ion-padding">
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
                    {/* <IonButton color="green" fill="solid" shape="round" size="small" onClick={handlePrint}>
                        <IonIcon icon={printOutline} slot="start" />
                        Print
                    </IonButton> */}
                </div>
                {/* <pre>{JSON.stringify(lefts, null,2)}</pre> */}
                {lefts.length>0 && <table className='ledger-tb'>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Customer Name</th>
                            <th>Items Left</th>
                        </tr>
                    </thead>
                    <tfoot>
                        <tr>
                            <th>Date</th>
                            <th>Customer Name</th>
                            <th>Items Left</th>
                        </tr>
                    </tfoot>
                    <tbody>
                        {lefts.map((value, index) => (<tr key={index}>
                            <td>{format(new Date(value.date), "EEEE, dd LLLL yyyy")}</td>
                            <td>{value.name}</td>
                            <td className='!p-0'>
                                <table className='w-full'>
                                    <thead>
                                        <tr>
                                            <th>Product Type</th>
                                            <th>Dispatch</th>
                                            <th>Security</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.keys(value.joint).map(key=>(<tr key={key}>
                                            <th>{key}</th>
                                            <td>
                                                {value.joint[key][0]}
                                                {value.joint[key][0] !== value.joint[key][1] && <IonIcon icon={value.joint[key][0] > value.joint[key][1] ? chevronUp : chevronDown} color={value.joint[key][0] > value.joint[key][1] ? "success" : "danger"} />}
                                            </td>
                                            <td>
                                                {value.joint[key][1]}
                                                {value.joint[key][0] !== value.joint[key][1] && <IonIcon icon={value.joint[key][1] > value.joint[key][0] ? chevronUp : chevronDown} color={value.joint[key][1] > value.joint[key][0] ? "success" : "danger"} />}
                                            </td>
                                        </tr>))}
                                    </tbody>
                                </table>
                            </td>
                        </tr>))}
                    </tbody>
                </table>}
            </IonContent>
        </IonPage>
    );
};

export default CeoLeft;