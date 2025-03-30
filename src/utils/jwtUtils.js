
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function encodeJWT(payload) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("1d") 
        .sign(secret);
}


export async function decodeJWT(token) {
    try {
        const { payload } = await jwtVerify(token, secret);
        return payload;
    } catch (error) {
        return null; 
    }
}
