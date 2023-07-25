import { Http } from '@capacitor-community/http';
import { IonAvatar, IonButton, IonButtons, IonSelect, IonSelectOption, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonMenuButton, IonModal, IonNote, IonPage, IonTitle, IonToolbar, useIonActionSheet, useIonLoading, IonItemGroup, IonText, IonItemDivider, IonImg, useIonToast, IonToggle, InputChangeEventDetail, ToggleChangeEventDetail } from '@ionic/react';
import { addCircle, addCircleOutline, alertCircleOutline, arrowBack, checkmarkCircleOutline, closeCircleOutline, personOutline } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';
import { useIonFormState } from 'react-use-ionic-form';
import { useRecoilValue } from 'recoil';
import { urlAtom } from '../recoil/urlAtom';
import { User, userAtom } from '../recoil/userAtom';
// import DropdownInput from 'react-dropdown-input';
interface IType {
    id: number;
    brand_id: number;
    type: string;
}
interface IEmployees {
    id: number;
    name: string;
    department_id: number;
    employee_id: string;
}
interface ILogins {
    id: number;
    name: string;
    passport: string;
    department: string;
}
interface ICustomer {
    id: number;
    customer_id: number;
    name: string;
}
const Logins: React.FC = () => {
    const user = useRecoilValue<User>(userAtom);
    const href = useRecoilValue<string>(urlAtom);
    const [popup, popout] = useIonActionSheet();
    const [toasted] = useIonToast();
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showDispatch, setShowDispatch] = useState(false);
    const [employees, setEmployees] = useState<IEmployees[]>([]);
    const [types, setTypes] = useState<any[]>([]);
    const [logins, setLogins] = useState<ILogins[]>([]);
    const [login, setLogin] = useState({});
    const isClean = useRef(false);
    const [isFirst, setIsFirst] = useState(true);
    const [departments, setDepartments] = useState([{ id: 0, department: "" }]);
    const [selectedIndex, setSelectedIndex] = useState<number>(undefined);
    const [isDispatch, setIsDispatch] = useState(true);
    const [selectedBrand, setSelectedBrand] = useState(0);
    const [newLogin, setnewLogin] = useState<any>({
        brand: "",
        type_id: 0,
        amount: 0,
        type: {},
    });
    const isValid = useRef(false);
    const [show, hide] = useIonLoading();
    const [filter, setFilter] = useState([{
        id: 0,
        name: "",
        customer_id: "54",
        phone: "",
    }]);
    const [customer, setCustomer] = useState<ICustomer[]>([]);
    let { setState, state, reset, item } = useIonFormState({
        id: 0,
        employee_id: 0,
        department_id: 0,
        username: "",
        password: "12345678",
        role: 2
    });
    const set = {
        employee_id: { name: "Employee's Name", type: "select", },
        department_id: { name: "Department", type: "select", disabled: true },
        username: { name: "Username", type: "text", disabled: true },
        password: { name: "Password", type: "text", disabled: true },
    }
    const [fieldSet, setFieldSet] = useState<any>(set);

    useEffect(() => {
        isClean.current = true;
        show("Loading");
        Http.request({
            method: "GET",
            url: href + "/api/ceo/get/logins",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            }
        }).then(({ data }) => {
            if (isClean.current && data.success) {
                setEmployees(data.employees);
                setDepartments(data.departments);
                setLogins(data.logins);
                // setLogins(data.logins);
                // setCustomer(data.customer)
            }
        }).finally(() => {
            hide();
        });
        return () => {
            isClean.current = false;
        }
    }, []);
    useEffect(() => {
        isClean.current = true;
        // show();
        if (isClean.current) {
            if (state.employee_id > 0) {
                let employeed = { id: 0, department_id: 0, employee_id: "" };
                employees.forEach(element => {
                    if (element.id === state.employee_id)
                        employeed = { ...element };
                });
                setState({ ...state, department_id: employeed.department_id, username: employeed.employee_id });
            }else{
                setState({ ...state, department_id: 0, username: "" });
            }

        }

        return () => {
            isClean.current = false;
        }
    }, [state.employee_id]);
    useEffect(() => {
        isClean.current = true;
        if (isClean.current) {
            setnewLogin({ ...newLogin, ...{ type: {} } });
        }
        return () => {
            isClean.current = false;
        }
    }, [newLogin.brand]);

    const handleSave = () => {
        isValid.current = true;
        Object.keys(state).forEach((element: any) => {
            if (state[element] === "" || state[element] === null) {
                isValid.current = false;
                setIsFirst(false);
            }
        });

        if (isValid.current) {
            show("Saving Login...")
            Http.request({
                method: "POST",
                url: href + "/api/ceo/add/logins",
                headers: {
                    'Content-Type': 'application/json',
                    'Data-Type': 'json',
                    'Authorization': 'Bearer ' + user.token
                },
                data: state
            }).then(({ data }) => {
                if (data.success) {
                    setShowModal(false);
                    setLogins(data.logins);
                    setShowModal(false);
                    reset();
                    setIsFirst(true);
                    // setAddresses([...data.addresses]);
                    // handleReset();
                }
            }).finally(() => {
                hide();
            });
        }
    }
    const handleShow = (type: string, value: any = {}) => {
        if (type === "new") {
            reset();
            setShowModal(true);
        } else {
            setState({...value, password: "12345678"});
            setShowModal(true);
        }
    }

    const compareWith = (a: any, b: any) => {
        return a && b ? a.type_id === b.type_id : a === b;
    }
    return (
        <>
            <div className="flex justify-end mb-3">
                <IonButton color='green' onClick={() => handleShow("new")}>Add New Login</IonButton>
            </div>
            <div>
                {logins.map((value, index) => (
                    <IonItem className="mb-1" key={value.id} button onClick={() => handleShow("old", value)}>
                        <IonAvatar slot='start'>
                            <IonImg src={href + value.passport} />
                        </IonAvatar>
                        <IonLabel>{value.name}</IonLabel>
                        <IonNote slot='end'>{value.department} Department</IonNote>
                    </IonItem>
                ))}
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
                                <IonLabel>Add new login</IonLabel>
                            </IonItem>
                        </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        {/* <pre>
                            {JSON.stringify(state, null, 2)}
                        </pre> */}
                        {Object.keys(state).map((key: any) => {
                            if (Object.keys(fieldSet).includes(key)) {
                                return (
                                    <div className="form mb-1" key={key}>
                                        {item({
                                            name: key,
                                            label: fieldSet[key].name,
                                            // override default Label renderer
                                            renderLabel: (props) => (
                                                <IonLabel color="medium" position="floating">
                                                    {props.label}
                                                </IonLabel>
                                            ),
                                            renderContent: (props) => (
                                                <>
                                                    {(fieldSet[key].type === "text") && <IonInput type={fieldSet[key].type} {...props} disabled={fieldSet[key].disabled} />}
                                                    {fieldSet[key].type === "select" && <IonSelect interface='action-sheet' {...props} disabled={fieldSet[key].disabled}>
                                                        <IonSelectOption value={0}>Select {fieldSet[key].name}</IonSelectOption>
                                                        {key === "employee_id" && employees.map(index => {
                                                            return (
                                                                <IonSelectOption key={index.id} value={index.id}>{index.name}</IonSelectOption>
                                                            )
                                                        })}
                                                        {key === "department_id" && departments.map(index => {
                                                            return (
                                                                <IonSelectOption key={"department_key_" + index.id} value={index.id}>{index.department}</IonSelectOption>
                                                            )
                                                        })}
                                                    </IonSelect>}

                                                    {!isFirst && (state[key] === 0) && <>
                                                        <IonNote slot="helper" color="red">{fieldSet[key].name} is a required field</IonNote>
                                                        <IonIcon slot="end" icon={alertCircleOutline} color="red" />
                                                    </>}
                                                    {!isFirst && state[key] > 0 && <IonIcon slot="end" icon={checkmarkCircleOutline} color="green" />}
                                                </>
                                            ),
                                        })}
                                    </div>
                                )
                            }

                        })}

                        <IonButton color='green' className='mt-10' expand='block' onClick={handleSave}>
                            <IonIcon slot='start' icon={addCircleOutline} />
                            <IonText>Save Login</IonText>
                        </IonButton>
                    </IonCardContent>
                </IonCard>
            </IonModal>
        </>
    );
};

export default Logins;