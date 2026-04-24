import jwt, { JwtPayload } from "jsonwebtoken";

export class TokenService {
  private secretKey: string;
  private expiresIn: string;

  constructor(secretKey: string, expiresIn: string) {
    this.secretKey = secretKey;
    this.expiresIn = expiresIn;
  }

  // สร้าง Token
  generateToken(payload: object): string {
    return jwt.sign(payload, this.secretKey, { expiresIn: this.expiresIn } as jwt.SignOptions);
  }

  // ตรวจสอบ Token และดึงข้อมูล
  verifyToken(token: string): JwtPayload | null {
    try {
      return jwt.verify(token, this.secretKey) as JwtPayload;
    } catch (error: any) {
      console.error("Invalid or expired token:", error.message);
      return null;
    }
  }

  // ตรวจสอบว่า Token หมดอายุหรือไม่
  isTokenExpired(token: string): boolean {
    const decoded = this.verifyToken(token);
    if (!decoded || typeof decoded.exp !== "number") return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  }
}