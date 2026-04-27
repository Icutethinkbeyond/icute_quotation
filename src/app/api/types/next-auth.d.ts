import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    roleId?: string;
    roleName?: string;
    // storeName?: string;
    // storeId?: string;
    isEmailVerified?: boolean | string;
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
    // storeName?: string;
    // storeId?: string;
    isEmailVerified?: boolean | string;
    type?: string;
  }
}
