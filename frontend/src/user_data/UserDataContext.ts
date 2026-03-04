import { createContext } from 'react';

export const initialUserData: UserDataType = {
    name: "",
    email: "",
    role: "PROJECT_VIEWER",
    projects: [],
    avatar: ""
}

export const UserContext = createContext(initialUserData);
export const UserDispatchContext = createContext<React.Dispatch<UserDataDispatchType>>(() => {});

export type UserDataType = {
    name: string;
    email: string;
    role: "GLOBAL_ADMIN" | "PROJECT_ADMIN" | "PROJECT_MEMBER" | "PROJECT_VIEWER";
    projects: string[];
    avatar: string;
};

export type UserDataDispatchType = 
    | { action_type: "LOGIN"; data: UserDataType }
    | { action_type: "LOGOUT"};

export function userDataReducer(state: UserDataType, action:UserDataDispatchType): UserDataType{
    switch(action.action_type){
        case "LOGIN":
            return action.data;
        case "LOGOUT":
            return initialUserData;
        default:
            return state;
    }
}