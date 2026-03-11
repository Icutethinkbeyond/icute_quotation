

import {
  IconReceipt2,
  IconPackage,
  IconBuilding,
  IconUsers,
  IconRulerMeasure,
} from "@tabler/icons-react";

import { uniqueId } from "lodash";

export const useMenuItems = () => {
  return [
    {
      id: uniqueId(),
      title: "ใบเสนอราคา",
      icon: IconReceipt2,
      href: `/quotation`,
    },
    {
      id: uniqueId(),
      title: "ข้อมูลบริษัท",
      icon: IconBuilding,
      href: `/company`,
    },
    {
      id: uniqueId(),
      title: "ข้อมูลลูกค้า",
      icon: IconUsers,
      href: `/customer`,
    },
    {
      id: uniqueId(),
      title: "ข้อมูลสินค้า",
      icon: IconPackage,
      href: `/product`,
    },
    {
      id: uniqueId(),
      title: "ข้อมูลหน่วยสินค้า",
      icon: IconRulerMeasure,
      href: `/unit`,
    },
  ];
};
