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
};

// A4: 297mm total, 10mm top/bottom padding = 277mm usable
const USABLE_HEIGHT_MM = 277;
const MM_TO_PX = 3.7795275591;
const USABLE_HEIGHT_PX = USABLE_HEIGHT_MM * MM_TO_PX;

// Helper: get full height of element including margins
const getElementTotalHeight = (el: HTMLElement | null): number => {
  if (!el) return 0;
  const style = window.getComputedStyle(el);
  const marginTop = parseFloat(style.marginTop) || 0;
  const marginBottom = parseFloat(style.marginBottom) || 0;
  return el.offsetHeight + marginTop + marginBottom;
};

interface PageSlot {
  rows: ContentRow[];
  showHeader: boolean;
  showTail: boolean;
}

// Dummy row for measuring table header (QuotationTable returns null with empty rows)
const TABLE_HEADER_DUMMY_ROW: ContentRow = {
  type: "header",
  data: { name: "", index: "", id: "__measure__" },
};

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

  // Store measured heights
  const [heights, setHeights] = useState<{
    header: number;
    simpleHeader: number;
    tableHeader: number;
    rows: number[];
    summary: number;
    signature: number;
    footer: number;
  } | null>(null);

  // Flatten categories into row list with indices matching rowRefs
  const allRows = useMemo<ContentRow[]>(() => {
    const rows: ContentRow[] = [];
    categories.forEach((category, catIndex) => {
      rows.push({
        type: "header",
        data: { name: category.name, index: catIndex + 1, id: category.id },
      });
      category.subItems.forEach((item, itemIndex) => {
        rows.push({
          type: "item_name",
          data: { ...item, displayIndex: `${catIndex + 1}.${itemIndex + 1}` },
        });
        rows.push({
          type: "item_details",
          data: { ...item },
        });
      });
      rows.push({
        type: "subtotal",
        data: { total: getCategoryTotal(category.id) },
      });
    });
    return rows;
  }, [categories, getCategoryTotal]);

  // Measure all element heights once
  useEffect(() => {
    rowRefs.current = rowRefs.current.slice(0, allRows.length);

    const measure = () => {
      const header = getElementTotalHeight(headerRef.current);
      const simpleHeader = getElementTotalHeight(simpleHeaderRef.current);
      const tableHeader = getElementTotalHeight(tableHeaderRef.current);
      const summary = getElementTotalHeight(summaryRef.current);
      const signature = getElementTotalHeight(signatureRef.current);
      const footer = getElementTotalHeight(footerRef.current);
      const rows = rowRefs.current.map(getElementTotalHeight);

      setHeights({ header, simpleHeader, tableHeader, rows, summary, signature, footer });
    };

    const id = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(id);
  }, [allRows]);

  // Build pages by accumulating rows until page overflows, then flush
  const pages = useMemo<PageSlot[]>(() => {
    if (!heights) return [];

    const pagesResult: PageSlot[] = [];
    const tailHeight = heights.summary + heights.signature;
    const headerFirst = heights.header + heights.tableHeader;
    const headerSub = heights.simpleHeader + heights.tableHeader;

    let current: ContentRow[] = [];
    let used = headerFirst;

    const flush = (showTail: boolean) => {
      pagesResult.push({ rows: current, showHeader: pagesResult.length === 0, showTail: showTail });
      current = [];
      used = headerSub;
    };

    const blockFor = (idx: number): { end: number; height: number } => {
      const row = allRows[idx];
      let h = heights.rows[idx];
      let end = idx;

      if (row.type === "header") {
        if (idx + 1 < allRows.length && allRows[idx + 1].type === "item_name") {
          h += heights.rows[idx + 1];
          end = idx + 1;
          if (idx + 2 < allRows.length && allRows[idx + 2].type === "item_details") {
            h += heights.rows[idx + 2];
            end = idx + 2;
          }
        }
      } else if (row.type === "item_name") {
        if (idx + 1 < allRows.length && allRows[idx + 1].type === "item_details") {
          h += heights.rows[idx + 1];
          end = idx + 1;
        }
      }
      return { end, height: h };
    };

    for (let i = 0; i < allRows.length; i++) {
      const row = allRows[i];
      const block = blockFor(i);
      const blockHeight = block.height;
      const isLastFew = i >= allRows.length - 3;
      const remainingRowsHeight = heights.rows.slice(i).reduce((a, b) => a + b, 0);
      const willFitOnCurrent = used + blockHeight + (isLastFew ? tailHeight : 0) <= USABLE_HEIGHT_PX + 2;

      if (!willFitOnCurrent && current.length > 0) {
        // Ensure category header doesn't orphan
        if (row.type === "header" && block.end > i) {
          flush(false);
        } else if (blockHeight > USABLE_HEIGHT_PX - headerSub) {
          // Too tall for any page: split item_name+details
          if (row.type === "item_name" && block.end > i) {
            current.push(row);
            i++;
            continue;
          } else {
            flush(false);
          }
        } else {
          flush(false);
        }
      }

      // Add block rows
      for (let j = i; j <= block.end; j++) {
        current.push(allRows[j]);
      }
      used += blockHeight;
      i = block.end;
    }

    // Final flush
    if (current.length > 0) {
      if (used + tailHeight <= USABLE_HEIGHT_PX + 2) {
        flush(true);
      } else {
        flush(false);
        pagesResult.push({ rows: [], showHeader: false, showTail: true });
      }
    } else if (pagesResult.length === 0) {
      pagesResult.push({ rows: [], showHeader: true, showTail: true });
    }

    const last = pagesResult[pagesResult.length - 1];
    if (last && !last.showTail) {
      pagesResult.push({ rows: [], showHeader: false, showTail: true });
    }

    return pagesResult;
  }, [heights, allRows]);

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
      {/* Hidden measurement area */}
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
        <div ref={simpleHeaderRef} style={{ display: "flex", flexDirection: "column" }}>
          <QuotationHeader pageIndex={1} headForm={headForm} />
        </div>
        <div ref={tableHeaderRef} style={{ display: "flex", flexDirection: "column" }}>
          <QuotationTable pageRows={[TABLE_HEADER_DUMMY_ROW]} pageIndex={0} hideTableHeader={false} measureHeaderOnly />
        </div>
        {allRows.map((row, i) => (
          <div key={i} ref={(el) => { rowRefs.current[i] = el; }} style={{ display: "flex", flexDirection: "column" }}>
            <QuotationTable pageRows={[row]} pageIndex={0} hideTableHeader />
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

      {/* Printable pages */}
      <div className="print-container">
        {pages.map((page, pageIndex) => (
          <Box
            key={pageIndex}
            className="print-page"
            sx={{
              ...pageBoxSx,
              position: "relative",
              "@media print": { position: "relative", pageBreakAfter: "always" },
              "&": { opacity: 1, visibility: "visible", overflow: "visible" },
            }}
          >
            {page.showHeader && <QuotationHeader pageIndex={pageIndex} headForm={headForm} />}
            <QuotationTable pageRows={page.rows} pageIndex={pageIndex} />
            {page.showTail && (
              <Box className="tail-section" sx={{ pageBreakInside: "avoid", breakInside: "avoid", display: "flex", flexDirection: "column" }}>
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
