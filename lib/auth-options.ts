import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";
import { UserStatus } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 hour
  },

  // ✅ สำคัญมาก — แยก cookie ไม่ให้ชนกับ customer
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-store-session-token"
          : "store-session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/", // จำกัดเฉพาะ route ร้านค้า
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {
        const { email, password } = credentials ?? {};

        if (!email || !password) {
          console.error('"โปรดกรอกอีเมลและรหัสผ่าน"')
          throw new Error("โปรดกรอกอีเมลและรหัสผ่าน");
        }

        // 1. ลองหาใน User (Store Admin / Owner)
        let loginUser = await prisma.user.findFirst({
          where: {
            email: email,
            userStatus: UserStatus.ACTIVE,
          },
          select: {
            userId: true,
            email: true,
            password: true,
            isEmailVerified: true,
            role: {
              select: {
                name: true,
                roleId: true,
              },
            },
            store: {
              select: {
                storeName: true,
                id: true,
              },
            },
          },
        });

        let roleName: string | undefined;
        let roleId: string | undefined;
        let storeName: string | undefined;
        let storeId: string | undefined;
        let id: string | undefined;
        let emailVerified: boolean = false;

        if (loginUser && loginUser.password) {
          const isPasswordValid = await compare(password, loginUser.password);
          if (isPasswordValid) {
            id = loginUser.userId;
            roleName = loginUser.role?.name;
            roleId = loginUser.role?.roleId;
            storeName = loginUser.store?.storeName;
            storeId = loginUser.store?.id;
            emailVerified = loginUser.isEmailVerified;
          }
        }

        // 2. ถ้าไม่เจอใน User หรือรหัสผ่านไม่ผ่าน ให้ลองหาใน Employee
        if (!id) {
          const employee = await prisma.employee.findFirst({
            where: {
              email: email,
              isActive: true,
              isDelete: false,
            },
            select: {
              id: true,
              email: true,
              password: true,
              name: true,
              surname: true,
              role: {
                select: {
                  name: true,
                  roleId: true,
                },
              },
              store: {
                select: {
                  storeName: true,
                  id: true,
                },
              },
            },
          });

          if (employee && employee.password) {
            const isPasswordValid = await compare(password, employee.password);
            if (isPasswordValid) {
              id = employee.id;
              roleName = employee.role?.name;
              roleId = employee.role?.roleId;
              storeName = employee.store?.storeName;
              storeId = employee.store?.id;
              emailVerified = true; // พนักงานถือว่า verified แล้วถ้า login ได้ (หรือตาม logic ของระบบ)
            }
          }
        }

        if (!id) {
          console.error('"โปรดตรวจสอบชื่อผู้ใช้งานเเละรหัสผ่าน"')
          throw new Error("โปรดตรวจสอบชื่อผู้ใช้งานเเละรหัสผ่าน");
        }

        return {
          id: id,
          email: email,
          roleName: roleName,
          roleId: roleId,
          storeName: storeName,
          storeId: storeId,
          emailVerified: emailVerified,
          type: "store",
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial login - set token from user
      if (user) {
        token.id = user.id;
        token.roleName = (user as any).roleName;
        token.roleId = (user as any).roleId;
        token.storeName = (user as any).storeName;
        token.storeId = (user as any).storeId;
        token.emailVerified = (user as any).emailVerified;
        token.type = (user as any).type;
      }

      // Refresh session data from database on page refresh/update
      if (token.id && token.type === "store") {
        try {
          // Try to find in User table first
          let freshUser = await prisma.user.findFirst({
            where: { userId: token.id },
            select: {
              userId: true,
              email: true,
              isEmailVerified: true,
              userStatus: true,
              role: { select: { name: true, roleId: true } },
              store: { select: { storeName: true, id: true, activated: true } },
            },
          });

          if (freshUser) {
            token.roleName = freshUser.role?.name;
            token.roleId = freshUser.role?.roleId;
            token.storeName = freshUser.store?.storeName;
            token.storeId = freshUser.store?.id;
            token.emailVerified = freshUser.isEmailVerified;
            token.userStatus = freshUser.userStatus;
            token.storeActivated = freshUser.store?.activated;
          } else {
            // Try Employee table
            const employee = await prisma.employee.findFirst({
              where: { id: token.id, isActive: true, isDelete: false },
              select: {
                id: true,
                email: true,
                isActive: true,
                role: { select: { name: true, roleId: true } },
                store: { select: { storeName: true, id: true, activated: true } },
              },
            });

            if (employee) {
              token.roleName = employee.role?.name;
              token.roleId = employee.role?.roleId;
              token.storeName = employee.store?.storeName;
              token.storeId = employee.store?.id;
              token.emailVerified = true;
              token.userStatus = employee.isActive ? "ACTIVE" : "INACTIVE";
              token.storeActivated = employee.store?.activated;
            }
          }
        } catch (error) {
          console.error("Error refreshing session:", error);
        }
      }

      return token;
    },

    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          roleName: token.roleName,
          roleId: token.roleId,
          storeName: token.storeName,
          storeId: token.storeId,
          emailVerified: token.emailVerified,
          type: token.type,
          userStatus: token.userStatus,
          storeActivated: token.storeActivated,
        },
      } as any;
    },
  },
};
