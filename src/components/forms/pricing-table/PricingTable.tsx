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
} from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import DeleteIcon from "@mui/icons-material/Delete"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import InventoryIcon from "@mui/icons-material/Inventory"
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
      qty: 0,
      pricePerUnit: 0,
      remark: "",
    })
  }


  return (
    <Box sx={{ p: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight={500}>
          ตารางราคา
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddCategory}
          sx={{
            bgcolor: theme.palette.primary.main,
            "&:hover": {
              bgcolor: theme.palette.primary.dark,
            },
          }}
        >
          เพิ่มหมวดหมู่หลัก
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f6f9fc" }}>
              <TableCell sx={{ fontWeight: 500, width: "5%" }}>#</TableCell>
              <TableCell sx={{ fontWeight: 500, width: "35%" }}>รายการ</TableCell>
              <TableCell sx={{ fontWeight: 500, width: "10%" }}>หน่วย</TableCell>
              <TableCell sx={{ fontWeight: 500, width: "10%" }}>จำนวน</TableCell>
              <TableCell sx={{ fontWeight: 500, width: "12%" }}>ราคา/หน่วย</TableCell>
              <TableCell sx={{ fontWeight: 500, width: "12%" }}>ราคา</TableCell>
              <TableCell sx={{ fontWeight: 500, width: "12%" }}>หมายเหตุ</TableCell>
              <TableCell sx={{ fontWeight: 500, width: "4%" }}>ลบ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category, catIndex) => (
              <React.Fragment key={category.id}>
                {/* Category Header Row */}
                <TableRow
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    "&:hover": {
                      bgcolor: theme.palette.primary.dark,
                    },
                  }}
                >
                  <TableCell
                    sx={{
                      color: "white",
                      fontWeight: 500,
                      fontSize: "1.1rem",
                    }}
                  >
                    {catIndex + 1}
                  </TableCell>
                  <TableCell colSpan={6}>
                    <TextField
                      fullWidth
                      placeholder="ชื่อหมวดหมู่หลัก"
                      value={category.name}
                      onChange={(e) => handleUpdateCategoryName(category.id, e.target.value)}
                      variant="standard"
                      sx={{
                        '& .MuiInputBase-input': {
                          color: "white",
                          fontWeight: 500,
                          fontSize: "1.1rem",
                        },
                        '& .MuiInput-underline:before': {
                          borderBottomColor: "rgba(255, 255, 255, 0.5)",
                        },
                        '& .MuiInput-underline:hover:before': {
                          borderBottomColor: "rgba(255, 255, 255, 0.8)",
                        },
                        '& .MuiInput-underline:after': {
                          borderBottomColor: "white",
                        },
                        '& .MuiInputBase-input::placeholder': {
                          color: "rgba(255, 255, 255, 0.7)",
                          opacity: 1,
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ textAlign: "right" }}>
                    <IconButton size="small" onClick={() => toggleCategory(category.id)} sx={{ color: "white" }}>
                      {isCategoryExpanded(category.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                    <IconButton size="small" onClick={() => removeCategory(category.id)} sx={{ color: "white", ml: 1 }}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>

                {/* Sub Items */}
                {isCategoryExpanded(category.id) &&
                  category.subItems.map((item, itemIndex) => (
                    <React.Fragment key={item.id}>
                      {/* Product Name Row */}
                      <TableRow sx={{ bgcolor: "#f0f7ff" }}>
                        <TableCell sx={{ fontWeight: 500, fontSize: "1.1rem" }}>
                          {catIndex + 1}.{itemIndex + 1}
                        </TableCell>
                        <TableCell colSpan={6}>
                          <Autocomplete
                            freeSolo
                            disableClearable={false}
                            options={item.name && item.name.length >= 3 ? allProducts : []}
                            loading={loadingProducts}
                            getOptionLabel={(option) => {
                              if (typeof option === 'string') return option;
                              return option.productName || "";
                            }}
                            value={item.name}
                            onInputChange={(event, newInputValue, reason) => {
                              if (reason === "input" || reason === "clear") {
                                updateSubItem(category.id, item.id, { name: newInputValue });
                                if (newInputValue.length >= 3) {
                                  fetchProducts();
                                }
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
                            isOptionEqualToValue={(option, value) =>
                              typeof value === 'string' ? option.productName === value : option.id === value.id
                            }
                            noOptionsText={item.name ? "ไม่พบข้อมูล พิมพ์เพื่อเพิ่มรายการใหม่" : "พิมพ์เพื่อค้นหาสินค้า..."}
                            renderOption={(props, option) => (
                              <Box component="li" {...props} key={option.id}>
                                <Box sx={{ flexGrow: 1, py: 0.5 }}>
                                  <Typography variant="body1" fontWeight={500} component="span">
                                    {option.productName}
                                  </Typography>
                                  <Typography variant="body2" color="primary.main" component="span" sx={{ ml: 1, fontWeight: 500 }}>
                                    • ฿{Number(option.aboutProduct?.productPrice || 0).toLocaleString()} / {option.aboutProduct?.unitName || "หน่วย"}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.disabled"
                                    display="block"
                                    sx={{
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      maxWidth: '400px'
                                    }}
                                  >
                                    {option.productDescription || "ไม่มีรายละเอียดสินค้า"}
                                  </Typography>
                                </Box>
                              </Box>
                            )}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder="ค้นหาสินค้า..."
                                variant="standard"
                                sx={{
                                  '& .MuiInputBase-input': {
                                    fontWeight: 500,
                                    fontSize: "1.1rem",
                                  },
                                }}
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => duplicateSubItem(category.id, item.id)} color="primary">
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => removeSubItem(category.id, item.id)} color="error">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                      {/* Product Details Row */}
                      <TableRow hover>
                        <TableCell />
                        <TableCell>
                          <TextField
                            fullWidth
                            multiline
                            minRows={2}
                            placeholder="รายละเอียดสินค้า"
                            value={item.description}
                            onChange={(e) => updateSubItem(category.id, item.id, { description: e.target.value })}
                            variant="outlined"
                            size="small"
                            sx={{
                              '& .MuiInputBase-root': {
                                fontSize: '0.875rem',
                                lineHeight: 1.5,
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Autocomplete
                            freeSolo
                            options={unitOptions}
                            value={item.unit}
                            onInputChange={(event, newInputValue) => {
                              updateSubItem(category.id, item.id, { unit: newInputValue });
                            }}
                            onChange={(event, newValue) => {
                              updateSubItem(category.id, item.id, { unit: newValue || "" });
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                fullWidth
                                placeholder="หน่วย"
                                variant="standard"
                                size="small"
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            type="number"
                            value={item.qty || ""}
                            onChange={(e) => updateSubItem(category.id, item.id, { qty: Number(e.target.value) })}
                            variant="standard"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            type="number"
                            value={item.pricePerUnit || ""}
                            onChange={(e) =>
                              updateSubItem(category.id, item.id, { pricePerUnit: Number(e.target.value) })
                            }
                            variant="standard"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {calculateSubItemTotal(item.qty, item.pricePerUnit).toLocaleString("th-TH", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            placeholder="หมายเหตุ"
                            value={item.remark}
                            onChange={(e) => updateSubItem(category.id, item.id, { remark: e.target.value })}
                            variant="standard"
                            size="small"
                          />
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    </React.Fragment>
                  ))}

                {/* Add Sub Item Button */}
                {isCategoryExpanded(category.id) && (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ py: 1 }}>
                      <Button
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => handleAddSubItem(category.id)}
                        sx={{ ml: 2 }}
                      >
                        เพิ่มรายการย่อย
                      </Button>
                    </TableCell>
                  </TableRow>
                )}

                {/* Category Subtotal */}
                {isCategoryExpanded(category.id) && category.subItems.length > 0 && (
                  <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                    <TableCell colSpan={5} sx={{ textAlign: "right" }}>
                      <Typography variant="body1" fontWeight={500}>
                        รวมหมวดหมู่
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight={500}>
                        {getCategoryTotal(category.id).toLocaleString("th-TH", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell colSpan={2} />
                  </TableRow>
                )}
              </React.Fragment>
            ))}

            {/* Grand Total */}
            {categories.length > 0 && (
              <TableRow
                sx={{
                  bgcolor: theme.palette.primary.main,
                  "& td": { color: "white", fontWeight: 500 },
                }}
              >
                <TableCell colSpan={5} sx={{ textAlign: "right" }}>
                  <Typography variant="h6" sx={{ color: "white", fontWeight: 500 }}>
                    มูลค่ารวมทั้งหมด
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="h6" sx={{ color: "white", fontWeight: 500 }}>
                    {getTotalPrice().toLocaleString("th-TH", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Typography>
                </TableCell>
                <TableCell colSpan={2} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {categories.length === 0 && (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            bgcolor: "#f5f5f5",
            borderRadius: 2,
            mt: 2,
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            ยังไม่มีข้อมูล
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            กดปุ่ม "เพิ่มหมวดหมู่หลัก" เพื่อเริ่มต้นสร้างตารางราคา
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default PricingTable
