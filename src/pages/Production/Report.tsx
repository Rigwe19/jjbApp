import { Http } from '@capacitor-community/http';
import { CheckboxChangeEventDetail, InputChangeEventDetail, IonButton, IonCheckbox, IonChip, IonContent, IonFooter, IonIcon, IonInput, IonItem, IonItemDivider, IonLabel, IonList, IonListHeader, IonNote, IonPage, IonSelect, IonSelectOption, IonTextarea, useIonLoading, useIonToast } from '@ionic/react';
import { checkmarkOutline } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router';

import Toolbar from '../../components/toolbar';
import { useRecoilValue } from 'recoil';
import { urlAtom } from '../../recoil/urlAtom';
import { User, userAtom } from '../../recoil/userAtom';


interface IError {
    brand_id: Boolean;
    batchs: IBatch;
}

interface IBatch {
    [x: number]: IBatchs;
}

interface IBatchs {
    [x: number]: Boolean;
}

interface ITypes {
    id: number;
    type: string;
}
const ProductionReport: React.FC = () => {
    const user = useRecoilValue<User>(userAtom);
    const href = useRecoilValue<string>(urlAtom);
    const [brands, setBrands] = useState([{ id: 0, name: "" }]);
    const [brand, setBrand] = useState(0);
    const [batchs, setBatchs] = useState([{ id: 0, type: "", batch: 0, bag_type: 0, processed: 0, quantity: 0, done: false, type_id: 0 }]);
    const isClean = useRef(false);
    const isValid = useRef(false);
    const [errors, setErrors] = useState<IError>({ brand_id: false, batchs: {} });
    const [isFirst, setIsFirst] = useState(true);
    const [showBatch, setShowBatch] = useState(false);
    const [mixed, setMixed] = useState<any[]>([]);
    const [shared, setShared] = useState<any[]>([]);
    const [types, setTypes] = useState<ITypes[]>([])
    const [quantities, setQuantities] = useState<any[]>([]);
    const [present, dismiss] = useIonLoading();
    const [toasted] = useIonToast();
    const history = useHistory();
    const [form, setForm] = useState({ losts: 0, remarks: "", batch_id: 0 });
    useEffect(() => {
        isClean.current = true;
        present("Loading...");
        Http.request({
            method: "GET",
            url: href + "/api/get/dispatch/opening",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            }
        }).then(({ data }) => {
            if (isClean.current && data.success) {
                setBrands(data.brands);
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
        // present();
        if (brand !== 0) {
            Http.request({
                method: "GET",
                url: href + "/api/get/production/report/" + brand,
                headers: {
                    'Content-Type': 'application/json',
                    'Data-Type': 'json',
                    'Authorization': 'Bearer ' + user.token
                }
            }).then(({ data }) => {
                if (isClean.current && data.success) {
                    let mixes: any[] = Array(data.batchs.length).fill([]);
                    let shares: any[] = Array(data.batchs.length).fill([]);
                    data.batchs.forEach((element: any, index: number) => {
                        mixes[index] = Array(element.quantity).fill(false);
                        shares[index] = Array(element.quantity).fill(false);
                    });
                    let quantity: any[] = Array(data.batchs.length).fill([]);
                    data.batchs.forEach((element: any, index: number) => {
                        quantity[index] = [];
                        Array(element.quantity).fill(undefined).forEach((value, i) => {
                            let initialVal = {
                                batch_list_id: element.id,
                                mix: i + 1,
                                quantity: 0
                            };
                            quantity[index].push(initialVal);
                        });
                    });
                    // console.log(quantity);
                    setTypes(data.types);
                    setMixed(mixes);
                    setShared(shares);
                    setQuantities(quantity);
                    setBatchs(data.batchs);
                    setForm({ ...form, batch_id: data.batchs?.[0]?.batch_id });
                    setShowBatch(true);

                }
            }).finally(() => {
                // dismiss();
            });
        } else {
            setShowBatch(false)
        }
        return () => {
            isClean.current = false;
        }
    }, [brand]);

    const handleChange = (e: CustomEvent<InputChangeEventDetail>, index: number, i: number) => {
        let quantity = [...quantities];
        quantity[index][i].quantity = parseInt(e.detail.value);
        setQuantities(quantity);
    }

    const handleDone = () => {
        let isValid = true;
        if (brand > 0) {
            batchs.forEach(value => {
                if (value.done === false)
                    isValid = false;

            });
            if (form.losts === 0 || form.remarks === "") {
                isValid = false;
            }
        }
        if (isValid) {
            present("Saving...");
            Http.request({
                method: "POST",
                url: href + "/api/production/done/report",
                headers: {
                    'Content-Type': 'application/json',
                    'Data-Type': 'json',
                    'Authorization': 'Bearer ' + user.token
                },
                data: form
            }).then(({ data }) => {
                if (data.success) {
                    history.push("/production/dashboard");
                }
            }).finally(() => {
                dismiss();
            });

        } else {
            toasted("A field is still empty", 2000)
        }

    }

    const handleSave = (index: number) => {
        let batch: any[] = [];
        let mix = [...mixed[index]];
        isValid.current = true;
        let total = displayTotal(index);
        let error = { ...errors };
        errors.batchs[index] = {};
        quantities[index].forEach((element: { quantity: number; }, i: string | number) => {
            if (mix[i]) {
                if (element.quantity === 0) {
                    isValid.current = false;
                    error.batchs[index][i] = true;
                    setErrors(error);
                } else {
                    batch.push(element);
                }

            }
        })
        if (isValid.current) {
            present("Saving...");
            Http.request({
                method: "POST",
                url: href + "/api/production/add/report",
                headers: {
                    'Content-Type': 'application/json',
                    'Data-Type': 'json',
                    'Authorization': 'Bearer ' + user.token
                },
                data: { id: batchs[index].id, brand_id: brand, total: total, batch }
            }).then(({ data }) => {
                if (data.success) {
                    // let newBatch = [...batchs];
                    // newBatch[index].done = true;
                    setBatchs(data.batchs);
                    let error = { ...errors };
                    error.batchs[index] = {};
                    setErrors(error);
                    // setAddresses([...data.addresses]);
                    // handleReset();
                }
            }).finally(() => {
                dismiss();
            });
        }
    }

    const handleCheck = (e: CustomEvent<CheckboxChangeEventDetail<any>>, index: number, i: number) => {
        let mixes = [...mixed];
        mixes[index][i] = e.detail.checked;
        setMixed([...mixes]);
    }

    const handleSharedCheck = (e: CustomEvent<CheckboxChangeEventDetail<any>>, index: number, i: number) => {
        let shares = [...shared];
        // console.log(shared);

        shares[index][i] = e.detail.checked;
        setShared([...shares]);
    }

    const displayTotal = (index: number) => {
        if (quantities[index] !== undefined) {
            let mapped = quantities[index].map((value: { quantity: any; }) => value.quantity);
            return mapped.reduce((a: any, b: any) => a + b, 0);
        }
    }
    return (
        <IonPage>
            <Toolbar title="Production Report - Pan Count" />
            <IonContent className="ion-padding">
                <IonItem fill='solid'>
                    <IonLabel position='floating'>Brand</IonLabel>
                    <IonSelect interface='action-sheet' color='green' value={brand} onIonChange={e => setBrand(e.detail.value)}>
                        <IonSelectOption color="green" value={0}>Select Brand</IonSelectOption>
                        {brands.map(value => (
                            <IonSelectOption key={value.id} value={value.id}>{value.name}</IonSelectOption>
                        ))}
                    </IonSelect>
                </IonItem>
                {/* <pre>{JSON.stringify(mixed, null, 2)}</pre> */}
                {showBatch && batchs.map((value, index) => {
                    if (value.processed === 0) {
                        return (
                            <div key={value.id}>
                                <IonList className='mt-4'>
                                    <IonListHeader color='green'>{value.bag_type} bag{value.bag_type > 1 ? "s" : ""} measurement of {value.type}</IonListHeader>
                                    {Array(value.quantity).fill(undefined).map((e, i) => {
                                        return (
                                            <div key={i} className="overflow-hidden">
                                                <IonItemDivider>Bag {i + 1}</IonItemDivider>
                                                <IonItem fill='solid' /* disabled={value.done} */>
                                                    <div slot="start" className='flex items-center'>
                                                        <IonCheckbox color='green' checked={mixed?.[index]?.[i]} onIonChange={e => handleCheck(e, index, i)} />
                                                        <IonChip color='green'>Mixed</IonChip>
                                                    </div>
                                                    <IonItem fill='solid' className='z-50' slot='end' color='green' disabled={!mixed?.[index]?.[i]}>
                                                        <div slot="end" className='flex items-center'>
                                                            <IonCheckbox color='green' checked={shared?.[index]?.[i]} onIonChange={e => handleSharedCheck(e, index, i)} />
                                                            <IonChip> Share</IonChip>
                                                        </div>
                                                        <IonLabel position="floating">Amount</IonLabel>
                                                        <IonInput className='z-[99]' value={quantities?.[index]?.[i]?.quantity || 0} inputmode="numeric" onIonChange={e => handleChange(e, index, i)} />
                                                        {errors.batchs[index]?.[i] && <IonNote slot="helper" color="danger">Please enter a valid number.</IonNote>}
                                                    </IonItem>
                                                </IonItem>
                                                {shared?.[index]?.[i] && <div className='animate__animated animate__slideInDown'>
                                                    <IonItemDivider>Shared to</IonItemDivider>
                                                    <div className='grid grid-cols-2 gap-2'>
                                                        <IonItem fill='solid'>
                                                            <IonLabel position='floating'>Bread Type</IonLabel>
                                                            <IonSelect interface='action-sheet' value={0}>
                                                                <IonSelectOption value={0}>Select Type</IonSelectOption>
                                                                {types.map(val => {
                                                                    if (value.type_id !== val.id) {
                                                                        return (
                                                                            <IonSelectOption key={val.id}>{val.type}</IonSelectOption>
                                                                        )
                                                                    }
                                                                })}
                                                            </IonSelect>
                                                        </IonItem>
                                                        <IonItem fill='solid'>
                                                            <IonLabel position='floating'>Amount</IonLabel>
                                                            <IonInput value={0} />
                                                        </IonItem>
                                                    </div>
                                                </div>}
                                            </div>

                                        )
                                    }
                                    )}
                                    <IonItem fill='solid'>
                                        <IonButton color='green' onClick={() => handleSave(index)}>
                                            <IonIcon slot="start" icon={checkmarkOutline}></IonIcon>
                                            Save
                                        </IonButton>
                                        <IonChip slot="end" color='green'>Total - {displayTotal(index)}</IonChip>
                                    </IonItem>
                                </IonList>
                                {/* <IonItemDivider>{value.type}</IonItemDivider> */}

                            </div>
                        )
                    }
                }
                )}
                {showBatch && batchs.length > 0 && <>
                    <IonItemDivider>Damage Remark - Open Pan</IonItemDivider>
                    <IonItem fill='solid' className='mb-1'>
                        <IonLabel color='green' position="stacked">Number of Lost</IonLabel>
                        <IonInput value={form.losts || 0} inputmode="numeric" onIonChange={e => setForm({ ...form, losts: parseInt(e.detail.value) })} />
                    </IonItem>
                    <IonItem fill='solid'>
                        <IonLabel color='green' position="stacked">Remark</IonLabel>
                        <IonTextarea value={form.remarks || ""} onIonChange={e => setForm({ ...form, remarks:e.detail.value })}></IonTextarea>
                    </IonItem>
                </>}

            </IonContent>
            <IonFooter>
                <IonButton expand="block" color="green" onClick={handleDone}>Done</IonButton>
            </IonFooter>
        </IonPage>
    );
};

export default ProductionReport;