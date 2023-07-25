import { IonAlert, IonButton, IonContent, IonFooter, IonIcon, IonInput, IonItem, IonLabel, IonNote, IonPage, IonSelect, IonSelectOption, IonTextarea, useIonLoading } from '@ionic/react';
import { alertCircleOutline, checkmarkCircleOutline } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';

import { Http } from '@capacitor-community/http';
import Toolbar from '../../components/toolbar';
import { App } from '@capacitor/app';
import { useHistory } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { urlAtom } from '../../recoil/urlAtom';
import { User, userAtom } from '../../recoil/userAtom';
interface IState {
    type: string,
    name: string,
    others?: string|undefined,
    reason: string,
}
const Visitor: React.FC = () => {
    const user = useRecoilValue<User>(userAtom);
    const href = useRecoilValue<string>(urlAtom);
    const isClean = useRef(false);
    const [showAlert, setShowAlert] = useState(false);
    const history = useHistory();
    const [isFirst, setIsFirst] = useState(true);
    const isValid = useRef(false);
    const [show, hide] = useIonLoading();
    const initialState:IState = {
        type: "",
        name: "",
        others: undefined,
        reason: "",
    };
    const [state, setState] = useState(initialState);
    const set = {
        type: { name: "Visitor's Type", type: "select", key: "type", visible: true },
        name: { name: "Visitor's Name", type: "select", key: "name", visible: true },
        others: { name: "Name of ", type: "text", visible: false },
        reason: { name: "Reason for Visiting", type: "textarea", visible: true },
        // date: { name: "Employee Date of Birth", type: "date" },
    }
    const [fieldSet, setFieldSet] = useState<any>(set);
    const [individual, setIndividual] = useState<any>([]);
    const [corporation, setCorporation] = useState<any>([]);

    useEffect(() => {
        isClean.current = true;
        if (isClean.current && state.name === "Others") {
            setFieldSet({ ...fieldSet, ...{ others: { ...fieldSet.others, visible: true } } });
            setState({ ...state, others: "" })
        } else {
            setFieldSet({ ...fieldSet, ...{ others: { ...fieldSet.others, visible: false } } });
            setState({ ...state, others: undefined })
        }
        return () => {
            isClean.current = false;
        }
    }, [state.name]);
    useEffect(() => {
        isClean.current = true;
        document.addEventListener('ionBackButton', (ev: any) => {
            ev.detail.register(-1, () => {
                // when in home last page
                if (history.location.pathname === "/security/visitors") {
                    // calling alert box
                    setShowAlert(true);
                }
            });
        });
        show("Loading Attendance");
        Http.request({
            method: "GET",
            url: href + "/api/get/security/visitors",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            }
        }).then(({ data }) => {
            if (isClean.current && data.success) {
                setIndividual(data.individual);
                setCorporation(data.corporation);
            }
        }).finally(() => {
            hide();
        });
        return () => {
            isClean.current = false;
        }
    }, []);

    const handleSave = () => {
        isValid.current = true;
        Object.keys(state).forEach((element: any) => {
            if (state[element] === "" || state[element] === null) {
                isValid.current = false;
                setIsFirst(false);
            }
        });
        if (isValid.current) {
            show("Saving Address...")
            Http.request({
                method: "POST",
                url: href + "/api/security/add/visitor",
                headers: {
                    'Content-Type': 'application/json',
                    'Data-Type': 'json',
                    'Authorization': 'Bearer ' + user.token
                },
                data: state
            }).then(({ data }) => {
                if (data.success) {
                    setState(initialState);
                    setIsFirst(true);
                    // setFormValue(initialFormValue);
                    // setAddresses([...data.addresses]);
                    // handleReset();
                }
            }).finally(() => {
                hide();
            });
        }
    }

    const handleChange = (value: any, key: string) => {
        setState(pv => ({ ...pv, [key]: value }));
    }

    return (
        <IonPage>
            <Toolbar title="Visitor" />
            <IonContent className="ion-padding">
                <IonAlert isOpen={showAlert} header="please confirm" message="Do you really want to  exit?" buttons={[
                    { text: 'No', role: 'cancel', cssClass: 'secondary' },
                    { text: 'Yes', role: 'destructive', handler: () => App.exitApp() }
                ]} onDidDismiss={() => setShowAlert(false)} />
                {/* <pre>
                    {JSON.stringify(state, null, 2)}
                </pre> */}
                {Object.keys(state).map((key: any) => {
                    if (Object.keys(fieldSet).includes(key)) {
                        if (fieldSet[key].visible) {
                            return (
                                <IonItem fill="solid" className="form mb-1" key={key}>
                                    <IonLabel color='medium' position="stacked">
                                        {fieldSet[key].name}{key === "others" ? state.type : ""}
                                    </IonLabel>
                                    {(fieldSet[key].type === "text" || fieldSet[key].type === "email") && <IonInput type={fieldSet[key].type} inputmode={fieldSet[key].inputmode} value={state[key]} onIonChange={e => handleChange(e.detail.value, key)} />}
                                    {(fieldSet[key].type === "date") && <IonInput placeholder={fieldSet[key].name} type={fieldSet[key].type} value={state[key]} onIonChange={e => handleChange(e.detail.value, key)} />}
                                    {fieldSet[key].type === "textarea" && <IonTextarea placeholder={fieldSet[key].name} rows={3} value={state[key]} onIonChange={e => handleChange(e.detail.value, key)} />}
                                    {fieldSet[key].type === "select" && <IonSelect placeholder={fieldSet[key].name} interface='action-sheet' interfaceOptions={{ header: fieldSet[key].name }} value={state[key]} onIonChange={e => handleChange(e.detail.value, key)} >
                                        {fieldSet[key].key === "type" && <>
                                            {/* <IonSelectOption value="">Select {}</IonSelectOption> */}
                                            <IonSelectOption>Individual</IonSelectOption>
                                            <IonSelectOption>Corporation</IonSelectOption>
                                        </>}
                                        {fieldSet[key].key === "name" && <>
                                            <IonSelectOption value="">Select {fieldSet[key].name}</IonSelectOption>
                                            {state.type === "Individual" && individual.map((value: { id: React.Key; name: string; }) => {
                                                return (
                                                    <IonSelectOption key={value.id}>{value.name}</IonSelectOption>
                                                )
                                            })}
                                            {state.type === "Corporation" && corporation.map((value: { id: React.Key; name: string; }) => {
                                                return (
                                                    <IonSelectOption key={value.id}>{value.name}</IonSelectOption>
                                                )
                                            })}
                                            <IonSelectOption>Others</IonSelectOption>
                                        </>}
                                    </IonSelect>}
                                    {!isFirst && (state[key] === "" || state[key] === null) &&
                                        <>
                                            <IonNote slot="helper" color="danger">{fieldSet[key].name} is a required field</IonNote>
                                            <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                                        </>
                                    }
                                    {!isFirst && state[key] && <IonIcon slot="end" icon={checkmarkCircleOutline} color="success" />}
                                </IonItem>
                            )
                        }

                    }
                })}
                {/* {state.name === "Others" && <IonCol size='12'>
                            <IonItem fill='solid'>
                                <IonLabel position='floating'>Name of {state.type}</IonLabel>
                                <IonInput />
                            </IonItem>
                        </IonCol>} */}
            </IonContent>
            <IonFooter>
                {/* <IonItem fill='solid'>

                </IonItem> */}
                <IonButton className='mb-1' color='green' expand='block' onClick={handleSave}>Save</IonButton>
            </IonFooter>
        </IonPage>
    );
};

export default Visitor;