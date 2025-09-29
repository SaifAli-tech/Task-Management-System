import type { Metadata } from "next";
import "./globals.css";
import SidebarLayout from "@/components/SidebarLayout";
import { NextAuthProvider } from "@/components/NextAuthProvider";

export const metadata: Metadata = {
  title: "Task Management System",
  description:
    "Enhance your examination preparation with our comprehensive question bank system. Manage your questions, track your progress, and get detailed analytics to improve your learning experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <NextAuthProvider>
          <SidebarLayout>{children}</SidebarLayout>
        </NextAuthProvider>
      </body>
    </html>
  );
}
