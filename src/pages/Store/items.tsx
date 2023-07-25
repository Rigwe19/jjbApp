import { Http } from '@capacitor-community/http';
import { InputChangeEventDetail, IonButton, IonContent, IonFooter, IonIcon, IonInput, IonItem, IonLabel, IonNote, IonPage, IonSelect, IonSelectOption, SelectChangeEventDetail, useIonLoading } from '@ionic/react';
import { alertCircleOutline, saveOutline } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';
import convert from "convert-units";
import Toolbar from '../../components/toolbar';
import { IonSelectCustomEvent, IonInputCustomEvent } from '@ionic/core';
import { useRecoilValue } from 'recoil';
import { urlAtom } from '../../recoil/urlAtom';
import { User, userAtom } from '../../recoil/userAtom';

interface IState {
    type: string;
    // ingredients_id: string | number;
    ingredient_other: string;
    ingredient_type_id: string | number;
    quantity: number;
    unitWeight: number;
    weightTotal: number;
    purchase_id: number;
    // priceUnit: number;
    // priceTotal: number;
    unit_id: number;
}
const Items: React.FC = () => {
    const user = useRecoilValue<User>(userAtom);
    const href = useRecoilValue<string>(urlAtom);
    const [ingredients, setIngredients] = useState<any[]>([{ id: 0, type: "", name: "" }]);
    const [items, setItems] = useState<any[]>([{ id: 0, type: "", name: "" }]);
    const [types, setTypes] = useState<any[]>([{ id: 0, type: "", name: "", type_id: 0 }]);
    const [filterTypes, setFilterTypes] = useState<any[]>([{ id: 0, type: "", name: "", type_id: 0 }]);
    const [present, dismiss] = useIonLoading();
    const [units, setUnits] = useState([{ id: 0, unit: "", base: "", name: "" }]);
    const [recipes, setRecipes] = useState([{ id: 0, name: "", quantity: "", ingredients: "" }]);
    const isValid = useRef(false);
    const [errors, setErrors] = useState({
        type: false,
        // ingredients_id: false,
        ingredient_other: false,
        ingredient_type_id: false,
        quantity: false,
        unitWeight: false,
        weightTotal: false,
        priceUnit: false,
        priceTotal: false,
        unit_id: false,
    });
    const [isFirst, setIsFirst] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const isClean = useRef(false);
    const initialState = {
        type: "",
        // ingredients_id: 0,
        ingredient_other: "null",
        ingredient_type_id: 0,
        quantity: 0,
        unitWeight: 0,
        weightTotal: 0,
        purchase_id: 0,
        // priceUnit: 0,
        // priceTotal: 0,
        unit_id: 0,
    };
    const [state, setState] = useState<IState>(initialState);
    useEffect(() => {
        isClean.current = true;
        present("Loading...");
        Http.request({
            method: "GET",
            url: href + "/api/store/get/items",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            }
        }).then(({ data }) => {
            if (isClean.current && data.success) {
                setIngredients(data.ingredients);
                setTypes([...data.types]);
                setUnits(data.unit);
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
        let newState = { ...state };
        let unit = units.find(function (item) {
            return item.id === state.unit_id;
        });
        if (state.unit_id !== 0) {
            if (unit !== undefined) {
                newState.weightTotal = convert(newState.quantity * newState.unitWeight).from(unit.unit).to(unit.base);
            }
        }
        // newState.priceTotal = newState.quantity * newState.priceUnit;
        setState({ ...newState });
        return () => {
            isClean.current = false;
        }
    }, [state.quantity, state.unitWeight, state.unit_id]);

    useEffect(() => {
        isClean.current = true;
        if (isClean.current) {
            // if(state.ingredient_type_id !== "others"){
            //     setState({...state, ingredient_other: "null"});
            // }else if(state.ingredient_type_id === "others"){
            //     setState({...state, ingredient_other: ""});
            // }
            let type = types.find(value=> {
                return value.id === state.purchase_id;
            });
            if(type !== undefined){
                setState(pv => ({...pv, ingredient_type_id: type.expense_id, quantity: type.quantity, unitWeight: type.unit_weight, weightTotal: type.total_weight, unit_id: type.unit_id}));
            }
        }
        return () => {
            isClean.current = false;
        }
    }, [state.purchase_id]);
    const handleChange = (e: IonSelectCustomEvent<SelectChangeEventDetail<any>> | IonInputCustomEvent<InputChangeEventDetail>, name: string, type: string) => {
        let value =e.detail.value;
        if (type === "number") {
            value = parseInt(value);
        }
        if (value === 0) {
            setErrors({ ...errors, [name]: true });
        } else if (value === "") {
            setErrors({ ...errors, [name]: true });
        } else {
            setErrors({ ...errors, [name]: false });
        }
        setState(prevState =>({ ...prevState, [name]: value }));
    }

    const displayUnit = () => {
        let result = units.find(function (item) {
            return item.id === state.unit_id;
        });

        if (result !== undefined) {
            return result.base;
        } else {
            return "Select Weight";
        }
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
                url: href + "/api/store/add/item",
                headers: {
                    'Content-Type': 'application/json',
                    'Data-Type': 'json',
                    'Authorization': 'Bearer ' + user.token
                },
                data: state
            }).then(({ data }) => {
                if (isClean.current && data.success) {
                    setState(initialState);
                    setTypes([...data.types]);
                }
            }).finally(() => {
                dismiss();
            });
        }
    }
    return (
        <IonPage>
            <Toolbar title="Items Purchase (Direct Ingredients)" />
            <IonContent className="ion-padding">
                {/* <pre>{JSON.stringify(state, null, 2)}</pre> */}
                <IonItem fill='solid' className='mb-1'>
                    <IonLabel position="floating">Type</IonLabel>
                    <IonSelect interface='action-sheet' interfaceOptions={{header: "Select Type"}} placeholder="Select Type" value={state.type} onIonChange={e => handleChange(e, "type", "string")}>
                        {/* <IonSelectOption value={""}></IonSelectOption> */}
                        <IonSelectOption value="bag">Bag</IonSelectOption>
                        <IonSelectOption value="carton">Carton</IonSelectOption>
                        <IonSelectOption value="gallon">Gallon</IonSelectOption>
                    </IonSelect>
                    {!isFirst && errors.type && <>
                        <IonNote slot="helper" color="danger">Type cannot be empty</IonNote>
                        <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                    </>
                    }
                </IonItem>
                {/* <div className="mb-1 flex"> */}
                    <IonItem fill='solid' className="mb-1">
                        <IonLabel position="floating">Ingredient</IonLabel>
                        <IonSelect interface='action-sheet' interfaceOptions={{header: "Select Ingredient Type"}} placeholder="Select Ingredient Type" value={state.purchase_id} onIonChange={e => handleChange(e, "purchase_id", "string")}>
                            {/* <IonSelectOption value={0}></IonSelectOption> */}
                            {types.map(value => (
                                <IonSelectOption key={"ingredient_type_" + value.id} value={value.id}>{value.name}</IonSelectOption>
                            ))}
                            {/* <IonSelectOption value="others">Others</IonSelectOption> */}
                        </IonSelect>
                        {!isFirst && errors.ingredient_type_id && <>
                            <IonNote slot="helper" color="danger">Ingredient cannot be empty</IonNote>
                            <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                        </>
                        }
                    </IonItem>
                    {/* {state.ingredient_type_id === "others" && <IonItem fill='solid' className='w-1/2'>
                        <IonLabel position="stacked">Others</IonLabel>
                        <IonInput placeholder='Type Ingredient Name' onIonChange={e => handleChange(e, "ingredient_other", "string")} />
                        {!isFirst && errors.ingredient_other && <>
                            <IonNote slot="helper" color="danger">Ingredient cannot be empty</IonNote>
                            <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                        </>
                        }
                    </IonItem>} */}
                {/* </div> */}

                {/* <div className='mb-1 flex'>
                    <IonItem fill='solid' className={state.ingredients_id === "others"?"w-1/2":"w-full"}>
                        <IonLabel position="floating">Ingredient</IonLabel>
                    <IonSelect interface='action-sheet' value={state.ingredients_id} onIonChange={e => handleChange(e, "ingredients_id", "string")}>
                        <IonSelectOption value={0}>Select Ingredient</IonSelectOption>
                        {filterTypes.map(value => (
                            <IonSelectOption key={"type_" + value.id} value={value.id}>{value.name}</IonSelectOption>
                        ))}
                        <IonSelectOption value="others">Others</IonSelectOption>
                    </IonSelect>
                    </IonItem>
                    {state.ingredients_id === "others" && <IonItem fill='solid' className='w-1/2'>
                        <IonLabel position="stacked">Others</IonLabel>
                        <IonInput placeholder='Type Ingredient Name' onIonChange={e => handleChange(e, "ingredient_other", "string")} />
                    </IonItem>}
                </div> */}
                <IonItem fill='solid' className='mb-1'>
                    <IonLabel position="floating">Quantity</IonLabel>
                    <IonInput value={state.quantity || 0} inputmode="numeric" onIonChange={e => handleChange(e, "quantity", "number")} />
                    {!isFirst && errors.quantity && <>
                        <IonNote slot="helper" color="danger">Quantity cannot be empty</IonNote>
                        <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                    </>
                    }
                </IonItem>
                <div className='mb-1 flex'>
                    <IonItem fill='solid' className='mb-1 w-1/2'>
                        <IonLabel position="floating">Unit/Weight</IonLabel>
                        <IonInput value={state.unitWeight || 0} inputmode="numeric" onIonChange={e => handleChange(e, "unitWeight", "number")} />
                        {!isFirst && errors.unitWeight && <>
                            <IonNote slot="helper" color="danger">Unit/Weight cannot be empty</IonNote>
                            <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                        </>
                        }
                    </IonItem>
                    <IonItem fill='solid' className='w-1/2'>
                        <IonLabel position='floating'>Weight</IonLabel>
                        <IonSelect interface='action-sheet' interfaceOptions={{header: "Select Weight Unit"}} placeholder="Select Weight Unit" value={state.unit_id} onIonChange={e => handleChange(e, "unit_id", "string")}>
                            {/* <IonSelectOption value={0}></IonSelectOption> */}
                            {units.map(value => (
                                <IonSelectOption key={"unit_key_" + value.id} value={value.id}>{value.name}</IonSelectOption>
                            ))}
                        </IonSelect>
                        {!isFirst && errors.unit_id && <>
                            <IonNote slot="helper" color="danger">Unit cannot be empty</IonNote>
                            <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                        </>
                        }
                    </IonItem>
                </div>
                <IonItem fill='solid' className='mb-1'>
                    <IonLabel position="floating">Total Weight</IonLabel>
                    <IonInput readonly value={state.weightTotal || 0}/*  onIonChange={e => handleChange(e, "priceTotal")} */ />
                    {units !== undefined && <IonNote slot='end'>{displayUnit()}</IonNote>}
                    {!isFirst && errors.weightTotal && <>
                        <IonNote slot="helper" color="danger">Total Weight cannot be empty</IonNote>
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
                {/* {Object.keys(state).map((key: any) => {
                    if (Object.keys(fieldSet).includes(key)) {
                        return (
                            <IonCol size="12" className="form mb-1" key={key}>
                                {item({
                                    name: key,
                                    label: fieldSet[key].name,
                                    // override default Label renderer
                                    renderLabel: (props) => (
                                        <IonLabel color={state[key] ? "green" : "primary"} position="floating">
                                            {props.label}
                                        </IonLabel>
                                    ),
                                    renderContent: (props) => (
                                        <>
                                            {fieldSet[key].type === "text" && <IonInput type={fieldSet[key].type} value={state[key]|| 0} inputmode={fieldSet[key].inputmode} disabled={fieldSet[key].disabled} />}
                                            {fieldSet[key].type === "select" && <IonSelect interface='action-sheet' {...props}>
                                                <IonSelectOption value="">Select {fieldSet[key].name}</IonSelectOption>
                                                {fieldSet[key].options.map((value: { id: string; type: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal; name: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal; }) => {
                                                    if (key === "type_id") {
                                                        return (
                                                            <IonSelectOption key={"Type_key_" + value.id} value={value.id}>{value.type}</IonSelectOption>
                                                        )
                                                    } else if (key === "ingredient_id") {
                                                        return (
                                                            <IonSelectOption key={"Ingredient_key_" + value.id} value={value.id}>{value.name}</IonSelectOption>
                                                        )
                                                    } else if(key === "type"){
                                                        return <IonSelectOption key={"bag_type_key_" + value.id} value={value.id}>{value.name}</IonSelectOption>
                                                    }

                                                })}
                                                <IonSelectOption value="others">Others</IonSelectOption>
                                            </IonSelect>}
                                            {!isFirst && (state[key] === "" || state[key] === null) &&
                                                <>
                                                    <IonNote slot="helper" color="danger">{fieldSet[key].name} is a required field</IonNote>
                                                    <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                                                </>
                                            }
                                            {!isFirst && state[key] && <IonIcon slot="end" icon={checkmarkCircleOutline} color="success" />}
                                            {state[key] === "others" && <div className='w-full'>
                                                <IonInput onIonChange={e => setState(prevState =>({ ...prevState, key:e.detail.value }))} className='border font-[16px] border-green-400 rounded-md' />
                                            </div>}
                                        </>
                                    ),
                                })
                                }
                            </IonCol>
                        )
                    }
                })} */}


            </IonContent>
            <IonFooter>
                <IonButton color='green' expand='block' onClick={handleSubmit}>
                    <IonIcon icon={saveOutline} slot="start" />Save Item</IonButton>
            </IonFooter>
        </IonPage>
    );
};

export default Items;