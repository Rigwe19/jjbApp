import { Http } from '@capacitor-community/http';
import { IonButton, IonContent, IonFooter, IonIcon, IonInput, IonItem, IonItemDivider, IonLabel, IonNote, IonPage, IonRefresher, IonRefresherContent, IonSelect, IonSelectOption, useIonAlert, useIonLoading, useIonToast } from '@ionic/react';
import React, { useEffect, useRef, useState } from 'react';
import convert from "convert-units";
import { alertCircleOutline, saveOutline } from 'ionicons/icons';
import Toolbar from '../../components/toolbar';
import { useRecoilValue } from 'recoil';
import { urlAtom } from '../../recoil/urlAtom';
import { User, userAtom } from '../../recoil/userAtom';

interface ILocations {
    state: string;
    name: string;
    id: number;
}
interface IIngredients {
    id: number;
    type: string;
    quantity: number;
    size: number;
    unit: number;
    item_id: number;
}
interface IState {
    ingredient_id: number;
    location_id: number;
    brand_id: number;
    quantity: number;
    item_id: number;
}
interface IUnit {
    unit: string;
    base: string;
    id: number;
}
const Issueance: React.FC = () => {
    const user = useRecoilValue<User>(userAtom);
    const href = useRecoilValue<string>(urlAtom);
    const [brands, setBrands] = useState([{ id: 0, name: "" }]);
    const [locations, setLocations] = useState<ILocations[]>([]);
    const [ingredients, setIngredients] = useState<IIngredients[]>([]);
    const [ingredient, setIngredient] = useState<IIngredients>({ id: 0, quantity: 0, size: 0, type: "", unit: 0, item_id: 0, });
    const [units, setUnits] = useState<IUnit[]>([]);
    const [unit, setUnit] = useState<IUnit>({ base: "", unit: "", id: 0 });
    const [max, setMax] = useState(0);
    const [constMax, setConstMax] = useState(0);
    const initialState: IState = {
        ingredient_id: 0,
        location_id: 0,
        brand_id: 0,
        quantity: 0,
        item_id: 0,
    }
    const isValid = useRef(false);
    const [isFirst, setIsFirst] = useState(true);
    const [errors, setErrors] = useState({
        ingredient_id: false,
        quantity: false,
        location_id: false,
        brand_id: false,
    });
    const [state, setState] = useState<IState>(initialState);
    const [brand, setBrand] = useState(0);
    const isClean = useRef(false);
    const [toasted] = useIonToast();
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
        let newIngredient = ingredients.find(ingredient => {
            return ingredient.id === state.item_id;
        });
        if (newIngredient !== undefined) {
            setIngredient(newIngredient);
            setState(pv => ({ ...pv, ingredient_id: newIngredient.item_id }));
            let newUnit = units.find(value => {
                return newIngredient.unit.toString() === value.id.toString();
            });
            if (newUnit !== undefined) {
                setUnit(newUnit);
                setMax(convert(newIngredient.quantity).from(newUnit.base).to(newUnit.unit));
                setConstMax(convert(newIngredient.quantity).from(newUnit.base).to(newUnit.unit));
            }
        }
    }, [state.item_id]);
    useEffect(() => {
        setMax(constMax - state.quantity);
        if (state.quantity > constMax) {
            setState(pv=>({ ...pv, quantity: constMax }));
        }
    }, [state.quantity]);

    const handleChange = (value: number, name: string) => {
        setState(pv=>({ ...pv, [name]: value }));
    }

    const handleSubmit = () => {
        isValid.current = true;
        let err = { ...errors };
        Object.entries(state).forEach(value => {
            // console.log(value);
            if (value[1] === 0) {
                isValid.current = false;
                err[value[0]] = true;
                setIsFirst(false);
            } else {
                err[value[0]] = false;
            }
        });
        setErrors({ ...err });
        if (isValid.current) {
            // console.log({...state, quantity: convert(state.quantity).from(unit.unit).to(unit.base)*ingredient.size})
            present("Saving...");
            Http.request({
                method: "POST",
                url: href + "/api/store/add/issueance",
                headers: {
                    'Content-Type': 'application/json',
                    'Data-Type': 'json',
                    'Authorization': 'Bearer ' + user.token
                },
                data: { ...state, quantity: convert(state.quantity).from(unit.unit).to(unit.base) }
            }).then(({ data }) => {
                if (isClean.current && data.success) {
                    setState(initialState);
                    setMax(0);
                    setIngredients(data.ingredients);
                }
            }).finally(() => {
                dismiss();
            });
        }
    }
    const handleRefresh = (e?:any) => {
        present("Loading...");
        Http.request({
            method: "GET",
            url: href + "/api/get/store/issueance",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            }
        }).then(({ data }) => {
            if (isClean.current && data.success) {
                setBrands(data.brands);
                setLocations(data.locations);
                setIngredients(data.ingredients);
                setUnits(data.units);
            }
        }).finally(() => {
            dismiss();
            if(e !== undefined){
                e.detail.complete();
            }
        });
    }
    return (
        <IonPage>
            <Toolbar title="Store Issueance" />
            <IonContent className="ion-padding">
                <IonRefresher slot='fixed' onIonRefresh={e=>handleRefresh(e)} pullFactor={0.5} pullMin={100} pullMax={200} closeDuration="200ms">
                    <IonRefresherContent pullingText="pull to refresh"></IonRefresherContent>
                </IonRefresher>
                {/* <pre>{JSON.stringify(state, null, 2)}</pre> */}
                <IonItem fill='solid' className='mb-1'>
                    <IonLabel position='floating'>Ingredient</IonLabel>
                    <IonSelect interface='action-sheet' color='green' value={state.item_id} onIonChange={e => handleChange(e.detail.value, "item_id")}>
                        <IonSelectOption color="green" value={0}>Select Ingredient</IonSelectOption>
                        {ingredients.map(value => (
                            <IonSelectOption key={value.id} value={value.id}>{value.type}</IonSelectOption>
                        ))}
                    </IonSelect>
                    {!isFirst && errors.ingredient_id && <>
                        <IonNote slot="helper" color="danger">Ingredient cannot be empty</IonNote>
                        <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                    </>
                    }
                </IonItem>
                <IonItem fill='solid' className='mb-1'>
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
                </IonItem>
                <IonItem fill='solid' className='mb-1'>
                    <IonLabel position='floating'>Brand</IonLabel>
                    <IonSelect interface='action-sheet' color='green' value={state.brand_id} onIonChange={e => handleChange(e.detail.value, "brand_id")}>
                        <IonSelectOption color="green" value={0}>Select Brand</IonSelectOption>
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
                <IonItemDivider>Available quantity - {`${max}${unit?.unit}`}</IonItemDivider>
                <IonItem fill='solid' className="mb-1">
                    <IonLabel position="floating">Quantity</IonLabel>
                    <IonInput value={state.quantity || 0} onIonChange={e => handleChange(parseInt(e.detail.value), "quantity")} inputmode="numeric" max={constMax} />
                    {!isFirst && errors.quantity && <>
                        <IonNote slot="helper" color="danger">Quantity cannot be empty</IonNote>
                        <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                    </>
                    }
                </IonItem>
            </IonContent>
            <IonFooter>
                <IonButton expand="block" onClick={handleSubmit} color="green">
                    <IonIcon icon={saveOutline} slot="start" />
                    Save</IonButton>
            </IonFooter>
        </IonPage>
    );
};

export default Issueance;