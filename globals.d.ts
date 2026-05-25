export {};

declare global {
    interface CustomJwtSessionClaims {
        role?: "admin" | "customer";
    }
}