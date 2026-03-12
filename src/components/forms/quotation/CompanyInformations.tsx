import React, { useEffect, useState, useCallback } from "react";
import {
  Grid2,
  TextField,
  Autocomplete,
  Box,
  Typography,
  useTheme,
  CircularProgress,
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

// Validation Schema with Yup
const CompanyInformationSchema = Yup.object({
  // companyName: Yup.string().required("ชื่อบริษัทจำเป็นต้องกรอก"),
});

// Styled TextField - focus border only, no background change
const getTextFieldSx = (theme: any) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.primary.main,
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.primary.main,
      borderWidth: "2px",
    },
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: theme.palette.primary.main,
  },
});

const CompanyInformation: React.FC = () => {
  const { headForm, setHeadForm } = useQuotationListContext();
  const [suggestions, setSuggestions] = useState<CompanyProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);
  const theme = useTheme();

  // Fetch company profiles for autocomplete
  const fetchSuggestions = async (search: string) => {
    if (search.length < 3) {
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

  // Debounced search
  const debouncedFetch = useCallback(
    debounce((value: string) => fetchSuggestions(value), 300),
    [],
  );

  // Handle select company from suggestions
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
    }
    setSuggestions([]);
  };

  // Reset ฟอร์มทั้งหมดเมื่อเข้าหน้า New Quotation
  useEffect(
    () => {
      const initNewQuotation = async () => {

        setLoadingFavorite(true)
        console.log("🔄 Resetting form data for new quotation...");

        const today = new Date().toISOString().split("T")[0];
        let initialHead = { ...headerClean, dateCreate: today };

        // Try to fetch favorite company for auto-fill
        try {
          const response = await fetch("/api/companies");
          const data = await response.json();
          if (Array.isArray(data)) {
            const favorite = data.find((c: any) => c.isFavorite);
            if (favorite) {
              initialHead = {
                ...initialHead,
                companyName: favorite.companyName || "",
                companyTel: favorite.companyPhoneNumber || "",
                taxId: favorite.companyTaxId || "",
                branch: favorite.branch || "",
                companyAddress: favorite.companyAddress || "",
              };
              console.log(
                "✅ Auto-filled favorite company:",
                favorite.companyName,
              );
            }
          }
        } catch (error) {
          console.error("Error fetching favorite company:", error);
        }

        console.log(initialHead);
        setHeadForm(initialHead);

        console.log("✅ Form reset complete");
        setLoadingFavorite(false)
      };

      initNewQuotation();
    },
    [
      // setHeadForm,
    ],
  ); // Run only once when component mounts

  if (loadingFavorite) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Formik<HeadForm>
        initialValues={headForm}
        validationSchema={CompanyInformationSchema}
        enableReinitialize
        onSubmit={(values) => {
          console.log("บันทึกข้อมูล:", values);
          setHeadForm(values);
        }}
      >
        {({ touched, errors, values, setFieldValue }) => {
          useEffect(() => {
            setHeadForm(values);
          }, [values, setHeadForm]);

          return (
            <Form>
              <FormSection title="ข้อมูลบริษัท">
                <Grid2 container spacing={2}>
                  {/* Company Name with Autocomplete */}
                  <Grid2 size={12}>
                    <Autocomplete
                      freeSolo
                      disableClearable={false}
                      options={suggestions}
                      loading={loading}
                      inputValue={values.companyName || ""}
                      onInputChange={(event, newValue, reason) => {
                        if (reason === "input" || reason === "clear") {
                          setFieldValue("companyName", newValue);
                          if (reason === "input") {
                            debouncedFetch(newValue);
                          }
                        }
                      }}
                      onOpen={() => fetchSuggestions(values.companyName || "")}
                      onChange={(event, newValue) => {
                        if (typeof newValue === "object" && newValue !== null) {
                          handleSelectCompany(newValue, setFieldValue);
                        }
                      }}
                      getOptionLabel={(option) =>
                        typeof option === "string"
                          ? option
                          : option.companyName || ""
                      }
                      isOptionEqualToValue={(option, value) =>
                        option.companyId === value.companyId
                      }
                      noOptionsText={
                        values.companyName
                          ? "ไม่พบข้อมูล พิมพ์เพื่อใช้ชื่อบริษัทนี้"
                          : "พิมพ์เพื่อค้นหาบริษัท..."
                      }
                      loadingText="กำลังค้นหา..."
                      renderOption={(props, option) => (
                        <Box component="li" {...props} key={option.companyId}>
                          <Box sx={{ py: 0.5 }}>
                            <Typography
                              variant="body1"
                              fontWeight={500}
                              sx={{ color: theme.palette.primary.main }}
                            >
                              {option.companyName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {option.companyTaxId
                                ? `เลขภาษี: ${option.companyTaxId}`
                                : ""}
                              {option.companyPhoneNumber
                                ? ` • ${option.companyPhoneNumber}`
                                : ""}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.disabled"
                              sx={{
                                display: "block",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: "400px",
                              }}
                            >
                              {option.companyAddress || "ไม่ระบุที่อยู่"}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          name="companyName"
                          label="ชื่อบริษัท"
                          variant="outlined"
                          size="small"
                          fullWidth
                          error={
                            touched.companyName && Boolean(errors.companyName)
                          }
                          helperText={<ErrorMessage name="companyName" />}
                          placeholder="พิมพ์ 3 ตัวอักษรเพื่อเริ่มค้นหา..."
                          sx={getTextFieldSx(theme)}
                        />
                      )}
                    />
                  </Grid2>
                  <Grid2 size={6}>
                    <TextField
                      name="companyTel"
                      label="เบอร์โทร"
                      variant="outlined"
                      size="small"
                      fullWidth
                      value={values.companyTel || ""}
                      onChange={(e) =>
                        setFieldValue("companyTel", e.target.value)
                      }
                      error={touched.companyTel && Boolean(errors.companyTel)}
                      helperText={<ErrorMessage name="companyTel" />}
                      sx={getTextFieldSx(theme)}
                    />
                  </Grid2>
                  <Grid2 size={6}>
                    <TextField
                      name="taxId"
                      label="เลขที่เสียภาษี"
                      variant="outlined"
                      size="small"
                      fullWidth
                      value={values.taxId || ""}
                      onChange={(e) => setFieldValue("taxId", e.target.value)}
                      error={touched.taxId && Boolean(errors.taxId)}
                      helperText={<ErrorMessage name="taxId" />}
                      sx={getTextFieldSx(theme)}
                    />
                  </Grid2>
                  <Grid2 size={12}>
                    <TextField
                      name="branch"
                      label="สาขา"
                      variant="outlined"
                      size="small"
                      fullWidth
                      value={values.branch || ""}
                      onChange={(e) => setFieldValue("branch", e.target.value)}
                      error={touched.branch && Boolean(errors.branch)}
                      helperText={<ErrorMessage name="branch" />}
                      sx={getTextFieldSx(theme)}
                    />
                  </Grid2>
                  <Grid2 size={12}>
                    <TextField
                      name="dateCreate"
                      label="วันที่สร้าง"
                      variant="outlined"
                      size="small"
                      fullWidth
                      type="date"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      value={values.dateCreate || ""}
                      onChange={(e) =>
                        setFieldValue("dateCreate", e.target.value)
                      }
                      error={touched.dateCreate && Boolean(errors.dateCreate)}
                      helperText={<ErrorMessage name="dateCreate" />}
                      sx={getTextFieldSx(theme)}
                    />
                  </Grid2>
                  <Grid2 size={12}>
                    <TextField
                      name="companyAddress"
                      label="ที่อยู่"
                      variant="outlined"
                      size="small"
                      fullWidth
                      multiline
                      rows={3}
                      value={values.companyAddress || ""}
                      onChange={(e) =>
                        setFieldValue("companyAddress", e.target.value)
                      }
                      error={
                        touched.companyAddress && Boolean(errors.companyAddress)
                      }
                      helperText={<ErrorMessage name="companyAddress" />}
                      sx={getTextFieldSx(theme)}
                    />
                  </Grid2>
                </Grid2>
              </FormSection>
            </Form>
          );
        }}
      </Formik>
    </>
  );
};

export default CompanyInformation;
