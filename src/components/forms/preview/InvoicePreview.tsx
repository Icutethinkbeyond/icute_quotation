import type React from "react";
import { Box } from "@mui/material";
import { usePricingContext } from "@/contexts/PricingContext";
import { HeadForm, useQuotationListContext } from "@/contexts/QuotationContext";
import { useEffect, useMemo } from "react";
import QuotationHeader from "./QuotationHeader";
import "./preview.css";
import QuotationSummary from "./QuotationSummary";
import QuotationFooter from "./QuotationFooter";
import QuotationTable from "./QuotationTable";
import { ContactSupportOutlined } from "@mui/icons-material";

interface InvoiceProps {}

// Adjusted for new layout where each item takes 2 rows (name + details)
const ROWS_PER_PAGE_FIRST = 10; // ลดจาก 8 เหลือ 7
const ROWS_PER_PAGE_OTHER = 12; // ลดจาก 14 เหลือ 12 (หรือตามความเหมาะสม)

const InvoicePreview: React.FC<InvoiceProps> = ({}) => {
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

  // Flatten logic to handle pagination
  const pages = useMemo(() => {
    const allContentRows: Array<{
      type: "header" | "item_name" | "item_details" | "subtotal";
      data?: any;
    }> = [];

    // 1. Prepare data with weights
    categories.forEach((category, catIndex) => {
      allContentRows.push({
        type: "header",
        data: { name: category.name, index: catIndex + 1, id: category.id },
      });

      category.subItems.forEach((item, itemIndex) => {
        allContentRows.push({
          type: "item_name",
          data: { ...item, displayIndex: `${catIndex + 1}.${itemIndex + 1}` },
        });
        allContentRows.push({
          type: "item_details",
          data: { ...item },
        });
      });

      allContentRows.push({
        type: "subtotal",
        data: { total: getCategoryTotal(category.id) },
      });
    });

    console.log(allContentRows)

    const resultPages: Array<typeof allContentRows> = [];
    let currentPageRows: typeof allContentRows = [];
    let currentPageRowCount = 0;
    let limit = ROWS_PER_PAGE_FIRST;

    for (let i = 0; i < allContentRows.length; i++) {
      const row = allContentRows[i];
      let rowsToAdd = 0;

      if (row.type === "header") {
        rowsToAdd = 1; // Header itself
        // Look ahead for the first item to ensure header isn't orphaned
        if (
          i + 1 < allContentRows.length &&
          allContentRows[i + 1].type === "item_name"
        ) {
          rowsToAdd += 2; // Add space for item_name + item_details
        } else if (
          i + 1 < allContentRows.length &&
          allContentRows[i + 1].type === "subtotal"
        ) {
          rowsToAdd += 1; // Add space for subtotal if it's the only thing following
        }
      } else if (row.type === "item_name") {
        rowsToAdd = 2; // item_name + item_details
      } else if (row.type === "item_details") {
        rowsToAdd = 1; // Should always follow item_name
      } else if (row.type === "subtotal") {
        rowsToAdd = 1;
      }

      // Check if adding this block exceeds the current page limit
      // Also, ensure item_name and item_details (2 rows) always fit together
      // And header + first item always fit together (3 rows)
      // const isNewPageNeeded = currentPageRowCount + rowsToAdd > limit && currentPageRows.length > 0;
      const isNewPageNeeded = currentPageRowCount + rowsToAdd > limit && currentPageRows.length > 0;

      if (isNewPageNeeded) {
        resultPages.push(currentPageRows);
        currentPageRows = [];
        currentPageRowCount = 0;
        limit = ROWS_PER_PAGE_OTHER;
      }

      // Add the current row
      currentPageRows.push(row);
      if (row.type === "item_name") {
        // If it's an item_name, also push its details immediately if available
        if (
          i + 1 < allContentRows.length &&
          allContentRows[i + 1].type === "item_details"
        ) {
          currentPageRows.push(allContentRows[++i]); // Increment i to consume the item_details row
          currentPageRowCount += 2;
        } else {
          currentPageRowCount += 1; // Should not happen if data is consistent
        }
      } else {
        currentPageRowCount += 1;
      }

      // If a header was pushed alone because it was the last thing, adjust its row count
      if (
        row.type === "header" &&
        rowsToAdd === 1 &&
        currentPageRows.length > 0 &&
        currentPageRows[currentPageRows.length - 1].type === "header"
      ) {
        // This case means only the header fit, which we might want to prevent if possible
        // Re-evaluate if it's better to push it to next page if it's orphaned.
        // For now, let it be. More complex logic might be needed here.
      }
    }

    if (currentPageRows.length > 0) {
      resultPages.push(currentPageRows);
    }

    return resultPages;
  }, [categories, getCategoryTotal]);


  return (
    <>
      <div className="print-container">
        {pages.map((pageRows, pageIndex) => (
          <Box
            key={pageIndex}
            className="print-page"
            sx={{
              width: "210mm",
              height: "296.5mm",
              minHeight: "296.5mm",
              maxHeight: "296.5mm",
              position: "relative",
              padding: "15mm",
              margin: "0 auto",
              marginBottom: "20px",
              backgroundColor: "white",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              display: "flex",
              flexDirection: "column",
              boxSizing: "border-box",
              overflow: "hidden",
            }}
          >
            {/* ส่วน QuotationHeader */}
            {pageIndex === 0 && (
              <QuotationHeader pageIndex={pageIndex} headForm={headForm} />
            )}

            {/* ส่วน QuotationTable */}
            <QuotationTable pageRows={pageRows} pageIndex={pageIndex} />

            <Box sx={{ flexGrow: 1 }} />

            {pageIndex === pages.length - 1 && (
              <>
                {/* ส่วนสรุปท้ายตาราง */}
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
                {/* ส่วน QuotationFooter */}
                <QuotationFooter />
              </>
            )}
          </Box>
        ))}
      </div>
    </>
  );
};

export default InvoicePreview;
