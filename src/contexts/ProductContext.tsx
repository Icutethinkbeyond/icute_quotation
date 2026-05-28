// contexts/ProductContext.tsx

"use client";

import {
  Category,
  initialCategory,
  CategorySelect,
  Items,
  initialItems,
  ItemsSelect
} from "@/interfaces/Product";
import { GridPaginationModel } from "@mui/x-data-grid";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
} from "react";

export interface SearchFormData {
  categoryName: string;
}
export interface SearchProductFormData {
  itemsId: string;
  categoryName: string;
  itemsName: string;
  itemsSKU: string;
  itemsStock: string;
  itemsBrand: string;
  itemsPrice: string;
  itemsDiscountPrice: string;
}

// กำหนดประเภทของ Context
interface ProductContextProps {
  categoryState: Category[];
  setCategoryState: Dispatch<React.SetStateAction<Category[]>>;
  categoryForm: Category;
  setCategoryForm: Dispatch<React.SetStateAction<Category>>;
  setCategorySelectState: Dispatch<React.SetStateAction<CategorySelect[]>>;
  categorySelectState: CategorySelect[];

  productState: Items[];
  setProductState: Dispatch<React.SetStateAction<Items[]>>;
  productForm: Items;
  setProductForm: Dispatch<React.SetStateAction<Items>>;
  setProductSelectState: Dispatch<React.SetStateAction<ItemsSelect[]>>;
  productSelectState: ItemsSelect[];
  paginationModel: GridPaginationModel;
  setPaginationModel: Dispatch<React.SetStateAction<GridPaginationModel>>;
  rowCount: number;
  setRowCount: Dispatch<React.SetStateAction<number>>;
  searchForm: SearchFormData;
  searchProductForm: SearchProductFormData;
  setSearchForm: Dispatch<React.SetStateAction<SearchFormData>>;
  setSearchProductForm: Dispatch<React.SetStateAction<SearchProductFormData>>;
}

// สร้าง Context
const ProductContext = createContext<ProductContextProps | undefined>(
  undefined
);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [categoryState, setCategoryState] = useState<Category[]>([]);
  const [categorySelectState, setCategorySelectState] = useState<
    CategorySelect[]
  >([]);
  const [categoryForm, setCategoryForm] = useState<Category>(initialCategory);
  
  const [productState, setProductState] = useState<Items[]>([]);
  const [productSelectState, setProductSelectState] = useState<
    ItemsSelect[]
  >([]);
  const [productForm, setProductForm] = useState<Items>(initialItems);
  const [rowCount, setRowCount] = useState<number>(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });


  const [searchForm, setSearchForm] = useState<SearchFormData>({
    categoryName: "",
  });

  const [searchProductForm, setSearchProductForm] = useState<SearchProductFormData>({
    itemsId: "",
    categoryName: "",
    itemsName: "",
    itemsSKU: "",
    itemsStock: "",
    itemsBrand: "",
    itemsPrice: "",
    itemsDiscountPrice: "",
  });

  return (
    <ProductContext.Provider
      value={{
        searchForm,
        setSearchForm,
        setRowCount,
        rowCount,
        categoryState,
        setCategoryState,
        categoryForm,
        setCategoryForm,
        categorySelectState,
        setCategorySelectState,
        searchProductForm,
        setSearchProductForm,
        productState,
        setProductState,
        productForm,
        setProductForm,
        productSelectState,
        setProductSelectState,
        setPaginationModel,
        paginationModel,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

// Hook สำหรับใช้ Context
export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProductContext must be used within a ProductProvider");
  }
  return context;
};
