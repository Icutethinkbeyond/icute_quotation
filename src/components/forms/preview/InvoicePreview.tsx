import type React from "react";
import { Box } from "@mui/material";
import { usePricingContext } from "@/contexts/PricingContext";
import { useQuotationListContext } from "@/contexts/QuotationContext";
import { useRef, useState, useEffect, useMemo } from "react";
import QuotationHeader from "./QuotationHeader";
import "./preview.css";
import QuotationSummary from "./QuotationSummary";
import QuotationFooter from "./QuotationFooter";
import QuotationTable from "./QuotationTable";
import Signature from "./Signature";

type ContentRow = {
  type: "header" | "item_name" | "item_details" | "subtotal";
  data?: any;
  originalIndex: number; // ✅ เก็บ index จริงใน allRows ไว้ด้วย
};

interface PageSlot {
  rows: ContentRow[];
  showHeader: boolean;
  showTail: boolean;
}

interface HeightMap {
  header: number;
  simpleHeader: number;
  tableHeader: number;
  rows: number[];
  summary: number;
  signature: number;
  footer: number;
}

// ─── Dummy row สำหรับวัด tableHeader ────────────────────────────────────────
// แก้ปัญหา QuotationTable return null เมื่อ pageRows=[]
const TABLE_HEADER_DUMMY_ROW: ContentRow = {
  type: "header",
  data: { name: "", index: "", id: "__measure__" },
  originalIndex: -1,
};

function buildPages(allRows: ContentRow[], heights: HeightMap): PageSlot[] {
  const pages: PageSlot[] = [];
  const tailHeight = heights.summary + heights.signature;
  const FULL_HEADER_HEIGHT = heights.header + heights.tableHeader;
  const SUBSEQUENT_HEADER_HEIGHT = heights.simpleHeader + heights.tableHeader;

  // A4 total: 297mm. Padding: 10mm top + 10mm bottom = 20mm.
  // Usable content height = 277mm. Convert to pixels.
  const USABLE_HEIGHT_MM = 277;
  const MM_TO_PX = 3.7795275591;
  const USABLE_HEIGHT_PX = USABLE_HEIGHT_MM * MM_TO_PX;

  // Small buffer to avoid microscopic overflow (0.5mm ≈ 1.9px)
  const OVERFLOW_TOLERANCE_PX = 2;

  let currentRows: ContentRow[] = [];
  let usedHeight = FULL_HEADER_HEIGHT;

  const flushPage = (showTail: boolean) => {
    pages.push({
      rows: currentRows,
      showHeader: pages.length === 0,
      showTail: showTail,
    });
    currentRows = [];
    // Subsequent pages have simplified header + table header
    usedHeight = SUBSEQUENT_HEADER_HEIGHT;
  };

  const getRemainingHeight = (startIdx: number) => {
    let h = 0;
    for (let j = startIdx; j < allRows.length; j++) {
      h += heights.rows[allRows[j].originalIndex] ?? 0;
    }
    return h;
  };

  const isLastPageWithContent = (currentIdx: number, estimatedTail: number = tailHeight) => {
    const remainingHeight = getRemainingHeight(currentIdx);
    const availableNow = USABLE_HEIGHT_PX - usedHeight;
    // Tail fits in remaining space without needing another page
    return remainingHeight + estimatedTail <= availableNow + OVERFLOW_TOLERANCE_PX;
  };

  for (let i = 0; i < allRows.length; i++) {
    const row = allRows[i];
    const rowH = heights.rows[row.originalIndex] ?? 0;

    let blockEndIdx = i;
    let blockHeight = rowH;

    // Build block: category header + first item (and details), or item+details
    if (row.type === "header") {
      const nextIdx = i + 1;
      if (nextIdx < allRows.length && allRows[nextIdx].type === "item_name") {
        blockEndIdx = nextIdx;
        blockHeight += heights.rows[allRows[nextIdx].originalIndex] ?? 0;
        const detailIdx = nextIdx + 1;
        if (detailIdx < allRows.length && allRows[detailIdx].type === "item_details") {
          blockEndIdx = detailIdx;
          blockHeight += heights.rows[allRows[detailIdx].originalIndex] ?? 0;
        }
      }
    } else if (row.type === "item_name") {
      const nextIdx = i + 1;
      if (nextIdx < allRows.length && allRows[nextIdx].type === "item_details") {
        blockEndIdx = nextIdx;
        blockHeight += heights.rows[allRows[nextIdx].originalIndex] ?? 0;
      }
    }

    const isLastPage = isLastPageWithContent(i);
    const availableSpace = USABLE_HEIGHT_PX - usedHeight - (isLastPage ? tailHeight : 0);

    // Subtotal special handling: keep with its preceding items
    if (row.type === "subtotal") {
      // If subtotal doesn't fit on current page, try to move preceding items forward
      if (rowH > availableSpace + OVERFLOW_TOLERANCE_PX && currentRows.length > 0) {
        const lastDetailIdx = currentRows.findLastIndex(r => r.type === "item_details");
        let movedRows: ContentRow[] = [];

        if (lastDetailIdx !== -1) {
          const itemNameIdx = lastDetailIdx - 1;
          if (itemNameIdx >= 0 && currentRows[itemNameIdx]?.type === "item_name") {
            movedRows = currentRows.splice(itemNameIdx, 2);
            if (itemNameIdx > 0 && currentRows[itemNameIdx - 1]?.type === "header") {
              const headerRow = currentRows.splice(itemNameIdx - 1, 1)[0];
              movedRows.unshift(headerRow);
            }
          }
        }

        if (movedRows.length > 0) {
          const movedHeight = movedRows.reduce((sum, r) => sum + (heights.rows[r.originalIndex] ?? 0), 0);
          usedHeight -= movedHeight;
          flushPage(false);
          currentRows.push(...movedRows);
          usedHeight += movedHeight;
        } else {
          flushPage(false);
        }
      }

      // After moving items (if any), check if subtotal still fits; if not, flush again
      const currentIsLast = isLastPageWithContent(i);
      const currentAvail = USABLE_HEIGHT_PX - usedHeight - (currentIsLast ? tailHeight : 0);
      if (rowH > currentAvail + OVERFLOW_TOLERANCE_PX) {
        flushPage(false);
      }

      currentRows.push(row);
      usedHeight += rowH;
      continue;
    }

     // Normal block placement
     if (blockHeight > availableSpace + OVERFLOW_TOLERANCE_PX && currentRows.length > 0) {
      // If block is a category header with its first item(s), move whole block to new page
      if (row.type === "header" && blockEndIdx > i) {
        flushPage(false);
      } 
       // If block is too tall even for a fresh page (rare: extremely long item description),
       // force split only for item_name+details
       else if (blockHeight > USABLE_HEIGHT_PX - SUBSEQUENT_HEADER_HEIGHT) {
        if (row.type === "item_name" && blockEndIdx > i) {
          // Only item_name fits; item_details to next page
          currentRows.push(row);
          usedHeight += rowH;
          i++; // skip item_details
          continue;
        } else {
          flushPage(false);
        }
      } else {
        flushPage(false);
      }
    }

    // Add block to current page
    for (let j = i; j <= blockEndIdx; j++) {
      currentRows.push(allRows[j]);
    }
    usedHeight += blockHeight;
    i = blockEndIdx;
  }

  // Final flush with smart tail placement
  if (currentRows.length > 0) {
    if (usedHeight + tailHeight <= USABLE_HEIGHT_PX + OVERFLOW_TOLERANCE_PX) {
      flushPage(true);
    } else {
      flushPage(false);
      pages.push({ rows: [], showHeader: false, showTail: true });
    }
  } else if (pages.length === 0) {
    pages.push({ rows: [], showHeader: true, showTail: true });
  }

  // Ensure tail on last page
  const lastPage = pages[pages.length - 1];
  if (lastPage && !lastPage.showTail) {
    pages.push({ rows: [], showHeader: false, showTail: true });
  }

  return pages;
}

// ─── InvoicePreview ───────────────────────────────────────────────────────────
const InvoicePreview: React.FC = () => {
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

   const headerRef = useRef<HTMLDivElement>(null);
   const simpleHeaderRef = useRef<HTMLDivElement>(null);
   const tableHeaderRef = useRef<HTMLDivElement>(null);
   const summaryRef = useRef<HTMLDivElement>(null);
   const signatureRef = useRef<HTMLDivElement>(null);
   const footerRef = useRef<HTMLDivElement>(null);
   const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [heights, setHeights] = useState<HeightMap | null>(null);

  // ✅ allRows มี originalIndex ติดไปด้วยทุก row
  const allRows = useMemo<ContentRow[]>(() => {
    const rows: ContentRow[] = [];
    categories.forEach((category, catIndex) => {
      rows.push({
        type: "header",
        originalIndex: rows.length,
        data: { name: category.name, index: catIndex + 1, id: category.id },
      });
      category.subItems.forEach((item, itemIndex) => {
        rows.push({
          type: "item_name",
          originalIndex: rows.length,
          data: { ...item, displayIndex: `${catIndex + 1}.${itemIndex + 1}` },
        });
        rows.push({
          type: "item_details",
          originalIndex: rows.length,
          data: { ...item },
        });
      });
      rows.push({
        type: "subtotal",
        originalIndex: rows.length,
        data: { total: getCategoryTotal(category.id) },
      });
    });
    return rows;
  }, [categories, getCategoryTotal]);

   useEffect(() => {
     // ✅ cleanup refs เมื่อ allRows เปลี่ยน
     rowRefs.current = rowRefs.current.slice(0, allRows.length);

     const id = requestAnimationFrame(() => {
       // Helper to get total height including margins
       const getTotalHeight = (el: HTMLElement | null) => {
         if (!el) return 0;
         const style = window.getComputedStyle(el);
         const marginTop = parseFloat(style.marginTop) || 0;
         const marginBottom = parseFloat(style.marginBottom) || 0;
         return el.offsetHeight + marginTop + marginBottom;
       };

       setHeights({
         header: getTotalHeight(headerRef.current),
         simpleHeader: getTotalHeight(simpleHeaderRef.current),
         tableHeader: getTotalHeight(tableHeaderRef.current),
         rows: rowRefs.current.map((el) => getTotalHeight(el)),
         summary: getTotalHeight(summaryRef.current),
         signature: getTotalHeight(signatureRef.current),
         footer: getTotalHeight(footerRef.current),
       });
     });
     return () => cancelAnimationFrame(id);
   }, [allRows]);

  const pages = useMemo<PageSlot[]>(() => {
    if (!heights) return [];
    return buildPages(allRows, heights);
  }, [allRows, heights]);

  const pageBoxSx = {
    width: "210mm",
    height: "297mm",
    minHeight: "297mm",
    maxHeight: "297mm",
    position: "relative",
    padding: "10mm",
    margin: "0 auto",
    marginBottom: "20px",
    backgroundColor: "white",
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
    overflow: "hidden",
  } as const;

  return (
    <>
      {/* Hidden measurement area - mimics actual page structure for accurate heights */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: "-9999px",
          width: "190mm",
          visibility: "hidden",
          pointerEvents: "none",
          zIndex: -1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div ref={headerRef} style={{ display: "flex", flexDirection: "column" }}>
          <QuotationHeader pageIndex={0} headForm={headForm} />
        </div>

        {/* Measure simplified header for subsequent pages */}
        <div ref={simpleHeaderRef} style={{ display: "flex", flexDirection: "column" }}>
          <QuotationHeader pageIndex={1} headForm={headForm} />
        </div>

        {/* ✅ ใช้ dummy row แทน pageRows=[] เพื่อให้วัด tableHeader ได้ */}
        <div ref={tableHeaderRef} style={{ display: "flex", flexDirection: "column" }}>
          <QuotationTable
            pageRows={[TABLE_HEADER_DUMMY_ROW]}
            pageIndex={0}
            hideTableHeader={false}
            measureHeaderOnly={true} // ✅ แสดงแค่ header row ไม่ render body
          />
        </div>

        {allRows.map((row, i) => (
          <div
            key={i}
            ref={(el) => { rowRefs.current[i] = el; }}
            style={{ display: "flex", flexDirection: "column" }}
          >
            <QuotationTable
              pageRows={[row]}
              pageIndex={0}
              hideTableHeader={true}
            />
          </div>
        ))}

         <div ref={summaryRef} style={{ display: "flex", flexDirection: "column" }}>
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
         </div>
         <div ref={signatureRef} style={{ display: "flex", flexDirection: "column" }}>
           <Signature headForm={headForm} />
         </div>
         <div ref={footerRef} style={{ display: "flex", flexDirection: "column" }}>
           <QuotationFooter />
         </div>
      </Box>

      {/* Printable area */}
      <div className="print-container">
        {pages.map((page, pageIndex) => (
          <Box
            key={pageIndex}
            className="print-page"
            sx={{
              ...pageBoxSx,
              // Ensure pages are visible in print and PDF capture
              position: "relative",
              "@media print": {
                position: "relative",
                pageBreakAfter: "always",
              },
              // Help html2pdf see all pages
              "&": {
                opacity: 1,
                visibility: "visible",
                overflow: "visible",
              },
            }}
          >
            {page.showHeader && (
              <QuotationHeader pageIndex={pageIndex} headForm={headForm} />
            )}

            <QuotationTable pageRows={page.rows} pageIndex={pageIndex} />

            {page.showTail && (
              <Box
                className="tail-section"
                sx={{
                  pageBreakInside: "avoid",
                  breakInside: "avoid",
                  display: "flex",
                  flexDirection: "column",
                  // Ensure tail is visible
                  opacity: 1,
                  visibility: "visible",
                }}
              >
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
                <Signature headForm={headForm} />
              </Box>
            )}
          </Box>
        ))}
      </div>
    </>
  );
};

export default InvoicePreview;