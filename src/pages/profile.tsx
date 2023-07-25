import { Http } from '@capacitor-community/http';
import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonFooter, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonMenuButton, IonModal, IonPage, IonRouterLink, IonTitle, IonToolbar, useIonLoading } from '@ionic/react';
import { arrowBack, cloudUploadOutline, sendOutline } from 'ionicons/icons';
import React, { useRef, useState } from 'react';
import { useHistory } from 'react-router';
import { useRecoilValue } from 'recoil';
import { urlAtom } from '../recoil/urlAtom';
import { User, userAtom } from '../recoil/userAtom';
import Popup from '../components/popup';
// import Toolbar from './toolbar';

const Profile: React.FC = () => {
    const user = useRecoilValue<User>(userAtom);
    const href = useRecoilValue<string>(urlAtom);
    const [isOpen, setIsOpen] = useState(false);
    const [passed, setPassed] = useState(false);
    const isValid = useRef(false);
    const [errors, setErrors] = useState<any>({ current: false, password: false, password_confirmation: false });
    const [isFirst, setIsFirst] = useState(true);
    const [present, dismiss] = useIonLoading();
    const history = useHistory();
    const [serverErrors, setServerErrors] = useState({
        password: [],
        current: [],
        password_confirmation: []
    })
    const initialState = {
        current: "",
        password: "",
        password_confirmation: ""
    }
    const [state, setState] = useState(initialState);
    const [id, setId] = useState("");
    const handleForgot = () => {
        setIsOpen(true);
    }
    const handleDidDismiss = () => {
        setIsOpen(false);
        setId("");
    }
    const handleForgotSubmit = () => {
        if (user.username === id) {
            setPassed(true);
        }
        handleDidDismiss();
    }
    const handleSave = () => {
        isValid.current = true;
        type IError = typeof errors;
        let newErrors: IError = { ingredients: { 0: { ingredient_id: "", quantity: "", unit_id: "" } } };
        Object.keys(state).forEach(value => {
            if (state[value] === "") {
                isValid.current = false;
                newErrors[value] = true;
            }
        });
        // console.log(newErrors);
        if (isValid.current) {
            let formData = {
                password: state.password,
                current: state.current,
                password_confirmation: state.password_confirmation,
            };
            present("Saving Address...")
            Http.request({
                method: "POST",
                url: href + "/api/update_password",
                headers: {
                    'Content-Type': 'application/json',
                    'Data-Type': 'json',
                    'Authorization': 'Bearer ' + user.token
                },
                data: formData
            }).then(({ data, status }) => {
                if (status === 422) {
                    setServerErrors(data);
                }
                if (status === 403) {
                    let error: any = {
                        current: [],
                        password: [],
                        passwordConfirmation: []
                    }
                    setServerErrors({ ...error, current: ["wrong current password"] })
                }
                if (data.success) {
                    history.push("/" + user.department.replaceAll(" ", "").toLowerCase() + "/" + user.role);
                    // setShowModal(false);
                    // setAddresses([...data.addresses]);
                    // handleReset();
                }
            }).finally(() => {
                dismiss();
            });
        } else {
            setIsFirst(false);
            setErrors(newErrors);
            // console.log("set");

        }
    }
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color='green'>
                    <IonButtons slot="start">
                        <IonMenuButton />
                    </IonButtons>
                    <IonTitle>Profile</IonTitle>
                    <Popup profile />
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                {/* <pre>{JSON.stringify(user, null, 2)}</pre> */}
                {!passed && <IonItem className='mb-1' fill='solid'>
                    <IonLabel position="floating">Current Password</IonLabel>
                    <IonInput value={state.current} onIonChange={e => setState({ ...state, current:e.detail.value })} />
                    <div slot='helper' className="flex w-full flex-col-reverse">
                        {errors.current && <p className='text-red-800'>The current field is required.</p>}
                        {serverErrors.current && serverErrors.current.map((value, index) => (<p key={index} className="text-red-800">{value}</p>))}
                        <IonRouterLink color="success" onClick={handleForgot} className='text-right'>Forgot password</IonRouterLink>
                    </div>
                </IonItem>}
                <IonItem className='mb-1' fill='solid'>
                    <IonLabel position="floating">New Password</IonLabel>
                    <IonInput value={state.password} onIonChange={e => setState({ ...state, password:e.detail.value })} />
                    <div slot="helper">
                        {errors.password && <p className='text-red-800'>The password field is required.</p>}
                        {serverErrors.password && serverErrors.password.map((value, index) => (<p key={index} className="text-red-800">{value}</p>))}
                    </div>
                </IonItem>
                <IonItem className='mb-1' fill='solid'>
                    <IonLabel position="floating">Confirm Password</IonLabel>
                    <IonInput value={state.password_confirmation} onIonChange={e => setState({ ...state, password_confirmation:e.detail.value })} />
                    <div slot="helper">
                        {errors.password_confirmation && <p className='text-red-800'>The password confirmation field is required.</p>}
                        {serverErrors.password_confirmation && serverErrors.password_confirmation.map((value, index) => (<p key={index} className="text-red-800">{value}</p>))}
                    </div>
                </IonItem>
                <IonModal isOpen={isOpen}>
                    <IonCard>
                        <IonCardHeader className="ion-no-padding">
                            <IonToolbar>
                                <IonButtons slot="start">
                                    <IonButton onClick={handleDidDismiss}>
                                        <IonIcon slot="icon-only" icon={arrowBack} />
                                    </IonButton>
                                </IonButtons>
                                <IonCardTitle>Forgot Password</IonCardTitle>
                            </IonToolbar>
                            {/* <IonCardTitle>forgot current</IonCardTitle> */}
                        </IonCardHeader>
                        <IonCardContent>
                            <IonItem fill='outline'>
                                <IonLabel position="stacked">Username</IonLabel>
                                <IonInput value={id} onIonChange={e => setId(e.detail.value)} placeholder="Enter your Username" />
                            </IonItem>
                                <span className="text-center text-xs">
                                    Note: for username this is your username for login
                                </span>
                            {/* <IonItem lines='none'>
                            </IonItem> */}
                            <IonButton expand="block" color="success" onClick={handleForgotSubmit}>
                                <IonIcon slot="start" icon={sendOutline} />
                                Submit
                            </IonButton>
                        </IonCardContent>
                    </IonCard>
                </IonModal>
            </IonContent>
            <IonFooter>
                <IonButton onClick={handleSave} expand="block" color="success">
                    <IonIcon slot="start" icon={cloudUploadOutline} />
                    Update
                </IonButton>
            </IonFooter>
        </IonPage>
    );
};

export default Profile;