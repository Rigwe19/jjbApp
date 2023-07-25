import {
	IonAvatar,
	IonChip,
	IonContent,
	IonIcon,
	IonImg,
	IonItem,
	IonLabel,
	IonList,
	IonListHeader,
	IonMenu,
	IonMenuToggle,
	useIonLoading,
} from '@ionic/react';

import { useLocation } from 'react-router-dom';
import { bagAdd, bagAddOutline, body, bodyOutline, briefcase, briefcaseOutline, business, businessOutline, cash, cashOutline, chevronForward, document as doc, documentOutline, handLeft, handLeftOutline, home, homeOutline, list, listOutline, logIn, logInOutline, logOut, logOutOutline, map, mapOutline, moon, people, peopleCircle, peopleCircleOutline, peopleOutline, personAdd, personAddOutline, settings, settingsOutline, sunny, sync, time } from 'ionicons/icons';
import './Menu.css';
import { useRef, useEffect, useState } from 'react';
import { darkModeAtom } from '../recoil/darkModeAtom';
import { AccountDashboard, accountDashboardAtom } from '../recoil/accountDashboardAtom';
import { useRecoilValue, useRecoilState } from 'recoil';
import dispatch from '../pages/CEO/dispatch';
import { urlAtom } from '../recoil/urlAtom';
import { User, userAtom } from '../recoil/userAtom';
import { Http } from '@capacitor-community/http';

interface AppPage {
	activeIcon: string;
	url: string;
	icon: string;
	title: string;
	role: string;
}

const appPages: AppPage[] = [
	// {
	//   title: 'Create New Employee',
	//   url: '/page/Employee',
	//   icon: personAddOutline,
	//   role: "Admin",
	// },
	// {
	//   title: 'Department',
	//   url: '/page/Department',
	//   icon: warningOutline,
	//   role: "Admin",
	// },
	{
		title: 'Dashboard',
		url: '/admin/dashboard',
		icon: homeOutline,
		activeIcon: home,
		role: "Admin",
	},
	{
		title: 'Create Employee Logins',
		url: '/page/Logins',
		icon: logInOutline,
		activeIcon: logIn,
		role: "Admin",
	},
	{
		title: 'Make Recipe',
		url: '/page/Recipes',
		icon: listOutline,
		activeIcon: list,
		role: "Admin",
	},
	{
		title: 'Create Location',
		url: '/page/Location',
		icon: mapOutline,
		activeIcon: map,
		role: "Admin",
	},
	{
		title: 'Create New Brand',
		url: '/page/Brand',
		icon: briefcaseOutline,
		activeIcon: briefcase,
		role: "Admin",
	},
	{
		title: 'Attendance',
		url: '/admin/attendance',
		icon: homeOutline,
		activeIcon: home,
		role: "Admin",
	},
	{
		title: 'Visitors',
		url: '/admin/visitors',
		icon: peopleOutline,
		activeIcon: people,
		role: "Admin",
	},
	{
		title: 'Product Left',
		url: '/admin/left',
		icon: logOutOutline,
		activeIcon: logOut,
		role: "Admin",
	},
	{
		title: 'Query',
		url: '/admin/query',
		icon: logOutOutline,
		activeIcon: logOut,
		role: "Admin",
	},
	{
		title: 'Store Reports',
		url: '/admin/store',
		icon: settingsOutline,
		activeIcon: settings,
		role: "Admin",
	},
	{
		title: 'Loans',
		url: '/admin/loan',
		icon: cashOutline,
		activeIcon: cash,
		role: "Admin",
	},
	{
		title: 'Production Report',
		url: '/admin/production',
		icon: settingsOutline,
		activeIcon: settings,
		role: "Admin",
	},
	{
		title: 'Packaging Report',
		url: '/admin/packaging',
		icon: settingsOutline,
		activeIcon: settings,
		role: "Admin",
	},
	{
		title: 'Dispatch Report',
		url: '/admin/dispatch',
		icon: settingsOutline,
		activeIcon: settings,
		role: "Admin",
	},
	{
		title: 'Account Report',
		url: '/admin/account',
		icon: settingsOutline,
		activeIcon: settings,
		role: "Admin",
	},
	{
		title: 'Cost of Production',
		url: '/admin/costproduction',
		icon: settingsOutline,
		activeIcon: settings,
		role: "Admin",
	},
	{
		title: 'Salary',
		url: '/admin/salary',
		icon: cashOutline,
		activeIcon: cash,
		role: "Admin",
	},
	{
		title: 'Production and Packaging',
		url: '/admin/compprod',
		icon: settingsOutline,
		activeIcon: settings,
		role: "Admin",
	},
	{
		title: 'Packaging and Dispatch',
		url: '/admin/comppack',
		icon: settingsOutline,
		activeIcon: settings,
		role: "Admin",
	},
	{
		title: 'Cashier and Dispatch',
		url: '/admin/compcash',
		icon: settingsOutline,
		activeIcon: settings,
		role: "Admin",
	},

	{
		title: 'Dashboard',
		url: '/account/dashboard',
		icon: homeOutline,
		activeIcon: home,
		role: "Account",
	},
	{
		title: 'Daily Sales',
		url: '/account/sales',
		icon: bagAddOutline,
		activeIcon: bagAdd,
		role: "Account",
	},
	{
		title: 'Expenses',
		url: '/account/expenses',
		icon: bodyOutline,
		activeIcon: body,
		role: "Account",
	},
	{
		title: 'Bank',
		url: '/account/bank',
		icon: businessOutline,
		activeIcon: business,
		role: "Account",
	},
	{
		title: 'Loans',
		url: '/account/loan',
		icon: cashOutline,
		activeIcon: cash,
		role: "Account",
	},
	{
		title: 'IOU',
		url: '/account/iou',
		icon: cashOutline,
		activeIcon: cash,
		role: "Account",
	},
	{
		title: 'Salary',
		url: '/account/salary',
		icon: peopleCircleOutline,
		activeIcon: peopleCircle,
		role: "Account",
	},
	{
		title: 'Ledger',
		url: '/account/ledger',
		icon: documentOutline,
		activeIcon: doc,
		role: "Account",
	},
	{
		title: 'Debt',
		url: '/account/debt',
		icon: handLeftOutline,
		activeIcon: handLeft,
		role: "Account",
	},
	{
		title: 'Add',
		url: '/account/add',
		icon: personAddOutline,
		activeIcon: personAdd,
		role: "Account",
	}
];

const labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];

const Menu: React.FC = () => {
	const user = useRecoilValue<User>(userAtom);
	const href = useRecoilValue<string>(urlAtom);
	const [darkMode, setDarkMode] = useRecoilState<"auto" | "dark" | "light">(darkModeAtom);
	const accountDashboard = useRecoilValue<AccountDashboard>(accountDashboardAtom);
	const location = useLocation();
	const isClean = useRef(false);
	const [isDark, setIsDark] = useState(false)
	const preferDark = window.matchMedia('(prefers-color-scheme: dark)');
    const [show, hide] = useIonLoading();
	const account = [
		{
			name: "Cash Available Now",
			icon: cashOutline,
			amount: accountDashboard.available
		},
		{
			name: "Today Debtor Payment",
			icon: cashOutline,
			amount: accountDashboard.payment
		},
		{
			name: "Today Sales",
			icon: cashOutline,
			amount: accountDashboard.sales
		},
		{
			name: "Today Expenses",
			icon: cashOutline,
			amount: accountDashboard.expenses
		},
		{
			name: "Purchases/Creditor",
			icon: cashOutline,
			amount: (accountDashboard.total - accountDashboard.purchase).toLocaleString()
		},
	];
	useEffect(() => {
		isClean.current = true;
		if (isClean.current)
			checkToggle()
		return () => {
			isClean.current = false;
		}
	}, [darkMode]);
	const checkToggle = () => {
		switch (darkMode) {
			case 'auto':
				document.body.classList.toggle('dark', preferDark.matches);
				setIsDark(preferDark.matches);
				break;
			case 'dark':
				document.body.classList.toggle('dark', true);
				setIsDark(true);
				break;
			case 'light':
				document.body.classList.toggle('dark', false);
				setIsDark(false);
				break;
			default:
				break;
		}
	}
	preferDark.addEventListener("change", e => {
		if (darkMode === "auto") {
			document.body.classList.toggle('dark', preferDark.matches);
		}
	})
	const handleDarkMode = () => {
		if (darkMode === "light") {
			setDarkMode("dark");
		} else if (darkMode === "dark") {
			setDarkMode("auto");
		} else if (darkMode === "auto") {
			setDarkMode("light");
		}
	}

	const handleSync = () => {
		show("Loading");
        Http.request({
            method: "POST",
            url: href + "/api/sync",
            headers: {
                'Content-Type': 'application/json',
                'Data-Type': 'json',
                'Authorization': 'Bearer ' + user.token
            }
        }).then(({ data }) => {
            if (isClean.current && data.success) {
                // setLogins(data.logins);
                // setCustomer(data.customer)
            }
        }).finally(() => {
            hide();
        });
	}

	return (
		<IonMenu contentId="main" type="overlay">
			<IonContent>
				<IonList id="inbox-list">
					<IonListHeader className='border-b mb-4'>
						{user.department} Menu
					</IonListHeader>
					<IonItem lines='none'>
						<IonAvatar slot='start'>
							<IonImg src={href + user.passport} />
						</IonAvatar>

						<IonChip color="green" className="text-center">{user.name}</IonChip>
					</IonItem>
					{/* <IonMenuToggle autoHide={false}> */}
					<IonItem lines='full'>
						<IonIcon slot="start" icon={time} />
						<IonLabel>Shift</IonLabel>
						<IonLabel slot="end"><p className='!text-green-500'>{user.shift}</p></IonLabel>
						{/* <IonCheckbox indeterminate /> */}
					</IonItem>
					{/* </IonMenuToggle> */}
					<IonMenuToggle autoHide={false}>
						<IonItem lines='full' button onClick={handleDarkMode}>
							<IonIcon slot="start" icon={isDark ? moon : sunny} />
							<IonLabel>Dark Mode</IonLabel>
							<IonLabel slot="end"><p className='!text-green-500'>{darkMode}</p></IonLabel>
						</IonItem>
					</IonMenuToggle>
					{user.isLoggedIn && appPages.map((appPage, index) => {
						if (user.department.toLowerCase() === appPage.role.toLowerCase()) {
							return (
								<IonMenuToggle key={index} autoHide={false}>
									<IonItem className={location.pathname === appPage.url ? 'selected' : ''} routerLink={appPage.url} routerDirection="none" lines="none" detail>
										<IonIcon color="green" slot="start" icon={location.pathname === appPage.url ? appPage.activeIcon : appPage.icon} />
										<IonLabel>{appPage.title}</IonLabel>
									</IonItem>
								</IonMenuToggle>
							);
						}
					})}
					{!user.isLoggedIn && <div className='flex justify-center items-center h-full'>
						<span className='my-auto'>Login to use this app</span>
					</div>}
				</IonList>
				{user.isLoggedIn && ["account", "admin"].includes(user.department.toLowerCase()) && <IonList id="labels-list" lines='none'>
					<IonListHeader>
						<IonLabel color='secondary'>Account Dashboard</IonLabel>
					</IonListHeader>
					{account.map((value, index) => (
						<IonItem lines="full" key={index}>
							<IonIcon color="green" slot="start" icon={value.icon} />
							<IonLabel color='medium'>{value.name}</IonLabel>
							<IonChip slot="end">₦{value.amount.toLocaleString()}</IonChip>
						</IonItem>
					))}
				</IonList>}
					
				{user.isLoggedIn && <IonMenuToggle autoHide={false}><IonItem lines="full" button onClick={() => handleSync()}>
					<IonIcon color="green" slot="start" icon={sync} />
					<IonLabel color='medium'>Sync</IonLabel>
					<IonIcon slot="end" icon={chevronForward} />
				</IonItem></IonMenuToggle>}
			</IonContent>
		</IonMenu>
	);
};

export default Menu;
