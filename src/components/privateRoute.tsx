import { Route, Redirect } from "react-router";
import { useRecoilValue } from "recoil";
import { User, userAtom } from "../recoil/userAtom";

interface IPrivateProps {
    component?: React.FC;
    path: string;
    exact?: boolean;
    children?: any;
    department?: String;
}

const PrivateRoute: React.FC<IPrivateProps> = ({ component, path, exact, children, department }) => {
    const user = useRecoilValue<User>(userAtom);
    let condition = false;
    let redirect = "";
    if (user.isLoggedIn) {
        if (department === user.department.toLowerCase()) {
            condition = true;
        } else {
            condition = false;
            redirect = "/" + user.department.toLowerCase();
        }
    }else{
        condition = false;
            redirect = "/login";
    }

    return condition ? (
        <Route path={path} exact={exact} component={component}>
            {children}
        </Route>
    ) : (
        <Redirect to={redirect} />
    )
}

export default PrivateRoute;