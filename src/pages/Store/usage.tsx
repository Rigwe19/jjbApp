import { Http } from '@capacitor-community/http';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonFooter, IonIcon, IonInput, IonItem, IonItemDivider, IonLabel, IonNote, IonPage, IonRefresher, IonRefresherContent, IonSelect, IonSelectOption, useIonAlert, useIonLoading } from '@ionic/react';
import { alertCircleOutline, checkmarkCircle, closeCircle, closeCircleOutline, saveOutline } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';
import convert from 'convert-units';
import Toolbar from '../../components/toolbar';
import { useRecoilValue } from 'recoil';
import { urlAtom } from '../../recoil/urlAtom';
import { User, userAtom } from '../../recoil/userAtom';

interface ILocations {
    state: string;
    name: string;
    id: number;
}
interface IState {
    // ingredient_id: number;
    // location_id: number;
    brand_id: number;
    recipe_id: number;
    quantity: number;
    bag: number;
}
interface IError {
    brand_id?: boolean;
    recipe_id?: boolean;
    quantity?: boolean;
    bag?: boolean;
}
const Usage: React.FC = () => {
    const user = useRecoilValue<User>(userAtom);
    const href = useRecoilValue<string>(urlAtom);
    const [brands, setBrands] = useState([{ id: 0, name: "" }]);
    const [locations, setLocations] = useState<ILocations[]>([]);
    const [recipes, setRecipes] = useState([]);
    const [recipe, setRecipe] = useState<any[]>([]);
    const [ingredients, setIngredients] = useState([]);
    const [filter, setFilter] = useState([]);
    const initialState: IState = {
        // ingredient_id: 0,
        // location_id: 0,
        brand_id: 0,
        recipe_id: 0,
        quantity: 0,
        bag: 0,
    }
    const [isFirst, setIsFirst] = useState(true);
    const [errors, setErrors] = useState<IError>({
        // ingredient_id: false,
        quantity: false,
        // location_id: false,
        brand_id: false,
        recipe_id: false,
        bag: false,
    });
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
    const [state, setState] = useState<IState>(initialState);
    const isClean = useRef(false);
    const [present, dismiss] = useIonLoading();
    const [alerted] = useIonAlert();
    useEffect(() => {
        isClean.current = true;
        handleRefresh();
        return () => {
            isClean.current = false;
        }
    }, []);

    useEffect(() => {
        isClean.current = true;
        let filter = recipes.filter(value => { return value.brand_id === state.brand_id });
        setFilter(filter);
        let filters = lists.filter(value => {
            return value.brand_id === state.brand_id;
        });
        if (filters !== undefined) {
            setFilterLists(filters);
        }
        return () => {
            isClean.current = false;
        }
    }, [state.brand_id]);
    useEffect(() => {
        let index: any = recipes.findIndex(value => {
            return value.id === state.recipe_id
        });
        if (index !== undefined) {
            setRecipe(ingredients[index]);
        }
    }, [state.recipe_id]);

    const handleChange = (value: number, name: string) => {
        setState({ ...state, [name]: value });
    }

    const handleSubmit = () => {
        let isValid = true;
        let err = {};
        Object.entries(state).forEach(value => {
            if (value[1] === 0) {
                isValid = false;
                err[value[0]] = true;
            } else {
                err[value[0]] = false;
            }
        });
        if (isValid) {
            // console.log({...state, quantity: convert(state.quantity).from(unit.unit).to(unit.base)*ingredient.size})
            present("Saving...");
            let reci: { ingredient_id: any; quantity: any; }[] = [];
            recipe.forEach(value=> {
                reci.push({
                    ingredient_id: value.ingredient_id,
                    quantity: convert(value.quantity * state.quantity * state.bag).from(value.unit).to(value.base),
                });
            });
            Http.request({
                method: "POST",
                url: href + "/api/store/add/usage",
                headers: {
                    'Content-Type': 'application/json',
                    'Data-Type': 'json',
                    'Authorization': 'Bearer ' + user.token
                },
                data: {...state, recipe: reci}
            }).then(({ data }) => {
                if (isClean.current && data.success) {
                    setState(initialState);
                    setIngredients(data.ingredients);
                    setRecipe([]);
                    alerted({
                        message: "Saved Successfully",
                        buttons: [
                            {text: "Okay", role: "cancel"}
                        ]
                    });
                }
            }).finally(() => {
                dismiss();
            });
        } else {
            setErrors(err);
            setIsFirst(false);
            console.log(err);

        }
    }
    const handleRefresh = (e?: any) => {
        present("Loading...");
        Http.request({
            method: "GET",
            url: href + "/api/get/store/usage",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            }
        }).then(({ data }) => {
            if (isClean.current && data.success) {
                setBrands(data.brands);
                setLocations(data.locations);
                setRecipes(data.recipes);
                setIngredients(data.ingredients);
                setLists(data.lists);
            }
        }).finally(() => {
            dismiss();
            if (e !== undefined) {
                e.detail.complete();
            }
        });
    }

    return (
        <IonPage>
            <Toolbar title="Usage" />
            <IonContent className="ion-padding">
                <IonRefresher slot='fixed' onIonRefresh={e => handleRefresh(e)} pullFactor={0.5} pullMin={100} pullMax={200} closeDuration="200ms">
                    <IonRefresherContent pullingText="pull to refresh"></IonRefresherContent>
                </IonRefresher>
                <IonCard>
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
                </IonCard>
                {/* <IonItem fill='solid' className='mb-1'>
                    <IonLabel position='floating'>Location</IonLabel>
                    <IonSelect interface='action-sheet' color='green' value={state.location_id} onIonChange={e => handleChange(e.detail.value, "location_id")}>
                        <IonSelectOption color="green" value={0}>Select Location</IonSelectOption>
                        {locations.map(value => (
                            <IonSelectOption key={value.id} value={value.id}>{value.name} in {value.state}</IonSelectOption>
                        ))}
                    </IonSelect>
                    {!isFirst && errors.location_id && <>
                        <IonNote slot="helper" color="danger">Location cannot be empty</IonNote>
                        <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                    </>
                    }
                </IonItem> */}
                <IonItem fill='solid' className='mb-1'>
                    <IonLabel position='floating'>Brand</IonLabel>
                    <IonSelect interface='action-sheet' interfaceOptions={{ header: "Select Brand" }} placeholder="Select Brand" color='green' value={state.brand_id} onIonChange={e => handleChange(e.detail.value, "brand_id")}>
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
                    <IonLabel position='floating'>Recipe</IonLabel>
                    <IonSelect interface='action-sheet' interfaceOptions={{ header: "Select Recipe" }} placeholder="Select Recipe" color='green' value={state.recipe_id} onIonChange={e => handleChange(e.detail.value, "recipe_id")}>
                        {/* <IonSelectOption color="green" value={0}></IonSelectOption> */}
                        {filter.map(value => (
                            <IonSelectOption key={value.id} value={value.id}>{value.type}</IonSelectOption>
                        ))}
                    </IonSelect>
                    {!isFirst && errors.recipe_id && <>
                        <IonNote slot="helper" color="danger">Recipe cannot be empty</IonNote>
                        <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                    </>
                    }
                </IonItem>
                <IonItem fill='solid' className='mb-1'>
                    <IonLabel position='floating'>Bag Measuremnet</IonLabel>
                    <IonSelect interface='action-sheet' interfaceOptions={{ header: "Select Bags" }} placeholder="Select Bags" inputmode='numeric' value={state.bag || 0} onIonChange={e => handleChange(e.detail.value, "bag")}>
                        {/* <IonSelectOption value={0}>Select Bags</IonSelectOption> */}
                        <IonSelectOption value={1}>1 bag</IonSelectOption>
                        <IonSelectOption value={2}>2 bags</IonSelectOption>
                    </IonSelect>
                    {!isFirst && errors.recipe_id && <>
                        <IonNote slot="helper" color="danger">Recipe cannot be empty</IonNote>
                        <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                    </>
                    }
                </IonItem>
                <IonItem fill='solid' className='mb-1'>
                    <IonLabel position='floating'>Quantity</IonLabel>
                    <IonInput inputmode='numeric' value={state.quantity || 0} onIonChange={e => handleChange(parseInt(e.detail.value), "quantity")} />
                    {!isFirst && errors.recipe_id && <>
                        <IonNote slot="helper" color="danger">Recipe cannot be empty</IonNote>
                        <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                    </>
                    }
                </IonItem>
                {recipe !== undefined && recipe.length > 0 && <IonItemDivider>Recipe</IonItemDivider>}
                {recipe !== undefined && recipe.map((value, index) => (
                    <IonItem fill='solid' key={"item_key_" + index} className="mb-1">
                        <div className="flex justify-between items-center w-full">
                            <span>{value.type}</span>
                            <span>{convert(value.quantity * (state.quantity || 1) * (state.bag || 1)).from(value.unit).to(value.base) + value.base}</span>
                            <IonNote>available {value.available + value.base}</IonNote>
                            {(function () {
                                let quantity = convert(value.quantity * (state.quantity || 1) * (state.bag || 1)).from(value.unit).to(value.base);
                                if (value.available >= quantity) {
                                    return <IonIcon icon={checkmarkCircle} color="success" />
                                } else {
                                    return <IonIcon icon={closeCircle} color="danger" />
                                }
                            })()}
                        </div>
                    </IonItem>
                ))}
                {/* <pre>{JSON.stringify(state, null, 2)}</pre> */}
            </IonContent>
            <IonFooter>
                <IonButton expand="block" color="green" onClick={handleSubmit} >
                    <IonIcon slot="start" icon={saveOutline} />
                    Save
                </IonButton>
            </IonFooter>
        </IonPage>
    );
};

export default Usage;