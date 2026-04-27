import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("12345678", 10);

  const adminRole = await prisma.role.upsert({
    where: { name: "SUPERADMIN" },
    update: {},
    create: {
      name: "SUPERADMIN",
      description: "System Administrator",
      permissions: JSON.stringify(["ALL"]),
    },
  });

  await prisma.user.upsert({
    where: { email: "thanapognchunchombun@gmail.com" },
    update: {
      password: hashedPassword,
      roleId: adminRole.roleId,
      userStatus: "ACTIVE",
      isEmailVerified: true,
    },
    create: {
      email: "thanapognchunchombun@gmail.com",
      password: hashedPassword,
      name: "SUPERADMIN",
      userStatus: "ACTIVE",
      isEmailVerified: true,
      roleId: adminRole.roleId,
    },
  });

  // await prisma.package.upsert({
  //   where: { id: "free-package" },
  //   update: {},
  //   create: {
  //     id: "free-package",
  //     name: "ฟรี",
  //     description: "แพ็กเกจฟรีสำหรับร้านใหม่",
  //     price: 0,
  //     duration: 30,
  //     features: JSON.stringify([
  //       "พนักงาน 1 คน",
  //       "บริการ 5 รายการ",
  //       "การจอง 50 ครั้ง/เดือน",
  //       "แจ้งเตือนทางอีเมล",
  //     ]),
  //     maxEmployees: 1,
  //     maxServices: 5,
  //     maxBookingsPerMonth: 50,
  //     sortOrder: 0,
  //   },
  // });

  // await prisma.package.upsert({
  //   where: { id: "basic-package" },
  //   update: {},
  //   create: {
  //     id: "basic-package",
  //     name: "พื้นฐาน",
  //     description: "แพ็กเกจพื้นฐานสำหรับร้านที่กำลังเติบโต",
  //     price: 299,
  //     duration: 30,
  //     features: JSON.stringify([
  //       "พนักงาน 3 คน",
  //       "บริการ 15 รายการ",
  //       "การจอง 200 ครั้ง/เดือน",
  //       "แจ้งเตือนทางอีเมลและ LINE",
  //       "รายงานพื้นฐาน",
  //     ]),
  //     maxEmployees: 3,
  //     maxServices: 15,
  //     maxBookingsPerMonth: 200,
  //     sortOrder: 1,
  //   },
  // });

  // await prisma.package.upsert({
  //   where: { id: "pro-package" },
  //   update: {},
  //   create: {
  //     id: "pro-package",
  //     name: "โปร",
  //     description: "แพ็กเกจโปรสำหรับร้านที่ต้องการครบทุกฟีเจอร์",
  //     price: 799,
  //     duration: 30,
  //     features: JSON.stringify([
  //       "พนักงาน 10 คน",
  //       "บริการ 50 รายการ",
  //       "การจองไม่จำกัด",
  //       "แจ้งเตือนทางอีเมลและ LINE",
  //       "รายงานขั้นสูง",
  //       "ส่งออก Excel",
  //       "สแปมรอบรู้",
  //     ]),
  //     maxEmployees: 10,
  //     maxServices: 50,
  //     maxBookingsPerMonth: -1,
  //     sortOrder: 2,
  //   },
  // });

  // await prisma.package.upsert({
  //   where: { id: "enterprise-package" },
  //   update: {},
  //   create: {
  //     id: "enterprise-package",
  //     name: "เอ็นเตอร์ไพรส์",
  //     description: "แพ็กเกจสำหรับธุรกิจขนาดใหญ่",
  //     price: 1999,
  //     duration: 30,
  //     features: JSON.stringify([
  //       "พนักงานไม่จำกัด",
  //       "บริการไม่จำกัด",
  //       "การจองไม่จำกัด",
  //       "แจ้งเตือนทางอีเมลและ LINE",
  //       "รายงานขั้นสูง",
  //       "ส่งออก Excel",
  //       "สแปมรอบรู้",
  //       "API Access",
  //       "Support 24/7",
  //       "Multi-branch",
  //     ]),
  //     maxEmployees: -1,
  //     maxServices: -1,
  //     maxBookingsPerMonth: -1,
  //     sortOrder: 3,
  //   },
  // });

  console.log("Seed completed: ADMIN user and packages created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
