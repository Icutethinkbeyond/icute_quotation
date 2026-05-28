import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";
import { UserStatus, RoleName, ProviderAccount } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 hour
  },

  // ✅ สำคัญมาก — แยก cookie ไม่ให้ชนกับระบบอื่น
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
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials, req) {
        const { email, password } = credentials ?? {};

        if (!email || !password) {
          throw new Error("โปรดกรอกอีเมลและรหัสผ่าน");
        }

        // 1. ค้นหาผู้ใช้ตามอีเมล
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
                company: true
              }
            }
          }
        });

        if (!user || !user.password) {
          throw new Error("โปรดตรวจสอบอีเมลเเละรหัสผ่าน");
        }

        const isPasswordValid = await compare(password, user.password);
        if (!isPasswordValid) {
          throw new Error("โปรดตรวจสอบอีเมลเเละรหัสผ่าน");
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
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" || account?.provider === "facebook") {
        if (!user.email) return false;

        // 1. ตรวจสอบว่ามีผู้ใช้อยู่แล้วหรือไม่
        let dbUser: any = await prisma.user.findUnique({
          where: { email: user.email },
          include: { companies: true }
        });

        const provider = account.provider === "google" ? ProviderAccount.Google : ProviderAccount.Facebook;

        if (!dbUser) {
          // 2. ถ้าไม่มี ให้สร้างใหม่
          // ค้นหา Role "ADMIN" (หรือตามที่ระบบต้องการสำหรับผู้ใช้ใหม่)
          let adminRole = await prisma.role.findUnique({
            where: { name: RoleName.ADMIN },
          });

          if (!adminRole) {
            adminRole = await prisma.role.create({
              data: {
                name: RoleName.ADMIN,
                description: "Administrator",
                permissions: JSON.stringify(["ALL"]),
              },
            });
          }

          dbUser = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
              data: {
                email: user.email!,
                name: user.name,
                imageUrl: user.image,
                provider: provider,
                providerId: account.providerAccountId,
                userStatus: UserStatus.ACTIVE,
                isEmailVerified: true, // Social login ถือว่า verified แล้ว
                roleId: adminRole!.roleId,
              }
            });

            // สร้างบริษัทเริ่มต้นให้ผู้ใช้ใหม่
            const company = await tx.company.create({
              data: {
                companyName: `${user.name || 'My'} Company`,
                companyEmail: user.email,
              }
            });

            await tx.companyUser.create({
              data: {
                userId: newUser.userId,
                companyId: company.companyId,
              }
            });

            return newUser;
          });
        } else {
          // 3. ถ้ามีผู้ใช้อยู่แล้ว แต่ provider ไม่ตรงกัน อาจจะทำการ link หรือ update
          if (dbUser.provider === ProviderAccount.Email && !dbUser.providerId) {
            // กรณีเป็น User ที่สมัครด้วย Email มาก่อน ให้ update provider info (ถ้าต้องการ)
            await prisma.user.update({
              where: { userId: dbUser.userId },
              data: {
                provider: provider,
                providerId: account.providerAccountId,
                imageUrl: dbUser.imageUrl || user.image,
              }
            });
          }
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
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

      // รีเฟรชข้อมูลจาก Database เพื่อให้ข้อมูลเป็นปัจจุบัน
      if (token.id) {
        try {
          const freshUser = await prisma.user.findUnique({
            where: { userId: token.id as string },
            include: {
              role: true,
              companies: {
                include: {
                  company: true
                }
              }
            }
          });

          if (freshUser) {
            token.roleName = freshUser.role?.name;
            token.roleId = freshUser.roleId || '';
            token.isEmailVerified = freshUser.isEmailVerified;
            
            // ถ้าบริษัทยังไม่ได้ถูกเลือก หรือบริษัทเดิมไม่มีอยู่แล้ว ให้เลือกใหม่
            const currentCompanyExists = freshUser.companies.some(c => c.companyId === token.companyId);
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
