import { Http } from '@capacitor-community/http';
import { IonAvatar, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonIcon, IonImg, IonInput, IonItem, IonItemGroup, IonLabel, IonModal, IonNote, IonPage, useIonActionSheet, useIonLoading } from '@ionic/react';
import { alertCircleOutline, arrowBack, cash, cashOutline, closeOutline } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';

import Toolbar from '../../components/toolbar';
import { useRecoilValue } from 'recoil';
import { urlAtom } from '../../recoil/urlAtom';
import { User, userAtom } from '../../recoil/userAtom';

const Banks: React.FC = () => {
    const user = useRecoilValue<User>(userAtom);
    const href = useRecoilValue<string>(urlAtom);
    const [popup, popout] = useIonActionSheet();
    // const [segment, setSegment] = useState("Deposit");
    const [present, dismiss] = useIonLoading();
    const [banks, setBanks] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const isClean = useRef(false);
    const [type, setType] = useState('deposit');
    const initialState = {
        id: 0,
        acc_balance: 0,
        amount: 0,
        name: "",
        slip_number: "",
    }
    const [state, setState] = useState(initialState);
    let fieldset = {
        acc_balance: { name: "Available Account Balance", inputmode: "numeric", type: "number" },
        amount: { name: type === "deposit" ? "Depositted Amount" : "Withdrew Amount", inputmode: "numeric", type: "number" },
        name: { name: type === "deposit" ? "Depositor Name" : "Withdrawee Name", inputmode: "text", type: "text" },
        slip_number: { name: type === "deposit" ? "Deposit Slip Number" : "Withdraw Slip Number", inputmode: "text", type: "text" }
    }
    const [isFirst, setIsFirst] = useState(true);
    useEffect(() => {
        isClean.current = true;
        present("Loading...");
        Http.request({
            method: "GET",
            url: href + "/api/account/get/banks",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            }
        }).then(({ data }) => {
            if (isClean.current && data.success) {
                setBanks(data.banks);
                // setPurchases(data.purchases);
                // setPaymentMode(data.payment_mode);
                // setBrands(data.brands);
                // setUnits(data.units);
                // setSuppliers(data.suppliers);
                // setLocations(data.locations);
                // setAccounts(data.accounts);
                // setBanks(data.banks);
            }
        }).finally(() => {
            dismiss();
        });
        return () => {
            isClean.current = false;
        }
    }, []);
    const handleClick = (index: number) => {
        let button = [];
        button = [
            { text: 'Deposit', color: "theme", icon: cashOutline, role: 'destructive', handler: () => handleOpen(index, "deposit") },
            { text: 'Withdrawal', color: "theme", icon: cash, role: 'destructive', handler: () => handleOpen(index, "withdraw") },
            { text: 'Cancel', icon: closeOutline, role: 'destructive', handler: () => popout() }
        ];
        popup({
            buttons: button,
            header: banks[index].acc_name
        });
    }
    const handleOpen = (index: number, type: string) => {
        setType(type);
        setState(prevState => ({ ...prevState, id: banks[index].id }))
        setIsOpen(true);
    }
    const [errors, setErrors] = useState({
        acc_balance: false,
        amount: false,
        name: false,
        slip_number: false,
    });
    const handleSave = () => {
        let err = {};
        let isValid = true;
        Object.entries(state).forEach(value => {
            if (typeof value[1] === "number") {
                if (value[1] === 0) {
                    err[value[0]] = true;
                    isValid = false;
                }
            } else {
                if (value[1] === "") {
                    err[value[0]] = true;
                    isValid = false;
                }
            }
        });
        if (isValid) {
            present("Updating...");
            Http.request({
                method: "POST",
                url: href + "/api/account/update/bank",
                headers: {
                    'Content-Type': 'application/json',
                    'Data-Type': 'json',
                    'Authorization': 'Bearer ' + user.token
                },
                data: {...state, type}
            }).then(({ data }) => {
                if (data.success) {
                    setBanks(data.banks);
                    handleDismiss();
                }
            }).finally(() => {
                dismiss();
            });
        } else {
            setErrors(prevErr => ({ ...prevErr, ...err }));
            setIsFirst(false);
        }

    }
    const handleDismiss = () => {
        setIsOpen(false);
        setState(initialState);
        setErrors({
            acc_balance: false,
            amount: false,
            name: false,
            slip_number: false,
        });
        setIsFirst(true);
    }
    const handleChange = (value: string | number, type: string) => {
        setState(prevState => ({ ...prevState, [type]: value }));
    }
    return (
        <IonPage>
            <Toolbar title="Bank Details" />
            <IonContent className='ion-padding'>
                <IonItemGroup>
                    {banks.map((value, index) => (<IonItem key={value.id} fill='solid' button onClick={() => handleClick(index)}>
                        <IonLabel>
                            <p>Account name: {value.acc_name}</p>
                            <p>Account number: {value.acc_number}</p>
                        </IonLabel>
                        <IonAvatar slot='start'>
                            <IonImg src={value.logo} />
                        </IonAvatar>
                        <IonNote slot="end">₦{value.acc_balance.toLocaleString()}</IonNote>
                    </IonItem>))}
                </IonItemGroup>
                <IonModal isOpen={isOpen} onDidDismiss={handleDismiss} className="">
                    <IonCard>
                        <IonCardHeader>
                            <IonCardTitle>
                                <IonItem lines='none'>
                                    <IonButtons slot='start'>
                                        <IonButton onClick={handleDismiss}>
                                            <IonIcon slot='icon-only' icon={arrowBack} />
                                        </IonButton>
                                    </IonButtons>
                                    <IonLabel>Add new customer</IonLabel>
                                </IonItem>
                            </IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            {/* <pre>{JSON.stringify(errors, null, 2)}</pre> */}
                            {Object.keys(state).map((key: any) => {
                                if (Object.keys(fieldset).includes(key)) {
                                    return (
                                        <IonItem className="form mb-1" key={key}>
                                            <IonLabel position='stacked'>
                                                {fieldset[key].name}
                                            </IonLabel>
                                            <IonInput value={fieldset[key].type === "number" ? (state[key] || 0) : state[key]} inputmode={fieldset[key].inputmode} onIonChange={e => handleChange(fieldset[key].type === "number" ? parseInt(e.detail.value) :e.detail.value, key)} placeholder={"Type " + fieldset[key].name} />
                                            {!isFirst && errors[key] && <>
                                                <IonNote slot="helper" color="red">{fieldset[key].name} is a required field</IonNote>
                                                <IonIcon slot="end" icon={alertCircleOutline} color="red" />
                                            </>}
                                        </IonItem>
                                    )
                                }

                                // if (Object.keys(fieldSet).includes(key)) {
                                //     return (
                                //         <div className="form mb-1" key={key}>
                                //             {item({
                                //                 name: key,
                                //                 label: fieldSet[key].name,
                                //                 // override default Label renderer
                                //                 renderLabel: (props) => (
                                //                     <IonLabel color={state[key] ? "green" : "red"} position="floating">
                                //                         {props.label}
                                //                     </IonLabel>
                                //                 ),
                                //                 renderContent: (props) => (
                                //                     <>
                                //                         {(fieldSet[key].type === "text") && <IonInput type={fieldSet[key].type} {...props} inputmode={fieldSet[key].inputmode} />}

                                //                         {!isFirst && (state[key] === "" || state[key] === null) && <>
                                //                             <IonNote slot="helper" color="red">{fieldSet[key].name} is a required field</IonNote>
                                //                             <IonIcon slot="end" icon={alertCircleOutline} color="red" />
                                //                         </>}
                                //                         {!isFirst && state[key] && <IonIcon slot="end" icon={checkmarkCircleOutline} color="green" />}
                                //                     </>),
                                //             })}</div>)
                                // }

                            })}
                            <IonButton expand='block' color='green' onClick={handleSave}>Save</IonButton>
                        </IonCardContent>
                    </IonCard>
                </IonModal>
            </IonContent>
        </IonPage>
    );
};

export default Banks;