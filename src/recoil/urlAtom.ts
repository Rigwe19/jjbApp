import { atom } from 'recoil';
export const urlAtom = atom({
    key: "jjbUrlState",
    // default: "https://jjbfoods.com",
    default: "https://jjbfood.test",
    effects_UNSTABLE: []
});