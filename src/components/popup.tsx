import { Http } from '@capacitor-community/http';
import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonContent, IonIcon, IonItem, IonLabel, IonModal, IonPopover, IonToolbar, useIonLoading } from '@ionic/react';
import { ellipsisVertical, personCircleOutline, arrowBack, informationCircleOutline, returnDownBack } from 'ionicons/icons';
import React, { useRef, useState } from 'react';
import { useHistory } from 'react-router';
import { useRecoilState, useRecoilValue } from 'recoil';
import dispatch from '../pages/CEO/dispatch';
import { urlAtom } from '../recoil/urlAtom';
import { User, userAtom } from '../recoil/userAtom';
const initialUser = {
    employee_id: 0,
    department_id: 0,
    name: "",
    passport: "",
    position: "",
    shift: "",
    department: "",
    created_at: "",
    id: 0,
    role: 0,
    brand: "",
    token: "",
    updated_at: "",
    username: "",
    location_id: 0,
    setOpening: false,
    setClosing: false,
    isLoggedIn: false,
};
interface ComponentProp{
    profile?: boolean;
}
const Popup: React.FC<ComponentProp> = ({profile}) => {
    const [user, setUser] = useRecoilState<User>(userAtom);
    const href = useRecoilValue<string>(urlAtom);
    const [dashboard, setDashboard] = useState([]);
    const [present, dismiss] = useIonLoading();
    const [popOpen, setPopOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
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
    const handleAbout = () => {
        setPopOpen(true);
    }
    const popover = useRef<HTMLIonPopoverElement>(null);
    const openPopover = (e:any) => {
        popover.current!.event = e;
        setIsOpen(true);
    }
    return (
        <IonButtons slot="end">
            <IonButton onClick={openPopover}>
                <IonIcon slot="icon-only" icon={ellipsisVertical} />
            </IonButton>
            <IonPopover ref={popover} onDidDismiss={()=>setIsOpen(false)} isOpen={isOpen} dismissOnSelect side='top'>
                <IonContent>
                    <IonItem button onClick={handleAbout}>
                        <IonIcon slot="start" icon={informationCircleOutline} />
                        <IonLabel>About</IonLabel>
                    </IonItem>
                    {!profile&&<IonItem button onClick={handleProfile}>
                        <IonIcon slot="start" icon={personCircleOutline} />
                        <IonLabel>Profile</IonLabel>
                    </IonItem>}
                    {!profile&&<IonItem button onClick={handleProfile}>
                        <IonIcon slot="start" icon={personCircleOutline} />
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
        </IonButtons>
    );
};

export default Popup;