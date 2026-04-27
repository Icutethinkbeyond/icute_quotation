import React from "react";
import { Avatar, Breadcrumbs, Grid2, Link, Typography } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { MapPin } from "lucide-react";
import { useBreadcrumbContext } from "@/contexts/BreadcrumbContext";

interface BreadcrumbProps {
  // title: string;
  // breadcrumbs?: { name: string; href?: string }[];
  // icon?: JSX.Element;
}

const BreadcrumbCustom: React.FC<BreadcrumbProps> = (
  {
    // title,
    // breadcrumbs = [],
    // icon,
  }
) => {
  const { breadcrumbs, icon } = useBreadcrumbContext();

  return (
    <Grid2
      container
      justifyItems="center"
      alignContent="center"
      alignItems="center"
    >
      {/* {icon && <Avatar sx={{ bgcolor: "primary.main", width: "40px", height: "40px" }}>{icon}</Avatar>} */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" color="primary" />}
        aria-label="breadcrumb"
        // sx={{ marginBottom: 2 }} // Add some margin below
      >
        {breadcrumbs.map((breadcrumb, index) =>
          breadcrumb.href ? (
            <Link
              key={index}
              underline="hover"
              // color="#fff"
              href={breadcrumb.href}
            >
              {breadcrumb.name}
            </Link>
          ) : (
            <Typography key={index} 
            // color="#fff"
            >
              {breadcrumb.name}
            </Typography>
          )
        )}
      </Breadcrumbs>
    </Grid2>
  );
};

export default BreadcrumbCustom;
