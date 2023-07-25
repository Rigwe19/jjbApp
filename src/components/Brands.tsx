import { IonAvatar, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonModal, IonNote, IonText, IonThumbnail, useIonLoading, useIonToast } from '@ionic/react';
import React, { useEffect, useRef, useState } from 'react';
import { FilePicker } from '@robingenz/capacitor-file-picker';
import { addCircleOutline, alertCircleOutline, arrowBack, cameraOutline } from 'ionicons/icons';
import { Http } from '@capacitor-community/http';
import { useRecoilValue } from 'recoil';
import { urlAtom } from '../recoil/urlAtom';
import { User, userAtom } from '../recoil/userAtom';

const Brands: React.FC = () => {
    const user = useRecoilValue<User>(userAtom);
    const href = useRecoilValue<string>(urlAtom);
    const isClean = useRef(false);
    const [isFirst, setIsFirst] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const isValid = useRef(false);
    const [toasted] = useIonToast();
    const [show, hide] = useIonLoading();
    const [brand, setBrand] = useState({
        id: 0,
        name: "",
        logo: ""
    });
    const [brands, setBrands] = useState([{ name: "", logo: "", id: 0 }]);
    const result = useRef<any>({});
    useEffect(() => {
        isClean.current = true;
        show("Loading...")
        Http.request({
            method: "GET",
            url: href + "/api/ceo/get/brand",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            },
        }).then(({ data }) => {
            if (data.success) {
                setBrands(data.brand);
                // reset();
            }
        }).finally(() => {
            hide();
        });
        return () => {
            isClean.current = false;
        }
    }, [])

    const select = async () => {
        let image: any[] = [];
        result.current = await FilePicker.pickFiles({
            types: ['image/*'],
            multiple: false,
            readData: true
        });
        result.current.files.forEach((element: any) => {
            setBrand({ ...brand, logo: "data:" + element.mimeType + ";base64," + element.data });
        });
    }
    const handleSubmit = () => {
        isValid.current = true;
        Object.keys(brand).forEach((element: any) => {
            if (brand[element] === "") {
                isValid.current = false;
                setIsFirst(false);
            }
        });
        if (isValid.current) {
            show("Saving...")
            Http.request({
                method: "POST",
                url: href + "/api/ceo/add/brand",
                headers: {
                    'Content-Type': 'application/json',
                    'Data-Type': 'json',
                    'Authorization': 'Bearer ' + user.token
                },
                data: brand
            }).then(({ data }) => {
                if (data.success) {
                    setIsFirst(true);
                    setBrand({
                        id: 0,
                        name: "",
                        logo: "",
                    });
                    // reset();
                }
            }).finally(() => {
                hide();
            });
        } else {
            toasted("Some field(s) can not be empty!", 3000);
        }
    }
    const handleShow = (type: string, value: any = {}) => {
        if(type === "new") {
            setBrand({id: 0, logo: "", name: ""});
            setShowModal(true);
        }else{
            setBrand(value);
            setShowModal(true);
        }
    }
    return (
        <>
            <IonButton color='green' className='mb-1' onClick={() => handleShow("new")}>Add New Brand</IonButton>
            {brands.map(value => {
                return (
                    <IonItem fill='solid' onClick={() => handleShow("old", value)} button key={value.id} className='mb-1'>
                        <IonAvatar slot="start">
                            <IonIcon src={href + value.logo} />
                        </IonAvatar>
                        <IonText>{value.name}</IonText>
                    </IonItem>
                )
            })}
            <IonModal isOpen={showModal} className="">
                <IonCard>
                    <IonCardHeader>
                        <IonCardTitle>
                            <IonItem lines='none'>
                                <IonButtons slot='start'>
                                    <IonButton onClick={() => setShowModal(false)}>
                                        <IonIcon slot='icon-only' icon={arrowBack} />
                                    </IonButton>
                                </IonButtons>
                                <IonLabel>{brand.id !== 0?"Edit Brand": "Add New Brand"}</IonLabel>
                            </IonItem>
                        </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        <IonItem className='mb-1'>
                            <IonLabel position='floating'>Brand name</IonLabel>
                            <IonInput value={brand.name} onIonChange={e => setBrand({ ...brand, name: e.detail.value })} />

                            {!isFirst && (brand.name === "") && <>
                                <IonNote slot="helper" color="danger">Brand name is a required field</IonNote>
                                <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                            </>}
                        </IonItem>
                        <IonItem>
                            <IonThumbnail>
                                {brand.logo && <IonImg src={brand.logo} />}
                                {brand.logo === "" && <IonNote color={isFirst ? "medium" : "danger"}>No Logo</IonNote>}
                            </IonThumbnail>
                            <IonButton color='green' slot='end' onClick={select}>
                                <IonIcon slot='start' icon={cameraOutline} />
                                <IonLabel>Select Logo</IonLabel>
                            </IonButton>

                            {!isFirst && (brand.logo === "") && <>
                                <IonNote slot="helper" color="danger">Brand logo is a required field</IonNote>
                                <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                            </>}
                        </IonItem>

                        <IonButton color='green' className='mt-10' expand='block' onClick={handleSubmit}>
                            <IonIcon slot='start' icon={addCircleOutline} />
                            <IonText>Save Brand</IonText>
                        </IonButton>
                    </IonCardContent>
                </IonCard>
            </IonModal>
        </>

    );
};

export default Brands;