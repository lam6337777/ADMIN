import { NextResponse, type NextRequest } from 'next/server';

// Các route không cần login
const publicRoutes = ['/login', '/register'];

// Next.js 16+: phải export function tên "proxy" thay vì "middleware"
export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Cho phép public routes và static files
    if (
        publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/')) ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    const token = request.cookies.get('accessToken');
    const userRole = request.cookies.get('userRole');

    if (!token || userRole?.value !== 'ADMIN') {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        // Tránh vòng lặp: chỉ set callbackUrl nếu không phải trang login
        if (pathname !== '/login') {
            url.searchParams.set('callbackUrl', pathname);
        }
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

// Cấu hình matcher
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
