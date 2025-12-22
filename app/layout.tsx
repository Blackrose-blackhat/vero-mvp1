import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import { createSupabaseServerClient } from "./supabaseServerClient";

import { AuthProvider } from "./components/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vero | Social Repo Platform",
  description: "Share your work and expertise",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-foreground antialiased selection:bg-primary/20`}>
        <AuthProvider>
          <div className="flex min-h-screen">
            <Sidebar user={user} />
            <main className="flex-1 lg:pl-64">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
