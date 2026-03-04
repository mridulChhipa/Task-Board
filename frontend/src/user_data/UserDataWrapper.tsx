import { useReducer } from "react";
import type { ReactNode } from "react";
import { UserContext, UserDispatchContext, userDataReducer, initialUserData } from "./UserDataContext";

export function UserDataProvider({children}: {children: ReactNode}){
    const [userData, userDataDispatch] = useReducer(userDataReducer, initialUserData);
    return (
        <UserContext.Provider value={userData}>
            <UserDispatchContext.Provider value={userDataDispatch}>
                {children}
            </UserDispatchContext.Provider>
        </UserContext.Provider>
    );
};

export default UserDataProvider;