import { IonRouterOutlet } from '@ionic/react';
import React from 'react';
import { Route, Redirect } from 'react-router';
import AddPage from './addPage';
import Banks from './banks';
import AccountDashboard from './dashboard';
import Debt from './debt';
import AccountExpenses from './expenses';
import IouCollection from './iouCollection';
// import IOU from './iou';
import CustomerLedger from './ledger';
import LoanAcquisition from './loanAcquisition';
import Salary from './salary';
import Sales from './sales';

const AccountTab: React.FC = () => {
    return (
        <IonRouterOutlet>
            <Route exact path='/account/:tab(sales)' component={Sales} />
            <Route exact path='/account/:tab(loan)' component={LoanAcquisition} />
            <Route exact path='/account/:tab(debt)' component={Debt} />
            <Route exact path='/account/:tab(dashboard)' component={AccountDashboard} />
            <Route path='/account/:tab(add)' component={AddPage} />
            <Route exact path='/account/:tab(bank)' component={Banks} />
            <Route exact path="/account/:tab(expenses)" component={AccountExpenses} />
            <Route exact path="/account/:tab(salary)" component={Salary} />
            <Route exact path="/account/:tab(ledger)" component={CustomerLedger} />
            <Route exact path="/account/:tab(iou)" component={IouCollection} />
            <Route exact path="/account">
                <Redirect to="/account/dashboard" />
            </Route>
        </IonRouterOutlet>
    );
};

export default AccountTab;