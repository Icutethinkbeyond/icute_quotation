import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";
import { formatNum } from "@/utils/utils";

interface QuotationTableProps {
  pageRows: any[];
  pageIndex: number;
}

const QuotationTable: React.FC<QuotationTableProps> = ({
  pageRows,
  pageIndex,
}) => {
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{ mb: 3, flexGrow: 1, borderRadius: 0, overflow: "hidden" }}
  >
      <Table sx={{ width: "100%", tableLayout: "fixed" }}>
        {/* ส่วนหัวตาราง */}
        <TableHead>
          <TableRow sx={{ backgroundColor: "#2196f3" }}> {/* Changed header background color */}
            <TableCell
              sx={{
                color: "white",
                fontSize: 12,
                width: "40px",
              }}
            >
              NO.
            </TableCell>
            <TableCell sx={{ color: "white", fontSize: 12 }}>
              สินค้า / รายละเอียด
            </TableCell>
            <TableCell
              sx={{
                color: "white",
                fontSize: 12,
                textAlign: "center",
                width: "60px",
              }}
            >
              จำนวน
            </TableCell>
            <TableCell
              sx={{
                color: "white",
                fontSize: 12,
                textAlign: "center",
                width: "60px",
              }}
            >
              หน่วย
            </TableCell>
            <TableCell
              sx={{
                color: "white",
                fontSize: 12,
                textAlign: "right",
                width: "120px",
              }}
            >
              ราคา/หน่วย
            </TableCell>
            <TableCell
              sx={{
                color: "white",
                fontSize: 12,
                textAlign: "right",
                width: "120px",
              }}
            >
              จำนวนเงิน (บาท)
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {pageRows.map((row, rowIndex) => {
            const key = `${pageIndex}-${rowIndex}`;

            // 1. แถวหัวข้อกลุ่ม (Header Row)
            if (row.type === "header") {
              return (
                <TableRow key={`header-${key}`}>
                  <TableCell
                    colSpan={6}
                    sx={{
                      backgroundColor: "#42a5f5", /* Lighter blue for category header */
                      color: "white",
                      py: 1,
                      fontSize: 13,
                      fontWeight: "bold",
                    }}
                  >
                    {row.data.index}. {row.data.name}
                  </TableCell>
                </TableRow>
              );
            }

            // 2. แถวรายการสินค้า (Item Row - combined name, description, remark)
            if (row.type === "item_name") {
              const item = row.data;
              const itemTotal = item.qty * item.pricePerUnit;
              return (
                <TableRow key={`item-${key}`}> {/* Removed bgcolor */}
                  <TableCell sx={{ fontSize: 12, textAlign: "center" }}>
                    {item.displayIndex}
                  </TableCell>
                  <TableCell sx={{ py: 1.5 }}> {/* Adjusted padding */}
                    <Typography
                      variant="body2"
                      sx={{ fontSize: 12, fontWeight: "medium" }}
                    >
                      {item.name}
                    </Typography>
                    {item.description && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          fontWeight: "bold",
                          display: "block",
                          mt: 0.5,
                          fontSize: 10, /* Smaller font for details */
                        }}
                      >
                        รายละเอียด:{" "}
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: 10, whiteSpace: "pre-wrap" }} /* Smaller font for details content */
                        >
                          {item.description}
                        </Typography>
                      </Typography>
                    )}
                    {item.remark && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{
                          fontWeight: "bold",
                          display: "block",
                          mt: 0.5,
                          fontSize: 10, /* Smaller font for remark */
                        }}
                      >
                        หมายเหตุ:{" "}
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: 10, whiteSpace: "pre-wrap" }} /* Smaller font for remark content */
                        >
                          {item.remark}
                        </Typography>
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center", fontSize: 12 }}>
                    {item.qty}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center", fontSize: 12 }}>
                    {item.unit}
                  </TableCell>
                  <TableCell sx={{ textAlign: "right", fontSize: 12 }}>
                    {formatNum(item.pricePerUnit)}
                  </TableCell>
                  <TableCell
                    sx={{
                      textAlign: "right",
                      fontSize: 12,
                      fontWeight: "bold",
                    }}
                  >
                    {formatNum(itemTotal)}
                  </TableCell>
                </TableRow>
              );
            }

            // 3. แถวสรุปยอดในหน้านั้นๆ (Subtotal Row)
            if (row.type === "subtotal") {
              return (
                <TableRow key={`subtotal-${key}`}>
                  <TableCell
                    colSpan={5}
                    sx={{
                      textAlign: "right",
                      fontWeight: "bold",
                      backgroundColor: "#e0e0e0", /* Slightly darker for subtotal */
                      fontSize: 12,
                    }}
                  >
                    รวมเป็นเงิน
                  </TableCell>
                  <TableCell
                    sx={{
                      textAlign: "right",
                      fontWeight: "bold",
                      backgroundColor: "#e0e0e0", /* Slightly darker for subtotal */
                      fontSize: 14,
                      color: "#1565c0",
                    }}
                  >
                    {formatNum(row.data.total)}
                  </TableCell>
                </TableRow>
              );
            }

            return null;
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default QuotationTable;
