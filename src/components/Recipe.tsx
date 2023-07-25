import { Http } from '@capacitor-community/http';
import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonFooter, IonHeader, IonIcon, IonInput, IonItem, IonItemDivider, IonLabel, IonModal, IonNote, IonSegment, IonSegmentButton, IonSelect, IonSelectOption, IonToolbar, useIonActionSheet, useIonLoading, useIonToast } from '@ionic/react';
import { alertCircleOutline, addCircleOutline, arrowBack, closeOutline, createOutline, save } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';
import { useIonFormState } from 'react-use-ionic-form';
import convert from "convert-units";
import { useRecoilValue } from 'recoil';
import { urlAtom } from '../recoil/urlAtom';
import { User, userAtom } from '../recoil/userAtom';

interface IUnit {
    id: number;
    unit: string;
    name: string;
    base: string;
}
const Recipes: React.FC = () => {
    const user = useRecoilValue<User>(userAtom);
    const href = useRecoilValue<string>(urlAtom);
    const [ingredients, setIngredients] = useState<any[]>([{ id: 0, type: "", name: "" }]);
    const [brands, setBrands] = useState([{ id: 0, name: "" }]);
    const [present, dismiss] = useIonLoading();
    const [action, cancelAction] = useIonActionSheet();
    const [units, setUnits] = useState<IUnit[]>([]);
    const [segment, setSegment] = useState("lists");
    const [types, setTypes] = useState([]);
    const [typeFilter, setTypeFilter] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const [hasReset, setHasReset] = useState({ brand_id: 0, type_id: 0 });
    const [ingredientChanged, setIngredientChanged] = useState(0);
    const isValid = useRef(false);
    const [showModal, setShowModal] = useState(false);
    const [errors, setErrors] = useState<any>({ name: false, quantity: false, ingredients: { 0: { ingredient_id: "", quantity: "", unit_id: "" } } });
    const [isFirst, setIsFirst] = useState(true);
    const first = useRef(false);
    const second = useRef(true);
    const [toasted] = useIonToast();
    const [product, setProduct] = useState({
        brand_id: 0,
        type: "",
    });
    let { setState, state, reset, item } = useIonFormState({
        id: 0,
        name: "",
        type_id: 0,
        quantity: 0,
        brand_id: 0,
        calcPrice: 0,
        price: 0,
        misc: 0,
        ingredients: [{
            ingredient_id: 0,
            quantity: 0,
            unit_id: 0
        }],
    });
    const set = {
        name: { name: "Recipe name", type: "text" },
        quantity: { name: "Number of Bread per Recipe", type: "text", inputmode: "numeric" },
        brand_id: { name: "Brand", type: "select", options: brands },
        ingredients: { name: "Ingredients", type: "date" },
    }
    const [fieldSet, setFieldSet] = useState<any>(set);
    const isClean = useRef(false);

    useEffect(() => {
        isClean.current = true;
        present("Loading...");
        Http.request({
            method: "GET",
            url: href + "/api/ceo/get/recipes",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            }
        }).then(({ data }) => {
            if (isClean.current && data.success) {
                setIngredients(data.ingredients);
                setUnits(data.units);
                setRecipes(data.recipes);
                setBrands(data.brands);
                setTypes(data.types);
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
        if (isClean.current && first.current) {
            let length = state.ingredients.length;
            let valid = true;
            Object.keys(state.ingredients[length - 1]).forEach(element => {
                if (state.ingredients[length - 1][element] === 0) {
                    valid = false;
                }
            });
            if (valid) {
                setState(pv => ({
                    ...pv, ingredients: [...state.ingredients, {
                        ingredient_id: 0,
                        quantity: 0,
                        unit_id: 0
                    }]
                }));
                first.current = false;
            }
            setIngredientChanged(pv => (pv + 1));
        } else {
            second.current = true;
        }
        return () => {
            isClean.current = false;
        }
    }, [JSON.stringify(state.ingredients),]);
    useEffect(() => {
        let price = 0;
        if (state.quantity > 0 && state.ingredients[0].quantity > 0) {
            console.log(state);
            let sum = 0;
            state.ingredients.forEach(value => {
                let base_unit = units.find(unit => {
                    return unit.id === value.unit_id;
                });
                let expense = ingredients.find(exp => {
                    return exp.id === value.ingredient_id;
                })
                if (base_unit !== undefined && expense !== undefined) {
                    let base = convert(value.quantity).from(base_unit.unit).to(base_unit.base);
                    sum += (base * expense.price);
                }
            });
            sum += state.misc
            price = sum / state.quantity;
        }
        setState(pv => ({ ...pv, calcPrice: price }));
    }, [ingredientChanged, state.quantity, state.misc]);

    useEffect(() => {
        let recipe = recipes.find(value => {
            return value.type_id === state.type_id;
        });
        let type = types.find(value => {
            return value.id === state.type_id;
        });
        if (recipe !== undefined && type !== undefined) {
            if (typeof recipe.ingredients === "string")
                recipe.ingredients = JSON.parse(recipe.ingredients);
            setState(pv => ({ ...pv, ...recipe, name: type.type }));
            second.current = true;
        } else {
            let recipe: any = {
                id: 0,
                name: "",
                // type_id: state.type_id,
                quantity: 0,
                // brand_id: state.brand_id,
                calcPrice: 0,
                price: 0,
                misc: 0,
                ingredients: [{
                    ingredient_id: 0,
                    quantity: 0,
                    unit_id: 0
                }],
            }
            first.current = false;
            second.current = false;
            if (type !== undefined) {
                setState(pv => ({ ...pv, ...recipe, name: type.type }));
            } else {
                setState(pv => ({ ...pv, ...recipe }));
            }

        }
    }, [state.type_id]);

    // useEffect(() => {
    //     setState(pv=>({...pv, ...hasReset}));
    // }, [JSON.stringify(hasReset)]);

    useEffect(() => {
        let filt = types.filter(value => {
            return value.brand_id === state.brand_id;
        });
        if (filt !== undefined) {
            setTypeFilter(filt);
        }
    }, [state.brand_id]);

    const handleSubmit = () => {
        isValid.current = true;
        type IError = typeof errors;
        let newErrors: IError = { ingredients: { 0: { ingredient_id: "", quantity: "", unit_id: "" } } };
        if (state.name === "") {
            isValid.current = false;
            newErrors.name = true;
        }
        if (state.quantity === 0) {
            isValid.current = false;
            newErrors.quantity = true;
        }
        let ingre = [...state.ingredients];
        ingre.splice(-1);
        newErrors.ingredients = {};
        ingre.forEach((element, index) => {
            newErrors.ingredients[index] = {};
            Object.keys(element).forEach(key => {
                if (element[key] === 0) {
                    isValid.current = false;
                    // console.log(newErrors.ingredients);
                    // console.log(index);
                    newErrors.ingredients[index][key] = "danger";
                }
            });
        });
        // console.log(newErrors);
        if (isValid.current) {
            let formData = {
                id: state.id,
                type_id: state.type_id,
                quantity: state.quantity,
                price: state.price,
                misc: state.misc,
                ingredients: JSON.stringify(ingre),
            };
            present("Saving Recipe...")
            Http.request({
                method: "POST",
                url: href + "/api/ceo/add/recipe",
                headers: {
                    'Content-Type': 'application/json',
                    'Data-Type': 'json',
                    'Authorization': 'Bearer ' + user.token
                },
                data: formData
            }).then(({ data }) => {
                if (data.success) {
                    setRecipes(data.recipes)
                    reset();
                    setSegment("lists");
                    // setShowModal(false);
                    // setAddresses([...data.addresses]);
                    // handleReset();
                }
            }).finally(() => {
                dismiss();
            });
        } else {
            setIsFirst(false);
            setErrors(newErrors);
            // console.log("set");

        }
    }

    const handleItemClick = (index: number) => {
        let buttons = [
            { text: 'Edit', color: "theme", icon: createOutline, role: 'destructive', handler: () => doEdit(index) },
            { text: 'Cancel', icon: closeOutline, role: 'destructive', handler: () => cancelAction() }
        ];
        action({
            buttons: buttons,
            header: recipes[index].name + " Bread"
        });
    }

    const doEdit = (index: number) => {
        let recipe = { ...recipes[index] };
        // recipe.ingredients = JSON.parse(recipe.ingredients);
        setState({ ...recipes[index], ingredients: JSON.parse(recipe.ingredients) });
        setSegment("new");
    }
    const handleChange = (e: any, key: string, index: number) => {
        let ingre = [...state.ingredients];
        ingre[index][key] = e;
        if (second.current) {
            setState(pv => ({ ...pv, ingredients: ingre }));
            first.current = true;
        }

    }
    const handleDismiss = () => {
        setShowModal(false);
        reset();
    }

    const handleAdd = () => {
        setProduct(pv => ({ ...pv, brand_id: state.brand_id }));
        setShowModal(true);
    }

    const saveProduct = () => {
        let isValid = true;
        if (product.brand_id === 0 || product.type === "") {
            isValid = false;
        }
        if (isValid) {
            present("Saving Product...")
            Http.request({
                method: "POST",
                url: href + "/api/ceo/add/product",
                headers: {
                    'Content-Type': 'application/json',
                    'Data-Type': 'json',
                    'Authorization': 'Bearer ' + user.token
                },
                data: product
            }).then(({ data }) => {
                if (data.success) {
                    setTypes(data.types);
                    if(state.brand_id > 0){
                        let filt = data.types.filter((value: { brand_id: number; }) => {
                            return value.brand_id === state.brand_id;
                        });
                        if (filt !== undefined) {
                            setTypeFilter(filt);
                        }
                    }
                    setProduct({
                        type: "",
                        brand_id: 0,
                    });
                    setShowModal(false);
                    // setAddresses([...data.addresses]);
                    // handleReset();
                }
            }).finally(() => {
                dismiss();
            });
        }else{
            toasted({
                message: "Error all field must be filled",
                header: "Validation Error",
                duration: 3000,
                position: "bottom",
                icon: alertCircleOutline,
            })
        }

    }
    return (
        <>
            <IonHeader>
                <IonToolbar>
                    <IonSegment value={segment} onIonChange={e => setSegment(e.detail.value)}>
                        <IonSegmentButton value="lists">Recipe Lists</IonSegmentButton>
                        <IonSegmentButton value="new">New Recipe</IonSegmentButton>
                    </IonSegment>
                </IonToolbar>
            </IonHeader>
            {/* <IonButton color="green" onClick={() => setShowModal(true)}>Add New Recipe</IonButton> */}
            {segment === "lists" && <div className="my-4">
                {recipes.map((value, index) => (
                    <IonItem fill='solid' button className='mb-1' key={value.id} onClick={() => handleItemClick(index)}>
                        <IonLabel>
                            <p>{value.name}</p>
                            <p>Sold at ₦{value.price}</p>
                        </IonLabel>
                        <IonNote slot="end">{value.quantity} breads per recipe</IonNote>
                    </IonItem>
                ))}
            </div>}
            {segment === "new" && <div className="my-4">
                {/* <pre>{JSON.stringify(state.brand_id, null, 2)}</pre> */}
                <IonItem fill='solid' className='mb-1'>
                    <IonLabel color='medium' position='stacked'>Brand</IonLabel>
                    <IonSelect interface='action-sheet' placeholder='Select Brand' interfaceOptions={{ header: "Select Brand" }} color='green' value={state.brand_id} onIonChange={e => setState(pv => ({ ...pv, brand_id:e.detail.value }))}>
                        {/* <IonSelectOption color="green" value={0}>Select Brand</IonSelectOption> */}
                        {brands.map(value => (
                            <IonSelectOption key={value.id} value={value.id}>{value.name}</IonSelectOption>
                        ))}
                    </IonSelect>
                    {!isFirst && errors.brand_id && <>
                        <IonNote slot="helper" color="danger">Brand cannot be empty</IonNote>
                        <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                    </>
                    }
                </IonItem>
                <IonItem fill='solid' className='mb-1'>
                    <IonLabel color='medium' position="stacked">Recipe's name</IonLabel>
                    <IonSelect interface='action-sheet' placeholder='Select Recipe' interfaceOptions={{ header: "Select Recipe" }} value={state.type_id} onIonChange={e => setState(pv => ({ ...pv, type_id:e.detail.value }))}>
                        {typeFilter.map(value => (<IonSelectOption key={value.id} value={value.id}>{value.type}</IonSelectOption>))}
                    </IonSelect>
                    <IonButtons slot="end">
                        <IonButton onClick={handleAdd}>
                            <IonIcon color="green" slot="icon-only" icon={addCircleOutline} />
                        </IonButton>
                    </IonButtons>
                    {/* <IonInput type="text" onIonChange={e => setState({ ...state, name:e.detail.value })} value={state.name} inputmode="text" /> */}
                    {!isFirst && errors.name &&
                        <>
                            <IonNote slot="helper" color="danger">Recipe's name is a required field</IonNote>
                            <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                        </>
                    }
                </IonItem>
                <IonItem fill='solid' className='mb-1'>
                    <IonLabel color='medium' position="stacked">Number of Bread Per Recipe</IonLabel>
                    <IonInput type="text" onIonChange={e => setState(pv => ({ ...pv, quantity: parseInt(e.detail.value) }))} value={state.quantity || 0} inputmode="numeric" />
                    {!isFirst && errors.quantity &&
                        <>
                            <IonNote slot="helper" color="danger">Quantity is a required field</IonNote>
                            <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                        </>
                    }
                </IonItem>
                <div className="flex mb-1">
                    <IonItem fill='solid' className='w-1/2'>
                        <IonLabel color='medium' position="stacked">Input Price</IonLabel>
                        <IonInput type="text" onIonChange={e => setState(pv => ({ ...pv, price: parseInt(e.detail.value) }))} value={state.price || 0} inputmode="numeric" />
                        {!isFirst && errors.price &&
                            <>
                                <IonNote slot="helper" color="danger">Price is a required field</IonNote>
                                <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                            </>
                        }
                    </IonItem>
                    <IonItem fill='solid' className='w-1/2 mr-1'>
                        <IonLabel color='medium' position="stacked">Calculated Price</IonLabel>
                        <IonInput type="text" readonly onIonChange={e => setState(pv => ({ ...pv, calcPrice: parseInt(e.detail.value) }))} value={state.calcPrice || 0} inputmode="numeric" />
                    </IonItem>
                </div>
                <IonItemDivider>Ingredients</IonItemDivider>
                <IonItem fill='solid'>
                    <IonLabel position="stacked" color="medium">Miscellaneous</IonLabel>
                    <IonInput value={state.misc || 0} onIonChange={e => setState(pv => ({ ...pv, misc: parseInt(e.detail.value) }))} />
                </IonItem>
                {state.ingredients.map((value, index) => {
                    return (
                        <div key={index} className="flex flex-row mb-1">
                            <IonItem fill='solid' className='w-[35%]'>
                                <IonLabel color='medium' position='stacked'>Ingredient</IonLabel>
                                <IonSelect interface='action-sheet' interfaceOptions={{ header: "Select Ingredient" }} placeholder="Select Ingredient" value={value.ingredient_id} onIonChange={e => handleChange(e.detail.value, "ingredient_id", index)}>
                                    {ingredients.map(value => (
                                        <IonSelectOption key={value.id} value={value.id}>{value.name}</IonSelectOption>
                                    ))}
                                </IonSelect>
                            </IonItem>
                            <IonItem fill='solid' className='w-[30%]'>
                                <IonLabel color='medium' position='stacked'>Quantity</IonLabel>
                                <IonInput type="text" inputmode='numeric' value={value.quantity || 0} onIonChange={e => handleChange(parseInt(e.detail.value), "quantity", index)} />
                            </IonItem>
                            <IonItem fill='solid' className='w-[35%]'>
                                <IonLabel color='medium' position='stacked'>Unit</IonLabel>
                                <IonSelect interface='action-sheet' interfaceOptions={{ header: "Select Unit" }} placeholder="Select Unit" value={value.unit_id} onIonChange={e => handleChange(e.detail.value, "unit_id", index)}>
                                    {units.map(value => (
                                        <IonSelectOption key={value.id} value={value.id}>{value.name}</IonSelectOption>
                                    ))}
                                </IonSelect>
                            </IonItem>
                        </div>
                    )
                })}
            </div>}
            <IonModal isOpen={showModal} onDidDismiss={handleDismiss}>
                <IonCard>
                    <IonCardHeader>
                        <IonToolbar className='ion-no-padding'>
                            <IonButtons slot='start'>
                                <IonButton onClick={() => setShowModal(false)}>
                                    <IonIcon slot='icon-only' icon={arrowBack} />
                                </IonButton>
                            </IonButtons>
                            <IonCardTitle>Add Product</IonCardTitle>
                        </IonToolbar>
                    </IonCardHeader>
                    <IonCardContent>
                        {/* <pre>{JSON.stringify(state, null, 2)}</pre> */}
                        <IonItem fill='solid' className='mb-1'>
                            <IonLabel color='medium' position='stacked'>Brand</IonLabel>
                            <IonSelect interface='action-sheet' placeholder='Select Brand' interfaceOptions={{ header: "Select Brand" }} color='green' value={product.brand_id} onIonChange={e => setProduct(pv => ({ ...pv, brand_id:e.detail.value }))}>
                                {/* <IonSelectOption color="green" value={0}>Select Brand</IonSelectOption> */}
                                {brands.map(value => (
                                    <IonSelectOption key={value.id} value={value.id}>{value.name}</IonSelectOption>
                                ))}
                            </IonSelect>
                            {!isFirst && errors.brand_id && <>
                                <IonNote slot="helper" color="danger">Brand cannot be empty</IonNote>
                                <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                            </>
                            }
                        </IonItem>
                        <IonItem fill="solid">
                            <IonLabel position="stacked" color="medium">enter Name</IonLabel>
                            <IonInput placeholder='Enter Name' value={product.type} onIonChange={e => setProduct(pv => ({ ...pv, type:e.detail.value }))} />
                        </IonItem>
                        <IonButton onClick={saveProduct} color="green" expand="block">
                            <IonIcon slot="start" icon={save} />
                            Save
                        </IonButton>
                    </IonCardContent>
                </IonCard>

            </IonModal>
            <IonFooter>
                <IonButton color='green' expand='block' onClick={() => handleSubmit()}>
                    <IonIcon slot="start" icon={addCircleOutline} />
                    Add Recipe</IonButton>
            </IonFooter>
        </>
    );
};

export default Recipes;