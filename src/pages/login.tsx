import { Http } from '@capacitor-community/http';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonMenuButton, IonModal, IonNote, IonPage, IonRadio, IonRadioGroup, IonTitle, IonToolbar, useIonLoading } from '@ionic/react';
import { alertCircleOutline, arrowBack, logInOutline, saveOutline } from 'ionicons/icons';
import React, { useRef, useState } from 'react';
import { useHistory } from 'react-router';
import { useIonFormState } from 'react-use-ionic-form';
import { useRecoilState, useRecoilValue } from 'recoil';
import { urlAtom } from '../recoil/urlAtom';
import { User, userAtom } from '../recoil/userAtom';

const Login: React.FC = () => {
    const [user, setUser] = useRecoilState<User>(userAtom);
    const href = useRecoilValue<string>(urlAtom);
    const [isFirst, setIsFirst] = useState(true);
    const isValid = useRef(false);
    const [showModal, setShowModal] = useState(false);
    const [newUser, setNewUser] = useState<typeof user>();
    const history = useHistory();
    const [errors, setErrors] = useState({
        login: "",
        password: "",
    });
    const [candismiss, setCandismiss] = useState(false);
    const [shift, setShift] = useState("");
    const [show, hide] = useIonLoading();
    const [opening, setOpening] = useState(false);
    let { setState, state, reset, item } = useIonFormState({
        login: "",
        password: "",
    });
    const handleSubmit = () => {
        isValid.current = true;
        let err = {
            login: "",
            password: ""
        };
        Object.keys(state).forEach((element: any) => {
            if (state[element] === "" || state[element] === null) {
                isValid.current = false;
                err[element] = element.charAt(0).toUpperCase() + element.slice(1) + " is a required field";
                // setErrors({ ...errors, [element]:  })
            }
        });
        if (isValid.current) {
            show("Login in...")
            Http.request({
                method: "POST",
                url: href + "/api/login",
                headers: {
                    'Content-Type': 'application/json',
                    'Data-Type': 'json',
                    'accept': 'application/json'
                },
                data: state
            }).then((response) => {
                if (response.data.success) {
                    if (response.data.user.department.toLowerCase() === "admin") {
                        setUser(response.data.user);
                        history.replace("/admin");
                    } else {
                        setNewUser(response.data.user);
                        setShift(user.shift);
                        setShowModal(true);
                    }
                    setIsFirst(true);
                } else if (response.status === 422) {
                    // console.log(response.data);
                    let newErrors = { login: "", password: "" };
                    Object.keys(response.data.errors).forEach(element => {
                        if (element === "username") {
                            newErrors.login = response.data.errors[element][0];
                        } else {
                            newErrors[element] = response.data.errors[element][0];
                        }
                    });
                    setErrors({ ...newErrors });
                    setIsFirst(false);
                }else{
                    console.log(response.data.error)
                    setErrors({login: response.data.error, password: ""});
                    setIsFirst(false);
                }
            }).finally(() => {
                hide();
            });
        }else{
            setErrors(err);
            setIsFirst(false);
        }
    }

    const handleDismiss = () => {
        let derivedUser = { ...newUser };
        derivedUser.shift = shift;
        derivedUser.setOpening = opening;
        setUser(derivedUser);
        setShowModal(false);
    }

    const handleSwitch = (value: string) => {
        show("Loading...")
        Http.request({
            method: "POST",
            url: href + "/api/check/opening",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'accept': 'application/json',
                'Authorization': 'Bearer ' + newUser.token
            },
            data: { shift: value, location_id: newUser.location_id }
        }).then(({ data }) => {
            if (data.success) {
                setShift(value);
                setOpening(data.exists);
                setCandismiss(true);
            }
        }).finally(() => {
            hide();
        });
    }

    const handleSave = () => {
        handleDismiss();
        history.replace("/");
    }
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color='green'>
                    <IonButtons slot="start">
                        <IonMenuButton />
                    </IonButtons>
                    <IonTitle>Login</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                {/* <pre>{JSON.stringify(user, null, 2)}</pre> */}
                <div className="flex justify-center items-center h-[30vh] w-full">
                    <img className='w-48 h-48 rounded-full' />
                </div>
                <IonItem fill='solid' className="mb-1">
                    <IonLabel position='floating'>Username</IonLabel>
                    <IonInput value={state.login} onIonChange={e => setState({ ...state, login:e.detail.value })} />

                    {!isFirst && errors.login &&
                        <>
                            <IonNote slot="helper" color="danger">{errors.login}</IonNote>
                            <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                        </>
                    }
                </IonItem>
                <IonItem fill='solid' className="mb-1">
                    <IonLabel position='floating'>Password</IonLabel>
                    <IonInput type='password' value={state.password} onIonChange={e => setState({ ...state, password:e.detail.value })} />

                    {!isFirst && errors.password &&
                        <>
                            <IonNote slot="helper" color="danger">{errors.password}</IonNote>
                            <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                        </>
                    }
                </IonItem>
                <IonButton color='green' onClick={handleSubmit} expand='block'>
                    <IonIcon slot="start" icon={logInOutline} />
                    Login
                </IonButton>
                {/* <button onClick={()=>setShowModal(true)}>Show</button> */}
            </IonContent>
            <IonModal isOpen={showModal} canDismiss={candismiss} onDidDismiss={handleDismiss}>
                <div className="w-11/12 mx-auto" style={{ backgroundColor: "var(--ion-card-background, #fff)" }}>
                    <IonHeader>
                        <IonToolbar>
                            <IonButtons slot="start">
                                <IonButton onClick={() => setShowModal(false)}>
                                    <IonIcon slot="icon-only" icon={arrowBack} />
                                </IonButton>
                            </IonButtons>
                            <IonTitle>Choose Shift</IonTitle>
                        </IonToolbar>
                    </IonHeader>
                    <div className="w-full mt-2">
                        <IonRadioGroup value={shift} onIonChange={e => handleSwitch(e.detail.value)}>
                            <IonItem>
                                <IonLabel>Morning Shift</IonLabel>
                                <IonRadio value="morning" slot="start" />
                            </IonItem>
                            <IonItem>
                                <IonLabel>Evening Shift</IonLabel>
                                <IonRadio value="evening" slot="start" />
                            </IonItem>
                        </IonRadioGroup>
                        <IonButton disabled={shift === ""} color="green" expand="block" onClick={handleSave}>
                            <IonIcon slot="start" icon={saveOutline} />
                            Save</IonButton>
                    </div>
                </div>

            </IonModal>
        </IonPage>
    );
};

export default Login;