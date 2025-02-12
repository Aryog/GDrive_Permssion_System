import { AuthProvider } from "@/components/auth/auth-provider"
import { ThemeProvider } from "@/components/theme/theme-provider"
import { AuthButton } from "@/components/auth/auth-button"
import { UserNav } from "@/components/auth/user-nav"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { FileUpload } from "@/components/file-upload"
import FileList from './components/FileList'
import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  path: string;
  blobName?: string;
}

// Create a layout component to avoid duplicate code
const Layout = ({ shouldRefresh }: { shouldRefresh: number }) => {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold tracking-tight">My Files</h1>
        <div className="flex items-center gap-4">
          <FileUpload
            onUploadComplete={(file: UploadedFile) => {
              console.log("Uploaded:", file);
              // You might want to refresh your file list here
            }}
          />
        </div>
      </div>

      <FileList key={shouldRefresh} />
    </div>
  );
};

export default function App() {
  const [shouldRefresh, setShouldRefresh] = useState(0);

  const handleUploadComplete = (file: UploadedFile) => {
    console.log("Uploaded:", file);
    setShouldRefresh(prev => prev + 1);
  };

  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark">
        <AuthProvider>
          <div className="min-h-screen flex flex-col bg-background">
            <header className="sticky top-0 z-50 w-full border-b bg-background">
              <div className="container flex h-14 items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="font-semibold">e-Patra</div>
                </div>
                <div className="flex items-center gap-4">
                  <ThemeToggle />
                  <AuthButton />
                  <UserNav />
                </div>
              </div>
            </header>

            <main className="flex-1 flex flex-col">
              <Routes>
                {/* Redirect root to /folder/root */}
                <Route path="/" element={<Navigate to="/folder/root" replace />} />

                {/* Main file list routes */}
                <Route
                  path="/folder/:folderId"
                  element={<Layout shouldRefresh={shouldRefresh} />}
                />

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/folder/root" replace />} />
              </Routes>
            </main>

            <footer className="mt-auto border-t py-4 bg-background">
              <div className="container flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  © 2025 e-Patra. All rights reserved.
                </p>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}