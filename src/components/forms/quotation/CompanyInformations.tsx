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
  Button,
} from "@mui/material";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import FormSection from "../../shared/FormSection";
import {
  headerClean,
  HeadForm,
  useQuotationListContext,
} from "@/contexts/QuotationContext";
import { CompanyProfile } from "@/interfaces/Company";
import debounce from "lodash/debounce";
import { 
  Business, 
  Phone, 
  Receipt, 
  AccountTree, 
  CalendarToday, 
  LocationOn 
} from "@mui/icons-material";

// Validation Schema with Yup
const CompanyInformationSchema = Yup.object({
  companyName: Yup.string().required("กรุณาระบุชื่อบริษัท"),
  taxId: Yup.string().required("กรุณาระบุเลขประจำตัวผู้เสียภาษี"),
});

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
      "& fieldset": { borderColor: theme.palette.primary.main, borderWidth: "2px" },
    },
  },
  "& .MuiInputLabel-root": {
    fontSize: "0.875rem",
    fontWeight: 500,
  },
});

const CompanyInformation: React.FC = () => {
  const theme = useTheme();
  const { headForm, setHeadForm } = useQuotationListContext();
  const [suggestions, setSuggestions] = useState<CompanyProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);

  // Fetch company profiles for autocomplete
  const fetchSuggestions = async (search: string) => {
    if (search.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/companies");
      const data = await response.json();
      if (Array.isArray(data)) {
        const filtered = data.filter(
          (c: CompanyProfile) =>
            c.companyName.toLowerCase().includes(search.toLowerCase()) ||
            c.companyTaxId?.toLowerCase().includes(search.toLowerCase()),
        );
        setSuggestions(filtered);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetch = useCallback(
    debounce((value: string) => fetchSuggestions(value), 300),
    [],
  );

  // Helper to generate Quotation Number
  // const generateQuotationNumber = () => {
  //   const now = new Date();
  //   const timestamp = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  //   const dateStr = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
  //   return `QT-${dateStr}-${timestamp}`;
  // };

  // const handleGenerateNumber = (setFieldValue: any) => {
  //   const newNumber = generateQuotationNumber();
  //   setFieldValue("quotationNumber", newNumber);
  // };

  const handleSelectCompany = (
    profile: CompanyProfile | null,
    setFieldValue: any,
  ) => {
    if (profile) {
      setFieldValue("companyName", profile.companyName || "");
      setFieldValue("companyTel", profile.companyPhoneNumber || "");
      setFieldValue("taxId", profile.companyTaxId || "");
      setFieldValue("branch", profile.branch || "");
      setFieldValue("companyAddress", profile.companyAddress || "");
      setFieldValue("companyLogo", profile.companyImage || "");
      setFieldValue("companyLogoPublicId", profile.companyImagePublicId || "");
    }
  };

  const initNewQuotation = async () => {
    setLoadingFavorite(true);
    try {
      const response = await fetch("/api/companies/favorite");
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setHeadForm((prev) => ({
            ...prev,
            companyName: data.companyName || "",
            companyTel: data.companyPhoneNumber || "",
            taxId: data.companyTaxId || "",
            branch: data.branch || "",
            companyAddress: data.companyAddress || "",
            companyLogo: data.companyImage || "",
            companyLogoPublicId: data.companyImagePublicId || "",
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching favorite company:", error);
    } finally {
      setLoadingFavorite(false);
    }
  };


  useEffect(() => {
    // Only fetch if companyName is not already set (e.g. during an edit or if already auto-filled)
    if (!headForm.companyName) {
      initNewQuotation();
    }
  }, [headForm.companyName]);

  if (loadingFavorite) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
        <CircularProgress size={32} thickness={5} />
      </Box>
    );
  }

  return (
    <Formik<HeadForm>
      initialValues={headForm}
      validationSchema={CompanyInformationSchema}
      enableReinitialize
      onSubmit={() => {}}
    >
      {({ touched, errors, values, setFieldValue }) => {
        // Update context when formik values change
        useEffect(() => {
          setHeadForm(values);
        }, [values]);

        return (
          <Form>
            <FormSection title="ผู้ออกเอกสาร (ข้อมูลบริษัท)">
              <Grid2 container spacing={2.5}>
                {/* <Grid2 size={{ xs: 12, sm: 6 }}>
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
                </Grid2> */}

                {/* <Grid2 size={{ xs: 12, sm: 6 }}>
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
                </Grid2> */}

                {/* Company Name with Autocomplete */}
                <Grid2 size={12}>
                  <Autocomplete
                    freeSolo
                    disableClearable={false}
                    options={suggestions}
                    loading={loading}
                    inputValue={values.companyName || ""}
                    onInputChange={(_, newValue, reason) => {
                      if (reason === "input" || reason === "clear") {
                        setFieldValue("companyName", newValue);
                        if (reason === "input") debouncedFetch(newValue);
                      }
                    }}
                    onChange={(_, newValue) => {
                      if (typeof newValue === "object" && newValue !== null) {
                        handleSelectCompany(newValue, setFieldValue);
                      }
                    }}
                    getOptionLabel={(option) => typeof option === "string" ? option : option.companyName || ""}
                    renderOption={(props, option) => (
                      <Box component="li" {...props} key={option.companyId} sx={{ borderBottom: "1px solid", borderColor: "grey.100" }}>
                        <Box sx={{ py: 1 }}>
                          <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                            {option.companyName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                            เลขภาษี: {option.companyTaxId || "-"} | สาขา: {option.branch || "สำนักงานใหญ่"}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        name="companyName"
                        label="ชื่อบริษัท / นามบุคคล"
                        variant="outlined"
                        size="small"
                        fullWidth
                        error={touched.companyName && Boolean(errors.companyName)}
                        helperText={<ErrorMessage name="companyName" />}
                        sx={inputStyles(theme)}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <InputAdornment position="start">
                              <Business fontSize="small" color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6 }}>
                  <TextField
                    name="companyTel"
                    label="เบอร์โทรศัพท์"
                    variant="outlined"
                    size="small"
                    placeholder="02-XXX-XXXX"
                    fullWidth
                    value={values.companyTel || ""}
                    onChange={(e) => setFieldValue("companyTel", e.target.value)}
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
                    name="taxId"
                    label="เลขประจำตัวผู้เสียภาษี"
                    variant="outlined"
                    placeholder="0123XXXXXXXX"
                    size="small"
                    fullWidth
                    value={values.taxId || ""}
                    onChange={(e) => setFieldValue("taxId", e.target.value)}
                    error={touched.taxId && Boolean(errors.taxId)}
                    helperText={<ErrorMessage name="taxId" />}
                    sx={inputStyles(theme)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Receipt fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6 }}>
                  <TextField
                    name="branch"
                    label="สาขา"
                    variant="outlined"
                    size="small"
                    fullWidth
                    placeholder="เช่น สำนักงานใหญ่ หรือ 00001"
                    value={values.branch || ""}
                    onChange={(e) => setFieldValue("branch", e.target.value)}
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
                    name="companyAddress"
                    label="ที่อยู่บริษัท"
                    variant="outlined"
                    size="small"
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="ที่อยู่สำหรับออกใบกำกับภาษี..."
                    value={values.companyAddress || ""}
                    onChange={(e) => setFieldValue("companyAddress", e.target.value)}
                    sx={inputStyles(theme)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1 }}>
                          <LocationOn fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid2>
              </Grid2>
            </FormSection>
          </Form>
        );
      }}
    </Formik>
  );
};

export default CompanyInformation;
