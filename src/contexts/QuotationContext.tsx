"use client";

import { toNumber } from "lodash";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import { calculateFooterTotals, calculateTax } from "@/utils/utils";
import { Customer } from "@/interfaces/Customer";
import { CustomerCompany } from "@/interfaces/Company";


// ==================== ENUMS ====================

export enum DOCUMENT_TYPE {
  QUOTATION = 'Quotation',
  INVOICE = 'Invoice',
  RECEIPT = 'Receipt',
}

export enum DOCUMENT_STATUS {
  DRAFT = 'Draft',
  WAITING = 'Waiting',
  APPROVE = 'Approve',
  CANCEL = 'Cancel',
}

// ==================== INTERFACES ====================

// ----- Contact & Company Types -----

// ----- Contact & Company Types -----

// Use shared interfaces
export type IContactor = Customer;
export type ICustomerCompany = CustomerCompany;

// ----- Product & Item Types -----

/** ข้อมูลสินค้าย่อย (SubProduct) */
export interface ISubProduct {
  isSubjectItem: boolean;
  productServiceKey: number;
  productService: string;
  description: string;
  amount: number;
  price: number;
  discount: number;
  total: number;
  subProductServiceNumber: number;
}

/** ข้อมูลสินค้าหลัก (Product) */
export interface IProduct {
  isSubjectItem: boolean;
  productService: string;
  description: string;
  amount: number;
  price: number;
  discount: number;
  total: number;
  productServiceNumber: number;
  subProductList: ISubProduct[];
  totalAmount: number;
  totalPrice: number;
  totalDiscount: number;
  sumTotal: number;
  totalAmountDue: number;
}

// ----- Document Types -----

export interface IDocumentCategory {
  categoryId: string;
  name: string;
  orderIndex: number;
  items: IDocumentItem[];
}

export interface IDocumentItem {
  itemId: string;
  name?: string;
  description: string;
  unit: string;
  qty: number;
  pricePerUnit: number;
  remark?: string;
  totalPrice: number;
  orderIndex: number;
}

// ----- Form Types -----

/** ข้อมูล Footer ของเอกสาร */
export interface IFormDataFooter {
  total: number;
  discountPrice: number;
  priceAfterDiscount: number;
  includeVat: boolean;
  vatPrice: number;
  totalAmount: number;
  withholdingTax: number;
  withholdingTaxPrice: number;
  totalAmountDue: number;
}

/** ข้อมูล Header ของเอกสาร */
export interface IHeadForm {
  quotationNumber: string;
  companyName: string;
  companyTel: string;
  companyAddress: string;
  taxId: string;
  branch: string;

  // Customer Type
  customerType: "Individual" | "Corporate"; // Added field

  // Customer Company Fields
  customerCompanyName: string;
  customerCompanyTel: string;
  customerCompanyAddress: string;
  customerTaxId: string;
  customerBranch: string;

  // Contactor Fields
  contactorName: string;
  contactorTel: string;
  contactorAddress: string;
  contactorEmail: string;

  dateCreate: string;
  includeTax: boolean;
  note: string;
}

// ----- Quotation Types -----

export interface IQuotation {
  documentId: string;
  documentIdNo: string;
  docType: string;
  docMonth?: string;
  docYear?: string;
  documentDetials?: string;

  customerCompany?: ICustomerCompany;
  customerCompanyId?: string;

  contactor?: IContactor;
  contactorId?: string;

  documentType: DOCUMENT_TYPE;
  documentStatus: DOCUMENT_STATUS;
  documentCreateDate?: Date | string;
  documentExpire?: Date | string;

  includeVat: boolean;
  taxRate: number;
  globalDiscount: number;

  subTotal: number;
  totalAfterDiscount: number;
  vatAmount: number;
  grandTotal: number;
  withholdingTax: number;

  note?: string;

  categories: IDocumentCategory[];

  isDeleted: boolean;
  deletedAt?: Date | string | null;

  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IQuotationTableRow extends IQuotation {
  keyId: string;
  id: string;
}

// ==================== TYPE ALIASES ====================

/** Alias สำหรับความเข้ากันได้กับโค้ดเดิม */
export type SubProduct = ISubProduct;
export type Product = IProduct;
export type FormDataFooter = IFormDataFooter;
export type HeadForm = IHeadForm;

// ==================== DEFAULT VALUES ====================

export const PRODUCT_CLEAN: IProduct = {
  isSubjectItem: true,
  productServiceNumber: 0,
  productService: "",
  description: "",
  price: 0,
  amount: 0,
  discount: 0,
  total: 0,
  subProductList: [],
  totalAmount: 0,
  totalPrice: 0,
  totalDiscount: 0,
  sumTotal: 0,
  totalAmountDue: 0,
};

export const SUB_PRODUCT_CLEAN: ISubProduct = {
  isSubjectItem: false,
  subProductServiceNumber: 0,
  productService: "",
  description: "",
  price: 0,
  amount: 0,
  discount: 0,
  total: 0,
  productServiceKey: 0,
};

export const FOOTER_FORM_CLEAN: IFormDataFooter = {
  total: 0,
  discountPrice: 0,
  priceAfterDiscount: 0,
  includeVat: false,
  vatPrice: 0,
  totalAmount: 0,
  withholdingTax: 0,
  withholdingTaxPrice: 0,
  totalAmountDue: 0,
};

export const headerClean: IHeadForm = {
  quotationNumber: "",
  companyName: "",
  companyTel: "",
  companyAddress: "",
  taxId: "",
  branch: "",
  
  customerType: "Individual",
  customerCompanyName: "",
  customerCompanyTel: "",
  customerCompanyAddress: "",
  customerTaxId: "",
  customerBranch: "",

  contactorName: "",
  contactorTel: "",
  contactorAddress: "",
  contactorEmail: "",

  dateCreate: "",
  includeTax: false,
  note: "",
};


// ==================== COMPONENT PROPS ====================

/** Props สำหรับ QuotationsTable component */
export type QuotationsTableProps = Record<string, never>;

/** Props สำหรับ TrashTable component */
export type TrashTableProps = Record<string, never>;

/** Props สำหรับ Category Input */
export interface ICategoryInput {
  id: string;
  name: string;
  subItems: ISubItemInput[];
}

/** Props สำหรับ SubItem Input */
export interface ISubItemInput {
  id: string;
  description: string;
  unit: string;
  qty: number;
  pricePerUnit: number;
  remark: string;
}

// ==================== CONTEXT ====================


// กำหนดประเภทของ Context
interface QuotationListContextProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  addProduct: (product: Product) => void;
  removeProduct: (productServiceNumber: number) => void;
  updateProduct: (updatedProduct: Product) => void;
  addSubProduct: (productServiceNumber: number, subProduct: SubProduct) => void;
  removeSubProduct: (
    productServiceNumber: number,
    subProductServiceNumber: number
  ) => void;
  updateSubProduct: (
    productServiceNumber: number,
    updatedSubProduct: SubProduct
  ) => void;

  //สินค้า
  productEdit: Product;
  setProductEdit: React.Dispatch<React.SetStateAction<Product>>;
  subProductEdit: SubProduct;
  setSubProductEdit: React.Dispatch<React.SetStateAction<SubProduct>>;

  isProductEdit: boolean;
  setIsProductEdit: React.Dispatch<React.SetStateAction<boolean>>;
  isSubProductEdit: boolean;
  setIsSubProductEdit: React.Dispatch<React.SetStateAction<boolean>>;

  //ส่วนท้ายเอกสาร
  footerForm: FormDataFooter;
  setFooterForm: React.Dispatch<React.SetStateAction<FormDataFooter>>;

  //ส่วนหัวเอกสาร
  headForm: HeadForm;
  setHeadForm: React.Dispatch<React.SetStateAction<HeadForm>>;
  loadHeadForm: (data: Partial<HeadForm>) => void;

  isPreview: boolean;
  setIsPreview: React.Dispatch<React.SetStateAction<boolean>>;
}

// สร้าง Context
const QuotationListContext = createContext<
  QuotationListContextProps | undefined
>(undefined);

export const QuotationProvider = ({ children }: { children: ReactNode }) => {

  const [products, setProducts] = useState<Product[]>([]);
  const [footerForm, setFooterForm] = useState<FormDataFooter>(FOOTER_FORM_CLEAN);
  const [productEdit, setProductEdit] = useState<Product>(PRODUCT_CLEAN);
  const [headForm, setHeadForm] = useState<HeadForm>(headerClean);
  const [subProductEdit, setSubProductEdit] =
    useState<SubProduct>(SUB_PRODUCT_CLEAN);
  const [isProductEdit, setIsProductEdit] = useState<boolean>(false);
  const [isSubProductEdit, setIsSubProductEdit] = useState<boolean>(false);

  const [isPreview, setIsPreview] = useState<boolean>(false);

  // useEffect(() => {
  //   console.log(headForm)
  // }, [headForm])


  // Function to calculate totals
  const calculateTotals = (products: Product[]): Product[] => {

    return products.map((product) => {
      const totalAmount = product.subProductList.reduce(
        (sum, subProduct) => sum + subProduct.amount,
        product.amount
      );

      const totalPrice = product.subProductList.reduce(
        (sum, subProduct) => sum + subProduct.price * subProduct.amount,
        product.price * product.amount
      );

      const totalDiscount = product.subProductList.reduce(
        (sum, subProduct) => sum + subProduct.discount,
        product.discount
      );

      const sumTotal = product.subProductList.reduce(
        (sum, subProduct) => sum + subProduct.total,
        product.total
      );

      const totalAmountDue = sumTotal - totalDiscount;

      // Only update the product if the totals have changed
      if (
        totalAmount !== product.totalAmount ||
        totalPrice !== product.totalPrice ||
        totalDiscount !== product.totalDiscount ||
        totalAmountDue !== product.totalAmountDue
      ) {
        return {
          ...product,
          totalAmount,
          totalPrice,
          totalDiscount,
          totalAmountDue,
          sumTotal,
        };
      }

      return product;
    });
  };

  // Update totals whenever products change
  useEffect(() => {
    const updatedProducts = calculateTotals(products);
    const { totalPrice, totalDiscount, priceAfterDiscount } =
      calculateFooterTotals(products);

    setFooterForm({
      ...footerForm,
      total: totalPrice,
      discountPrice: totalDiscount,
      priceAfterDiscount: priceAfterDiscount,
    });

    // Check if there are any differences before setting the state
    if (JSON.stringify(products) !== JSON.stringify(updatedProducts)) {
      setProducts(updatedProducts);
    }

    // console.log(products);
  }, [products]);

  useEffect(() => {
    let vatRate = footerForm.includeVat ? 0.07 : 0;

    const {
      totalWithVAT,
      vatAmount,
      withholdingTaxAmount,
      totalAfterWithholdingTax,
    } = calculateTax(
      footerForm.priceAfterDiscount,
      vatRate,
      footerForm.withholdingTax
    );

    // // Only update state if the calculated values are different
    if (
      vatAmount !== footerForm.vatPrice ||
      totalWithVAT !== footerForm.totalAmount ||
      withholdingTaxAmount !== footerForm.withholdingTaxPrice ||
      totalAfterWithholdingTax !== footerForm.totalAmountDue
    ) {
      setFooterForm((prevForm) => ({
        ...prevForm,
        vatPrice: vatAmount,
        totalAmount: totalWithVAT,
        withholdingTaxPrice: withholdingTaxAmount,
        totalAmountDue: totalAfterWithholdingTax,
      }));
    }
  }, [
    footerForm.includeVat,
    footerForm.priceAfterDiscount,
    footerForm.withholdingTax,
  ]);

  // ฟังก์ชันสำหรับเพิ่มสินค้า
  const addProduct = (product: Product) => {
    console.log("🎯 addProduct() called with:", product);
    setProducts((prevProducts) => {
      console.log("📦 Products BEFORE adding:", prevProducts.length, prevProducts);
      const newProducts = [...prevProducts, product];
      console.log("📦 Products AFTER adding:", newProducts.length, newProducts);
      return newProducts;
    });
  };

  // ฟังก์ชันสำหรับลบสินค้า
  const removeProduct = (productServiceNumber: number) => {
    setProducts((prevProducts) =>
      prevProducts.filter(
        (product) => product.productServiceNumber !== productServiceNumber
      )
    );
  };

  // ฟังก์ชันสำหรับอัปเดตสินค้า
  const updateProduct = (updatedProduct: Product) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.productServiceNumber === updatedProduct.productServiceNumber
          ? updatedProduct
          : product
      )
    );
  };

  // ฟังก์ชันสำหรับเพิ่มสินค้าย่อย
  const addSubProduct = (
    productServiceNumber: number,
    subProduct: SubProduct
  ) => {
    console.log(subProduct)
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        toNumber(product.productServiceNumber) === productServiceNumber
          ? {
            ...product,
            subProductList: [...product.subProductList, subProduct],
          }
          : product
      )
    );
  };

  // ฟังก์ชันสำหรับลบสินค้าย่อย
  const removeSubProduct = (
    productServiceNumber: number,
    subProductServiceNumber: number
  ) => {
    console.log(productServiceNumber, subProductServiceNumber);
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.productServiceNumber === productServiceNumber
          ? {
            ...product,
            subProductList: product.subProductList.filter(
              (subProduct) =>
                subProduct.subProductServiceNumber !== subProductServiceNumber
            ),
          }
          : product
      )
    );
  };

  // ฟังก์ชันสำหรับอัปเดตสินค้าย่อย
  const updateSubProduct = (
    productServiceNumber: number,
    updatedSubProduct: SubProduct
  ) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.productServiceNumber === productServiceNumber
          ? {
            ...product,
            subProductList: product.subProductList.map((subProduct) =>
              subProduct.subProductServiceNumber ===
                updatedSubProduct.subProductServiceNumber
                ? updatedSubProduct
                : subProduct
            ),
          }
          : product
      )
    );
  };

  return (
    <QuotationListContext.Provider
      value={{
        products,
        setProducts,
        addProduct,
        removeProduct,
        updateProduct,
        addSubProduct,
        removeSubProduct,
        updateSubProduct,
        productEdit,
        setProductEdit,
        subProductEdit,
        setSubProductEdit,
        isProductEdit,
        setIsProductEdit,
        isSubProductEdit,
        setIsSubProductEdit,
        footerForm,
        setFooterForm,
        headForm,
        setHeadForm,
        loadHeadForm: useCallback((data: Partial<HeadForm>) => {
          setHeadForm(prev => ({ ...prev, ...data }));
        }, []),
        setIsPreview,
        isPreview
      }}
    >
      {children}
    </QuotationListContext.Provider>
  );
};

// Hook สำหรับใช้ Context
export const useQuotationListContext = () => {
  const context = useContext(QuotationListContext);
  if (!context) {
    throw new Error(
      "useQuotationListContext must be used within a QuotationProvider"
    );
  }
  return context;
};
