import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/../../lib/prisma';

export async function GET(req: NextRequest) {
    try {
        // Since the new Customer model doesn't have isFavorite, 
        // we'll return the most recently created customer as a "favorite" fallback
        const latestCustomer = await prisma.customer.findFirst({
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                company: true
            }
        });

        if (!latestCustomer) {
            return NextResponse.json({ message: 'No customer found' }, { status: 404 });
        }

        // Map fields to match what the UI expects (based on old CustomerCompany schema)
        const mappedCustomer = {
            id: latestCustomer.id,
            companyName: latestCustomer.name,
            companyTel: latestCustomer.phone,
            companyAddress: latestCustomer.address,
            taxId: latestCustomer.taxId,
            // branch: latestCustomer.branch, // Customer model doesn't have branch, but UI expects it
            createdAt: latestCustomer.createdAt,
        };

        return NextResponse.json(mappedCustomer);
    } catch (error) {
        console.error("Error fetching latest customer:", error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: String(error) },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
