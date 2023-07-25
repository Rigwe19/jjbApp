import { Http } from '@capacitor-community/http';
import { IonAvatar, IonContent, IonImg, IonItem, IonLabel, IonList, IonNote, IonPage, IonSearchbar, useIonLoading } from '@ionic/react';
import React, { useEffect, useRef, useState } from 'react';

import Toolbar from '../../components/toolbar';
import { useRecoilValue } from 'recoil';
import { urlAtom } from '../../recoil/urlAtom';
import { User, userAtom } from '../../recoil/userAtom';

const CeoAttendance: React.FC = () => {
    const user = useRecoilValue<User>(userAtom);
    const href = useRecoilValue<string>(urlAtom);
    const [departments, setDepartments] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [filters, setFilters] = useState([]);
    const isClean = useRef(false);
    const [present, dismiss] = useIonLoading();
    const [query, setQuery] = useState("");
    useEffect(() => {
        isClean.current = true;
        present("Loading...");
        Http.request({
            method: "GET",
            url: href + "/api/ceo/get/attendance",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            }
        }).then(({ data }) => {
            if (isClean.current && data.success) {
                setAttendance(data.attendance);
                setFilters(data.attendance);
                setDepartments(data.departments);
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
      if (query.length > 1) {
        let result: any = [];
        // setFilter([]);
        if (/\d/.test(query)) {
            // attendance.forEach(value => {
            //     if (value.employee_id.includes(query)) {
            //         result.push(value);
            //     }
            // });
        } else {
            attendance.forEach(value => {
                if (value.name.toLowerCase().includes(query.toLowerCase())) {
                    result.push(value);
                }
            });
        }

        setFilters(result)
    } else {
        setFilters(attendance)
    }
      return () => {
        isClean.current = false;
      }
    }, [query]);
    const replace = (text: string, regex: RegExp) => {
        text = text.toString();
        let result = [];
        let matches = [];
        let results = text.matchAll(regex);
        for (let match of results) {
            matches.push(match[0]);
        }
        let parts = text.split(regex);
        for (let i = 0; i < parts.length; i++) {
            result.push(parts[i]);
            if (i !== parts.length - 1)
                result.push(<b key={`highlight_${i}`} className='text-green-500'>{matches[i]}</b>);
        }
        return result;
    }
    
    const handleSearch = (value:string) => {
        setQuery(value);
    }

    return (
        <IonPage>
            <Toolbar title="Attendance sheet" /> 
            <IonContent className="ion-padding">
                <IonSearchbar value={query} onIonChange={e => handleSearch(e.detail.value)} />
                <IonList>
                    {filters.map(value => (<IonItem key={value.id} fill='solid'>
                        <IonAvatar slot="start">
                            <IonImg src={`${href}/${value.passport}`} />
                        </IonAvatar>
                        <IonLabel>
                            <p>{replace(value.name, new RegExp(query, "gi"))}</p>
                            <p>{value.phone}</p>
                        </IonLabel>
                        <IonNote slot="end">
                            <p>{value.department}</p>
                            <p>Clocked in {value.in}</p>
                        </IonNote>
                    </IonItem>))}
                </IonList>
            </IonContent>
        </IonPage>
    );
};

export default CeoAttendance;