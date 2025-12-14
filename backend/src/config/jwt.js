import dotenv from "dotenv";

dotenv.config();

// Shared JWT configuration - ensures same secret is used everywhere
export const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
export const JWT_EXPIRE = process.env.JWT_EXPIRE || "7d";

console.log("🔑 JWT Configuration loaded:");
console.log("  - JWT_SECRET length:", JWT_SECRET.length);
console.log("  - JWT_SECRET preview:", JWT_SECRET.substring(0, 10) + "...");
console.log("  - JWT_EXPIRE:", JWT_EXPIRE);

