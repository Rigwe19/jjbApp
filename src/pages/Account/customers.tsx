import { Http } from '@capacitor-community/http';
import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonIcon, IonInput, IonItem, IonLabel, IonModal, IonNote, IonPage, IonSearchbar, IonText, useIonActionSheet, useIonLoading } from '@ionic/react';
import { addCircleOutline, alertCircleOutline, arrowBack, checkmarkCircleOutline, closeOutline, createOutline, saveOutline } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';
import { useIonFormState } from 'react-use-ionic-form';

import Toolbar from '../../components/toolbar';
import '../../modal.css';
import { useRecoilValue } from 'recoil';
import { urlAtom } from '../../recoil/urlAtom';
import { User, userAtom } from '../../recoil/userAtom';

const Customers: React.FC = () => {
    const user = useRecoilValue<User>(userAtom);
    const href = useRecoilValue<string>(urlAtom);
    const [popup, popout] = useIonActionSheet();
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const isClean = useRef(false);
    const [isFirst, setIsFirst] = useState(true);
    const isValid = useRef(false);
    const [show, hide] = useIonLoading();
    const [filter, setFilter] = useState([{
        id: 0,
        name: "",
        customer_id: "54",
        phone: "",
    }]);
    const [customer, setCustomer] = useState([{
        id: 0,
        name: "",
        customer_id: "",
        phone: "",
    }]);
    let { setState, state, reset, item } = useIonFormState({
        id: 0,
        name: "",
        phone: "",
        customer_id: undefined,
    });
    const set = {
        name: { name: "Customer's Name", type: "text", key: "type", inputmode: "text" },
        phone: { name: "Customer's Phone", type: "text", inputmode: "numeric" },
        // date: { name: "Employee Date of Birth", type: "date" },
    }
    const [fieldSet, setFieldSet] = useState<any>(set);
    useEffect(() => {
        isClean.current = true;
        if (searchTerm.length > 0) {
            let result: any = [];
            // setFilter([]);
            if (/\d/.test(searchTerm)) {
                customer.forEach(value => {
                    if (value.customer_id.toString().includes(searchTerm)) {
                        result.push(value);
                    }
                });
            } else {
                customer.forEach(value => {
                    if (value.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                        result.push(value);
                    }
                });
            }

            setFilter(result)
        } else {
            setFilter(customer)
        }
        return () => {
            isClean.current = false;
        }
    }, [searchTerm]);
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
    useEffect(() => {
        isClean.current = true;
        show("Loading Attendance");
        Http.request({
            method: "GET",
            url: href + "/api/get/account/customers",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            }
        }).then(({ data }) => {
            if (isClean.current && data.success) {
                setCustomer(data.customers);
                setFilter(data.customers);
            }
        }).finally(() => {
            hide();
        });
        return () => {
            isClean.current = false;
        }
    }, []);

    const handleClick = (value: { id: number; name: string; customer_id: string; }, index: number) => {
        let button = [];
        button = [
            { text: 'Edit', color: "theme", icon: createOutline, role: 'destructive', handler: () => doEdit(index) },
            { text: 'Cancel', icon: closeOutline, role: 'destructive', handler: () => popout() }
        ];
        popup({
            buttons: button,
            header: value.name
        });
    }
    const doEdit = (index: number) => {
        setState({ ...filter[index] });
        setShowModal(true);
        // console.log(index)
    }

    const handleSave = () => {
        isValid.current = true;
        Object.keys(state).forEach((element: any) => {
            if (state[element] === "" || state[element] === null) {
                isValid.current = false;
                setIsFirst(false);
            }
        });
        if (isValid.current) {
            show("Saving Customer...")
            Http.request({
                method: "POST",
                url: href + "/api/dispatch/add/customer",
                headers: {
                    'Content-Type': 'application/json',
                    'Data-Type': 'json',
                    'Authorization': 'Bearer ' + user.token
                },
                data: state
            }).then(({ data }) => {
                if (data.success) {
                    setShowModal(false);
                    setCustomer(data.customers);
                    setFilter(data.customers);
                    reset();
                    // setFormValue(initialFormValue);
                    // setAddresses([...data.addresses]);
                    // handleReset();
                }
            }).finally(() => {
                hide();
            });
        }
    }
    const handleDismiss = () => {
        setShowModal(false);
        reset();
    }

    return (
        <IonPage>
            <Toolbar title="Customer" />
            <IonContent className="ion-padding">
                <div className="flex justify-end mb-3">
                    <IonButton color='green' onClick={() => setShowModal(true)}>
                        <IonIcon slot="start" icon={addCircleOutline} />
                        Add New Customer</IonButton>
                </div>
                <IonSearchbar placeholder='search for customer name or Id' onIonChange={e => setSearchTerm(e.detail.value)} />
                <div>
                    {filter.map((value, index) => (
                        <IonItem fill='solid' className="mb-1" key={"customers_" + value.customer_id} button onClick={() => handleClick(value, index)}>
                            <IonText slot="start">{replace(value.customer_id, new RegExp(searchTerm, "gi"))}</IonText>
                            <IonLabel>{replace(value.name, new RegExp(searchTerm, "gi"))}</IonLabel>
                            <IonNote slot='end'>{value.phone}</IonNote>
                        </IonItem>
                    )
                    )}
                </div>
                <IonModal isOpen={showModal} onDidDismiss={handleDismiss} className="">
                    <IonCard>
                        <IonCardHeader>
                            <IonCardTitle>
                                <IonItem lines='none'>
                                    <IonButtons slot='start'>
                                        <IonButton onClick={() => setShowModal(false)}>
                                            <IonIcon slot='icon-only' icon={arrowBack} />
                                        </IonButton>
                                    </IonButtons>
                                    <IonLabel>Add new customer</IonLabel>
                                </IonItem>
                            </IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            {Object.keys(state).map((key: any) => {
                                if (Object.keys(fieldSet).includes(key)) {
                                    return (
                                        <div className="form mb-1" key={key}>
                                            {item({
                                                name: key,
                                                label: fieldSet[key].name,
                                                // override default Label renderer
                                                renderLabel: (props) => (
                                                    <IonLabel color="medium" position="stacked">
                                                        {props.label}
                                                    </IonLabel>
                                                ),
                                                renderContent: (props) => (
                                                    <>
                                                        {(fieldSet[key].type === "text") && <IonInput type={fieldSet[key].type} {...props} inputmode={fieldSet[key].inputmode} />}

                                                        {!isFirst && (state[key] === "" || state[key] === null) && <>
                                                            <IonNote slot="helper" color="red">{fieldSet[key].name} is a required field</IonNote>
                                                            <IonIcon slot="end" icon={alertCircleOutline} color="red" />
                                                        </>}
                                                        {!isFirst && state[key] && <IonIcon slot="end" icon={checkmarkCircleOutline} color="green" />}
                                                    </>),
                                            })}</div>)
                                }

                            })}
                            <IonButton expand='block' color='green' onClick={handleSave}>
                                <IonIcon slot="start" icon={saveOutline} />
                                Save</IonButton>
                        </IonCardContent>
                    </IonCard>
                </IonModal>
            </IonContent>
        </IonPage>
    );
};

export default Customers;