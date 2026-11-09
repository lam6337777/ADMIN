// Root layout - KHÔNG được dùng 'use client'
import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import RootClientLayout from "@/components/layout/RootClientLayout";

const beVietnam = Be_Vietnam_Pro({
    variable: "--font-be-vietnam",
    subsets: ["latin", "vietnamese"],
    weight: ["400", "500", "600", "700", "800"],
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
            <body className={`${beVietnam.variable} antialiased`}>
                <RootClientLayout>
                    {children}
                </RootClientLayout>
            </body>
        </html>
    );
}
