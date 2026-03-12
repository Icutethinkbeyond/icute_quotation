import React from "react";
import { Box, Typography, useTheme } from "@mui/material";

interface FormSectionProps {
    title: string;
    children: React.ReactNode;
    padding?: number;
}

/**
 * Reusable form section component with clean styling
 */
const FormSection: React.FC<FormSectionProps> = ({
    title,
    children,
    padding = 3
}) => {
    const theme = useTheme();

    return (
        <Box
            p={padding}
            sx={{
                borderRadius: "12px",
                height: "100%",
                backgroundColor: "#ffffff",
                // border: "1px solid",
                // borderColor: "grey.100",
                // boxShadow: "0 2px 12px rgba(0, 0, 0, 0.04)",
            }}
        >
            <Typography
                variant="h5"
                fontWeight={700}
                gutterBottom
                sx={{
                    mb: 3,
                    color: "text.primary",
                    display: "flex",
                    alignItems: "center",
                    "&::before": {
                        content: '""',
                        display: "inline-block",
                        width: "4px",
                        height: "20px",
                        bgcolor: theme.palette.primary.main,
                        borderRadius: "4px",
                        mr: 1.5
                    }
                }}
            >
                {title}
            </Typography>
            {children}
        </Box>
    );
};

export default FormSection;
