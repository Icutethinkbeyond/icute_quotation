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

const USABLE_HEIGHT_PX = (296.5 - 15 * 2) * 3.7795275591;

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
  const tailHeight = heights.summary + heights.signature + heights.footer;
  const HEADER_TABLE_HEIGHT = heights.header + heights.tableHeader;
  const TABLE_HEADER_HEIGHT = heights.tableHeader;

  let currentRows: ContentRow[] = [];
  let usedHeight = 0; // Tracks height of currentRows + (HEADER_TABLE_HEIGHT or TABLE_HEADER_HEIGHT)

  const flushPage = (showTail: boolean) => {
    pages.push({
      rows: currentRows,
      showHeader: pages.length === 0,
      showTail: showTail,
    });
    currentRows = [];
    usedHeight = TABLE_HEADER_HEIGHT; // Reset for new page, including table header
  };

  // Initialize usedHeight for the very first page
  usedHeight = HEADER_TABLE_HEIGHT;

  for (let i = 0; i < allRows.length; i++) {
    const row = allRows[i];
    const rowH = heights.rows[row.originalIndex] ?? 0;

    let rowsToConsider: ContentRow[] = [row];
    let potentialBlockHeight = rowH;

    // Look ahead for item_name + item_details block
    if (row.type === "item_name") {
      const nextRow = allRows[i + 1];
      if (nextRow?.type === "item_details") {
        potentialBlockHeight += (heights.rows[nextRow.originalIndex] ?? 0);
        rowsToConsider.push(nextRow);
      }
    }

    // Calculate space remaining on the current page
    let availableSpace = USABLE_HEIGHT_PX - usedHeight;

    // Determine if this current page *could* be the last one, and thus needs to reserve tail space
    // This is a heuristic. If we are past a certain point in allRows, or if the remaining content
    // plus tail is less than a full page, we consider reserving tail space.
    const remainingContentHeightEstimate = allRows
      .slice(i + (rowsToConsider.length - 1))
      .reduce((sum, r) => sum + (heights.rows[r.originalIndex] ?? 0), 0);

    const isPotentiallyLastPage = (
      (i + rowsToConsider.length >= allRows.length - 2) || // Nearing end of content (e.g., last few items)
      (potentialBlockHeight + remainingContentHeightEstimate + tailHeight < USABLE_HEIGHT_PX) // Total remaining fits with tail
    );

    if (isPotentiallyLastPage) {
        availableSpace -= tailHeight;
    }


    // --- Core Pagination Logic ---

    // Scenario 1: Current potential block (header, item_name+details) overflows the page
    if (potentialBlockHeight > availableSpace && currentRows.length > 0) {
        // If it doesn't fit and there are already rows on the page, flush current page
        flushPage(false);
        // Recalculate available space for the new page (which is now a subsequent page)
        availableSpace = USABLE_HEIGHT_PX - usedHeight - (isPotentiallyLastPage ? tailHeight : 0);
    }

    // Scenario 2: Subtotal overflow (and potentially need to move previous item)
    if (row.type === "subtotal") {
      if (potentialBlockHeight > availableSpace) {
        // Subtotal itself does not fit. Try to move the preceding item_name + item_details if present.
        const lastDetailIdx = currentRows.findLastIndex((r) => r.type === "item_details");

        if (lastDetailIdx !== -1 && currentRows[lastDetailIdx - 1]?.type === "item_name") {
            const itemNameIdx = lastDetailIdx - 1;
            const rowsToMove = currentRows.splice(itemNameIdx, 2); // Get item_name and item_details

            const movedHeight = rowsToMove.reduce((sum, r) => sum + (heights.rows[r.originalIndex] ?? 0), 0);
            usedHeight -= movedHeight; // Reduce usedHeight for the current page

            flushPage(false); // Flush current page without the moved items
            // Add the moved items to the newly flushed page
            currentRows.push(...rowsToMove);
            usedHeight += movedHeight;

            // Recalculate available space for the new page
            availableSpace = USABLE_HEIGHT_PX - usedHeight - (isPotentiallyLastPage ? tailHeight : 0);

            // If after moving the previous item, the subtotal still doesn't fit on the new page (very unlikely)
            // or if the moved items + subtotal + tail don't fit, then flush again.
            if (potentialBlockHeight > availableSpace) {
                 flushPage(false); // Flush the page with moved items
                 availableSpace = USABLE_HEIGHT_PX - usedHeight - (isPotentiallyLastPage ? tailHeight : 0);
            }

        } else {
            // No preceding item_name + item_details to move, just flush current page
            if (currentRows.length > 0) flushPage(false);
            availableSpace = USABLE_HEIGHT_PX - usedHeight - (isPotentiallyLastPage ? tailHeight : 0);
        }
      }
      currentRows.push(row); // Add the subtotal row
      usedHeight += rowH;
      continue; // Move to next iteration
    }

    // Add the current block of rows (header or item_name + details) to current page
    currentRows.push(...rowsToConsider);
    usedHeight += potentialBlockHeight;

    // Increment 'i' if item_details was consumed with item_name
    if (rowsToConsider.length === 2) {
      i++;
    }
  }

  // After loop, flush any remaining rows. This will be the absolute last page.
  if (currentRows.length > 0) {
    flushPage(true); // Always show tail on the last page with content
  } else if (pages.length === 0) {
    // If no content rows were ever added, but we need a page for the tail (e.g., empty quotation)
    pages.push({
      rows: [],
      showHeader: true,
      showTail: true,
    });
  }

  // If the very last page was flushed *without* a tail (because of an overflow/move),
  // and there's no tail yet, add a dedicated page for the tail.
  const lastPage = pages.length > 0 ? pages[pages.length - 1] : null;
  if (lastPage && !lastPage.showTail) {
      pages.push({
          rows: [],
          showHeader: false, // Not the first page
          showTail: true,
      });
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
      setHeights({
        header: headerRef.current?.offsetHeight ?? 0,
        tableHeader: tableHeaderRef.current?.offsetHeight ?? 0,
        rows: rowRefs.current.map((el) => el?.offsetHeight ?? 0),
        summary: summaryRef.current?.offsetHeight ?? 0,
        signature: signatureRef.current?.offsetHeight ?? 0,
        footer: footerRef.current?.offsetHeight ?? 0,
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
  } as const;

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: "-9999px",
          width: "180mm",
          visibility: "hidden",
          pointerEvents: "none",
          zIndex: -1,
        }}
      >
        <div ref={headerRef}>
          <QuotationHeader pageIndex={0} headForm={headForm} />
        </div>

        {/* ✅ ใช้ dummy row แทน pageRows=[] เพื่อให้วัด tableHeader ได้ */}
        <div ref={tableHeaderRef}>
          <QuotationTable
            pageRows={[TABLE_HEADER_DUMMY_ROW]}
            pageIndex={0}
            hideTableHeader={false}
            measureHeaderOnly={true} // ✅ แสดงแค่ header row ไม่ render body
          />
        </div>

        {allRows.map((row, i) => (
          <div key={i} ref={(el) => { rowRefs.current[i] = el; }}>
            <QuotationTable
              pageRows={[row]}
              pageIndex={0}
              hideTableHeader={true}
            />
          </div>
        ))}

        <div ref={summaryRef}>
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
        <div ref={signatureRef}>
          <Signature headForm={headForm} />
        </div>
        <div ref={footerRef}>
          <QuotationFooter />
        </div>
      </div>

      <div className="print-container">
        {pages.map((page, pageIndex) => (
          <Box key={pageIndex} className="print-page" sx={pageBoxSx}>
            {page.showHeader && (
              <QuotationHeader pageIndex={pageIndex} headForm={headForm} />
            )}

            <QuotationTable pageRows={page.rows} pageIndex={pageIndex} />

            {page.showTail && (
              <>
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
                {/* <QuotationFooter /> */}
              </>
            )}
          </Box>
        ))}
      </div>
    </>
  );
};

export default InvoicePreview;