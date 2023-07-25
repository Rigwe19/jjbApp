import { Http } from '@capacitor-community/http';
import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonIcon, IonInput, IonItem, IonItemGroup, IonLabel, IonModal, IonNote, IonPage, IonSelect, IonSelectOption, IonTextarea, useIonLoading } from '@ionic/react';
import { addCircleOutline, alertCircleOutline, arrowBack, saveOutline } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';

import Toolbar from '../../components/toolbar';
import { useRecoilValue } from 'recoil';
import { urlAtom } from '../../recoil/urlAtom';
import { User, userAtom } from '../../recoil/userAtom';

const Supplier: React.FC = () => {
    const user = useRecoilValue<User>(userAtom);
    const href = useRecoilValue<string>(urlAtom);
    const [present, dismiss] = useIonLoading();
    const [locations, setLocations] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [supErrors, setSupErrors] = useState({
        name: false,
        address: false,
        phone: false,
        location_id: false,
    });
    const [isSupFirst, setIsSupFirst] = useState(true);
    const initialSupplier = {
        code: 0,
        name: "",
        phone: "",
        address: "",
        location_id: 0,
    }
    const [supplier, setSupplier] = useState(initialSupplier);
    const isClean = useRef(false);
    useEffect(() => {
        isClean.current = true;
        present("Loading...");
        Http.request({
            method: "GET",
            url: href + "/api/account/get/expenses",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            }
        }).then(({ data }) => {
            if (isClean.current && data.success) {
                setSuppliers(data.suppliers);
                setLocations(data.locations);
            }
        }).finally(() => {
            dismiss();
        });
        return () => {
            isClean.current = false;
        }
    }, []);
    const handleSupChange = (value: any, key: string) => {
        setSupplier(prevState => ({ ...prevState, [key]: value }));
    }
    const [isSupOpen, setIsSupOpen] = useState(false);

    const handleSupDismiss = () => {
        setSupplier(initialSupplier);
        setIsSupOpen(false);
    }

    const handleSupOpen = () => {
        Http.request({
            method: "GET",
            url: href + "/api/account/new/supplier",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            }
        }).then(({ data }) => {
            if (data.success) {
                setSupplier(prevState => ({ ...prevState, code: data.code }))
            }
        }).finally(() => {
            setIsSupOpen(true);
        });
    }
    const handleSupSave = () => {
        const { isValid, errors } = validateState(supplier);
        if (isValid) {
            present("Saving Supplier...");
            Http.request({
                method: "POST",
                url: href + "/api/account/add/supplier",
                headers: {
                    'Content-Type': 'application/json',
                    'Data-Type': 'json',
                    'Authorization': 'Bearer ' + user.token
                },
                data: supplier
            }).then(({ data }) => {
                if (data.success) {
                    setSupplier(prevState => ({ ...initialSupplier }));
                    setSuppliers(data.suppliers);
                    setIsSupOpen(false);
                }
            }).finally(() => {
                dismiss();
            });
        } else {
            setSupErrors(prevState => ({ ...errors }));
            setIsSupFirst(false);
        }
    }
    const validateState = (state: any, options?: any) => {
        let isValid = true;
        let errors: any = {};
        if (options === undefined) {
            Object.entries(state).forEach((element: any) => {
                if (typeof element[1] === "number" && element[1] === 0) {
                    isValid = false;
                    errors[element[0]] = true;
                }
                if (typeof element[1] === "string" && element[1] === "") {
                    isValid = false;
                    errors[element[0]] = true;
                }
            });
        } else {
            Object.entries(state).forEach(element => {
                if (options[element[0]].required) {
                    if (typeof element[1] === "number" && element[1] === 0) {
                        isValid = false;
                        errors[element[0]] = true;
                    }
                    if (typeof element[1] === "string" && element[1] === "") {
                        isValid = false;
                        console.log(element[0]);
                        errors[element[0]] = true;
                    }
                }
            });
        }
        return {
            isValid,
            errors
        };
    }

    return (
        <>
        <IonPage>
            <Toolbar title="Supplier" />
            <IonContent className="ion-padding">
                <IonButton color='green' onClick={handleSupOpen} className="mb-1">
                    <IonIcon slot="start" icon={addCircleOutline} />
                    Add Supplier
                </IonButton>
                <IonItemGroup>
                    {suppliers.map(value=>(
                    <IonItem key={value.id} fill="solid" className='mb-1' button>
                        <IonNote slot="start">{value.code}</IonNote>
                        <IonLabel>{value.name}</IonLabel>
                        <IonNote slot="end">{value.phone}</IonNote>
                    </IonItem>
                    ))}
                </IonItemGroup>

                <IonModal showBackdrop onDidDismiss={handleSupDismiss} isOpen={isSupOpen}>
                    <IonCard>
                        <IonCardHeader>
                            <IonCardTitle>
                                <IonItem lines='none'>
                                    <IonButtons slot='start'>
                                        <IonButton onClick={() => setIsSupOpen(false)}>
                                            <IonIcon slot='icon-only' icon={arrowBack} />
                                        </IonButton>
                                    </IonButtons>
                                    <IonLabel>Create new supplier</IonLabel>
                                </IonItem>
                            </IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            {/* <pre>{JSON.stringify(supplier, null, 2)}</pre> */}
                            <IonItem className='mb-1' fill='solid'>
                                <IonLabel color='medium' position="stacked">Supplier Code</IonLabel>
                                <IonInput readonly value={supplier.code} onIonChange={e => handleSupChange(e.detail.value, "code")} />
                            </IonItem>
                            <IonItem className='mb-1' fill='solid'>
                                <IonLabel color='medium' position="stacked">Supplier Name</IonLabel>
                                <IonInput value={supplier.name} onIonChange={e => handleSupChange(e.detail.value, "name")} />
                                {!isSupFirst && supErrors.name && <>
                                    <IonNote slot="helper" color="danger">Supplier Name cannot be empty</IonNote>
                                    <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                                </>}
                            </IonItem>
                            <IonItem className='mb-1' fill='solid'>
                                <IonLabel color='medium' position="stacked">Supplier Phone Number</IonLabel>
                                <IonInput value={supplier.phone} onIonChange={e => handleSupChange(e.detail.value, "phone")} />
                                {!isSupFirst && supErrors.phone && <>
                                    <IonNote slot="helper" color="danger">Supplier Phone Number cannot be empty</IonNote>
                                    <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                                </>}
                            </IonItem>
                            <IonItem className='mb-1' fill='solid'>
                                <IonLabel color='medium' position="stacked">Supplier Address</IonLabel>
                                <IonTextarea value={supplier.address} onIonChange={e => handleSupChange(e.detail.value, "address")} />
                                {!isSupFirst && supErrors.address && <>
                                    <IonNote slot="helper" color="danger">Supplier Address cannot be empty</IonNote>
                                    <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                                </>}
                            </IonItem>
                            <IonItem className='mb-1' fill='solid'>
                                <IonLabel color='medium' position="stacked">Branch Code</IonLabel>
                                <IonSelect interface='action-sheet' interfaceOptions={{ header: "Branch Code" }} value={supplier.location_id} onIonChange={e => handleSupChange(e.detail.value, "location_id")}>
                                    {locations.map(value => (<IonSelectOption key={value.id} value={value.id}>{value.name}</IonSelectOption>))}
                                </IonSelect>
                                {!isSupFirst && supErrors.location_id && <>
                                    <IonNote slot="helper" color="danger">Branch Code cannot be empty</IonNote>
                                    <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                                </>}
                            </IonItem>
                            <IonButton expand='block' color='green' onClick={handleSupSave}>
                                <IonIcon slot="start" icon={saveOutline} />
                                Save
                            </IonButton>
                        </IonCardContent>
                    </IonCard>
                </IonModal>
                </IonContent>
        </IonPage>
        </>
    );
};

export default Supplier;