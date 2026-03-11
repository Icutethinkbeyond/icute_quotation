"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode, Dispatch } from "react"

export interface SubItem {
  id: string
  name: string
  description: string
  unit: string
  qty: number
  pricePerUnit: number
  remark: string
}

export interface Category {
  id: string
  name: string
  subItems: SubItem[]
}

interface PricingContextType {
  categories: Category[]
  setCategories: Dispatch<React.SetStateAction<Category[]>>;
  addCategory: (name: string) => void
  removeCategory: (categoryId: string) => void
  updateCategoryName: (categoryId: string, name: string) => void
  addSubItem: (categoryId: string, subItem: Omit<SubItem, "id">) => void
  removeSubItem: (categoryId: string, subItemId: string) => void
  updateSubItem: (categoryId: string, subItemId: string, subItem: Partial<SubItem>) => void
  duplicateSubItem: (categoryId: string, subItemId: string) => void
  getTotalPrice: () => number
  getCategoryTotal: (categoryId: string) => number
  discount: number
  taxRate: number
  vatIncluded: boolean
  setDiscount: (discount: number) => void
  setTaxRate: (taxRate: number) => void
  setVatIncluded: (vatIncluded: boolean) => void
  getSubtotal: () => number
  getTotalAfterDiscount: () => number
  getTaxAmount: () => number
  withholdingTaxRate: number
  setWithholdingTaxRate: (rate: number) => void
  getWithholdingTaxAmount: () => number
  getGrandTotal: () => number
  // loadData: (categories: Category[]) => void
}

const PricingContext = createContext<PricingContextType | undefined>(undefined)

export const usePricingContext = () => {
  const context = useContext(PricingContext)
  if (!context) {
    throw new Error("usePricing must be used within PricingProvider")
  }
  return context
}

interface PricingProviderProps {
  children: ReactNode
}



export const PricingProvider: React.FC<PricingProviderProps> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [discount, setDiscount] = useState<number>(0)
  const [taxRate, setTaxRate] = useState<number>(7)
  const [vatIncluded, setVatIncluded] = useState<boolean>(false)
  const [withholdingTaxRate, setWithholdingTaxRate] = useState<number>(0)

  useEffect(() => {
    console.log(categories)
  }, [categories])

  const addCategory = useCallback((name: string) => {
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name,
      subItems: [],
    }
    setCategories((prev) => [...prev, newCategory])
  }, [])

  const removeCategory = useCallback((categoryId: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== categoryId))
  }, [])

  const updateCategoryName = useCallback((categoryId: string, name: string) => {
    setCategories((prev) => prev.map((cat) => (cat.id === categoryId ? { ...cat, name } : cat)))
  }, [])

  const addSubItem = useCallback((categoryId: string, subItem: Omit<SubItem, "id">) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
            ...cat,
            subItems: [...cat.subItems, { ...subItem, id: `item-${Date.now()}` }],
          }
          : cat,
      ),
    )
  }, [])

  const removeSubItem = useCallback((categoryId: string, subItemId: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
            ...cat,
            subItems: cat.subItems.filter((item) => item.id !== subItemId),
          }
          : cat,
      ),
    )
  }, [])

  const updateSubItem = useCallback((categoryId: string, subItemId: string, subItem: Partial<SubItem>) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
            ...cat,
            subItems: cat.subItems.map((item) => (item.id === subItemId ? { ...item, ...subItem } : item)),
          }
          : cat,
      ),
    )
  }, [])

  const duplicateSubItem = useCallback((categoryId: string, subItemId: string) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        const itemIndex = cat.subItems.findIndex((item) => item.id === subItemId);
        if (itemIndex === -1) return cat;

        const itemToDuplicate = cat.subItems[itemIndex];
        const duplicatedItem = {
          ...itemToDuplicate,
          id: `item-${Date.now()}`,
        };

        const newSubItems = [...cat.subItems];
        newSubItems.splice(itemIndex + 1, 0, duplicatedItem);

        return {
          ...cat,
          subItems: newSubItems,
        };
      }),
    )
  }, [])

  const getCategoryTotal = useCallback((categoryId: string): number => {
    const category = categories.find((cat) => cat.id === categoryId)
    if (!category) return 0
    return category.subItems.reduce((sum, item) => sum + item.qty * item.pricePerUnit, 0)
  }, [categories])

  const getTotalPrice = useCallback(() => {
    return categories.reduce((sum, cat) => {
      const categoryTotal = cat.subItems.reduce((s, item) => s + (item.qty * item.pricePerUnit), 0)
      return sum + categoryTotal
    }, 0)
  }, [categories])

  const getSubtotal = useCallback(() => {
    return getTotalPrice()
  }, [getTotalPrice])

  const getTotalAfterDiscount = useCallback(() => {
    const subtotal = getSubtotal()
    return subtotal - discount
  }, [getSubtotal, discount])

  const getTaxAmount = useCallback(() => {
    const totalAfterDiscount = getTotalAfterDiscount()
    return vatIncluded ? (totalAfterDiscount * taxRate) / 100 : 0
  }, [getTotalAfterDiscount, vatIncluded, taxRate])

  const getWithholdingTaxAmount = useCallback(() => {
    const totalAfterDiscount = getTotalAfterDiscount()
    return (totalAfterDiscount * withholdingTaxRate) / 100
  }, [getTotalAfterDiscount, withholdingTaxRate])

  const getGrandTotal = useCallback(() => {
    const totalAfterDiscount = getTotalAfterDiscount()
    const taxAmount = getTaxAmount()
    const withholdingTaxAmount = getWithholdingTaxAmount()
    return totalAfterDiscount + taxAmount - withholdingTaxAmount
  }, [getTotalAfterDiscount, getTaxAmount, getWithholdingTaxAmount])

  // const loadData = useCallback((categories: Category[], discount: number, vatIncluded: boolean, withholdingTaxRate: number = 0) => {
  //   setCategories(categories)
  //   setDiscount(discount)
  //   setVatIncluded(vatIncluded)
  //   setWithholdingTaxRate(withholdingTaxRate)
  // }, [])

  return (
    <PricingContext.Provider
      value={{
        setCategories,
        categories,
        addCategory,
        removeCategory,
        updateCategoryName,
        addSubItem,
        removeSubItem,
        updateSubItem,
        duplicateSubItem,
        getTotalPrice,
        getCategoryTotal,
        discount,
        taxRate,
        vatIncluded,
        setDiscount,
        setTaxRate,
        setVatIncluded,
        withholdingTaxRate,
        setWithholdingTaxRate,
        getWithholdingTaxAmount,
        getSubtotal,
        getTotalAfterDiscount,
        getTaxAmount,
        getGrandTotal,
        // loadData,
      }}
    >
      {children}
    </PricingContext.Provider>
  )
}
