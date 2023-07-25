import { Http } from '@capacitor-community/http';
import { InputChangeEventDetail, IonButton, IonCol, IonContent, IonFooter, IonGrid, IonIcon, IonInput, IonItem, IonItemDivider, IonLabel, IonNote, IonPage, IonRow, IonSegment, IonSegmentButton, useIonAlert, useIonLoading, useIonToast, useIonViewWillEnter } from '@ionic/react';
import { addCircleOutline, thumbsUp } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router';
import Toolbar from '../../components/toolbar';
import { useRecoilState, useRecoilValue } from 'recoil';
import { urlAtom } from '../../recoil/urlAtom';
import { User, userAtom } from '../../recoil/userAtom';

const Closing: React.FC = () => {
    const [user, setUser] = useRecoilState<User>(userAtom);
    const href = useRecoilValue<string>(urlAtom);
    const [brands, setBrands] = useState([{ id: 0, name: "" }]);
    const [brand, setBrand] = useState(0);
    const [items, setItems] = useState([{ id: 0, type: "", quantity: 0, isAdded: false, processed: false, first: true }]);
    const [present, dismiss] = useIonLoading();
    const [toasted] = useIonToast();
    const isClean = useRef(false);
    const history = useHistory();
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
                setBrand(data.brands[0].id);
                //   setUnits(data.units);
            }
        }).finally(() => {
            dismiss();
        });
        return () => {
            isClean.current = false;
        }
    }, []);
    useIonViewWillEnter(()=>{
        if(true){
            // history.push("/dispatch/opening");
            setUser({...user, setClosing: true});
        }
    })
    useEffect(() => {
        isClean.current = true;
        // present("Loading...");
        Http.request({
            method: "GET",
            url: href + "/api/get/brand/closing/items/" + brand,
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            }
        }).then(({ data }) => {
            if (isClean.current && data.success) {
                setItems(data.items);
                //   setUnits(data.units);
            }
        }).finally(() => {
            // dismiss();
        });
        return () => {
            isClean.current = false;
        }
    }, [brand]);

    const handleChange = (index: number, e: CustomEvent<InputChangeEventDetail>) => {
        let item = items;
        item[index].quantity = parseInt(e.detail.value);
        setItems([...item]);
    }

    const handleAdded = (index: number) => {
        let item = items;
        if (items[index].quantity === 0 || items[index].quantity === undefined) {
            item[index].first = false;
            setItems([...item]);
            toasted(items[index].type + " quantity cannot be empty", 2000);
        } else {
            item[index].isAdded = true;
            present();
            Http.request({
                method: "POST",
                url: href + "/api/set/closing/",
                headers: {
                    'Content-Type': 'application/json',
                    'Data-Type': 'json',
                    'Authorization': 'Bearer ' + user.token
                },
                data: { ...item[index] }
            }).then(({ data }) => {
                if (data.success) {
                    setItems([...item]);
                }
            }).finally(() => {
                dismiss();
            });
        }
    }
    const [pop] = useIonAlert();
    const handleDone = () => {
        pop({
            message: "If there are any with 0 value, they would be saved as 0",
            header: "Are you are done for all brands?",
            buttons: [
                {text: "Yes", role: "destructive", handler: handleYes},
                {text: "No", role: "cancel"}
            ]
        });
    }
    const handleYes = () => {
        toasted({
            message: "You can log out now!",
            color: "green",
            duration: 5000,
            translucent: true,
            icon: thumbsUp

        });
    }
    return (
        <IonPage>
            <Toolbar title="Closing stock" />
            <IonContent className="ion-padding">
                {/* <pre>{JSON.stringify(user, null, 2)}</pre> */}
                <IonSegment value={brand.toString()} onIonChange={e => setBrand(parseInt(e.detail.value))}>
                    {brands.map(value=>(<IonSegmentButton key={value.id} value={value.id.toString()}>{value.name}</IonSegmentButton>))}
                </IonSegment>
                {/* <IonItem fill='solid'>
                    <IonLabel position='floating'>Brand</IonLabel>
                    <IonSelect interface='action-sheet' value={brand} onIonChange={e => setBrand(e.detail.value)}>
                        <IonSelectOption value={0}>Select Brand</IonSelectOption>
                        {brands.map(value => (
                            <IonSelectOption key={value.id} value={value.id}>{value.name}</IonSelectOption>
                        ))}
                    </IonSelect>
                </IonItem> */}
                {items.length > 0 && <IonItemDivider>Items</IonItemDivider>}
                {items.map((value, index) => (
                    <IonItem fill='solid' key={value.id} disabled={value.isAdded || value.processed}>
                        <IonLabel position='floating'>{value.type}</IonLabel>
                        <IonInput inputmode="numeric" value={value.quantity || 0} onIonChange={e => handleChange(index, e)} />
                        <IonButton slot='end' color='green' onClick={() => handleAdded(index)}>
                            <IonIcon slot="start" icon={addCircleOutline} />
                            Add
                        </IonButton>
                        {(function(){
                            if (!value.first && value.quantity === 0) {
                                return <IonNote slot='helper' color='danger'>Please enter number of items received</IonNote>
                            }
                        })()}
                        {/* { (value.processed === 0 || value.quantity === 0) && } */}
                    </IonItem>
                ))}

            </IonContent>
            <IonFooter>
                {JSON.stringify([user.setClosing, user.setOpening])}
                <IonGrid>
                    <IonRow>
                        <IonCol>
                            <IonButton color='green' expand='block' onClick={handleDone}>Done</IonButton>
                        </IonCol>
                        <IonCol>
                            <IonButton color='danger' expand='block' onClick={()=>setUser({...user, setClosing: false, setOpening: true})}>Cancel</IonButton>
                        </IonCol>
                    </IonRow>
                </IonGrid>
                
            </IonFooter>
        </IonPage>
    );
};

export default Closing;