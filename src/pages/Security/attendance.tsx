import { Http } from '@capacitor-community/http';
import { IonAvatar, IonContent, IonImg, IonItem, IonLabel, IonList, IonNote, IonPage, IonSearchbar, useIonLoading, useIonActionSheet, useIonToast } from '@ionic/react';
import { fingerPrint, fingerPrintOutline, remove } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';

import Toolbar from '../../components/toolbar';
import { useRecoilValue } from 'recoil';
import { urlAtom } from '../../recoil/urlAtom';
import { User, userAtom } from '../../recoil/userAtom';

const Attendance: React.FC = () => {
    const user = useRecoilValue<User>(userAtom);
    const href = useRecoilValue<string>(urlAtom);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState([{
        id: 0,
        name: "",
        employee_id: "",
        passport: "",
        status: "",
    }]);
    const [employee, setEmployee] = useState([{
        id: 0,
        name: "",
        employee_id: "",
        passport: "",
        status: "",
    }]);
    const isClean = useRef(false);
    const [present, dismiss] = useIonLoading();
    const [popup, popout] = useIonActionSheet();
    const [load, unload] = useIonToast();
    useEffect(() => {
        isClean.current = true;
        present("Loading Attendance");
        Http.request({
            method: "GET",
            url: href + "/api/get/security/employee",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            }
        }).then(({ data }) => {
            if (isClean.current && data.success) {
                setEmployee(data.employee);
                setFilter(data.employee);
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
        if (searchTerm.length > 1) {
            let result: any = [];
            // setFilter([]);
            if (/\d/.test(searchTerm)) {
                employee.forEach(value => {
                    if (value.employee_id.includes(searchTerm)) {
                        result.push(value);
                    }
                });
            } else {
                employee.forEach(value => {
                    if (value.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                        result.push(value);
                    }
                });
            }

            setFilter(result)
        } else {
            setFilter(employee)
        }
        return () => {
            isClean.current = false;
        }
    }, [searchTerm]);

    const handleClick = (value: { id: number; name: string; employee_id: string; passport: string; status: string; }) => {
        let button = [];
        if (value.status !== "Signed Out") {
            button = [
                { text: 'Sign Out', color: "theme", icon: fingerPrintOutline, role: 'destructive', handler: () => doSignOut(value.employee_id) },
                { text: 'Cancel', icon: remove, role: 'destructive', handler: () => popout() }
            ]
        } else {
            button = [
                { text: 'Sign In', icon: fingerPrint, role: 'destructive', handler: () => doSignIn(value.employee_id) },
                // { text: 'Sign Out', color: "theme", icon: fingerPrintOutline, role: 'destructive', handler: () => doSignOut(value.employee_id) },
                { text: 'Cancel', icon: remove, role: 'destructive', handler: () => popout() }
            ]
        }
        popup({
            buttons: button,
            header: value.name
        });
    }

    const doSignIn = (employee_id: string) => {
        present("Signing Attendance");
        Http.request({
            method: "POST",
            url: href + "/api/security/add/attendance",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            },
            data: { employee_id: employee_id, type: "in" }
        }).then(({ data }) => {
            if (data.success) {
                setEmployee(data.employee);
                setFilter(data.employee);
            } else {
                load("Has already worked for today", 3000);
            }
        }).finally(() => {
            dismiss();
        });
    }

    const doSignOut = (employee_id: string) => {
        present("Signing Out");
        Http.request({
            method: "POST",
            url: href + "/api/security/add/attendance",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            },
            data: { employee_id: employee_id, type: "out" }
        }).then(({ data }) => {
            if (data.success) {
                setEmployee(data.employee);
                setFilter(data.employee);
            }
        }).finally(() => {
            dismiss();
        });
    }

    const handleSearch = () => {

    }

    return (
        <IonPage>
            <Toolbar title="Attendance" />
            <IonContent className="ion-padding">
                {/* <pre>
                    {JSON.stringify(employee, null, 2)}
                </pre> */}
                <IonSearchbar placeholder='search for employees' onIonChange={e => setSearchTerm(e.detail.value)} />
                <IonList>
                    {filter.map((value, index) => {
                        return (
                            <IonItem className='mb-1' fill='solid' key={value.id} button onClick={() => handleClick(value)}>
                                <IonAvatar slot='start'>
                                    <IonImg src={href + value.passport} />
                                </IonAvatar>
                                <IonLabel>{value.name}</IonLabel>
                                <IonNote color={value.status === "Signed Out" ? "red" : "green"} slot='end'>{value.status}</IonNote>
                            </IonItem>
                        )
                    })}

                </IonList>
            </IonContent>
        </IonPage>
    );
};

export default Attendance;