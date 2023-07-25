import { atom } from 'recoil';
import { recoilPersist } from 'recoil-persist';
const { persistAtom } = recoilPersist();
export const dispatchIdsAtom = atom({
    key: "jjbDispatchIdsState",
    default: {
        breads: [
            { type_id: 0, dispatch_id: 0 }
        ],
        complete: false,
        date: "2022-05-13",
        shift: "Morning",
        employee_id: 1,
    },
    effects_UNSTABLE: [persistAtom]
});

interface Bread {
    type_id: number, 
    dispatch_id: number
}

export interface DispatchIds {
    breads: Bread[],
    complete: boolean,
    date: string,
    shift: string,
    employee_id: number,
}