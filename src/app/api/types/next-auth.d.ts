import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    roleId?: string;
    roleName?: string;
    isEmailVerified?: boolean | string;
    companyId?: string | null;
    companyName?: string | null;
    type?: string;
  }

  interface Session extends DefaultSession {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    roleId?: string;
    roleName?: string;
    isEmailVerified?: boolean | string;
    companyId?: string | null;
    companyName?: string | null;
    type?: string;
  }
}
