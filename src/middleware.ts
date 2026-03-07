import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
    const workspacePattern = /^\/workspace\/[^/]+\/.*$/;

    if (req.nextUrl.pathname === '/') {
        return NextResponse.redirect(new URL('/workspaces', req.url));
    }
    if (workspacePattern.test(req.nextUrl.pathname)) {
        const param = req.nextUrl.pathname.split('/')[2];
        if (param && param !== '' && decodeURI(param) === '[wid]') {
            return NextResponse.redirect(new URL('/workspaces', req.url));
        }
    }
    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/workspace/:param/:path*'],
};
