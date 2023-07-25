import { atom } from 'recoil';
import { recoilPersist } from 'recoil-persist';
const { persistAtom } = recoilPersist();
export const darkModeAtom = atom({
    key: "jjbDarkModeState",
    default: "auto",
    effects_UNSTABLE: [persistAtom]
});

// export interface DarkMode {
//     value: string //"auto" | "dark" | "light";
// }