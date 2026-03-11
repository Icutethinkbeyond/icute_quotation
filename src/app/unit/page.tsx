"use client";

import { Grid2, Box } from "@mui/material";
import UnitTable from "@/components/unit/UnitTable";
import PageContainer from "@/components/shared/PageContainer";

const UnitPage = () => {
    return (
        <PageContainer title="Unit Management" description="">
            <Box mt={3}>
                <Grid2 container spacing={3}>
                    <Grid2 size={12}>
                        <UnitTable />
                    </Grid2>
                </Grid2>
            </Box>
        </PageContainer>
    );
};

export default UnitPage;
