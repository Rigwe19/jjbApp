import { Http } from '@capacitor-community/http';
import { IonBackButton, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonMenuButton, IonModal, IonPopover, IonRow, IonTitle, IonToolbar, useIonLoading } from '@ionic/react';
import { arrowBack, checkmarkCircle, closeCircle, cogOutline, cogSharp, ellipsisVertical, informationCircleOutline, personCircleOutline, refreshOutline, returnDownBack, saveOutline } from 'ionicons/icons';
import React, { useRef, useState } from 'react';
import { useHistory } from 'react-router';
import { useRecoilState } from 'recoil';
import { urlAtom } from '../recoil/urlAtom';
import { User, userAtom } from '../recoil/userAtom';
interface IPrivateProps {
    title: String;
    back?: boolean;
    profile?: boolean;
}
const initialUser = {
    employee_id: 0,
    department_id: 0,
    name: "",
    passport: "",
    position: "",
    shift: "",
    department: "",
    created_at: "",
    brand: "",
    id: 0,
    role: 0,
    token: "",
    updated_at: "",
    username: "",
    location_id: 0,
    setOpening: false,
    setClosing: false,
    isLoggedIn: false,
};
const Toolbar: React.FC<IPrivateProps> = ({ title, back, profile }) => {
    const [user, setUser] = useRecoilState<User>(userAtom);
    const [href, setHref] = useRecoilState<string>(urlAtom);
    const [dashboard, setDashboard] = useState([]);
    const [present, dismiss] = useIonLoading();
    const [popOpen, setPopOpen] = useState(false);
    const [proxyOpen, setProxyOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [proxySuccess, setProxySuccess] = useState(false);
    const [proxyFail, setProxyFail] = useState(false);
    const [proxy, setProxy] = useState("");
    const [saving, setSaving] = useState(false);
    const history = useHistory();
    const handleLogout = () => {
        present("Loging out...");
        Http.request({
            method: "POST",
            url: href + "/api/logout",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            },
        }).then(({ data }) => {
            if (data.success) {
                setUser(initialUser);
                history.push("/");
            }
        }).finally(() => {
            dismiss();
            // handleDismiss();
        });
    }
    const handleProfile = () => {
        history.push('/profile');
        // handleDismiss();
    }
    const handleDismiss = () => {
        setPopOpen(false);
    }
    const handleProxyDismiss = () => {
        setProxyOpen(false);
        setProxySuccess(false);
        setProxyFail(false);
        setProxy('');
    }
    const handleAbout = () => {
        setPopOpen(true);
    }
    const popover = useRef<HTMLIonPopoverElement>(null);
    const openPopover = (e: any) => {
        popover.current!.event = e;
        setIsOpen(true);
    }
    const saveProxy = () => {
        setSaving(true);
        setHref(proxy);
        setTimeout(() => {
            setSaving(false);
        }, 500);
    }
    const testProxy = () => {
        present("Testing Proxy Address...");
        Http.request({
            method: "POST",
            url: href + "/api/proxy-test",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            },
        }).then(({ data }) => {
            if (data.success) {
                setProxySuccess(true);
                setProxyFail(false);
            }
        }).catch((err) => {
            setProxyFail(true);
            setProxySuccess(false);
        }).finally(() => {
            dismiss();
            // handleDismiss();
        });
    }
    return (
        <IonHeader>
            <IonToolbar color='green'>
                <IonButtons slot="start">
                    <IonMenuButton />
                </IonButtons>
                {back && <IonBackButton slot="start" defaultHref='/' />}
                <IonTitle>{title}</IonTitle>
                <IonButtons slot="end">
                    <IonButton onClick={openPopover}>
                        <IonIcon slot="icon-only" icon={ellipsisVertical} />
                    </IonButton>
                    <IonPopover ref={popover} onDidDismiss={() => setIsOpen(false)} isOpen={isOpen} dismissOnSelect side='bottom'>
                        <IonContent>
                            <IonItem button onClick={handleAbout}>
                                <IonIcon slot="start" icon={informationCircleOutline} />
                                <IonLabel>About</IonLabel>
                            </IonItem>
                            {!profile && <IonItem button onClick={handleProfile}>
                                <IonIcon slot="start" icon={personCircleOutline} />
                                <IonLabel>Profile</IonLabel>
                            </IonItem>}
                            {!profile && <IonItem button onClick={() => setProxyOpen(true)}>
                                <IonIcon slot="start" icon={cogOutline} />
                                <IonLabel>Setup Proxy</IonLabel>
                            </IonItem>}
                            <IonItem button onClick={handleLogout}>
                                <IonIcon slot="start" icon={returnDownBack} />
                                <IonLabel>Logout</IonLabel>
                            </IonItem>
                        </IonContent>
                    </IonPopover>
                    <IonModal isOpen={popOpen} onDidDismiss={handleDismiss}>
                        <IonCard>
                            <IonCardHeader className='ion-no-padding'>
                                <IonToolbar>
                                    <IonButtons slot="start">
                                        <IonButton onClick={handleDismiss} color="green">
                                            <IonIcon slot="icon-only" icon={arrowBack} />
                                        </IonButton>
                                    </IonButtons>
                                    <IonLabel>About</IonLabel>
                                </IonToolbar>
                            </IonCardHeader>
                            <IonCardContent>
                                <h5 className='text-center text-green-600 mb-1'><b>Introduction</b></h5>
                                <p className='mb-1'>Introduction goes here
                                </p>
                            </IonCardContent>
                        </IonCard>
                    </IonModal>
                    <IonModal isOpen={proxyOpen} onDidDismiss={handleProxyDismiss}>
                        <IonCard>
                            <IonCardHeader className='ion-no-padding'>
                                <IonToolbar>
                                    <IonButtons slot="start">
                                        <IonButton onClick={handleProxyDismiss} color="green">
                                            <IonIcon slot="icon-only" icon={arrowBack} />
                                        </IonButton>
                                    </IonButtons>
                                    <IonLabel>Setup Proxy</IonLabel>
                                </IonToolbar>
                            </IonCardHeader>
                            <IonCardContent>
                                <IonItem>
                                    <IonLabel position='stacked'>Proxy</IonLabel>
                                    <IonInput placeholder='http://169.254.44.55' value={proxy} onIonChange={e => setProxy(e.detail.value)} />
                                    {proxySuccess && <IonIcon slot='end' icon={checkmarkCircle} color='success' />}
                                    {proxyFail && <IonIcon slot='end' icon={closeCircle} color='danger' />}
                                </IonItem>
                                <IonGrid >
                                    <IonRow>
                                        <IonCol>
                                            <IonButton expand='block' color='primary' onClick={()=>setHref('http://jjbfood.test')}>Default</IonButton>
                                        </IonCol>
                                        <IonCol>
                                            <IonButton expand='block' onClick={saveProxy} color='success'>
                                                {!saving && <IonIcon icon={saveOutline} class='mr-2'/>}
                                                {saving && <IonIcon icon={refreshOutline} class='mr-2 animate-spin'/>}
                                                Save
                                            </IonButton>
                                        </IonCol>
                                        <IonCol>
                                            <IonButton expand='block' onClick={testProxy} color='tertiary'>
                                                <IonIcon icon={cogSharp} class='mr-2' />
                                                Test
                                            </IonButton>
                                        </IonCol>
                                    </IonRow>
                                </IonGrid>
                                <div className="flex flex-wrap w-full -px-4">
                                    
                                    
                                    
                                </div>

                            </IonCardContent>
                        </IonCard>
                    </IonModal>
                </IonButtons>
            </IonToolbar>
        </IonHeader>
    );
};

export default Toolbar;