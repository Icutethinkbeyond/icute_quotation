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
const ROWS_PER_PAGE_FIRST = 7; // ลดจาก 8 เหลือ 7
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
    const flattenedRows: Array<{
      type: "header" | "item_name" | "item_details" | "subtotal";
      data?: any;
    }> = [];

    // 1. เตรียมข้อมูลแบบ Flatten เหมือนเดิม
    categories.forEach((category, catIndex) => {
      flattenedRows.push({
        type: "header",
        data: { name: category.name, index: catIndex + 1, id: category.id },
      });

      category.subItems.forEach((item, itemIndex) => {
        flattenedRows.push({
          type: "item_name",
          data: { ...item, displayIndex: `${catIndex + 1}.${itemIndex + 1}` },
        });
        flattenedRows.push({
          type: "item_details",
          data: { ...item },
        });
      });

      flattenedRows.push({
        type: "subtotal",
        data: { total: getCategoryTotal(category.id) },
      });
    });

    const resultPages: Array<typeof flattenedRows> = [];
    let currentPage: typeof flattenedRows = [];
    let currentLimit = ROWS_PER_PAGE_FIRST;

    for (let i = 0; i < flattenedRows.length; i++) {
      const row = flattenedRows[i];

      // คำนวณว่าแถวนี้ต้องใช้กี่ "หน่วย" (Weight)
      // ปกติ 1 แถว = 1 weight แต่เราต้องเช็คคู่ name+details
      let rowWeight = 1;

      const spaceUsed = currentPage.length;
      const spaceLeft = currentLimit - spaceUsed;

      let needsNewPage = false;

      // 1. ถ้าเจอ item_name ต้องมั่นใจว่ามีที่พอสำหรับ name + details (2 แถว)
      if (row.type === "item_name") {
        if (spaceLeft < 2) {
          needsNewPage = true;
        }
      }

      // 2. ถ้าเจอ header (หมวดหมู่) และเหลือที่แค่ 1-2 แถว
      // ให้ปัดขึ้นหน้าใหม่ไปเลย เพื่อไม่ให้หัวข้ออยู่โดดเดี่ยวท้ายหน้า
      if (row.type === "header") {
        if (spaceLeft < 2) {
          needsNewPage = true;
        }
      }

      // 3. ถ้าเจอ subtotal (ยอดรวมหมวด) ควรอยู่ติดกับรายการสุดท้าย
      if (row.type === "subtotal") {
        if (spaceLeft < 1) {
          needsNewPage = true;
        }
      }

      if (needsNewPage && currentPage.length > 0) {
        resultPages.push(currentPage);
        currentPage = [];
        currentLimit = ROWS_PER_PAGE_OTHER;
      }

      currentPage.push(row);

      // เช็ค Limit ปกติ
      if (currentPage.length >= currentLimit) {
        resultPages.push(currentPage);
        currentPage = [];
        currentLimit = ROWS_PER_PAGE_OTHER;
      }
    }

    if (currentPage.length > 0) {
      resultPages.push(currentPage);
    }

    return resultPages;

    // // 2. เริ่มการแบ่งหน้าด้วยเงื่อนไขพิเศษ
    // const resultPages: Array<typeof flattenedRows> = [];
    // let currentPage: typeof flattenedRows = [];
    // let currentLimit = ROWS_PER_PAGE_FIRST;

    // for (let i = 0; i < flattenedRows.length; i++) {
    //   const row = flattenedRows[i];
    //   const spaceUsed = currentPage.length;
    //   const spaceLeft = currentLimit - spaceUsed;

    //   let needsNewPage = false;

    //   // เงื่อนไขที่ 1: ถ้าเป็นหมวดหมู่ (header) และเหลือพื้นที่แค่บรรทัดสุดท้ายพอดี
    //   // เราจะไม่ยอมให้ header อยู่โดดเดี่ยวที่บรรทัดสุดท้าย
    //   if (row.type === "header" && spaceLeft === 1) {
    //     needsNewPage = true;
    //   }

    //   // เงื่อนไขที่ 2: ถ้าเป็นชื่อรายการ (item_name)
    //   // เราต้องมีที่ว่างอย่างน้อย 2 บรรทัด (สำหรับ name + details)
    //   // ถ้าเหลือที่แค่ 1 บรรทัด ให้ขึ้นหน้าใหม่เลย
    //   if (row.type === "item_name" && spaceLeft < 2) {
    //     needsNewPage = true;
    //   }

    //   // ถ้าเข้าเงื่อนไข ให้ตัดขึ้นหน้าใหม่
    //   if (needsNewPage) {
    //     resultPages.push(currentPage);
    //     currentPage = [];
    //     currentLimit = ROWS_PER_PAGE_OTHER;
    //   }

    //   // กรณีพิเศษ: ถ้าขึ้นหน้าใหม่แล้วตัวแรกดันเป็น item_details (ซึ่งไม่ควรเกิดขึ้นถ้า Logic ข้อ 2 ทำงาน)
    //   // แต่เผื่อไว้กันพลาด ถ้า currentPage ว่างอยู่แต่ดันจะใส่ details ให้เช็คดีๆ

    //   currentPage.push(row);

    //   // ถ้าเต็ม Limit ปกติ (กรณีทั่วไป)
    //   if (currentPage.length >= currentLimit) {
    //     resultPages.push(currentPage);
    //     currentPage = [];
    //     currentLimit = ROWS_PER_PAGE_OTHER;
    //   }
    // }

    // if (currentPage.length > 0) {
    //   resultPages.push(currentPage);
    // }

    // return resultPages;
  }, [categories, getCategoryTotal, headForm]);

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
