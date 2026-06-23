// Root layout - KHÔNG được dùng 'use client'
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import RootClientLayout from "@/components/layout/RootClientLayout";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
    title: "Admin PF",
    description: "Trang quản trị hệ thống",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="vi">
            <body className={`${inter.variable} antialiased`}>
                <RootClientLayout>
                    {children}
                </RootClientLayout>
            </body>
        </html>
    );
}
