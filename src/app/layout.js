import "./globals.css";
import { SidebarProvider } from "@/components/layout/SidebarContext";
import { AuthProvider } from "@/context/AuthContext";
import ClientLayout from "@/components/ClientLayout";

export const metadata = {
  title: "crm.anglobalservices.com",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        <AuthProvider>
          <SidebarProvider>
            <ClientLayout>{children}</ClientLayout>
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}