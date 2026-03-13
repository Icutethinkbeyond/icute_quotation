"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Grid2,
  TextField,
  Autocomplete,
  Box,
  Typography,
  useTheme,
  CircularProgress,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Button,
} from "@mui/material";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import FormSection from "../../shared/FormSection";
import { HeadForm, useQuotationListContext } from "@/contexts/QuotationContext";
import { CustomerCompany } from "@/interfaces/Company";
import { Customer } from "@/interfaces/Customer";
import debounce from "lodash/debounce";
import {
  Business,
  Phone,
  Receipt,
  AccountTree,
  Person,
  Email,
  LocationOn,
  CalendarToday,
} from "@mui/icons-material";

// Validation Schema with Yup
const ContactorInformationSchema = Yup.object().shape({
  quotationNumber: Yup.string().required("กรุณาระบุเลขที่ใบเสนอราคา"),
  contactorName: Yup.string().required("กรุณาระบุชื่อผู้ติดต่อ"),
  // Conditional validation based on isCorporate
  customerCompanyName: Yup.string().when("isCorporate", {
    is: true,
    then: (schema) => schema.required("กรุณาระบุชื่อบริษัทลูกค้า"),
  }),
  customerTaxId: Yup.string().when("isCorporate", {
    is: true,
    then: (schema) =>
      schema.required("กรุณาระบุเลขประจำตัวผู้เสียภาษี (ลูกค้า)"),
  }),
});

interface ContactorOption extends Customer {}
interface CompanyOption extends CustomerCompany {}

// Styled Input Helper
const inputStyles = (theme: any) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    transition: "all 0.2s ease-in-out",
    backgroundColor: "grey.50",
    "& fieldset": { borderColor: "grey.200" }, // Always visible border
    "&:hover": {
      backgroundColor: "grey.100",
      "& fieldset": { borderColor: "grey.300" }, // Darker border on hover
    },
    "&.Mui-focused": {
      backgroundColor: "#ffffff",
      "& fieldset": {
        borderColor: theme.palette.primary.main,
        borderWidth: "2px",
      },
    },
  },
  "& .MuiInputLabel-root": {
    fontSize: "0.875rem",
    fontWeight: 500,
  },
});

const ContactorInformation: React.FC = () => {
  const { headForm, setHeadForm } = useQuotationListContext();
  const [contactorSuggestions, setContactorSuggestions] = useState<
    ContactorOption[]
  >([]);
  const [loadingContactor, setLoadingContactor] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);
  const theme = useTheme();

  // State to manage customer type (sync with headForm.customerType)
  const [isCorporate, setIsCorporate] = useState(headForm.customerType === "Corporate");

  // Helper to generate Quotation Number
  const generateQuotationNumber = () => {
    const now = new Date();
    const timestamp = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const dateStr = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
    return `QT-${dateStr}-${timestamp}`;
  };

  const handleGenerateNumber = (setFieldValue: any) => {
    const newNumber = generateQuotationNumber();
    setFieldValue("quotationNumber", newNumber);
  };

  // Update local state if headForm.customerType changes externally
  useEffect(() => {
    setIsCorporate(headForm.customerType === "Corporate");
  }, [headForm.customerType]);

  // Fetch contactors for autocomplete
  const fetchContactorSuggestions = async (search: string = "") => {
    if (search.length < 2 && !search) {
      setContactorSuggestions([]);
      return;
    }

    setLoadingContactor(true);
    try {
      const response = await fetch(
        `/api/customer?search=${encodeURIComponent(search)}`,
      );
      const data = await response.json();
      if (Array.isArray(data)) {
        setContactorSuggestions(data);
      }
    } catch (error) {
      console.error("Error fetching contactor suggestions:", error);
    } finally {
      setLoadingContactor(false);
    }
  };

  const debouncedContactorFetch = useCallback(
    debounce((value: string) => fetchContactorSuggestions(value), 300),
    [],
  );

  const handleSelectContactor = (
    contactor: ContactorOption | null,
    setFieldValue: any,
  ) => {
    if (contactor) {
      setFieldValue("contactorName", contactor.contactorName || "");
      setFieldValue("contactorTel", contactor.contactorTel || "");
      setFieldValue("contactorEmail", contactor.contactorEmail || "");
      setFieldValue("contactorAddress", contactor.contactorAddress || "");
    }
  };

  useEffect(() => {
    // Fetch Customer Specific favorite
    const fetchFavoriteCustomer = async () => {
      setLoadingFavorite(true);
      try {
        const response = await fetch("/api/customer/company/favorite");
        if (response.ok) {
          const favorite = await response.json();
          if (favorite) {
            setHeadForm((prev) => ({
              ...prev,
              customerType: favorite.taxId ? "Corporate" : "Individual",
              customerCompanyName: favorite.companyName || "",
              customerCompanyTel: favorite.companyTel || "",
              customerCompanyAddress: favorite.companyAddress || "",
              customerTaxId: favorite.taxId || "",
              customerBranch: favorite.branch || "",
              ...(favorite.contactors && favorite.contactors.length > 0
                ? {
                    contactorName: favorite.contactors[0].contactorName || "",
                    contactorTel: favorite.contactors[0].contactorTel || "",
                    contactorEmail: favorite.contactors[0].contactorEmail || "",
                    contactorAddress:
                      favorite.contactors[0].contactorAddress || "",
                  }
                : {}),
            }));
            if (favorite.taxId) setIsCorporate(true);
          }
        }
      } catch (error) {
        console.error("Error fetching favorite customer company:", error);
      } finally {
        setLoadingFavorite(false);
      }
    };

    // Only fetch favorite if we are starting fresh (no existing company selected)
    if (!headForm.customerCompanyName && !headForm.customerTaxId && !headForm.contactorName) {
      fetchFavoriteCustomer();
    }
  }, []);

  if (loadingFavorite) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 300,
        }}
      >
        <CircularProgress size={32} thickness={5} />
      </Box>
    );
  }

  return (
    <Formik<HeadForm>
      initialValues={headForm}
      validationSchema={ContactorInformationSchema}
      enableReinitialize
      onSubmit={() => {}}
    >
      {({ touched, errors, values, setFieldValue }) => {
        useEffect(() => {
          setHeadForm(values);
        }, [values]);

        const handleTypeChange = (isCorp: boolean) => {
          setIsCorporate(isCorp);
          setFieldValue("customerType", isCorp ? "Corporate" : "Individual");
          // Clear corporate fields if switching to individual
          if (!isCorp) {
            setFieldValue("customerCompanyName", "");
            setFieldValue("customerTaxId", "");
            setFieldValue("customerBranch", "");
            setFieldValue("customerCompanyAddress", "");
          } else {
            // Clear individual fields if switching to corporate (or just set contactorName if needed)
            // For now, only corporate fields are affected directly
          }
        };

        return (
          <Form>
            <FormSection title="ผู้รับเอกสาร (ข้อมูลลูกค้า)">
              <Grid2 container spacing={2.5}>
                <Grid2 size={{ xs: 12, sm: 6 }}>
                  <TextField
                    name="quotationNumber"
                    label="เลขที่ใบเสนอราคา"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={values.quotationNumber || ""}
                    onChange={(e) =>
                      setFieldValue("quotationNumber", e.target.value)
                    }
                    error={
                      touched.quotationNumber &&
                      Boolean(errors.quotationNumber)
                    }
                    helperText={<ErrorMessage name="quotationNumber" />}
                    sx={inputStyles(theme)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Receipt fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button 
                            variant="text" 
                            size="small" 
                            onClick={() => handleGenerateNumber(setFieldValue)}
                            sx={{ minWidth: "auto", fontSize: "11px", fontWeight: 700 }}
                          >
                            สร้างเลขที่
                          </Button>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6 }}>
                  <TextField
                    name="dateCreate"
                    label="วันที่ออกเอกสาร"
                    variant="outlined"
                    size="small"
                    fullWidth
                    type="date"
                    value={values.dateCreate || ""}
                    onChange={(e) =>
                      setFieldValue("dateCreate", e.target.value)
                    }
                    sx={inputStyles(theme)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarToday fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid2>

                {/* Checkbox for customer type */}
                <Grid2 size={12}>
                  <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isCorporate}
                          onChange={() => handleTypeChange(true)}
                          color="primary"
                        />
                      }
                      label="นิติบุคคล"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={!isCorporate}
                          onChange={() => handleTypeChange(false)}
                          color="primary"
                        />
                      }
                      label="บุคคลธรรมดา"
                    />
                  </Box>
                </Grid2>

                {isCorporate && (
                  <>
                    <Grid2 size={12}>
                      <TextField
                        name="customerCompanyName"
                        label="ชื่อบริษัทลูกค้า"
                        variant="outlined"
                        size="small"
                        placeholder="บริษัท XXX จำกัด"
                        fullWidth
                        value={values.customerCompanyName || ""}
                        onChange={(e) =>
                          setFieldValue("customerCompanyName", e.target.value)
                        }
                        sx={inputStyles(theme)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Business fontSize="small" color="action" />
                            </InputAdornment>
                          ),
                        }}
                        error={
                          touched.customerCompanyName &&
                          Boolean(errors.customerCompanyName)
                        }
                        helperText={<ErrorMessage name="customerCompanyName" />}
                      />
                    </Grid2>

                    <Grid2 size={{ xs: 12, sm: 6 }}>
                      <TextField
                        name="customerTaxId"
                        label="เลขประจำตัวผู้เสียภาษี (ลูกค้า)"
                        variant="outlined"
                        size="small"
                        fullWidth
                        placeholder="0123XXXXXXXX"
                        value={values.customerTaxId || ""}
                        onChange={(e) =>
                          setFieldValue("customerTaxId", e.target.value)
                        }
                        sx={inputStyles(theme)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Receipt fontSize="small" color="action" />
                            </InputAdornment>
                          ),
                        }}
                        error={
                          touched.customerTaxId && Boolean(errors.customerTaxId)
                        }
                        helperText={<ErrorMessage name="customerTaxId" />}
                      />
                    </Grid2>

                    <Grid2 size={{ xs: 12, sm: 6 }}>
                      <TextField
                        name="customerBranch"
                        label="สาขา (ลูกค้า)"
                        variant="outlined"
                        size="small"
                        fullWidth
                        placeholder="เช่น สำนักงานใหญ่ หรือ 00001"
                        value={values.customerBranch || ""}
                        onChange={(e) =>
                          setFieldValue("customerBranch", e.target.value)
                        }
                        sx={inputStyles(theme)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AccountTree fontSize="small" color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid2>

                    <Grid2 size={12}>
                      <TextField
                        name="customerCompanyAddress"
                        label="ที่อยู่บริษัทลูกค้า"
                        variant="outlined"
                        size="small"
                        fullWidth
                        multiline
                        placeholder="ที่อยู่สำหรับออกใบกำกับภาษี..."
                        rows={2}
                        value={values.customerCompanyAddress || ""}
                        onChange={(e) =>
                          setFieldValue(
                            "customerCompanyAddress",
                            e.target.value,
                          )
                        }
                        sx={inputStyles(theme)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment
                              position="start"
                              sx={{ alignSelf: "flex-start", mt: 1 }}
                            >
                              <LocationOn fontSize="small" color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid2>
                  </>
                )}

                <Grid2 size={12}>
                  <Autocomplete
                    freeSolo
                    disableClearable={false}
                    options={contactorSuggestions}
                    loading={loadingContactor}
                    inputValue={values.contactorName || ""}
                    onInputChange={(_, newValue, reason) => {
                      if (reason === "input" || reason === "clear") {
                        setFieldValue("contactorName", newValue);
                        if (reason === "input")
                          debouncedContactorFetch(newValue);
                      }
                    }}
                    onChange={(_, newValue) => {
                      if (typeof newValue === "object" && newValue !== null) {
                        handleSelectContactor(newValue, setFieldValue);
                      }
                    }}
                    getOptionLabel={(option) =>
                      typeof option === "string"
                        ? option
                        : option.contactorName || ""
                    }
                    renderOption={(props, option) => (
                      <Box
                        component="li"
                        {...props}
                        key={option.contactorId}
                        sx={{
                          borderBottom: "1px solid",
                          borderColor: "grey.100",
                        }}
                      >
                        <Box sx={{ py: 1 }}>
                          <Typography
                            variant="subtitle2"
                            fontWeight={700}
                            color="primary.main"
                          >
                            {option.contactorName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option.contactorTel || "ไม่มีเบอร์โทร"} |{" "}
                            {option.contactorEmail || "ไม่มีอีเมล"}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        name="contactorName"
                        label="ชื่อผู้ติดต่อ"
                        variant="outlined"
                        size="small"
                        placeholder="พิมพ์ 3 ตัวอักษรเพื่อเริ่มค้นหา"
                        fullWidth
                        error={
                          touched.contactorName && Boolean(errors.contactorName)
                        }
                        helperText={<ErrorMessage name="contactorName" />}
                        sx={inputStyles(theme)}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person fontSize="small" color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6 }}>
                  <TextField
                    name="contactorTel"
                    label="เบอร์โทรผู้ติดต่อ"
                    variant="outlined"
                    size="small"
                    placeholder="06X-XXX-XXXX"
                    fullWidth
                    value={values.contactorTel || ""}
                    onChange={(e) =>
                      setFieldValue("contactorTel", e.target.value)
                    }
                    sx={inputStyles(theme)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6 }}>
                  <TextField
                    name="contactorEmail"
                    label="อีเมลผู้ติดต่อ"
                    variant="outlined"
                    size="small"
                    fullWidth
                    placeholder="example@mail.com"
                    value={values.contactorEmail || ""}
                    onChange={(e) =>
                      setFieldValue("contactorEmail", e.target.value)
                    }
                    sx={inputStyles(theme)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid2>

                {!isCorporate && (
                  <Grid2 size={12}>
                    <TextField
                      name="contactorAddress"
                      label="ที่อยู่ผู้ติดต่อ"
                      variant="outlined"
                      size="small"
                      placeholder="ที่อยู่สำหรับออกใบกำกับภาษี..."
                      fullWidth
                      multiline
                      rows={2}
                      value={values.contactorAddress || ""}
                      onChange={(e) =>
                        setFieldValue("contactorAddress", e.target.value)
                      }
                      sx={inputStyles(theme)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment
                            position="start"
                            sx={{ alignSelf: "flex-start", mt: 1 }}
                          >
                            <LocationOn fontSize="small" color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid2>
                )}
              </Grid2>
            </FormSection>
          </Form>
        );
      }}
    </Formik>
  );
};

export default ContactorInformation;
