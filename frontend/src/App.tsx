import { AuthProvider } from "@/components/auth/auth-provider"
import { AuthButton } from "@/components/auth/auth-button"
import { UserNav } from "@/components/auth/user-nav"
import { FileUpload } from "@/components/file-upload"

export default function App() {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <header className="border-b">
          <div className="container flex h-14 items-center justify-between">
            <div className="font-semibold">e-Patra</div>
            <div className="flex items-center gap-4">
              <AuthButton />
              <UserNav />
            </div>
          </div>
        </header>
        <main className="flex-1">
          <div className="container py-6">
            <FileUpload
              onUploadComplete={(file) => {
                console.log("File uploaded:", file);
                // Handle the uploaded file (e.g., refresh file list)
              }}
            />
          </div>
        </main>
      </div>
    </AuthProvider>
  )
}