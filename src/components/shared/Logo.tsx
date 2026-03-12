"use client"

import Link from "next/link";
import { styled, Typography, Stack } from "@mui/material";
import Image from "next/image";


const LinkStyled = styled(Link)(() => ({
  height: "70px",
  width: "auto",
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  textDecoration: "none",
}));

const Logo = () => {
  return (
    <LinkStyled href={`/quotation`}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Image src="/images/logos/logo-dark.svg" alt="logo" height={40} width={40} priority />
        <Typography variant="h3" color="primary.main" fontWeight="700" sx={{ letterSpacing: "-1px" }}>
          EzyAccount
        </Typography>
      </Stack>
    </LinkStyled>
  );
};

export default Logo;
