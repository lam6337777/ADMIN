'use client';

// Client wrapper cho layout: providers, auth route check
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import StoreProvider from "@/app/StoreProvider";
import { AdminWebSocketProvider } from "@/components/providers/AdminWebSocketProvider";
import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import "dayjs/locale/vi";
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
            locale={viVN}
            warning={{ strict: false }}
            theme={{
                token: {
                    fontFamily: 'var(--font-be-vietnam), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    colorPrimary: '#0ea893',
                    colorInfo: '#0ea893',
                    colorSuccess: '#0ea893',
                    colorError: '#ec4733',
                    colorWarning: '#f59e0b',
                    colorLink: '#088777',
                    colorText: '#10231f',
                    colorTextSecondary: '#5f7471',
                    colorBorder: '#d3e3df',
                    colorBorderSecondary: '#dfeae7',
                    colorBgLayout: '#f4fbf9',
                    borderRadius: 10,
                    borderRadiusLG: 16,
                    controlHeight: 38,
                },
                components: {
                    Button: { fontWeight: 600, primaryShadow: '0 6px 16px -6px rgba(14,168,147,0.55)' },
                    Table: {
                        headerBg: '#f4fbf9',
                        headerColor: '#5f7471',
                        headerSplitColor: 'transparent',
                        borderColor: '#e6efec',
                        rowHoverBg: '#f1faf7',
                    },
                    Card: { borderRadiusLG: 16 },
                    Tag: { borderRadiusSM: 6 },
                },
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
