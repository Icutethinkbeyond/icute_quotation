/**
 * Utility functions for quotation calculations
 * Can be used in both Backend (API routes) and Frontend (components)
 */

export interface QuotationCalculationResult {
    subtotal: number;
    totalAfterDiscount: number;
    vatAmount: number;
    totalWithVat: number;
    withholdingTaxAmount: number;
    grandTotal: number;
}

/**
 * Calculate all totals for a quotation document
 * 
 * @param categories - Array of categories with items
 * @param globalDiscount - Total discount amount
 * @param includeVat - Whether to include VAT
 * @param taxRate - VAT tax rate (default 7%)
 * @param withholdingTax - Withholding tax amount
 * @param withholdingTaxRate - Withholding tax rate (%)
 * @returns Calculated totals
 */
export function calculateQuotationTotals(
    categories: any[] = [],
    globalDiscount: number = 0,
    includeVat: boolean = false,
    taxRate: number = 7,
    withholdingTax: number = 0,
    withholdingTaxRate: number = 0
): QuotationCalculationResult {
    // 1. Calculate subtotal from all categories and items
    const subtotal = categories.reduce((total: number, category: any) => {
        // Support both 'items' (DB) and 'subItems' (Context)
        const items = category.items || category.subItems || [];
        const categoryTotal = items.reduce((catTotal: number, item: any) => {
            const itemTotal = (item.qty || 0) * (item.pricePerUnit || 0);
            return catTotal + itemTotal;
        }, 0);
        return total + categoryTotal;
    }, 0);

    // 2. Apply global discount
    const totalAfterDiscount = subtotal - globalDiscount;

    // 3. Calculate VAT if included
    const vatAmount = includeVat ? totalAfterDiscount * (taxRate / 100) : 0;
    const totalWithVat = totalAfterDiscount + vatAmount;

    // 4. Calculate final grand total (after withholding tax)
    // If withholdingTaxRate is provided, calculate from totalAfterDiscount
    // Otherwise use the provided withholdingTax amount
    const withholdingTaxAmount = withholdingTaxRate > 0
        ? totalAfterDiscount * (withholdingTaxRate / 100)
        : withholdingTax;

    const grandTotal = totalWithVat - withholdingTaxAmount;

    return {
        subtotal,
        totalAfterDiscount,
        vatAmount,
        totalWithVat,
        withholdingTaxAmount,
        grandTotal,
    };
}

/**
 * Format number as Thai currency string
 */
export function formatCurrency(amount: number, decimals: number = 2): string {
    return amount.toLocaleString("th-TH", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}
