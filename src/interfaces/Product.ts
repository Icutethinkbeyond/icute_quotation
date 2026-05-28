export interface Category {
  categoryId: string;
  categoryName: string;
  categoryDesc?: string | null;
  itemss?: Items[];
  _count?: {
    itemss?: number
  }
}

export interface AboutItem {
  aboutItemsId: string;
  itemsId: string;
  itemsPrice: number;
  itemsDiscountPrice: number | null;
  itemsStock: number;
  itemsBrand: string | null;
  unitName: string | null;
}

export interface Items {
  itemsId: string;
  itemsName: string;
  itemsSKU: string | null;
  itemsDescription: string | null;
  itemsImage: string | null;
  aboutItems?: AboutItem | null;
  category?: Category | null;
  categoryId: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export const initialCategory: Category = {
  categoryId: '',
  categoryName: '',
  categoryDesc: '',
  itemss: [],
};


export const initialAboutItem: AboutItem = {
  aboutItemsId: "",
  itemsId: "",
  itemsPrice: 0,
  itemsDiscountPrice: 0,
  itemsStock: 0,
  itemsBrand: "",
  unitName: '',
}

export const initialItems: Items = {
  itemsId: "",
  itemsName: "",
  itemsSKU: "",
  itemsDescription: "",
  itemsImage: "",
  aboutItems: initialAboutItem,
  category: initialCategory,
  categoryId: "",
}


export type CategorySelect = {
  categoryId: string; // ID ของหมวดหมู่
  categoryName: string; // ชื่อของหมวดหมู่
};
export type ItemsSelect = {
  itemsId: string; // ID ของสินค้า
  itemsName: string; // ชื่อของสินค้า
};
