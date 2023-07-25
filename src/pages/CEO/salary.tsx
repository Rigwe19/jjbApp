import { Http } from '@capacitor-community/http';
import { IonButton, IonCheckbox, IonContent, IonFooter, IonIcon, IonItem, IonLabel, IonNote, IonPage, IonSegment, IonSegmentButton, IonSelect, IonSelectOption, IonText, useIonLoading } from '@ionic/react';
import { format } from 'date-fns';
import { enGB } from 'date-fns/locale';
import { checkmarkCircle, saveOutline, search } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';

import Toolbar from '../../components/toolbar';
import { useRecoilValue } from 'recoil';
import { urlAtom } from '../../recoil/urlAtom';
import { User, userAtom } from '../../recoil/userAtom';

const CEOSalary: React.FC = () => {
    const user = useRecoilValue<User>(userAtom);
    const href = useRecoilValue<string>(urlAtom);
    const [employeeLists, setEmployeeLists] = useState([]);
    const [filters, setFilters] = useState([]);
    const [segment, setSegment] = useState("factory");
    const [all, setAll] = useState(false);
    const [state, setState] = useState({
        month: new Date().getMonth(),
        year: parseInt(format(new Date(), "yyyy")),
    });
    const isClean = useRef(false);
    const [show, hide] = useIonLoading();
    useEffect(() => {
        isClean.current = true;
        show("Loading...")
        Http.request({
            method: "GET",
            url: href + "/api/account/get/salary",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            },
        }).then(({ data }) => {
            if (isClean.current && data.success) {
                setEmployeeLists(data.employeeLists);
                setSegment("factory");
                let list = data.employeeLists.filter((value: { department: string; }) => {
                    return value.department === "Production";
                });
                if (list !== undefined) {
                    setFilters(list);
                } else {
                    setFilters([]);
                }
            }
        }).finally(() => {
            hide();
        });
        return () => {
            isClean.current = false;
        }
    }, []);
    const handleSearch = () => {
        show("Searching...")
        Http.request({
            method: "POST",
            url: href + "/api/account/search/salary",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            },
            data: { date: new Date(state.year, state.month).toDateString() }
        }).then(({ data }) => {
            if (data.success) {
                setEmployeeLists(data.employeeLists);
                setSegment("factory");
                let list = data.employeeLists.filter((value: { department: string; }) => {
                    return value.department === "Production";
                });
                if (list !== undefined) {
                    setFilters(list);
                } else {
                    setFilters([]);
                }
            }
        }).finally(() => {
            hide();
        });
    }
    useEffect(() => {
        let list = [];
        if (segment === "admin") {
            list = employeeLists.filter(value => {
                return value.department !== "Production";
            });
        } else {
            list = employeeLists.filter(value => {
                return value.department === "Production";
            });
        }
        if (list !== undefined) {
            setFilters(list);
            setAll(false);
        } else {
            setFilters([]);
        }
    }, [segment]);

    const displayTotal = () => {
        let sum = 0;
        filters.forEach(element => {
            if (element.pay && !element.paid) {
                sum += element.salary;
            }
        });
        return sum;
    }
    const year = [];
    for (let i = 2021; i <= parseInt(format(new Date(), "yyyy")); i++) {
        year.push(i);
    }
    const months = [];
    for (let i = 0; i < 12; i++) {
        if (enGB.localize !== undefined)
            months.push({ month: enGB.localize.month(i), id: i });
    }

    const handleChange = (value: any, key: string) => {
        setState(pv => ({ ...pv, [key]: value }));
    }
    const handleAll = (value: boolean) => {
        setAll(value);
    }
    useEffect(() => {
        let lists = [...filters];
        if (all) {
            lists.forEach(element => {
                element.pay = true;
            });
        } else {
            lists.forEach(element => {
                element.pay = false;
            });
        }
        setFilters(lists);
    }, [all]);
    const handleCheckChange = (value: boolean, index: number) => {
        let lists = [...filters];
        if (value) {
            lists[index].pay = true;
        } else {
            lists[index].pay = false;
        }
        setFilters(lists);
    }
    const handleSave = () => {
        let lists = {};
        let isValid = false;
        let paid = true;
        employeeLists.forEach(value => {
            if (value.paid || value.pay) {
                let list = {
                    amount: value.salary,
                    paid: true,
                    date: format(new Date(), "yyyy-MM-dd"),
                }
                lists[value.id] = list;
                isValid = true;
            } else {
                paid = false;
            }
        });
        if (isValid) {
            show("Paying...")
            Http.request({
                method: "POST",
                url: href + "/api/account/save/salary",
                headers: {
                    'Content-Type': 'application/json',
                    'Data-Type': 'json',
                    'Authorization': 'Bearer ' + user.token
                },
                data: {
                    lists: JSON.stringify(lists),
                    date: new Date(state.year, state.month).toDateString(),
                    type: segment,
                    paid
                }
            }).then(({ data }) => {
                if (data.success) {
                    setEmployeeLists(data.employeeLists);
                    setSegment("factory");
                    let list = data.employeeLists.filter((value: { department: string; }) => {
                        return value.department === "Production";
                    });
                    if (list !== undefined) {
                        setFilters(list);
                    } else {
                        setFilters([]);
                    }
                }
            }).finally(() => {
                hide();
            });
        }
        // console.log(JSON.stringify(lists));
    }
    return (
        <IonPage>
            <Toolbar title="Salary" />
            <IonContent className="ion-padding">
                <div className="flex">
                    <IonItem fill='solid' className='w-1/2'>
                        <IonLabel color="medium" position="stacked">Select Month</IonLabel>
                        <IonSelect interface="action-sheet" interfaceOptions={{ header: "Select Month" }} placeholder="Select Month" value={state.month} onIonChange={e => handleChange(e.detail.value, "month")}>
                            {months.map(value => (<IonSelectOption key={value.id} value={value.id}>{value.month}</IonSelectOption>))}
                        </IonSelect>
                    </IonItem>
                    <IonItem fill='solid' className='w-1/2'>
                        <IonLabel color="medium" position="stacked">Select Year</IonLabel>
                        <IonSelect interface="action-sheet" interfaceOptions={{ header: "Select Year" }} placeholder="Select Year" value={state.year} onIonChange={e => handleChange(e.detail.value, "year")}>
                            {year.map((value, index) => (<IonSelectOption key={index} value={value}>{value}</IonSelectOption>))}
                        </IonSelect>
                    </IonItem>
                </div>
                <IonButton color='green' onClick={handleSearch}>
                    <IonIcon slot="start" icon={search} />
                    Search
                </IonButton>
                <IonSegment value={segment} onIonChange={e => setSegment(e.detail.value)}>
                    <IonSegmentButton value='factory'>Factory Workers</IonSegmentButton>
                    <IonSegmentButton value='admin'>Admin Workers</IonSegmentButton>
                </IonSegment>
                <div>
                    {filters.map((value, index) => (<IonItem key={value.id} className='mb-1' fill='solid'>
                        {!value.paid && <IonCheckbox color="green" readonly={value.paid} slot="start" checked={value.pay || value.paid} onIonChange={e => handleCheckChange(e.detail.checked, index)} />}
                        {value.paid && <IonIcon icon={checkmarkCircle} color="success" slot="start" />}
                        <IonLabel>
                            <p>{value.name}</p>
                            {value.reduced !== 0 && <p><span className='text-red-800'>₦{value.reduced}</span> was deducted from salary, check query to see why.</p>}
                        </IonLabel>
                        <IonNote slot="end">
                            <p>₦{value.salary}</p>
                            {value.paid && <IonText color="success">has been paid</IonText>}
                        </IonNote>
                    </IonItem>))}
                    <IonItem fill='solid'>
                        <IonCheckbox color="green" slot="start" checked={all} onIonChange={e => handleAll(e.detail.checked)} />
                        <IonLabel>
                            <p>Select All</p>
                        </IonLabel>
                        <IonNote slot="end">₦{displayTotal()}</IonNote>
                    </IonItem>
                </div>
            </IonContent>
            <IonFooter>
                <IonButton disabled={displayTotal() === 0} color='green' expand='block' onClick={handleSave}>
                    <IonIcon slot='start' icon={saveOutline} />
                    Pay {displayTotal()}
                </IonButton>
            </IonFooter>
        </IonPage>
    );
};

export default CEOSalary;