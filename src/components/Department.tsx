import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonIcon, IonInput, IonItem, IonLabel, IonModal, IonNote, IonText, IonToggle, useIonLoading, useIonToast } from '@ionic/react';
import React, { useEffect, useRef, useState } from 'react';
import { addCircleOutline, alertCircleOutline, arrowBack } from 'ionicons/icons';
import { Http } from '@capacitor-community/http';
import { useRecoilValue } from 'recoil';
import { urlAtom } from '../recoil/urlAtom';
import { User, userAtom } from '../recoil/userAtom';

const Departments: React.FC = () => {
    const user = useRecoilValue<User>(userAtom);
    const href = useRecoilValue<string>(urlAtom);
    const isClean = useRef(false);
    const [isFirst, setIsFirst] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const isValid = useRef(false);
    const [toasted] = useIonToast();
    const [show, hide] = useIonLoading();
    const [department, setDepartment] = useState({
        id: 0,
        department: "",
        shift: false
    });
    const [departments, setDepartments] = useState<any[]>([{ department: "", shift: false, id: 0 }]);
    const result = useRef<any>({});
    useEffect(() => {
        isClean.current = true;
        show("Loading...")
        Http.request({
            method: "GET",
            url: href + "/api/ceo/get/department",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            },
        }).then(({ data }) => {
            if (data.success) {
                setDepartments(data.departments);
                // reset();
            }
        }).finally(() => {
            hide();
        });
        return () => {
            isClean.current = false;
        }
    }, []);
    const handleSubmit = () => {
        isValid.current = true;
        Object.keys(department).forEach((element: any) => {
            if (department[element] === "") {
                isValid.current = false;
                setIsFirst(false);
            }
        });
        if (isValid.current) {
            show("Saving...")
            Http.request({
                method: "POST",
                url: href + "/api/ceo/add/department",
                headers: {
                    'Content-Type': 'application/json',
                    'Data-Type': 'json',
                    'Authorization': 'Bearer ' + user.token
                },
                data: department
            }).then(({ data }) => {
                if (data.success) {
                    setIsFirst(true);
                    setDepartments(data.departments);
                    setDepartment({
                        id: 0,
                        department: "",
                        shift: false,
                    });

                    setShowModal(false);
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
        if (type === "new") {
            setDepartment({ id: 0, shift: false, department: "" });
            setShowModal(true);
        } else {
            setDepartment(value);
            setShowModal(true);
        }
    }
    return (
        <>
            <IonButton color='green' className='mb-1' onClick={() => handleShow("new")}>Add New Department</IonButton>
            <div>
                {departments.length > 0 && departments.map(value => {
                    return (
                        <IonItem onClick={() => handleShow("old", value)} button key={value.id} className='mb-1'>
                            <IonText>{value.department}</IonText>
                            <IonNote slot='end'>{value.shift ? "Has Shift" : "No Shift"}</IonNote>
                        </IonItem>
                    )
                })}
            </div>
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
                                <IonLabel>{department.id !== 0 ? "Edit Department" : "Add New Department"}</IonLabel>
                            </IonItem>
                        </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        <IonItem className='mb-1'>
                            <IonLabel position='floating'>Department name</IonLabel>
                            <IonInput value={department.department} onIonChange={e => setDepartment({ ...department, department:e.detail.value })} />

                            {!isFirst && (department.department === "") && <>
                                <IonNote slot="helper" color="danger">Department name is a required field</IonNote>
                                <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                            </>}
                        </IonItem>
                        <IonItem>
                            <IonLabel>Has Shift</IonLabel>
                            <IonToggle checked={department.shift} onIonChange={e => setDepartment({ ...department, shift: e.detail.checked })} slot='end' />
                        </IonItem>

                        <IonButton color='green' className='mt-10' expand='block' onClick={handleSubmit}>
                            <IonIcon slot='start' icon={addCircleOutline} />
                            <IonText>Save Department</IonText>
                        </IonButton>
                    </IonCardContent>
                </IonCard>
            </IonModal>
        </>

    );
};

export default Departments;