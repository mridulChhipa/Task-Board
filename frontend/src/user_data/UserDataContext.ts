import { createContext } from 'react';

export const initialUserData: UserDataType = {
    userId: 0,
    name: "",
    email: "",
    role: "USER",
    projects: [],
    avatar: "",
    refreshToken: ""
}

export const UserContext = createContext(initialUserData);
export const UserDispatchContext = createContext<React.Dispatch<UserDataDispatchType>>(() => {});

export type UserDataType = {
    userId: number;
    name?: string;
    email?: string;
    role?: "GLOBAL_ADMIN" | "USER";
    projects?: string[];
    avatar?: string;
    refreshToken?: string;
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