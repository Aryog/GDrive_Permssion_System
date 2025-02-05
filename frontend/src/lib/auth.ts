import { createContext, useContext } from 'react'

export type User = {
    id: string
    email: string
    given_name?: string
    family_name?: string
    picture?: string
}

type AuthContextType = {
    user: User | null
    isLoading: boolean
    login: () => void
    register: () => void
    logout: () => void
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: false,
    login: () => { },
    register: () => { },
    logout: () => { },
})

export const useAuth = () => useContext(AuthContext) 