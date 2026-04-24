"use client";

import type React from "react";
import {
  Box,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  Paper,
  Divider,
  FormControl,
  useTheme,
  Button,
  InputLabel,
  OutlinedInput,
  Stack,
  InputAdornment,
} from "@mui/material";

// Context สำหรับคำนวณราคา (หมวดสินค้า, VAT, ส่วนลด ฯลฯ)
import { usePricingContext } from "@/contexts/PricingContext";

// Context สำหรับข้อมูลหัวเอกสารใบเสนอราคา (บริษัท / ผู้ติดต่อ)
import {
  headerClean,
  useQuotationListContext,
} from "@/contexts/QuotationContext";

import {
  Visibility,
  Save,
  FileDownload,
  Description,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import PreviewDialog from "../preview/DialogPreview";
import { useEffect, useState } from "react";
import { calculateQuotationTotals, formatCurrency } from "@/services/utils/quotationCalculations";

interface PricingSummaryProps {
  isEdit?: boolean;
  quotationId?: string;
}

const PricingSummary: React.FC<PricingSummaryProps> = ({
  isEdit = false,
  quotationId: propQuotationId,
}) => {
  const theme = useTheme();
  const router = useRouter();

  const [onOpen, setOnOpen] = useState<boolean>(false);
  const [internalId, setInternalId] = useState<string | undefined>(
    propQuotationId,
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState<boolean>(true);

  // ดึงข้อมูลและฟังก์ชันที่เกี่ยวกับการคำนวณราคาจาก PricingContext
  const {
    getTotalPrice, // รวมราคาสินค้าทั้งหมด
    discount, // ส่วนลดรวม
    setDiscount, // setter ส่วนลด
    vatIncluded, // คิด VAT หรือไม่
    setVatIncluded, // setter VAT
    taxRate, // อัตราภาษี (%)
    withholdingTaxRate,
    setWithholdingTaxRate,
    getWithholdingTaxAmount,
    setCategories,
  } = usePricingContext();

  // ข้อมูลหัวเอกสาร (บริษัท / ผู้ติดต่อ)
  const { headForm, setHeadForm } = useQuotationListContext();

  // หมวดสินค้าและรายการย่อย (ใช้สำหรับบันทึกลง DB)
  const { categories } = usePricingContext();

  /**
   * ======================
   * ส่วนคำนวณราคา - ใช้ Utility Function
   * ======================
   */
  const subtotal = getTotalPrice(); // ราคารวมก่อนหักส่วนลด (จาก PricingContext)

  // ใช้ utility function สำหรับการคำนวณทั้งหมด
  const calculations = calculateQuotationTotals(
    categories,
    discount,
    vatIncluded,
    taxRate,
    0, // ให้ฟังก์ชันคำนวณจาก rate แทน
    withholdingTaxRate,
  );

  // สำหรับความเข้ากันได้กับโค้ดเดิม (backward compatibility)
  const priceAfterDiscount = calculations.totalAfterDiscount;
  const vat = calculations.vatAmount;
  const totalWithVat = calculations.totalWithVat;
  const withholdingTax = calculations.withholdingTaxAmount;
  const finalTotal = calculations.grandTotal;

  /**
   * เปิดหน้า Preview ใบเสนอราคา - บันทึกข้อมูลก่อนแสดงผล
   */
  const handlePreviewInvoice = async () => {
    // ตรวจสอบว่ามีสินค้าอย่างน้อย 1 รายการหรือไม่
    const hasItems = categories.some(
      (cat) => cat.subItems && cat.subItems.length > 0,
    );
    if (!hasItems) {
      alert("กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการก่อนดูตัวอย่าง");
      return;
    }

    // บันทึกข้อมูลก่อนแสดง preview (ไม่เปลี่ยนสถานะ dla existing documents)
    const savedDocId = await handleSaveQuotation(undefined, false, false);

    if (savedDocId) {
      // เปิด PDF preview ด้วย documentId ที่เพิ่งบันทึก
      window.open(`/quotation/pdf-preview/${savedDocId}`, "_blank");
    } else {
      // ถ้าบันทึกล้มเหลว หรือ user ยกเลิก (เช่น edit mode) ให้แสดง dialog preview โดยใช้ internalId
      const idToUse = internalId || propQuotationId;
      if (idToUse) {
        window.open(`/quotation/pdf-preview/${idToUse}`, "_blank");
      } else {
        setOnOpen(true);
      }
    }
  };

  /**
   * บันทึกใบเสนอราคา
   * @param status - "draft" | "approve" | undefined (undefined = keep current status for edits)
   * @returns documentId if save successful, null otherwise
   */
  const handleSaveQuotation = async (
    status?: "draft" | "approve",
    isAutoSave = false,
    showalert = true,
  ): Promise<string | null> => {
    try {
      // ตรวจสอบว่ามีสินค้าหรือไม่
      const hasItems = categories.some(
        (cat) => cat.subItems && cat.subItems.length > 0,
      );

      // สำหรับ Auto Save จะไม่เช็คข้อมูลครบถ้วน และไม่แสดง alert
      if (!isAutoSave) {
        if (!headForm.companyName || !headForm.contactorName) {
          alert("กรุณากรอกข้อมูลบริษัทและผู้ติดต่อให้ครบถ้วน");
          return null;
        }

        // ถ้าจะ Approve ต้องมีสินค้า
        if (status === "approve" && !hasItems) {
          alert("ไม่สามารถบันทึกอนุมัติได้เนื่องจากยังไม่มีรายการสินค้า");
          return null;
        }
      } else {
        // ถ้าเป็น auto save แต่ไม่มีชื่อบริษัทหรือชื่อผู้ติดต่อ และไม่มีสินค้า ก็ไม่ต้องเซฟ
        if (!headForm.companyName && !headForm.contactorName && !hasItems) {
          return null;
        }
      }

      setIsSaving(true);

      /**
       * เตรียมข้อมูลสำหรับส่งไป Backend
       */
      const quotationData: any = {
        // เลขที่ใบเสนอราคา
        quotationNumber: headForm.quotationNumber,

        // ข้อมูลบริษัทผู้ออกเอกสาร (Issuer)
        companyName: headForm.companyName,
        companyTel: headForm.companyTel,
        taxId: headForm.taxId,
        branch: headForm.branch,
        companyAddress: headForm.companyAddress,

        // ข้อมูลลูกค้า (Customer Company)
        customerCompanyName: headForm.customerCompanyName,
        customerCompanyTel: headForm.customerCompanyTel,
        customerCompanyAddress: headForm.customerCompanyAddress,
        customerTaxId: headForm.customerTaxId,
        customerBranch: headForm.customerBranch,

        // ข้อมูลผู้ติดต่อ (Contactor)
        contactorName: headForm.contactorName,
        contactorTel: headForm.contactorTel,
        contactorEmail: headForm.contactorEmail,
        contactorAddress: headForm.contactorAddress,

        dateCreate: headForm.dateCreate,
        note: headForm.note,

        // สถานะ - include only if explicitly provided
        ...(status !== undefined ? { status } : {}),

        // ข้อมูลการเงิน
        includeVat: vatIncluded,
        taxRate: 7,
        globalDiscount: discount,
        withholdingTax: withholdingTax,
        withholdingTaxRate: withholdingTaxRate,

        // รายการสินค้า / บริการ
        categories: categories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          subItems: cat.subItems.map((item) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            unit: item.unit,
            qty: item.qty,
            pricePerUnit: item.pricePerUnit,
            remark: item.remark,
          })),
        })),
      };

      // ใช้ internalId ถ้ามี (จากการ auto save ครั้งก่อน) หรือ propQuotationId ถ้าเป็นการ edit
      const currentId = internalId || propQuotationId;
      const isActuallyEdit = isEdit || !!internalId;

      const url =
        isActuallyEdit && currentId
          ? `/api/income/quotation/${currentId}`
          : "/api/income/quotation/new";

      const method = isActuallyEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quotationData),
      });
      const result = await res.json();

      if (result.success) {
        let savedDocId: string | null = null;
        if (result.documentId) {
          setInternalId(result.documentId);
          savedDocId = result.documentId;
        } else if (result.document?.documentId) {
          setInternalId(result.document.documentId);
          savedDocId = result.document.documentId;
        }

        setLastSaved(new Date());

        if (!isAutoSave) {
          if (showalert) {
            alert(
              status === "draft"
                ? "บันทึกร่างสำเร็จ!"
                : "บันทึกใบเสนอราคาสำเร็จ!",
            );
          }
          if (status === "approve") {
            router.push(`/quotation`);
            setCategories([]);
            setWithholdingTaxRate(0);
            setDiscount(0);
            setVatIncluded(false);
            setHeadForm(headerClean);
          }
        }
        return savedDocId;
      } else {
        if (!isAutoSave) alert("เกิดข้อผิดพลาด: " + result.error);
        return null;
      }
    } catch (e) {
      console.error(e);
      if (!isAutoSave) alert("เกิดข้อผิดพลาดในการบันทึก");
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  // Auto Save Logic with 1-second debounce
  useEffect(() => {
    // if (isEdit || !autoSaveEnabled) return; // ถ้าเป็นหน้า Edit หรือปิด auto-save ไม่ต้อง Auto save
    if (!autoSaveEnabled) return; // ถ้าเป็นหน้า Edit หรือปิด auto-save ไม่ต้อง Auto save

    const timer = setTimeout(() => {
      // Auto save เฉพาะเมื่อมีข้อมูลเบื้องต้น
      if (
        headForm.companyName ||
        headForm.contactorName ||
        categories.length > 0
      ) {
        handleSaveQuotation("draft", true);
      }
    }, 1000); // Auto save 1 วินาทีหลังจากหยุดพิมพ์

    return () => clearTimeout(timer);
  }, [
    headForm,
    categories,
    discount,
    vatIncluded,
    withholdingTaxRate,
    autoSaveEnabled,
  ]);

  const SummaryItem = ({
    label,
    value,
    color = "text.primary",
    fontWeight = 500,
    secondary = false,
  }: {
    label: string;
    value: string | number;
    color?: string;
    fontWeight?: number;
    secondary?: boolean;
  }) => (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 1.5,
      }}
    >
      <Typography
        variant="body2"
        color={secondary ? "text.secondary" : "text.primary"}
        fontWeight={secondary ? 400 : 500}
      >
        {label}
      </Typography>
      <Typography variant="body1" color={color} fontWeight={fontWeight}>
        {typeof value === "number" ? `${formatCurrency(value)} บาท` : value}
      </Typography>
    </Box>
  );

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: 0,
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        }}
      >
        {/* Card Header */}
        <Box
          sx={{
            p: 3,
            bgcolor: "grey.50",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="h5" fontWeight={700} color="text.primary">
                สรุปรายการชำระเงิน
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ข้อมูลการคำนวณทั้งหมดอ้างอิงตามรายการสินค้า
              </Typography>
            </Box>
            <Box
              sx={{
                textAlign: "right",
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={autoSaveEnabled}
                    onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                    size="small"
                    sx={{
                      color: "primary.main",
                      "&.Mui-checked": { color: "primary.main" },
                      p: 0.5,
                    }}
                  />
                }
                label={
                  <Typography variant="caption" fontWeight={500}>
                    Auto-save
                  </Typography>
                }
                sx={{ m: 0 }}
              />
              {isSaving ? (
                <Typography
                  variant="caption"
                  sx={{
                    color: "primary.main",
                    fontStyle: "italic",
                    fontWeight: 600,
                  }}
                >
                  กำลังบันทึกร่าง...
                </Typography>
              ) : lastSaved ? (
                <Typography
                  variant="caption"
                  sx={{ color: "success.main", fontStyle: "italic" }}
                >
                  บันทึกร่างเมื่อ{" "}
                  {lastSaved.toLocaleTimeString("th-TH", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </Typography>
              ) : null}
            </Box>
          </Stack>
        </Box>

        <Box sx={{ p: 3 }}>
          {/* Main Totals Section */}
          <SummaryItem
            label="รวมเป็นเงิน (Subtotal)"
            value={subtotal}
            secondary
          />

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
              mt: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              ส่วนลดรวม (Discount)
            </Typography>
            <TextField
              type="number"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">฿</InputAdornment>
                ),
                sx: { borderRadius: "8px", width: 140, fontWeight: 600 },
              }}
            />
          </Box>

          <SummaryItem
            label="ราคาหลังหักส่วนลด"
            value={priceAfterDiscount}
            color="primary.main"
            fontWeight={700}
          />

          <Divider sx={{ my: 2.5, borderStyle: "dashed" }} />

          {/* Taxes Section */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={vatIncluded}
                  onChange={(e) => setVatIncluded(e.target.checked)}
                  sx={{
                    color: "primary.main",
                    "&.Mui-checked": { color: "primary.main" },
                  }}
                />
              }
              label={
                <Typography variant="body2" fontWeight={500}>
                  ภาษีมูลค่าเพิ่ม 7%
                </Typography>
              }
              sx={{ m: 0 }}
            />
            <Typography variant="body1" fontWeight={600}>
              {formatCurrency(vat)} บาท
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <FormControl size="small" sx={{ width: 160 }}>
              <InputLabel id="withholding-tax-label">หัก ณ ที่จ่าย</InputLabel>
              <Select
                labelId="withholding-tax-label"
                value={withholdingTaxRate}
                label="หัก ณ ที่จ่าย"
                onChange={(e) => setWithholdingTaxRate(Number(e.target.value))}
                sx={{ borderRadius: "8px" }}
              >
                <MenuItem value={0}>ไม่หัก (0%)</MenuItem>
                {[1, 2, 3, 5, 10].map((rate) => (
                  <MenuItem key={rate} value={rate}>
                    หัก {rate}%
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="body1" color="error.main" fontWeight={600}>
              -{formatCurrency(withholdingTax)} บาท
            </Typography>
          </Box>

          <Divider sx={{ my: 2.5, borderStyle: "dashed" }} />

          {/* Grand Total Section */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: "12px",
              bgcolor: "primary.main",
              color: "white",
              mb: 3,
              boxShadow:
                "0 8px 16px -4px rgba(theme.palette.primary.main, 0.3)",
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ opacity: 0.9, fontWeight: 600, mb: 0.5 }}
            >
              ยอดชำระสุทธิ (Grand Total)
            </Typography>
            <Typography variant="h3" fontWeight={800}>
              {formatCurrency(finalTotal)} บาท
            </Typography>
          </Box>

          {/* Notes Section */}
          <Box sx={{ mb: 4 }}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Description fontSize="small" color="action" />
              <Typography
                variant="subtitle2"
                fontWeight={700}
                color="text.secondary"
              >
                หมายเหตุท้ายเอกสาร
              </Typography>
            </Stack>
            <TextField
              fullWidth
              multiline
              minRows={3}
              placeholder="ข้อความที่จะแสดงในใบเสนอราคา..."
              value={headForm.note || ""}
              onChange={(e) =>
                setHeadForm({ ...headForm, note: e.target.value })
              }
              variant="outlined"
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  bgcolor: "grey.50",
                  fontSize: "0.875rem",
                },
              }}
            />
          </Box>

          {/* Action Buttons */}
          <Stack spacing={2}>
            <Button
              variant="contained"
              size="large"
              color="success"
              startIcon={<Save />}
              onClick={() => handleSaveQuotation("approve")}
              disabled={isSaving}
              fullWidth
              sx={{
                py: 1.5,
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 700,
                fontSize: "1.1rem",
                boxShadow: theme.shadows[4],
              }}
            >
              {isEdit
                ? "อัพเดทใบเสนอราคา"
                : autoSaveEnabled
                  ? "อนุมัติและออกใบเสนอราคา"
                  : "บันทึกและอนุมัติ"}
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<Save />}
              onClick={() => handleSaveQuotation("draft", false)}
              disabled={isSaving}
              fullWidth
              sx={{
                py: 1.2,
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 600,
                borderWidth: "2px",
                "&:hover": { borderWidth: "2px" },
              }}
            >
              {autoSaveEnabled
                ? isSaving
                  ? "กำลังบันทึก"
                  : "บันทึกดราฟท์เท่านั้น"
                : "บันทึกร่าง"}
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<Visibility />}
              onClick={handlePreviewInvoice}
              disabled={isSaving}
              fullWidth
              sx={{
                py: 1.2,
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 600,
                borderWidth: "2px",
                "&:hover": { borderWidth: "2px" },
              }}
            >
              ดูตัวอย่างเอกสาร
            </Button>
          </Stack>
        </Box>
      </Paper>
      <PreviewDialog open={onOpen} onClose={() => setOnOpen(false)} />
    </>
  );
};

export default PricingSummary;
