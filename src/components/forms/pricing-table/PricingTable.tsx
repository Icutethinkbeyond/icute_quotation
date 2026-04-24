"use client"

import {
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
  Autocomplete,
  Tooltip,
} from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp"
import React, { useEffect, useState } from "react"
import { usePricingContext, SubItem, Category } from "@/contexts/PricingContext"
import { calculateSubItemTotal } from "@/utils/utils"

const PricingTable: React.FC = () => {
  const theme = useTheme()
  const {
    categories,
    addCategory,
    removeCategory,
    addSubItem,
    removeSubItem,
    updateSubItem,
    duplicateSubItem,
    updateCategoryName,
    getCategoryTotal,
    getTotalPrice,
  } = usePricingContext()

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [unitOptions, setUnitOptions] = useState<string[]>([])

  const fetchProducts = async () => {
    if (allProducts.length > 0 || loadingProducts) return;

    setLoadingProducts(true);
    try {
      const response = await fetch("/api/inventory/product")
      const data = await response.json()
      setAllProducts(data)
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoadingProducts(false);
    }
  }

  const fetchUnits = async () => {
    try {
      const response = await fetch("/api/units")
      const data = await response.json()
      if (Array.isArray(data)) {
        setUnitOptions(data.map((u: any) => u.unitName))
      }
    } catch (error) {
      console.error("Error fetching units:", error)
    }
  }

  useEffect(() => {
    fetchUnits()
  }, [])

  const handleAddCategory = () => {
    addCategory("")
  }

  const handleUpdateCategoryName = (categoryId: string, name: string) => {
    updateCategoryName(categoryId, name)
  }

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }))
  }

  const isCategoryExpanded = (categoryId: string) => {
    return expandedCategories[categoryId] !== false // Default to expanded
  }

  const handleAddSubItem = (categoryId: string) => {
    addSubItem(categoryId, {
      name: "",
      description: "",
      unit: "",
      qty: 1,
      pricePerUnit: 0,
      remark: "",
    })
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" fontWeight={600} color="text.primary">
          รายการสินค้าและบริการ
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddCategory}
          sx={{
            px: 3,
            py: 1,
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 600,
            boxShadow: "none",
            "&:hover": {
              boxShadow: theme.shadows[2],
            },
          }}
        >
          เพิ่มหมวดหมู่
        </Button>
      </Box>

      {categories.map((category, catIndex) => (
        <Paper
          key={category.id}
          elevation={0}
          sx={{
            mb: 4,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          {/* Category Header */}
          <Box
            sx={{
              px: 3,
              py: 2,
              display: "flex",
              alignItems: "center",
              bgcolor: "grey.50",
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mr: 2,
                bgcolor: "primary.main",
                color: "white",
                width: 28,
                height: 28,
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.875rem",
                fontWeight: 700,
              }}
            >
              {catIndex + 1}
            </Typography>
            <TextField
              placeholder="ระบุชื่อหมวดหมู่หลัก (เช่น ค่าแรง, ค่าอุปกรณ์)"
              value={category.name}
              onChange={(e) => handleUpdateCategoryName(category.id, e.target.value)}
              variant="standard"
              InputProps={{
                disableUnderline: true,
                sx: {
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "text.primary",
                }
              }}
              sx={{ flexGrow: 1 }}
            />
            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title={isCategoryExpanded(category.id) ? "ย่อ" : "ขยาย"}>
                <IconButton size="small" onClick={() => toggleCategory(category.id)}>
                  {isCategoryExpanded(category.id) ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </IconButton>
              </Tooltip>
              <Tooltip title="ลบหมวดหมู่">
                <IconButton size="small" onClick={() => removeCategory(category.id)} color="error">
                  <DeleteOutlineIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {isCategoryExpanded(category.id) && (
            <Box sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "transparent" }}>
                    <TableCell sx={{ width: "40px", borderBottom: "none" }}></TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "text.secondary", fontSize: "0.75rem", textTransform: "uppercase", py: 1.5 }}>รายการ / รายละเอียด</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "text.secondary", fontSize: "0.75rem", textTransform: "uppercase", width: "100px" }}>หน่วย</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "text.secondary", fontSize: "0.75rem", textTransform: "uppercase", width: "100px" }}>จำนวน</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "text.secondary", fontSize: "0.75rem", textTransform: "uppercase", width: "140px" }}>ราคา/หน่วย</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "text.secondary", fontSize: "0.75rem", textTransform: "uppercase", width: "140px" }}>รวมเงิน</TableCell>
                    <TableCell sx={{ width: "80px", borderBottom: "none" }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {category.subItems.map((item, itemIndex) => (
                    <React.Fragment key={item.id}>
                      <TableRow sx={{ "& td": { borderBottom: "none", pt: 1, pb: 0 } }}>
                        <TableCell sx={{ verticalAlign: "top", pt: 2.5 }}>
                          <Typography variant="caption" color="text.disabled" fontWeight={700}>
                            {catIndex + 1}.{itemIndex + 1}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ pb: 0 }}>
                          <Autocomplete
                            freeSolo
                            disableClearable={false}
                            options={item.name && item.name.length >= 2 ? allProducts : []}
                            loading={loadingProducts}
                            getOptionLabel={(option) => typeof option === 'string' ? option : option.productName || ""}
                            value={item.name}
                            onInputChange={(event, newInputValue, reason) => {
                              if (reason === "input" || reason === "clear") {
                                updateSubItem(category.id, item.id, { name: newInputValue });
                                if (newInputValue.length >= 2) fetchProducts();
                              }
                            }}
                            onChange={(event, newValue: any) => {
                              if (newValue && typeof newValue !== 'string') {
                                updateSubItem(category.id, item.id, {
                                  name: newValue.productName,
                                  description: newValue.productDescription || "",
                                  unit: newValue.aboutProduct?.unitName || "",
                                  pricePerUnit: newValue.aboutProduct?.productPrice || 0,
                                });
                              }
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder="ค้นหาหรือพิมพ์ชื่อสินค้า..."
                                variant="outlined"
                                size="small"
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: "8px",
                                    bgcolor: "white",
                                    fontWeight: 600,
                                  }
                                }}
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Autocomplete
                            freeSolo
                            options={unitOptions}
                            value={item.unit}
                            onInputChange={(event, newInputValue) => updateSubItem(category.id, item.id, { unit: newInputValue })}
                            onChange={(event, newValue) => updateSubItem(category.id, item.id, { unit: newValue || "" })}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="outlined"
                                size="small"
                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", bgcolor: "white" } }}
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={item.qty || ""}
                            onChange={(e) => updateSubItem(category.id, item.id, { qty: Number(e.target.value) })}
                            variant="outlined"
                            size="small"
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", bgcolor: "white" } }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={item.pricePerUnit || ""}
                            onChange={(e) => updateSubItem(category.id, item.id, { pricePerUnit: Number(e.target.value) })}
                            variant="outlined"
                            size="small"
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", bgcolor: "white" } }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight={700} color="text.primary" sx={{ pt: 1 }}>
                            ฿{calculateSubItemTotal(item.qty, item.pricePerUnit).toLocaleString("th-TH", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: "top", pt: 1.5 }}>
                          <Box sx={{ display: "flex" }}>
                            <Tooltip title="คัดลอก">
                              <IconButton size="small" onClick={() => duplicateSubItem(category.id, item.id)} sx={{ color: "primary.main" }}>
                                <ContentCopyIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="ลบรายการ">
                              <IconButton size="small" onClick={() => removeSubItem(category.id, item.id)} sx={{ color: "error.main" }}>
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                      <TableRow sx={{ "& td": { borderBottom: "1px solid", borderColor: "grey.100", pt: 0.5, pb: 2 } }}>
                        <TableCell />
                        <TableCell colSpan={5}>
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                            <TextField
                              fullWidth
                              multiline
                              placeholder="รายละเอียดเพิ่มเติม (ระบุหรือไม่ก็ได้)"
                              value={item.description}
                              onChange={(e) => updateSubItem(category.id, item.id, { description: e.target.value })}
                              variant="outlined"
                              size="small"
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: "8px",
                                  fontSize: "0.8125rem",
                                  bgcolor: "grey.50",
                                  "& fieldset": { borderColor: "transparent" },
                                  // "&:hover fieldset": { borderColor: "grey.300" },
                                  // "&.Mui-focused fieldset": { borderColor: "primary.main", bgcolor: "white" },
                                }
                              }}
                            />
                            <TextField
                              fullWidth
                              placeholder="หมายเหตุ (ภายใน)"
                              value={item.remark}
                              onChange={(e) => updateSubItem(category.id, item.id, { remark: e.target.value })}
                              variant="outlined"
                              size="small"
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: "8px",
                                  fontSize: "0.8125rem",
                                  bgcolor: "grey.50",
                                  "& fieldset": { borderColor: "transparent" },
                                }
                              }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
              <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "grey.25" }}>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => handleAddSubItem(category.id)}
                  sx={{
                    borderRadius: "6px",
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  เพิ่มรายการย่อย
                </Button>
                <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    รวมหมวดหมู่ ({category.name || "ยังไม่ระบุชื่อ"}):
                  </Typography>
                  <Typography variant="h6" color="primary.main" fontWeight={700}>
                    ฿{getCategoryTotal(category.id).toLocaleString("th-TH", {
                      minimumFractionDigits: 2,
                    })}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Paper>
      ))}

      {categories.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 10,
            bgcolor: "grey.50",
            borderRadius: "16px",
            border: "2px dashed",
            borderColor: "grey.200",
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom fontWeight={600}>
            ยังไม่มีรายการสินค้าหรือบริการ
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
            เริ่มต้นโดยการเพิ่มหมวดหมู่เพื่อจัดกลุ่มรายการของคุณ
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddCategory}
            sx={{ borderRadius: "8px", px: 4 }}
          >
            สร้างหมวดหมู่แรก
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            mt: 4,
            p: 3,
            borderRadius: "12px",
            bgcolor: "primary.main",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: theme.shadows[4],
          }}
        >
          <Box>
            <Typography variant="subtitle2" sx={{ opacity: 0.8, fontWeight: 600 }}>
              มูลค่ารวมทุกหมวดหมู่ (Subtotal)
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.6 }}>
              ยังไม่รวมส่วนลดและภาษีมูลค่าเพิ่ม
            </Typography>
          </Box>
          <Typography variant="h3" fontWeight={800}>
            ฿{getTotalPrice().toLocaleString("th-TH", {
              minimumFractionDigits: 2,
            })}
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default PricingTable
