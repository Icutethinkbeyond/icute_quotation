import { baselightTheme } from "@/utils/theme/DefaultColors";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Prompt } from "next/font/google";

// import { SessionProviders } from "../../lib/SessionProviders";
import { NotifyProvider } from "@/contexts/NotifyContext";
import { BreadcrumbProvider } from "@/contexts/BreadcrumbContext";
import { QuotationProvider } from "@/contexts/QuotationContext";
import { PricingProvider } from "@/contexts/PricingContext";

export const dynamic = "force-dynamic";

const prompt = Prompt({
  subsets: ["thai", "latin"], // Specify subsets if needed
  weight: ["400", "700"], // Specify the font weights you need
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body className={prompt.className}>
        <ThemeProvider theme={baselightTheme}>
          {/* <SessionProviders> */}
            <CssBaseline />
            <BreadcrumbProvider>
              <QuotationProvider>
                <PricingProvider>
                  <NotifyProvider>
                    
                    {children}
                    </NotifyProvider>
                </PricingProvider>
              </QuotationProvider>
            </BreadcrumbProvider>
          {/* </SessionProviders> */}
        </ThemeProvider>
      </body>
    </html>
  );
}
