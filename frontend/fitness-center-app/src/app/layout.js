import "./globals.css";
import MainLayout from "@/layouts/MainLayout";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body className="bg-gray-100">
        <MainLayout>
          {children}
        </MainLayout>
      </body>
    </html>
  );
}
