import type React from "react";
import { Box, Typography } from "@mui/material";
import { usePricingContext } from "@/contexts/PricingContext";
import { useQuotationListContext } from "@/contexts/QuotationContext";
import { useMemo } from "react";
import QuotationHeader from "./QuotationHeader";
import QuotationSummary from "./QuotationSummary";
import QuotationFooter from "./QuotationFooter";
import QuotationTable from "./QuotationTable";
import "./preview.css";

interface InvoiceProps {}

// Constants for pagination weight
// We use a "weight" system where each row has a specific vertical cost
const WEIGHT_LIMIT_FIRST_PAGE = 22; // Weight limit for the first page (with header)
const WEIGHT_LIMIT_OTHER_PAGES = 32; // Weight limit for subsequent pages

const ROW_WEIGHTS = {
  header: 2,      // Category header
  item_name: 1.5, // Product name row
  item_details: 2, // Description and remark row
  subtotal: 1.5,  // Category subtotal row
};

const InvoicePreview: React.FC<InvoiceProps> = () => {
  const {
    categories,
    getSubtotal,
    getTaxAmount,
    getGrandTotal,
    discount,
    withholdingTaxRate,
    vatIncluded,
    getCategoryTotal,
    getWithholdingTaxAmount,
  } = usePricingContext();
  
  const { headForm } = useQuotationListContext();

  const displayNote = headForm?.note;
  const subtotal = getSubtotal();
  const taxAmount = getTaxAmount();

  // Pagination logic using a weight-based approach
  const pages = useMemo(() => {
    const flattenedRows: Array<{
      type: "header" | "item_name" | "item_details" | "subtotal";
      data?: any;
      weight: number;
    }> = [];

    // 1. Prepare data with weights
    categories.forEach((category, catIndex) => {
      flattenedRows.push({
        type: "header",
        data: { name: category.name, index: catIndex + 1, id: category.id },
        weight: ROW_WEIGHTS.header,
      });

      category.subItems.forEach((item, itemIndex) => {
        flattenedRows.push({
          type: "item_name",
          data: { ...item, displayIndex: `${catIndex + 1}.${itemIndex + 1}` },
          weight: ROW_WEIGHTS.item_name,
        });
        flattenedRows.push({
          type: "item_details",
          data: { ...item },
          weight: ROW_WEIGHTS.item_details,
        });
      });

      flattenedRows.push({
        type: "subtotal",
        data: { total: getCategoryTotal(category.id) },
        weight: ROW_WEIGHTS.subtotal,
      });
    });

    // 2. Split into pages based on weights
    const resultPages: Array<typeof flattenedRows> = [];
    let currentPageRows: typeof flattenedRows = [];
    let currentPageWeight = 0;
    let weightLimit = WEIGHT_LIMIT_FIRST_PAGE;

    for (let i = 0; i < flattenedRows.length; i++) {
      const row = flattenedRows[i];
      
      // Peek ahead for grouped rows (like item_name + item_details)
      let rowGroupWeight = row.weight;
      if (row.type === "item_name" && i + 1 < flattenedRows.length && flattenedRows[i+1].type === "item_details") {
        rowGroupWeight += flattenedRows[i+1].weight;
      }

      // Check if we need to move to a new page
      if (currentPageWeight + rowGroupWeight > weightLimit && currentPageRows.length > 0) {
        resultPages.push(currentPageRows);
        currentPageRows = [];
        currentPageWeight = 0;
        weightLimit = WEIGHT_LIMIT_OTHER_PAGES;
      }

      currentPageRows.push(row);
      currentPageWeight += row.weight;
    }

    if (currentPageRows.length > 0) {
      resultPages.push(currentPageRows);
    }

    return resultPages;
  }, [categories, getCategoryTotal]);

  return (
    <div className="print-container">
      {pages.map((pageRows, pageIndex) => (
        <Box
          key={pageIndex}
          className="print-page"
          sx={{
            width: "210mm",
            height: "297mm", // Standard A4
            minHeight: "297mm",
            maxHeight: "297mm",
            padding: "15mm",
            margin: "0 auto",
            marginBottom: "20px",
            backgroundColor: "white",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          {/* Header Section */}
          <QuotationHeader pageIndex={pageIndex} headForm={headForm} />

          {/* Table Section */}
          <QuotationTable pageRows={pageRows} pageIndex={pageIndex} />

          {/* Spacing to push content to bottom */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Summary Section (Only on the last page) */}
          {pageIndex === pages.length - 1 && (
            <QuotationSummary
              displayNote={displayNote}
              subtotal={subtotal}
              discount={discount}
              vatIncluded={vatIncluded}
              taxAmount={taxAmount}
              withholdingTaxRate={withholdingTaxRate}
              withholdingTaxAmount={getWithholdingTaxAmount()}
              grandTotal={getGrandTotal()}
            />
          )}

          {/* Footer Section (On every page) */}
          <QuotationFooter />

          {/* Page Numbering */}
          <Typography
            variant="caption"
            sx={{
              position: "absolute",
              bottom: "5mm",
              right: "15mm",
              color: "text.secondary",
              fontSize: "10px",
              zIndex: 10,
            }}
          >
            หน้า {pageIndex + 1} / {pages.length}
          </Typography>
        </Box>
      ))}
    </div>
  );
};

export default InvoicePreview;

