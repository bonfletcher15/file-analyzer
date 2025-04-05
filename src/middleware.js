import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req) {
  const token = req.cookies.get("token")?.value;

  if (req.nextUrl.pathname === "/") {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", req.url)); 
    }
    return NextResponse.redirect(new URL("/login", req.url)); 
  }

//   if (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register") {
//     if (token) {
//       return NextResponse.redirect(new URL("/dashboard", req.url)); 
//     }
//     return NextResponse.next(); 
//   }

//   if (
//     req.nextUrl.pathname.startsWith("/dashboard") 
//   ) {

//     if (!token) {
//       return NextResponse.redirect(new URL("/login", req.url));
//     }

//     try {
      
//       await jwtVerify(token, secret);
//       return NextResponse.next(); 
//     } catch (error) {
//       const response = NextResponse.redirect(new URL("/login", req.url));
//       response.cookies.delete("token");
//       return response;
//     }
//   }

//   return NextResponse.next(); 
// }

// export const config = {
//   matcher: ["/", "/register", "/dashboard/:path*", "/login"], 
};
