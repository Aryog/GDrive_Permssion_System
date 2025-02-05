import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"

export function AuthButton() {
    const { user, isLoading, login, register } = useAuth()

    if (user || isLoading) {
        return null
    }

    return (
        <div className="flex gap-2">
            <Button variant="outline" onClick={login}>
                Sign In
            </Button>
            <Button onClick={register}>
                Sign Up
            </Button>
        </div>
    )
} 