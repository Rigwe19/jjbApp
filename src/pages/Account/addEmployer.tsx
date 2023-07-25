import { DatetimeChangeEventDetail, IonAvatar, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonDatetime, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonModal, IonNote, IonPage, IonSelect, IonSelectOption, IonTextarea, IonThumbnail, IonToolbar, useIonLoading } from '@ionic/react';
import { addCircleOutline, arrowBack } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';
import { useIonFormState } from 'react-use-ionic-form';

import { Http } from "@capacitor-community/http";
import { FilePicker } from '@robingenz/capacitor-file-picker';
import Toolbar from '../../components/toolbar';
import { useParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { useRecoilValue } from 'recoil';
import { urlAtom } from '../../recoil/urlAtom';
import { User, userAtom } from '../../recoil/userAtom';
/**
 * Add an employee page
 * 
 * @returns JSX
 */
const AddEmployee: React.FC = () => {
    const user = useRecoilValue<User>(userAtom);
    const href = useRecoilValue<string>(urlAtom);
    const isClean = useRef(false);
    const [isFirst, setIsFirst] = useState(true);
    const [departments, setDepartments] = useState([{ department: "", id: 0 }]);
    const [brands, setBrands] = useState([]);
    const [locations, setLocations] = useState([]);
    const [employees, setEmployees] = useState([{ passport: "", name: "", department: "", id: 0 }]);
    const [showModal, setShowModal] = useState(false);
    const isValid = useRef(false);
    const result = useRef<any>({});
    const [show, hide] = useIonLoading();
    let { setState, state, reset, item } = useIonFormState({
        name: "",
        dob: new Date().toISOString(),
        gender: "",
        email: "",
        phone: "",
        address: "",
        passport: "",
        start_date: new Date().toISOString(),
        // employee_id: 0,
        department_id: 0,
        position: "",
        shift: "",
        // location_id: 0,
        brand_id: 0,
        salary: 0,
    });
    const fieldSet: any = {
        name: { name: "Employee Name", type: "text" },
        dob: { name: "Employee Date of Birth", type: "date" },
        email: { name: "Employee E-Mail", type: "email" },
        phone: { name: "Employee Phone Number", type: "text", inputmode: "numeric" },
        address: { name: "Employee Address", type: "textarea" },
        gender: { name: "Employee's Gender", type: "select" },
        // passport: { name: "Passport", type: "file" },
        start_date: { name: "Start Date", type: "date" },
        department_id: { name: "Department", type: "select" },
        position: { name: "Employee Position", type: "text" },
        shift: { name: "Shift", type: "select" },
    }
    // useEffect to run on page Load
    useEffect(() => {
        isClean.current = true;
        show("Loading...")
        Http.request({
            method: "GET",
            url: href + "/api/ceo/get/employee",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            },
        }).then(({ data }) => {
            if (data.success) {
                setDepartments(data.departments);
                setEmployees([...data.employees]);
                setLocations(data.locations);
                setBrands(data.brands);
                // handleReset();
            }
        }).finally(() => {
            hide();
        });
        return () => {
            isClean.current = false;
        }
    }, []);
    const { tab } = useParams<{ tab: string; }>();
    /**
     * this is used to open an image picker to get image of workers
     */
    const select = async () => {
        let image: any[] = [];
        result.current = await FilePicker.pickFiles({
            types: ['image/*'],
            multiple: false,
            readData: true
        });
        result.current.files.forEach((element: any) => {
            setState({ ...state, passport: "data:" + element.mimeType + ";base64," + element.data });
        });
    }
    /**
     * submission of the form to api for processing
     */
    const handleSubmit = () => {
        isValid.current = true;
        Object.keys(state).forEach((element: any) => {
            if(element === "brand_id"){
                return;
            }
            if (state[element] === "" || state[element] === 0) {
                isValid.current = false;
                setIsFirst(false);
            }
        });
        if (isValid.current) {
            show("Saving Employee...")
            Http.request({
                method: "POST",
                url: href + "/api/account/save/employee",
                headers: {
                    'Content-Type': 'application/json',
                    'Data-Type': 'json',
                    'Authorization': 'Bearer ' + user.token
                },
                data: state
            }).then(({ data }) => {
                if (data.success) {
                    setEmployees(data.employees);
                    reset();
                    setShowModal(false);
                    // setAddresses([...data.addresses]);
                    // handleReset();
                }
            }).finally(() => {
                hide();
            });
        }
    }
    const handleDismiss = () => {
        setShowModal(false);
        reset();
    }
    const [isOpen, setIsOpen] = useState(false);
    const [formatDate, setFormatDate] = useState({
        dob: "",
        start_date: ""
    });
    const [dateClick, setDateClick] = useState("");
    const handleDateChange = (e: CustomEvent<DatetimeChangeEventDetail>) => {
        setState(prevState => ({ ...prevState, [dateClick]:e.detail.value }));
    }
    const handleDateDismiss = () => {
        setIsOpen(false);
        setDateClick("");
    }
    const handleDateClick = (key: React.SetStateAction<string>) => {
        setDateClick(key);
        setIsOpen(true);
    }
    const displayDate = (date: string) => {
        return format(parseISO(date), "dd/MM/yyyy");
    }
    const handleChange = (value: string|number, key: string) => {
        setState(pv => ({ ...pv, [key]: value }));
    }
    return (
        <>
            <IonPage>
                <Toolbar title="Employee" />
                <IonContent className="ion-padding">
                    <IonButton className="mb-1" color='green' onClick={() => setShowModal(true)}>
                        <IonIcon slot="start" icon={addCircleOutline} />
                        Add New Employee</IonButton>
                    <div>
                        {employees.map(value => {
                            return (
                                <IonItem fill='solid' key={value.id} className="mb-1">
                                    <IonAvatar slot="start">
                                        <IonImg src={href + value.passport} />
                                    </IonAvatar>
                                    <IonLabel>{value.name}</IonLabel>
                                    <IonNote slot="end">{value.department} department</IonNote>
                                </IonItem>
                            )
                        })}
                    </div>
                    <IonModal isOpen={showModal} onDidDismiss={handleDismiss} className="">
                        <IonCard>
                            <IonCardHeader className='ion-no-padding'>
                                <IonToolbar>
                                    <IonButtons slot='start'>
                                        <IonButton onClick={() => setShowModal(false)}>
                                            <IonIcon slot='icon-only' icon={arrowBack} />
                                        </IonButton>
                                    </IonButtons>
                                    <IonCardTitle>
                                        Add Employee
                                    </IonCardTitle>
                                </IonToolbar>
                            </IonCardHeader>
                            <IonCardContent>
                                {/* <pre>
                                    {JSON.stringify(state, null, 2)}
                                </pre> */}
                                <IonItem lines='none'>
                                    <IonThumbnail slot="start">
                                        <IonImg src={state.passport || "/assets/images/profile/avatar.png"} className="rounded-sm shadow h-full w-full" alt="product" />
                                    </IonThumbnail>
                                    <IonButton color='theme' size='small' onClick={select} className='my-3'>Select Images</IonButton>
                                </IonItem>
                                <IonItem fill="solid" className="mb-1">
                                    <IonLabel color='medium' position="stacked">Name</IonLabel>
                                    <IonInput placeholder="Enter Name" type='text' inputmode='text' value={state.name} onIonChange={e => handleChange(e.detail.value, "name")} />
                                </IonItem>
                                <div className="mb-1 flex">
                                    <IonItem fill="solid" className="w-1/2">
                                        <IonLabel color='medium' position="stacked">Email</IonLabel>
                                        <IonInput placeholder="Type Email" type="email" inputmode="email" value={state.email} onIonChange={e => handleChange(e.detail.value, "email")} />
                                    </IonItem>
                                    <IonItem fill="solid" className="w-1/2">
                                        <IonLabel color='medium' position="stacked">Phone</IonLabel>
                                        <IonInput placeholder="Type Phone number" type="text" inputmode="numeric" value={state.phone} onIonChange={e => handleChange(e.detail.value, "phone")} />
                                    </IonItem>
                                </div>
                                <div className="flex mb-1">
                                    <IonItem fill="solid" className="w-1/2">
                                        <IonLabel color='medium' position="stacked">Date of Birth</IonLabel>
                                        <IonInput onClick={() => handleDateClick("dob")} value={displayDate(state.dob)} />
                                    </IonItem>
                                    <IonItem fill="solid" className="w-1/2">
                                        <IonLabel color='medium' position="stacked">Gender</IonLabel>
                                        <IonSelect placeholder="Select Gender" interface="action-sheet" interfaceOptions={{ header: "select Gender" }} value={state.gender} onIonChange={e => handleChange(e.detail.value, "gender")} >
                                            <IonSelectOption>Female</IonSelectOption>
                                            <IonSelectOption>Male</IonSelectOption>
                                        </IonSelect>
                                    </IonItem>
                                </div>
                                <div className="flex mb">
                                    <IonItem fill="solid" className="w-1/2">
                                        <IonLabel color='medium' position="stacked">Salary</IonLabel>
                                        <IonInput type='text' inputmode='numeric' value={state.salary||0} onIonChange={e=>handleChange(parseInt(e.detail.value), "salary")} />
                                    </IonItem>
                                    {/* <IonItem fill="solid" className="w-1/2">
                                        <IonLabel color='medium' position="stacked">Location</IonLabel>
                                        <IonSelect placeholder="Select Location" interface="action-sheet" interfaceOptions={{ header: "select Location" }} value={state.location_id} onIonChange={e => handleChange(e.detail.value, "location_id")} >
                                            {locations.map(value=>(<IonSelectOption key={value.id} value={value.id}>{value.name}</IonSelectOption>))}
                                        </IonSelect>
                                    </IonItem> */}
                                    <IonItem fill="solid" className="w-1/2">
                                        <IonLabel color='medium' position="stacked">Shift</IonLabel>
                                        <IonSelect placeholder="Select Shift" interface="action-sheet" interfaceOptions={{ header: "select Shift" }} value={state.shift} onIonChange={e => handleChange(e.detail.value, "shift")}>
                                        <IonSelectOption>Morning</IonSelectOption>
                                                        <IonSelectOption>Afternoon</IonSelectOption>
                                        </IonSelect>
                                    </IonItem>
                                </div>
                                <div className="flex mb-1">
                                    <IonItem fill="solid" className="w-1/2">
                                        <IonLabel color='medium' position="stacked">Brand</IonLabel>
                                        <IonSelect placeholder="Select Brand" interface="action-sheet" interfaceOptions={{ header: "select Brand" }} value={state.brand_id} onIonChange={e => handleChange(e.detail.value, "brand_id")}>
                                        <IonSelectOption value="">All</IonSelectOption>
                                        {brands.map(value=>(<IonSelectOption key={value.id} value={value.id}>{value.name}</IonSelectOption>))}
                                        </IonSelect>
                                    </IonItem>
                                    <IonItem fill="solid" className="w-1/2">
                                        <IonLabel color='medium' position="stacked">Position</IonLabel>
                                        <IonInput placeholder="Type Position" type="text" inputmode="text" value={state.position} onIonChange={e => handleChange(e.detail.value, "position")} />
                                    </IonItem>
                                </div>
                                <div className="flex mb-1">
                                    <IonItem fill="solid" className="w-1/2">
                                        <IonLabel color='medium' position="stacked">Department</IonLabel>
                                        <IonSelect placeholder="Select Department" interface="action-sheet" interfaceOptions={{ header: "select Department" }} value={state.department_id} onIonChange={e => handleChange(e.detail.value, "department_id")} >
                                            {departments.map(value => {
                                                return (
                                                    <IonSelectOption key={"Department_key_" + value.id} value={value.id}>{value.department}</IonSelectOption>
                                                )
                                            })}
                                        </IonSelect>
                                    </IonItem>
                                    <IonItem fill="solid" className="w-1/2">
                                        <IonLabel color='medium' position="stacked">Start Date</IonLabel>
                                        <IonInput onClick={() => handleDateClick("start_date")} value={displayDate(state.start_date)} />
                                    </IonItem>
                                </div>
                                <IonItem fill="solid" className="mb-1">
                                    <IonLabel color='medium' position="stacked">Address</IonLabel>
                                    <IonTextarea placeholder="Type Address" rows={2} value={state.address} onIonChange={e => handleChange(e.detail.value, "address")} ></IonTextarea>
                                </IonItem>
                                {/* {Object.keys(state).map((key: any) => {
                                    if (Object.keys(fieldSet).includes(key)) {
                                        return (
                                            <IonItem className='mb-1' key={key} fill="solid">
                                                <IonLabel color='medium' position='stacked'>{fieldSet[key].name}</IonLabel>
                                                {(fieldSet[key].type === "text" || fieldSet[key].type === "email") && <IonInput type={fieldSet[key].type} inputmode={fieldSet[key].inputmode} />}
                                                {(fieldSet[key].type === "date") && <IonInput type={fieldSet[key].type} placeholder="" />}
                                                {fieldSet[key].type === "textarea" && <IonTextarea rows={3} />}
                                                {fieldSet[key].type === "select" && <IonSelect interface='action-sheet' >
                                                    <IonSelectOption value="">Select {fieldSet[key].name}</IonSelectOption>
                                                    {key === "gender" && <>
                                                        <IonSelectOption>Female</IonSelectOption>
                                                        <IonSelectOption>Male</IonSelectOption>
                                                    </>}
                                                    {key === "shift" && <>
                                                        <IonSelectOption>Morning</IonSelectOption>
                                                        <IonSelectOption>Afternoon</IonSelectOption>
                                                    </>}
                                                    {key === "department_id" && departments.map(value => {
                                                        return (
                                                            <IonSelectOption key={"Department_key_" + value.id} value={value.id}>{value.department}</IonSelectOption>
                                                        )
                                                    })}
                                                </IonSelect>}
                                                {!isFirst && (state[key] === "" || state[key] === null) &&
                                                    <>
                                                        <IonNote slot="helper" color="danger">{fieldSet[key].name} is a required field</IonNote>
                                                        <IonIcon slot="end" icon={alertCircleOutline} color="danger" />
                                                    </>
                                                }
                                                {!isFirst && state[key] && <IonIcon slot="end" icon={checkmarkCircleOutline} color="success" />}
                                            </IonItem>
                                        )
                                    }
                                })} */}
                                <IonButton color='green' expand='block' onClick={handleSubmit}>Save</IonButton>
                                {/* </IonCol>
                                </IonRow>
                            </IonGrid> */}
                                <IonModal className='date-moda' onDidDismiss={handleDateDismiss} isOpen={isOpen}>
                                    <IonCard>
                                        <IonCardContent>
                                            {dateClick === "dob" && <IonDatetime value={state.dob || new Date().toISOString()} color='green' showDefaultButtons presentation="date" min="1970-01-01T00:00:00" onIonChange={e => handleDateChange(e)} />}
                                            {dateClick === "start_date" && <IonDatetime value={state.start_date || new Date().toISOString()} color='green' showDefaultButtons presentation="date" min="1970-01-01T00:00:00" onIonChange={e => handleDateChange(e)} />}
                                        </IonCardContent>
                                    </IonCard>
                                </IonModal>
                            </IonCardContent>
                        </IonCard>
                    </IonModal>
                </IonContent>
            </IonPage>


        </>
    );
};

export default AddEmployee;