import { uniqueId } from "lodash";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Briefcase,
  BarChart3,
  Settings,
  ShieldCheck,
  ClipboardList,
  UserRoundCog,
  Server,
  Store,
  Package,
  CreditCard,
  Wallet,
} from "lucide-react";
import {
  IconLayoutDashboard,
  IconReceipt2,
  IconPackage,
  IconBuilding,
  IconUsers,
  IconRulerMeasure,
  IconSettings,
} from "@tabler/icons-react";
import { useTranslations, useLocale } from "next-intl";
// import { useStoreContext } from "@/contexts/StoreContext";
import { useSession } from "next-auth/react";

export const useMenuItemsStore = () => {
  const t = useTranslations("Menus");
  const localActive = useLocale();
  // const { StoreForm, storeSetupStatus } = useStoreContext();
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  // Use actual setup status from API, fall back to heuristic if not available
  // const isSetupIncomplete = storeSetupStatus
  //   ? !storeSetupStatus.setupComplete
  //   : false;
  const isAdmin = !isLoading && session?.user?.roleName === "ADMIN";
  const isSuperAdmin = !isLoading && session?.user?.roleName === "SUPERADMIN";

  const menuItems = [
    {
      id: uniqueId(),
      title: isAdmin ? "แผงควบคุมระบบ" : "แผงควบคุม",
      icon: LayoutDashboard,
      href: isAdmin
        ? `/${localActive}/protected/admin-dashboard`
        : `/${localActive}/protected/dashboard`,
      // hide: isStaff,
    },
    {
      id: uniqueId(),
      title: "ใบเสนอราคา",
      icon: IconReceipt2,
      href: `/protected/quotation`,
      hide: isSuperAdmin,
    },
    {
      id: uniqueId(),
      title: "ข้อมูลบริษัท",
      icon: IconBuilding,
      href: `/protected/company`,
      hide: isSuperAdmin,
    },
    {
      id: uniqueId(),
      title: "ลูกค้า",
      icon: IconUsers,
      href: `/protected/customer`,
      hide: isSuperAdmin,
    },
    {
      id: uniqueId(),
      title: "ข้อมูลสินค้า",
      icon: IconPackage,
      href: `/protected/product`,
      hide: isSuperAdmin,
    },
    {
      id: uniqueId(),
      title: "ข้อมูลหน่วยสินค้า",
      icon: IconRulerMeasure,
      href: `/protected/unit`,
      hide: isSuperAdmin,
    },
    // {
    //   id: uniqueId(),
    //   title: "รายงาน",
    //   icon: BarChart3,
    //   href: `/${localActive}/store/protected/reports`,
    //   hide: isAdmin || isStaff || isReception || isSetupIncomplete,
    // },
    {
      id: uniqueId(),
      title: "ตั้งค่าบัญชี",
      icon: UserRoundCog,
      // hide: isSuperAdmin,
      children: isSuperAdmin
        ? [
            {
              id: uniqueId(),
              title: "ข้อมูลส่วนตัว",
              href: `/${localActive}/protected/profile`,
            },
            {
              id: uniqueId(),
              title: "เปลี่ยนรหัสผ่าน",
              href: `/${localActive}/protected/password`,
            },
          ]
        : [
            {
              id: uniqueId(),
              title: "ข้อมูลส่วนตัว",
              href: `/${localActive}/protected/admin-profile`,
            },
            {
              id: uniqueId(),
              title: "เปลี่ยนรหัสผ่าน",
              href: `/${localActive}/protected/admin-password`,
            },
          ],
    },
    // {
    //   id: uniqueId(),
    //   title: "ตั้งค่าร้า",
    //   icon: Settings,
    //   href: `/${localActive}/store/protected/shop-settings`,
    //   hide: isAdmin || isManager || isStaff || isReception,
    // },
    // {
    //   id: uniqueId(),
    //   title: "สิทธิ์การใช้งาน",
    //   icon: ShieldCheck,
    //   href: `/${localActive}/store/protected/permissions`,
    //   hide: isAdmin || isManager || isStaff || isReception || isSetupIncomplete,
    // },
    // {
    //   id: uniqueId(),
    //   title: "แพ็กเกจ",
    //   icon: Package,
    //   href: `/${localActive}/store/protected/packages`,
    //   hide: isAdmin || isStaff || isReception,
    // },
    // {
    //   id: uniqueId(),
    //   title: "การเงิน",
    //   icon: CreditCard,
    //   href: `/${localActive}/store/protected/billing`,
    //   hide: isAdmin || isStaff || isReception || isSetupIncomplete,
    // },
    // {
    //   id: uniqueId(),
    //   title: "จัดการร้านค้า",
    //   icon: Store,
    //   href: `/${localActive}/protected/admin-stores`,
    //   hide: !isSuperAdmin,
    // },
    // {
    //   id: uniqueId(),
    //   title: "จัดการการเงิน",
    //   icon: CreditCard,
    //   href: `/${localActive}/store/protected/admin-billing`,
    //   hide: !isAdmin,
    // },
    // {
    //   id: uniqueId(),
    //   title: "จัดการเครดิต",
    //   icon: Wallet,
    //   href: `/${localActive}/store/protected/admin-credit`,
    //   hide: !isAdmin,
    // },
    // {
    //   id: uniqueId(),
    //   title: "จัดการแพ็กเกจ",
    //   icon: Package,
    //   href: `/${localActive}/store/protected/admin-packages`,
    //   hide: !isAdmin,
    // },
    {
      id: uniqueId(),
      title: "ตั้งค่าระบบ",
      icon: Server,
      href: `/${localActive}/protected/system-settings`,
      hide: !isSuperAdmin,
      children: isSuperAdmin
        ? [
            {
              id: uniqueId(),
              title: "ทั่วไป",
              href: `/${localActive}/protected/system-settings`,
            },
            // {
            //   id: uniqueId(),
            //   title: "การเงิน",
            //   href: `/${localActive}/store/protected/system-settings/banking`,
            // },
          ]
        : [],
    },
  ];

  return menuItems.filter((item) => !item.hide);
};
