import { Http } from '@capacitor-community/http';
import { IonButton, IonContent, IonFooter, IonIcon, IonInput, IonItem, IonLabel, IonNote, IonPage, IonSelect, IonSelectOption, SelectChangeEventDetail, useIonLoading } from '@ionic/react';
import { alertCircleOutline, saveOutline } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';
import Toolbar from '../../components/toolbar';
import { IonSelectCustomEvent, IonInputCustomEvent, InputInputEventDetail } from '@ionic/core';
import { useRecoilValue } from 'recoil';
import { urlAtom } from '../../recoil/urlAtom';
import { User, userAtom } from '../../recoil/userAtom';


interface IState {
    non_type_id: number;
    non_ingredient_id: string | number;
    ingredient_other: string;
    quantity: number;
    purchase_id: number;
    // priceUnit: number;
    // priceTotal: number;
}
const NonItems: React.FC = () => {
    const user = useRecoilValue<User>(userAtom);
    const href = useRecoilValue<string>(urlAtom);
    const [ingredients, setIngredients] = useState<any[]>([{ id: 0, type: "", name: "" }]);
    const isClean = useRef(false);
    const isValid = useRef(false);
    const [errors, setErrors] = useState({
        non_type_id: false,
        non_ingredient_id: false,
        ingredient_other: false,
        quantity: false,
        // priceUnit: false,
        // priceTotal: false,
    });
    const [isFirst, setIsFirst] = useState(true);
    const initialState = {
        non_type_id: 0,
        non_ingredient_id: 0,
        ingredient_other: "null",
        quantity: 0,
        purchase_id: 0,
        // priceUnit: 0,
        // priceTotal: 0
    };
    const [state, setState] = useState<IState>(initialState);
    const [present, dismiss] = useIonLoading();
    useEffect(() => {
        isClean.current = true;
        present("Loading...");
        Http.request({
            method: "GET",
            url: href + "/api/store/get/nonitems",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            }
        }).then(({ data }) => {
            if (isClean.current && data.success) {
                setIngredients(data.ingredients);
            }
        }).finally(() => {
            dismiss();
        });
        return () => {
            isClean.current = false;
        }
    }, []);
    // useEffect(() => {
    //     isClean.current = true;
    //     let newState = { ...state };
    //     if (state.non_type_id === 1) {
    //         newState.priceTotal = newState.quantity * newState.priceUnit;
    //     } else {
    //         newState.priceTotal = newState.priceUnit;
    //     }

    //     setState({ ...newState });
    //     return () => {
    //         isClean.current = false;
    //     }
    // }, [state.quantity, state.priceUnit, state.non_type_id]);

    useEffect(() => {
        isClean.current = true;
        if (isClean.current) {
            let type = ingredients.find(value => {
                return value.id === state.purchase_id;
            });
            if(type !== undefined){
                setState(pv=>({...pv, non_ingredient_id: type.expense_id}));
            }
        }
        return () => {
            isClean.current = false;
        }
    }, [state.purchase_id]);

    const handleChange = (e: IonSelectCustomEvent<SelectChangeEventDetail<any>> | IonInputCustomEvent<InputInputEventDetail>, name: string, type: string) => {
        let value =e.detail.value;
        // if (value.match(/^([0-9]{1,})?(\.)?([0-9]{1,})?$/))
        if (type === "number") {
            if (value.charAt(value.length - 1) === ".") {
                value += "1"
                console.log(value);
            }
            value = parseInt(value);
        }
        setState({ ...state, [name]: value });

    }

    const handleBlur = (e: any, name: string, type: string) => {
        let value = e.detail.target.value;
        if (type === "float") {
            value = parseFloat(value);
        }
        setState({ ...state, [name]: value || '' });
    }

    const handleSubmit = () => {
        isValid.current = true;
        let err = { ...errors };
        Object.entries(state).forEach(value => {
            if (value[1] === 0 || value[1] === "") {
                isValid.current = false;
                err[value[0]] = true;
                setIsFirst(false);
            } else {
                err[value[0]] = false;
            }
        });
        setErrors({ ...err });
        if (isValid.current) {
            present("Saving...");
            Http.request({
                method: "POST",
                url: href + "/api/store/add/nonitem",
                headers: {
                    'Content-Type': 'application/json',
                    'Data-Type': 'json',
                    'Authorization': 'Bearer ' + user.token
                },
                data: state
            }).then(({ data }) => {
                if (isClean.current && data.success) {
                    setState(initialState);
                    setIngredients(data.ingredients)
                }
            }).finally(() => {
                dismiss();
            });
        }
    }
    return (
        <IonPage>
            <Toolbar title="Items Purchase (Non-Direct Ingredients)" />
            <IonContent className="ion-padding">
                {/* <pre>{JSON.stringify(state, null, 2)}</pre> */}
                <IonItem fill='solid' className='mb-1'>
                    <IonLabel position="floating">Type</IonLabel>
                    <IonSelect interface='action-sheet' interfaceOptions={{header: "Select Type"}} placeholder="Select Type" value={state.non_type_id} onIonChange={e => handleChange(e, "non_type_id", "string")}>
                        {/* <IonSelectOption value={0}>Select Type</IonSelectOption> */}
                        <IonSelectOption value={1}>Single</IonSelectOption>
                        <IonSelectOption value={2}>Bundle</IonSelectOption>
                    </IonSelect>
                </IonItem>
                {/* <div> */}
                    <IonItem fill='solid' className="mb-1">
                        <IonLabel position="floating">Ingredient</IonLabel>
                        <IonSelect interface='action-sheet' interfaceOptions={{header: "Select Ingredient Type"}} placeholder="Select Ingredient Type" value={state.purchase_id} onIonChange={e => handleChange(e, "purchase_id", "string")}>
                            {/* <IonSelectOption value={0}>Select Ingredient Type</IonSelectOption> */}
                            {ingredients.map(value => (
                                <IonSelectOption key={"ingredient_type_" + value.id} value={value.id}>{value.name}</IonSelectOption>
                            ))}
                            {/* <IonSelectOption value="others">Others</IonSelectOption> */}
                        </IonSelect>
                        {!isFirst && errors.non_ingredient_id && <>
                            <IonNote slot="helper" color="danger">Ingredient cannot be empty</IonNote>
                            <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                        </>
                        }
                    </IonItem>
                    {/* {state.non_ingredient_id === "others" && <IonItem fill='solid' className='w-1/2'>
                        <IonLabel position="stacked">Others</IonLabel>
                        <IonInput placeholder='Type Ingredient Name' onIonChange={e => handleChange(e, "ingredient_other", "string")} />
                        {!isFirst && errors.ingredient_other && <>
                            <IonNote slot="helper" color="danger">Ingredient cannot be empty</IonNote>
                            <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                        </>
                        }
                    </IonItem>} */}
                {/* </div> */}
                <IonItem fill='solid' className='mb-1'>
                    <IonLabel position="floating">Quantity</IonLabel>
                    <IonInput value={state.quantity || 0} inputmode="numeric" onIonChange={e => handleChange(e, "quantity", "float")} onIonBlur={e => handleBlur(e, "quantity", "float")} />
                    {!isFirst && errors.quantity && <>
                        <IonNote slot="helper" color="danger">Quantity cannot be empty</IonNote>
                        <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                    </>
                    }
                </IonItem>
                {/* <IonItem fill='solid' className='mb-1'>
                    <IonLabel position="floating">Price/Unit</IonLabel>
                    <IonInput value={state.priceUnit || 0} inputmode="numeric" onIonChange={e => handleChange(e, "priceUnit", "number")} />
                    <IonNote slot='end'>₦</IonNote>
                    {!isFirst && errors.priceUnit && <>
                        <IonNote slot="helper" color="danger">Price/Unit cannot be empty</IonNote>
                        <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                    </>
                    }
                </IonItem>
                <IonItem fill='solid' className='mb-1'>
                    <IonLabel position="floating">Total Price</IonLabel>
                    <IonInput readonly value={state.priceTotal || 0} />
                    <IonNote slot='end'>₦</IonNote>
                    {!isFirst && errors.priceTotal && <>
                        <IonNote slot="helper" color="danger">Total Price cannot be empty</IonNote>
                        <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                    </>
                    }
                </IonItem> */}
            </IonContent>
            <IonFooter>
                <IonButton color='green' expand='block' onClick={handleSubmit}>
                    <IonIcon icon={saveOutline} slot="start" />Save Item</IonButton>
            </IonFooter>
        </IonPage>
    );
};

export default NonItems;