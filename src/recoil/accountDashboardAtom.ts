import { atom } from 'recoil';
import { recoilPersist } from 'recoil-persist';
const { persistAtom } = recoilPersist();
export const accountDashboardAtom = atom({
    key: "jjbAccountDashboardState",
    default: {
        available: 0,
        payment: 0,
        sales: 0,
        expenses: 0,
        purchase: 0,
        total: 0,
    },
    effects_UNSTABLE: [persistAtom]
});

export interface AccountDashboard {
    available: number,
    payment: number,
    sales: number,
    expenses: number,
    purchase: number,
    total: number,
}