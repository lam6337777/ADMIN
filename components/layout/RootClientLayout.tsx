'use client';

// Client wrapper cho layout: providers, auth route check
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import StoreProvider from "@/app/StoreProvider";
import { AdminWebSocketProvider } from "@/components/providers/AdminWebSocketProvider";
import { ConfigProvider } from "antd";
import { useAppSelector } from "@/store/redux/hooks";

const AUTH_ROUTES = ['/login', '/register'];

// Guard bên trong StoreProvider để có thể dùng Redux
function AuthGuard({ children, isAuthRoute }: { children: React.ReactNode; isAuthRoute: boolean }) {
    const router = useRouter();
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    // Nếu đã đăng nhập mà còn ở trang auth → redirect về dashboard
    useEffect(() => {
        if (isAuthenticated && isAuthRoute) {
            router.replace('/');
        }
    }, [isAuthenticated, isAuthRoute, router]);

    if (isAuthRoute) {
        return <>{children}</>;
    }

    return (
        <AdminWebSocketProvider>
            <MainLayout>{children}</MainLayout>
        </AdminWebSocketProvider>
    );
}

export default function RootClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthRoute = AUTH_ROUTES.includes(pathname) || pathname?.startsWith('/(auth)');

    return (
        <ConfigProvider
            warning={{ strict: false }}
            theme={{
                token: {
                    fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    colorPrimary: '#000000',
                    colorInfo: '#000000',
                    borderRadius: 9999,
                    borderRadiusLG: 16,
                    colorBgContainer: '#FFFFFF',
                    colorBorder: '#E5E5E5',
                    controlHeight: 40,
                },
                components: {
                    Button: {
                        fontWeight: 500,
                    },
                    Table: {
                        headerBg: '#FFFFFF',
                        headerColor: '#737373',
                        headerSplitColor: 'transparent',
                        borderColor: '#E5E5E5',
                        rowHoverBg: '#F5F5F5',
                    },
                }
            }}
        >
            <StoreProvider>
                <AuthGuard isAuthRoute={isAuthRoute}>
                    {children}
                </AuthGuard>
            </StoreProvider>
        </ConfigProvider>
    );
}
