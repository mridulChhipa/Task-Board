import { createContext } from 'react';

export type User = {
    userId?: number;
    name?: string;
    email?: string;
    role?: "GLOBAL_ADMIN" | "USER" | null;
    projects?: string[];
    avatar?: string;
};

export interface AuthContextType {
    isLoading: boolean;
    user: User | null;
}

export const defaultAuth: AuthContextType = {
    isLoading: true,
    user: null,
}

export const AuthContext = createContext(defaultAuth);

export type DispatchType = {
    type: "LOGIN";
    data: AuthContextType;
} | {
    type: "LOGOUT";
};

export const DispatchContext = createContext<React.Dispatch<DispatchType>>(() => { });

export function authReducer(state: AuthContextType, action: DispatchType): AuthContextType {
    switch (action.type) {
        case "LOGIN":
            return { ...action.data };
        case "LOGOUT":
            return defaultAuth;
        default:
            return state;
    }
}