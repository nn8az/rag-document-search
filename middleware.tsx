import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request: NextRequest) {
    const session = request.cookies.get("session");

    if (!session) {
        const uuid = crypto.randomUUID();
        const jwt = await new SignJWT({ userId: uuid })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("30d")
            .sign(secret);

        const response = NextResponse.next();
        response.cookies.set("session", jwt, {  
            path: "/",
            httpOnly: true,
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30, // 30 days   
        });

        return response
    }
    
    return NextResponse.next();
}

// Only run this on page routes, not images or scripts
export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}