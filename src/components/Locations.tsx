import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonIcon, IonInput, IonItem, IonLabel, IonList, IonModal, IonNote, IonSelect, IonSelectOption, IonText, useIonLoading, useIonToast } from '@ionic/react';
import React, { useEffect, useRef, useState } from 'react';
import { addCircleOutline, alertCircleOutline, arrowBack } from 'ionicons/icons';
import { Http } from '@capacitor-community/http';
import { useRecoilValue } from 'recoil';
import { urlAtom } from '../recoil/urlAtom';
import { User, userAtom } from '../recoil/userAtom';

const Locations: React.FC = () => {
    const user = useRecoilValue<User>(userAtom);
    const href = useRecoilValue<string>(urlAtom);
    const isClean = useRef(false);
    const [isFirst, setIsFirst] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [states, setStates] = useState([{ id: 0, name: "" }]);
    const isValid = useRef(false);
    const [toasted] = useIonToast();
    const [show, hide] = useIonLoading();
    const [location, setLocation] = useState({
        id: 0,
        state_id: 0,
        name: ""
    });
    const [locations, setLocations] = useState([{ name: "", state: "", id: 0 }]);
    const result = useRef<any>({});
    useEffect(() => {
        isClean.current = true;
        show("Loading...")
        Http.request({
            method: "GET",
            url: href + "/api/ceo/get/location",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            },
        }).then(({ data }) => {
            if (data.success) {
                setLocations(data.location);
                setStates(data.state);
            }
        }).finally(() => {
            hide();
        });
        return () => {
            isClean.current = false;
        }
    }, []);
    const handleSubmit = () => {
        isValid.current = true;
        Object.keys(location).forEach((element: any) => {
            if (location[element] === "" || (element === "state_id" && location[element] === 0)) {
                isValid.current = false;
                setIsFirst(false);
            }
        });
        if (isValid.current) {
            show("Saving...")
            Http.request({
                method: "POST",
                url: href + "/api/ceo/add/location",
                headers: {
                    'Content-Type': 'application/json',
                    'Data-Type': 'json',
                    'Authorization': 'Bearer ' + user.token
                },
                data: location
            }).then(({ data }) => {
                if (data.success) {
                    setLocation({
                        id: 0,
                        state_id: 0,
                        name: "",
                    });
                    setIsFirst(true);
                    setLocations(data.location);
                    setShowModal(false);
                }
            }).finally(() => {
                hide();
            });
        } else {
            toasted("Some field(s) can not be empty!", 3000);
        }
    }
    const handleShow = (type: string, value: any = {}) => {
        if (type === "new") {
            setLocation({ id: 0, state_id: 0, name: "" });
            setShowModal(true);
        } else {
            setLocation(value);
            setShowModal(true);
        }
    }
    return (
        <>
            <IonButton color='green' className='mb-1' onClick={() => handleShow("new")}>Add New Location</IonButton>
            <IonList>
                {locations.map(value => {
                    return (
                        <IonItem onClick={() => handleShow("old", value)} button key={"locations_key_" + value.id} className='mb-1'>
                            <IonText>{value.name}</IonText>
                            <IonNote slot='end'>{value.state}</IonNote>
                        </IonItem>
                    )
                })}
            </IonList>
            <IonModal isOpen={showModal} className="">
                <IonCard>
                    <IonCardHeader>
                        <IonCardTitle>
                            <IonItem lines='none'>
                                <IonButtons slot='start'>
                                    <IonButton onClick={() => setShowModal(false)}>
                                        <IonIcon slot='icon-only' icon={arrowBack} />
                                    </IonButton>
                                </IonButtons>
                                <IonLabel>{location.id !== 0 ? "Edit Location" : "Add New Location"}</IonLabel>
                            </IonItem>
                        </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        <IonItem className='mb-1'>
                            <IonLabel position='floating'>Location short name</IonLabel>
                            <IonInput value={location.name} onIonChange={e => setLocation({ ...location, name:e.detail.value })} />

                            {!isFirst && (location.name === "") && <>
                                <IonNote slot="helper" color="danger">Location name is a required field</IonNote>
                                <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                            </>}
                        </IonItem>

                        <IonItem>
                            <IonLabel position='floating'>State</IonLabel>
                            <IonSelect interface='action-sheet' value={location.state_id} onIonChange={e => setLocation({ ...location, state_id:e.detail.value })}>
                                <IonSelectOption value={0}>Select State</IonSelectOption>
                                {states.map(value => (
                                    <IonSelectOption key={value.id} value={value.id}>{value.name}</IonSelectOption>
                                ))}
                            </IonSelect>

                            {!isFirst && (location.state_id === 0) && <>
                                <IonNote slot="helper" color="danger">state is a required field</IonNote>
                                <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                            </>}
                        </IonItem>

                        <IonButton color='green' className='mt-10' expand='block' onClick={handleSubmit}>
                            <IonIcon slot='start' icon={addCircleOutline} />
                            <IonText>Save Location</IonText>
                        </IonButton>
                    </IonCardContent>
                </IonCard>
            </IonModal>
        </>

    );
};

export default Locations;