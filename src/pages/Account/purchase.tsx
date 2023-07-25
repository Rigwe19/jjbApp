import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonFooter, IonIcon, IonInput, IonItem, IonItemDivider, IonItemGroup, IonLabel, IonModal, IonSelect, IonSelectOption, IonTextarea } from '@ionic/react';
import { addCircleOutline, arrowBack, saveOutline } from 'ionicons/icons';
import React, { useState } from 'react';

const Purchase: React.FC = () => {
    const [supplier, setSupplier] = useState([]);
    const [modes, setModes] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [items, setItems] = useState([]);

    const [state, setState] = useState({
        invoice: 0,
        supplier_id: 0,
        mode_id: 0,
    });
    const handleChange = (value: any, key: string) => {
        setState({ ...state, [key]: value });
    }

    const handleDismiss = () => {
        setIsOpen(false);
    }
    return (
        <>
        <IonContent className="ion-padding">
            <IonItem fill='solid' className='mb-1'>
                <IonLabel color='medium' position="stacked">Invoice Number</IonLabel>
                <IonInput placeholder='invoice number' />
            </IonItem>
            <IonItem fill='solid' className='mb-1'>
                <IonLabel color='medium' position="stacked">Supplier Name</IonLabel>
                <IonSelect interface='action-sheet' placeholder='select supplier' value={state.supplier_id} onIonChange={e => handleChange(e.detail.value, "supplier_id")}>
                    {supplier.map(value => (<IonSelectOption key={value.id} value={value.id}>{value.name}</IonSelectOption>))}
                </IonSelect>
                <IonButtons slot='end'>
                    <IonButton onClick={() => setIsOpen(true)}>
                        <IonIcon color='success' slot="icon-only" icon={addCircleOutline} />
                    </IonButton>
                </IonButtons>
            </IonItem>
            <IonItem fill='solid' className='mb-1'>
                <IonLabel color='medium' position="stacked">Purchase mode</IonLabel>
                <IonSelect interface='action-sheet' placeholder='select purchase mode' value={state.mode_id} onIonChange={e => handleChange(e.detail.value, "mode_id")}>
                    {modes.map(value => (<IonSelectOption key={value.id} value={value.id}>{value.mode}</IonSelectOption>))}
                </IonSelect>
            </IonItem>
            <IonItemGroup>
                <IonItemDivider>Items</IonItemDivider>
                <div className="flex">
                    <IonItem fill='solid' className='mb-1 w-1/2'>
                        <IonLabel color='medium' position="stacked">Brand</IonLabel>
                        <IonSelect interface='action-sheet' placeholder='select brand' value={state.mode_id} onIonChange={e => handleChange(e.detail.value, "brand_id")}>
                            {items.map(value => (<IonSelectOption key={value.id} value={value.id}>{value.name}</IonSelectOption>))}
                        </IonSelect>
                    </IonItem>
                    <IonItem fill='solid' className='mb-1 w-1/2'>
                        <IonLabel color='medium' position="stacked">Item Name</IonLabel>
                        <IonSelect interface='action-sheet' placeholder='select item' value={state.mode_id} onIonChange={e => handleChange(e.detail.value, "brand_id")}>
                            {items.map(value => (<IonSelectOption key={value.id} value={value.id}>{value.type}</IonSelectOption>))}
                        </IonSelect>
                    </IonItem>
                </div>

                <div className="flex">
                    <IonItem fill='solid' className='mb-1 w-1/2'>
                        <IonLabel color='medium' position="stacked">Item Quantity</IonLabel>
                        <IonInput />
                    </IonItem>
                    <IonItem fill='solid' className='mb-1 w-1/2'>
                        <IonLabel color='medium' position="stacked">Item Unit Price</IonLabel>
                        <IonInput />
                    </IonItem>
                </div>
                <IonButton expand='block' color='warning'>Add</IonButton>
            </IonItemGroup>
            <IonModal onDidDismiss={handleDismiss} isOpen={isOpen}>
                <IonCard>
                    <IonCardHeader>
                        <IonCardTitle>
                            <IonItem lines='none'>
                                <IonButtons slot='start'>
                                    <IonButton onClick={() => setIsOpen(false)}>
                                        <IonIcon slot='icon-only' icon={arrowBack} />
                                    </IonButton>
                                </IonButtons>
                                <IonLabel>Create new supplier</IonLabel>
                            </IonItem>
                        </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        <IonItem className='mb-1' fill='solid'>
                            <IonLabel color='medium' position="stacked">Supplier Code</IonLabel>
                            <IonInput />
                        </IonItem>
                        <IonItem className='mb-1' fill='solid'>
                            <IonLabel color='medium' position="stacked">Supplier Name</IonLabel>
                            <IonInput />
                        </IonItem>
                        <IonItem className='mb-1' fill='solid'>
                            <IonLabel color='medium' position="stacked">Supplier Phone Number</IonLabel>
                            <IonInput />
                        </IonItem>
                        <IonItem className='mb-1' fill='solid'>
                            <IonLabel color='medium' position="stacked">Supplier Address</IonLabel>
                            <IonTextarea />
                        </IonItem>
                        <IonItem className='mb-1' fill='solid'>
                            <IonLabel color='medium' position="stacked">Branch Code</IonLabel>
                            <IonInput />
                        </IonItem>
                        <IonButton expand='block' color='green'>
                            <IonIcon slot="start" icon={saveOutline} />
                            Save
                        </IonButton>
                    </IonCardContent>
                </IonCard>
            </IonModal>
        </IonContent>
            <IonFooter className='px-4'>
                <IonItemGroup className='flex'>
                    <IonItem fill='solid' className='w-1/3'>
                        <IonLabel color='medium' position='stacked'>Total</IonLabel>
                        <IonInput readonly value={0} />
                    </IonItem>
                    <IonItem className='w-1/3' fill='solid'>
                        <IonLabel color='medium' position="stacked">Paid</IonLabel>
                        <IonInput value={0} />
                    </IonItem>
                    <IonItem className='w-1/3' fill='solid'>
                        <IonLabel color='medium' position="stacked">Balance</IonLabel>
                        <IonInput readonly value={0} />
                    </IonItem>
                </IonItemGroup>
                <IonButton color='green' expand='block'>
                    <IonIcon slot="start" icon={saveOutline} />
                    Save
                </IonButton>
            </IonFooter>
        </>
    );
};

export default Purchase;