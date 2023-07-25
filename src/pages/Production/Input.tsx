import { Http } from '@capacitor-community/http';
import { IonInput, IonContent, IonItem, IonLabel, IonPage, IonSelect, IonSelectOption, useIonLoading, useIonToast, IonItemDivider, SelectChangeEventDetail, IonButton, IonFooter, IonRefresher, IonRefresherContent, RefresherEventDetail, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonIcon } from '@ionic/react';
import React, { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router';

import Toolbar from '../../components/toolbar';
import { closeCircleOutline } from 'ionicons/icons';
import { IonInputCustomEvent, InputInputEventDetail, IonSelectCustomEvent } from '@ionic/core';
import { useRecoilValue } from 'recoil';
import { urlAtom } from '../../recoil/urlAtom';
import { User, userAtom } from '../../recoil/userAtom';

const Input: React.FC = () => {
    const user = useRecoilValue<User>(userAtom);
    const href = useRecoilValue<string>(urlAtom);
    const [brands, setBrands] = useState([{ id: 0, name: "" }]);
    const [brand, setBrand] = useState(0);
    const batchInitial = { batch: 1, bag_type: 0, type_id: 0, quantity: 0 };
    const [showBatch, setShowBatch] = useState(false);
    type IBatch = typeof batchInitial;
    const [items, setItems] = useState([{ id: 0, type: "", quantity: 0, isAdded: false, processed: false, first: true, brand_id: 0 }]);
    const [batchs, setBatchs] = useState<IBatch[]>([batchInitial]);
    const [present, dismiss] = useIonLoading();
    const [toasted] = useIonToast();
    const isClean = useRef(false);
    const isValid = useRef(false);
    const [errors, setErrors] = useState<any>({ brand_id: false, batchs: { 0: { bag_type: "", type_id: "", quantity: "" } } });
    const [isFirst, setIsFirst] = useState(true);
    const [lists, setLists] = useState<{
        id: number;
        type: string;
        quantity: number;
        brand_id: number;
    }[]>([]);
    const [filterLists, setFilterLists] = useState<{
        id: number;
        type: string;
        quantity: number;
        brand_id: number;
    }[]>([]);
    const [types, setTypes] = useState<{
        id: number,
        type: string;
        quantity: number;
        isAdded: boolean;
        processed: boolean;
        first: boolean;
        brand_id: number;
    }[]>([]);
    const [filterTypes, setFilterTypes] = useState<{
        id: number,
        type: string;
    }[]>([]);
    const [usages, setUsages] = useState<{
        id: number;
        batch: number;
        type_id: number;
        quantity: number;
        bag_type: number;
        brand_id: number;
    }[]>([]);
    const history = useHistory();
    useEffect(() => {
        isClean.current = true;
        handleRefresh();
        return () => {
            isClean.current = false;
        }
    }, []);
    const handleRefresh = (e?: CustomEvent<RefresherEventDetail>) => {
        present("Loading...");
        Http.request({
            method: "GET",
            url: href + "/api/get/production/input",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            }
        }).then(({ data }) => {
            if (isClean.current && data.success) {
                setBrands(data.brands);
                setLists(data.lists);
                setTypes(data.types);
                setUsages(data.usages);
                // setBatchs([]);
            }
        }).finally(() => {
            dismiss();
            if (e !== undefined) {
                e.detail.complete();
            }
        });
    }

    useEffect(() => {
        isClean.current = true;
        // present("Loading...");
        if (brand !== 0) {
            let itemFilter = types.filter(value=>{
                return value.brand_id === brand;
            });
            if(itemFilter!==undefined){
                setItems(itemFilter);
            }
            
            setShowBatch(true);
            let filter = lists.filter(value => {
                return value.brand_id === brand;
            });
            if (filter !== undefined) {
                setFilterLists(filter);
            }

            let filterBatch = usages.filter(value=>{
                return value.brand_id === brand;
            });
            if(filterBatch !== undefined){
                setBatchs(filterBatch);
            }
        } else {
            setShowBatch(false)
        }
        return () => {
            isClean.current = false;
        }
    }, [brand]);
    // useEffect(() => {
    //     isClean.current = true;
    //     if (isClean.current) {
    //         let length = batchs.length;
    //         let valid = true;
    //         Object.keys(batchs[length - 1]).forEach(element => {
    //             if (batchs[length - 1][element] === 0) {
    //                 valid = false;
    //             }
    //         });
    //         if (valid) {
    //             setBatchs([...batchs, {
    //                 batch: length + 1,
    //                 bag_type: 0,
    //                 type_id: 0,
    //                 quantity: 0
    //             }])
    //         }
    //     }
    //     return () => {
    //         isClean.current = false;
    //     }
    // }, [batchs]);


    const handleChange = (e: IonInputCustomEvent<InputInputEventDetail> | IonSelectCustomEvent<SelectChangeEventDetail<any>>, key: string, index: number) => {
        let newBatch = [...batchs];
        newBatch[index][key] = parseInt(e.detail.value);
        setBatchs(newBatch);
    }

    const handleSubmit = () => {
        isValid.current = true;
        type IError = typeof errors;
        let newErrors: IError = { batchs: { 0: { bag_type: "", type_id: "", quantity: "" } } };
        // if (state.quantity === 0) {
        //     isValid.current = false;
        //     newErrors.quantity = true;
        // }
        let newBatchs = [...batchs];
        newBatchs.splice(-1);
        newErrors.batchs = {};
        newBatchs.forEach((element, index) => {
            console.log(newErrors.batchs);
            console.log(index);
            newErrors.batchs[index] = {};
            Object.keys(element).forEach(key => {
                if (element[key] === 0) {
                    isValid.current = false;
                    newErrors.batchs[index][key] = "danger";
                }
            });
        });
        if (brand === 0) {
            isValid.current = false;
            newErrors.brand_id = true;
        }
        // console.log(newErrors);
        if (isValid.current) {
            let formData = {
                brand_id: brand,
                batchs: newBatchs,
            };
            present("Saving...");
            Http.request({
                method: "POST",
                url: href + "/api/production/add/input",
                headers: {
                    'Content-Type': 'application/json',
                    'Data-Type': 'json',
                    'Authorization': 'Bearer ' + user.token
                },
                data: formData
            }).then(({ data }) => {
                if (data.success) {
                    setBatchs([batchInitial]);
                    setBrand(0);
                    history.push("/production/dashboard")
                    // handleReset();
                }
            }).finally(() => {
                dismiss();
            });
        } else {
            toasted("Some fields are empty, review your form and try again", 2000)
            setIsFirst(false);
            setErrors(newErrors);
            console.log("set");

        }
    }

    return (
        <IonPage>
            <Toolbar title="Bags of Recipes Collected From Store" />
            <IonContent className="ion-padding">
                <IonRefresher slot='fixed' onIonRefresh={e => handleRefresh(e)}>
                    <IonRefresherContent />
                </IonRefresher>
                <IonItem fill='solid'>
                    <IonLabel position='floating'>Brand</IonLabel>
                    <IonSelect interface='action-sheet' interfaceOptions={{ header: "Select Brand" }} placeholder="Select Brand" color='green' value={brand} onIonChange={e => setBrand(e.detail.value)}>
                        {/* <IonSelectOption color="green" value={0}></IonSelectOption> */}
                        {brands.map(value => (
                            <IonSelectOption key={value.id} value={value.id}>{value.name}</IonSelectOption>
                        ))}
                    </IonSelect>
                </IonItem>
                {showBatch && <IonCard>
                    <IonCardHeader>
                        <IonCardTitle className='text-center'>Amount of Items Paid for</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        {filterLists.map(value => (<div key={value.id} className="flex justify-between border-b">
                            <span>{value.type}</span>
                            <span>{value.quantity}</span>
                        </div>))}
                        {filterLists.length === 0 && <div className="flex justify-center">
                            <div className='flex flex-col'>
                                <IonIcon icon={closeCircleOutline} size="large" color="medium" />
                                Empty
                            </div>
                        </div>}
                    </IonCardContent>
                </IonCard>}
                {/* <pre>{JSON.stringify(errors, null, 2)}</pre> */}
                {showBatch && batchs.map((value, index) => (
                    <div key={value.batch}>
                        <IonItemDivider className='mt-2'>Batch {value.batch}</IonItemDivider>
                        <div className="flex flex-row mt-2">
                            <IonItem fill='solid' className='w-[30%]'>
                                <IonLabel color={errors?.batchs?.[index]?.bag_type || undefined} position='stacked'>Bag Type</IonLabel>
                                <IonSelect interface='action-sheet' interfaceOptions={{ header: "Select bag type" }} placeholder="Select bag type" value={value.bag_type} onIonChange={e => handleChange(e, "bag_type", index)}>
                                    {/* <IonSelectOption value={0}>Select bag type</IonSelectOption> */}
                                    <IonSelectOption value={1}>1 bag</IonSelectOption>
                                    <IonSelectOption value={2}>2 bags</IonSelectOption>
                                </IonSelect>
                            </IonItem>
                            <IonItem fill='solid' className='w-[40%]'>
                                <IonLabel color={errors?.batchs?.[index]?.type_id || undefined} position='stacked'>Type</IonLabel>
                                <IonSelect interface='action-sheet' interfaceOptions={{ header: "Select Type" }} placeholder="Select Type" value={value.type_id} onIonChange={e => handleChange(e, "type_id", index)}>
                                    {/* <IonSelectOption value={0}>Select Type</IonSelectOption> */}
                                    {items.map(value => (
                                        <IonSelectOption key={value.id} value={value.id}>{value.type}</IonSelectOption>
                                    ))}
                                </IonSelect>
                            </IonItem>
                            <IonItem fill='solid' className='w-[30%]'>
                                <IonLabel color={errors?.batchs?.[index]?.quantity || undefined} position='stacked'>Quantity</IonLabel>
                                <IonInput inputmode="numeric" value={value.quantity || 0} onIonChange={e => handleChange(e, "quantity", index)} />
                            </IonItem>
                        </div>
                    </div>
                ))}
            </IonContent>
            <IonFooter>
                <IonButton expand="block" color="green" onClick={handleSubmit}>Save</IonButton>
            </IonFooter>
        </IonPage>
    );
};

export default Input;
