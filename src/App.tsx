import { IonApp, IonRouterOutlet, IonSplitPane, isPlatform, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route, useHistory } from 'react-router-dom';
import Menu from './components/Menu';
import Page from './pages/Page';
import { StatusBar, Style } from "@capacitor/status-bar";

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';
import './App.css';
import 'animate.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import Login from './pages/login';
import ItemTab from './pages/Store/itemTab';
import SecurityTab from './pages/Security/securityTab';
import DispatchTabs from './pages/Dispatch/tabs';
import ProductionTab from './pages/Production/tabs';
import PackagingTab from './pages/Packaging/tabs';
import PrivateRoute from './components/privateRoute';
import Profile from './pages/profile';
import AccountDashboard from './pages/Account/dashboard';
import AddPage from './pages/Account/addPage';
import Banks from './pages/Account/banks';
import Debt from './pages/Account/debt';
import AccountExpenses from './pages/Account/expenses';
import CustomerLedger from './pages/Account/ledger';
import LoanAcquisition from './pages/Account/loanAcquisition';
import Salary from './pages/Account/salary';
import Sales from './pages/Account/sales';
import CeoAccount from './pages/CEO/account';
import CeoAttendance from './pages/CEO/attendance';
import CeoCompCash from './pages/CEO/compcash';
import CeoCompPack from './pages/CEO/comppack';
import CeoCompProd from './pages/CEO/compprod';
import CeoCostProduction from './pages/CEO/costProduction';
import CeoDashboard from './pages/CEO/dashboard';
import CeoDispatch from './pages/CEO/dispatch';
import CeoLeft from './pages/CEO/left';
import CeoPackaging from './pages/CEO/packaging';
import CeoProduction from './pages/CEO/production';
import CeoProfit from './pages/CEO/profitAnalysis';
import Query from './pages/CEO/query';
import CeoStore from './pages/CEO/store';
import CeoVisitors from './pages/CEO/visitors';
import IouCollection from './pages/Account/iouCollection';
import ApproveLoan from './pages/CEO/approvedLoan';
import { useIdleTimer } from 'react-idle-timer';
import { Http } from '@capacitor-community/http';
import CEOSalary from './pages/CEO/salary';
import { useRecoilState, useRecoilValue } from 'recoil';
import { urlAtom } from './recoil/urlAtom';
import { User, userAtom } from './recoil/userAtom';

setupIonicReact();

const App: React.FC = () => {
  const [user, setUser] = useRecoilState<User>(userAtom);
  const href = useRecoilValue<string>(urlAtom);
  const history = useHistory();
  if (isPlatform("capacitor") && !isPlatform("electron")) {
    StatusBar.setOverlaysWebView({ overlay: false });
    StatusBar.setStyle({ style: Style.Light })
    StatusBar.setBackgroundColor({ color: "#90ee90" });
  }
  const initialUser = {
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
  };
  const onIdle = () => {
    if (history.location.pathname !== "/login") {
      Http.request({
        method: "POST",
        url: href + "/api/logout",
        headers: {
          'Content-Type': 'application/json',
          'Data-Type': 'json',
          'Authorization': 'Bearer ' + user.token
        },
      }).then(({ data }) => {
        if (data.success) {
          // setShowAlert(true);
          handleDismiss();
        }
      }).finally(() => {
      });
    }

  }
  const handleDismiss = () => {
    setUser(initialUser);
    history.push("/")
    // setShowAlert(false);
  }
  const onActive = () => {

  }

  const idleTimer = useIdleTimer({ onIdle, onActive, timeout: 1000 * 60 * 60 * 30 });
  return (
    <IonApp>
      {/* <IonAlert isOpen={showAlert} header="Session timeout" message="You have been logout due to Inactivity on the app" buttons={[
            { text: 'Okay', role: 'destructive', handler: () => handleDismiss()}
        ]} onDidDismiss={() => handleDismiss()} /> */}
      <IonReactRouter>
        <IonSplitPane contentId="main">
          <Menu />
          <IonRouterOutlet id="main">
            {/* <PrivateRoute path="/" exact={true}>
              <Redirect to="/page/Inbox" />
            </PrivateRoute> */}
            <Route path="/page/:name" exact={true}>
              <Page />
            </Route>
            <PrivateRoute department="store" path="/store" component={ItemTab} />
            <PrivateRoute department="security" path="/security" component={SecurityTab} />
            <PrivateRoute department="dispatch" path="/dispatch" component={DispatchTabs} />
            <PrivateRoute department="production" path="/production" component={ProductionTab} />
            <PrivateRoute department="packaging" path="/packaging" component={PackagingTab} />
            <Route exact path="/login" component={Login} />
            {/* <Route path="/tabs" component={TabRoot}></Route> */}
            {/* <PrivateRoute department="account" path="/account" component={AccountTab}></PrivateRoute> */}
            <PrivateRoute department="account" exact path='/account/:tab(sales)' component={Sales} />
            <PrivateRoute department="account" exact path='/account/:tab(loan)' component={LoanAcquisition} />
            <PrivateRoute department="account" exact path='/account/:tab(debt)' component={Debt} />
            <PrivateRoute department="account" exact path='/account/:tab(dashboard)' component={AccountDashboard} />
            <PrivateRoute department="account" path='/account/:tab(add)' component={AddPage} />
            <PrivateRoute department="account" exact path='/account/:tab(bank)' component={Banks} />
            <PrivateRoute department="account" exact path="/account/:tab(expenses)" component={AccountExpenses} />
            <PrivateRoute department="account" exact path="/account/:tab(salary)" component={Salary} />
            <PrivateRoute department="account" exact path="/account/:tab(ledger)" component={CustomerLedger} />
            <PrivateRoute department="account" exact path="/account/:tab(iou)" component={IouCollection} />
            <PrivateRoute department="admin" exact path='/admin/:page(dashboard)' component={CeoDashboard} />
            <PrivateRoute department="admin" exact path='/admin/:page(attendance)' component={CeoAttendance} />
            <PrivateRoute department="admin" exact path='/admin/:page(visitors)' component={CeoVisitors} />
            <PrivateRoute department="admin" exact path='/admin/:page(left)' component={CeoLeft} />
            <PrivateRoute department="admin" exact path='/admin/:page(production)' component={CeoProduction} />
            <PrivateRoute department="admin" exact path='/admin/:page(packaging)' component={CeoPackaging} />
            <PrivateRoute department="admin" exact path='/admin/:page(dispatch)' component={CeoDispatch} />
            <PrivateRoute department="admin" exact path='/admin/:page(account)' component={CeoAccount} />
            <PrivateRoute department="admin" exact path='/admin/:page(costproduction)' component={CeoCostProduction} />
            <PrivateRoute department="admin" exact path='/admin/:page(compprod)' component={CeoCompProd} />
            <PrivateRoute department="admin" exact path='/admin/:page(comppack)' component={CeoCompPack} />
            <PrivateRoute department="admin" exact path='/admin/:page(compcash)' component={CeoCompCash} />
            <PrivateRoute department="admin" exact path='/admin/:page(query)' component={Query} />
            <PrivateRoute department="admin" exact path='/admin/:page(profit)' component={CeoProfit} />
            <PrivateRoute department="admin" exact path='/admin/:page(salary)' component={CEOSalary} />
            <PrivateRoute department="admin" path='/admin/:page(store)' component={CeoStore} />
            <PrivateRoute department="admin" exact path="/admin/:page(loan)" component={ApproveLoan} />
            <PrivateRoute department="admin" exact path="/admin">
              <Redirect to="/admin/dashboard" />
            </PrivateRoute>
            <PrivateRoute department="account" exact path="/account">
              <Redirect to="/account/dashboard" />
            </PrivateRoute>
            <Route path="/profile" component={Profile}></Route>
            {/* <PrivateRoute department="admin" path="/admin" component={Pages}></PrivateRoute> */}
            <Route exact={true} path="/" render={() => <Redirect to="/admin" />}></Route>
          </IonRouterOutlet>
        </IonSplitPane>
      </IonReactRouter>
    </IonApp >
  );
};

export default App;
