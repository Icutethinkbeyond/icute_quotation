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
  hideTableHeader?: boolean;
  measureHeaderOnly?: boolean;
}

const QuotationTable: React.FC<QuotationTableProps> = ({
  pageRows,
  pageIndex,
  hideTableHeader = false,
  measureHeaderOnly = false,
}) => {
  if (pageRows.length === 0) return null;

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        mb: 3,
        borderRadius: 0,
        overflow: "hidden",
        // Prevent table from breaking across pages
        pageBreakInside: "avoid",
        breakInside: "avoid",
      }}
    >
      <Table sx={{ width: "100%", tableLayout: "fixed" }}>
        {/* Table header */}
        {!hideTableHeader && (
          <TableRow
            sx={{
              backgroundColor: "#eaeaea",
              pageBreakInside: "avoid",
              breakInside: "avoid",
            }}
          >
            <TableCell
              sx={{
                color: "#989898",
                fontSize: 9,
                width: "40px",
                py: 0.5,
                pageBreakInside: "avoid",
                breakInside: "avoid",
              }}
            >
              NO.
            </TableCell>
            <TableCell
              sx={{
                color: "#989898",
                fontSize: 9,
                py: 0.5,
                pageBreakInside: "avoid",
                breakInside: "avoid",
              }}
            >
              สินค้า / รายละเอียด
            </TableCell>
            <TableCell
              sx={{
                color: "#989898",
                fontSize: 9,
                textAlign: "center",
                width: "60px",
                py: 0.5,
                pageBreakInside: "avoid",
                breakInside: "avoid",
              }}
            >
              จำนวน
            </TableCell>
            <TableCell
              sx={{
                color: "#989898",
                fontSize: 9,
                textAlign: "center",
                width: "60px",
                py: 0.5,
                pageBreakInside: "avoid",
                breakInside: "avoid",
              }}
            >
              หน่วย
            </TableCell>
            <TableCell
              sx={{
                color: "#989898",
                fontSize: 9,
                textAlign: "right",
                width: "120px",
                py: 0.5,
                pageBreakInside: "avoid",
                breakInside: "avoid",
              }}
            >
              ราคา/หน่วย
            </TableCell>
            <TableCell
              sx={{
                color: "#989898",
                fontSize: 9,
                textAlign: "right",
                width: "120px",
                py: 0.5,
                pageBreakInside: "avoid",
                breakInside: "avoid",
              }}
            >
              จำนวนเงิน (บาท)
            </TableCell>
          </TableRow>
        )}

        {!measureHeaderOnly && (
          <TableBody
            sx={{
              // Keep tbody content together
              pageBreakInside: "avoid",
              breakInside: "avoid",
            }}
          >
            {pageRows.map((row, rowIndex) => {
              const key = `${pageIndex}-${rowIndex}`;

              // 1. Category header row
              if (row.type === "header") {
                return (
                  <TableRow
                    key={`header-${key}`}
                    sx={{
                      pageBreakInside: "avoid",
                      breakInside: "avoid",
                      backgroundColor: "#42a5f5",
                    }}
                  >
                    <TableCell
                      colSpan={6}
                      sx={{
                        py: 0.5,
                        fontSize: 13,
                        fontWeight: "bold",
                        color: "white",
                        pageBreakInside: "avoid",
                        breakInside: "avoid",
                      }}
                    >
                      {row.data.index}. {row.data.name}
                    </TableCell>
                  </TableRow>
                );
              }

              // 2. Item row (name + description + remark combined)
              if (row.type === "item_name") {
                const item = row.data;
                const itemTotal = item.qty * item.pricePerUnit;
                return (
                  <TableRow
                    key={`item-${key}`}
                    sx={{
                      pageBreakInside: "avoid",
                      breakInside: "avoid",
                    }}
                  >
                    {" "}
                    {/* Removed bgcolor */}
                    <TableCell
                      sx={{
                        fontSize: 12,
                        textAlign: "center",
                        py: 0.5,
                        pageBreakInside: "avoid",
                        breakInside: "avoid",
                      }}
                    >
                      {item.displayIndex}
                    </TableCell>
                    <TableCell
                      sx={{
                        py: 0.5,
                        pageBreakInside: "avoid",
                        breakInside: "avoid",
                      }}
                    >
                      {" "}
                      {/* Adjusted padding */}
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
                            fontSize: 10,
                            pageBreakInside: "avoid",
                            breakInside: "avoid",
                          }}
                        >
                          รายละเอียด:{" "}
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              fontSize: 10,
                              whiteSpace: "pre-wrap",
                              pageBreakInside: "avoid",
                              breakInside: "avoid",
                            }}
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
                            fontSize: 10,
                            pageBreakInside: "avoid",
                            breakInside: "avoid",
                          }}
                        >
                          หมายเหตุ:{" "}
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              fontSize: 10,
                              whiteSpace: "pre-wrap",
                              pageBreakInside: "avoid",
                              breakInside: "avoid",
                            }}
                          >
                            {item.remark}
                          </Typography>
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell
                      sx={{
                        textAlign: "center",
                        fontSize: 12,
                        pageBreakInside: "avoid",
                        breakInside: "avoid",
                      }}
                    >
                      {item.qty}
                    </TableCell>
                    <TableCell
                      sx={{
                        textAlign: "center",
                        fontSize: 12,
                        pageBreakInside: "avoid",
                        breakInside: "avoid",
                      }}
                    >
                      {item.unit}
                    </TableCell>
                    <TableCell
                      sx={{
                        textAlign: "right",
                        fontSize: 12,
                        pageBreakInside: "avoid",
                        breakInside: "avoid",
                      }}
                    >
                      {formatNum(item.pricePerUnit)}
                    </TableCell>
                    <TableCell
                      sx={{
                        textAlign: "right",
                        fontSize: 12,
                        fontWeight: "bold",
                        pageBreakInside: "avoid",
                        breakInside: "avoid",
                      }}
                    >
                      {formatNum(itemTotal)}
                    </TableCell>
                  </TableRow>
                );
              }

              // 3. Subtotal row
              if (row.type === "subtotal") {
                return (
                  <TableRow
                    key={`subtotal-${key}`}
                    sx={{
                      pageBreakInside: "avoid",
                      breakInside: "avoid",
                    }}
                  >
                    <TableCell
                      colSpan={5}
                      sx={{
                        textAlign: "right",
                        fontWeight: "bold",
                        backgroundColor: "#e0e0e0",
                        fontSize: 12,
                        py: 0.5,
                        pageBreakInside: "avoid",
                        breakInside: "avoid",
                      }}
                    >
                      รวมเป็นเงิน
                    </TableCell>
                    <TableCell
                      sx={{
                        textAlign: "right",
                        fontWeight: "bold",
                        backgroundColor: "#e0e0e0",
                        fontSize: 14,
                        color: "#1565c0",
                        py: 0.5,
                        pageBreakInside: "avoid",
                        breakInside: "avoid",
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
        )}
      </Table>
    </TableContainer>
  );
};

export default QuotationTable;
