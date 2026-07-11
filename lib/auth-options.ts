import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";
import { UserStatus, ProviderAccount } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
    maxAge: 60 * 60,
  },

  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-accounting-session-token"
          : "accounting-session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
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
          throw new Error("โปรดกรอกอีเมลและรหัสผ่าน");
        }

        const user = await prisma.user.findFirst({
          where: {
            email: email,
            userStatus: UserStatus.ACTIVE,
            provider: ProviderAccount.Email,
          },
          include: {
            role: true,
            companies: {
              include: {
                company: true,
              },
            },
          },
        });

        if (!user || !user.password) {
          throw new Error("โปรดตรวจสอบอีเมลและรหัสผ่าน");
        }

        const isPasswordValid = await compare(password, user.password);
        if (!isPasswordValid) {
          throw new Error("โปรดตรวจสอบอีเมลและรหัสผ่าน");
        }

        return {
          id: user.userId,
          email: user.email,
          name: user.name,
          image: user.imageUrl,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.roleName = (user as any).roleName;
        token.roleId = (user as any).roleId;
        token.companyId = (user as any).companyId;
        token.companyName = (user as any).companyName;
        token.isEmailVerified = (user as any).isEmailVerified;
      }

      if (token.id) {
        try {
          const freshUser = await prisma.user.findUnique({
            where: { userId: token.id as string },
            include: {
              role: true,
              companies: {
                include: {
                  company: true,
                },
              },
            },
          });

          if (freshUser) {
            token.roleName = freshUser.role?.name;
            token.roleId = freshUser.roleId || "";
            token.isEmailVerified = freshUser.isEmailVerified;

            const currentCompanyExists = freshUser.companies.some(
              (c) => c.companyId === token.companyId
            );
            if (!token.companyId || !currentCompanyExists) {
              const defaultCompany = freshUser.companies[0]?.company;
              token.companyId = defaultCompany?.companyId;
              token.companyName = defaultCompany?.companyName;
            }
          }
        } catch (error) {
          console.error("Error refreshing session:", error);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).roleName = token.roleName;
        (session.user as any).roleId = token.roleId;
        (session.user as any).companyId = token.companyId;
        (session.user as any).companyName = token.companyName;
        (session.user as any).isEmailVerified = token.isEmailVerified;
      }
      return session;
    },
  },
};
