import { atom } from 'recoil';
import { recoilPersist } from 'recoil-persist';
const { persistAtom } = recoilPersist();
export const userAtom = atom({
    key: "jjbUserState",
    default: {
        employee_id: 0,
        department_id: 0,
        name: "",
        passport: "",
        position: "",
        shift: "",
        department: "",
        created_at: "",
        brand: "",
        id: 0,
        role: 0,
        token: "",
        updated_at: "",
        username: "",
        location_id: 0,
        setOpening: false,
        setClosing: false,
        isLoggedIn: false,
    },
    effects_UNSTABLE: [persistAtom]
});

export interface User {
    employee_id: number,
    department_id: number,
    name: string,
    passport: string,
    position: string,
    shift: string,
    department: string,
    created_at: string,
    brand: string,
    id: number,
    role: number,
    token: string,
    updated_at: string,
    username: string,
    location_id: number,
    setOpening: boolean,
    setClosing: boolean,
    isLoggedIn: boolean,
}