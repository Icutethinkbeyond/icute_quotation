import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/../lib/prisma';
import { calculateQuotationTotals } from '@/utils/quotationCalculations';

export async function GET(req: NextRequest) {
    try {
        // Basic counts
        const totalQuotations = await prisma.documentPaper.count({
            where: { isDeleted: false }
        });
        const totalCustomers = await prisma.customerCompany.count();
        const totalProducts = await prisma.product.count({
            where: { isDeleted: false }
        });

        // Get all approved quotations to calculate revenue
        const approvedQuotations = await prisma.documentPaper.findMany({
            where: { 
                isDeleted: false,
                documentStatus: 'Approve' 
            },
            include: {
                categories: {
                    include: {
                        items: true
                    }
                }
            }
        });

        let totalRevenue = 0;
        approvedQuotations.forEach((doc: any) => {
            const calculations = calculateQuotationTotals(
                doc.categories || [],
                doc.globalDiscount || 0,
                doc.includeVat || false,
                doc.taxRate || 7,
                doc.withholdingTax || 0
            );
            totalRevenue += calculations.grandTotal;
        });

        // Get recent quotations
        const recentQuotations = await prisma.documentPaper.findMany({
            where: { isDeleted: false },
            include: {
                customerCompany: true,
                contactor: true,
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 5
        });

        return NextResponse.json({
            stats: {
                totalQuotations,
                totalCustomers,
                totalProducts,
                totalRevenue
            },
            recentQuotations: recentQuotations.map((doc: any) => ({
                id: doc.documentId,
                number: doc.documentIdNo,
                customer: doc.customerCompany?.companyName || doc.contactor?.contactorName || 'N/A',
                date: doc.createdAt,
                status: doc.documentStatus,
                // We'd need to calculate total for each if we want it here, 
                // but let's keep it simple for now or just return enough data
            }))
        });
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
