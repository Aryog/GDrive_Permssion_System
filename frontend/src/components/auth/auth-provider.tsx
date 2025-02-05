import { useEffect, useState } from 'react'
import { AuthContext, type User } from '@/lib/auth'

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const backendUrl = import.meta.env.VITE_BACKEND_URL

    useEffect(() => {
        // Check auth status on mount
        checkAuth()
    }, [])

    const checkAuth = async () => {
        try {
            const res = await fetch(`${backendUrl}/api/auth/me`, {
                credentials: 'include',  // Important for sending cookies
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            if (res.ok) {
                const data = await res.json()
                setUser(data.user)
            }
        } catch (error) {
            console.error('Auth check failed:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const login = () => {
        window.location.href = `${backendUrl}/api/auth/login`
    }

    const register = () => {
        window.location.href = `${backendUrl}/api/auth/register`
    }

    const logout = async () => {
        try {
            const res = await fetch(`${backendUrl}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            if (res.ok) {
                setUser(null)
                window.location.href = '/'
            }
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
} 