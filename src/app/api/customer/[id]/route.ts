import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { getCurrentUserAndCompanyIdsByToken } from '@/services/utils/auth';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const customerId = params.id;

        const customer = await prisma.customer.findUnique({
            where: { id: customerId }
        });

        if (!customer) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }

        return NextResponse.json(customer);
    } catch (error) {
        console.error("Error fetching customer:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await getCurrentUserAndCompanyIdsByToken(req);
        const customerId = params.id;
        const data = await req.json();

        console.log(data)

        const {
            name,
            taxId,
            phone,
            email,
            address
        } = data;

        const updatedCustomer = await prisma.customer.update({
            where: { id: customerId },
            data: {
                name,
                taxId: taxId || null,
                phone: phone || null,
                email: email || null,
                address: address || null,
                userId,
            }
        });

        return NextResponse.json({ success: true, customer: updatedCustomer });
    } catch (error) {
        console.error("Error updating customer:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const customerId = params.id;

        await prisma.customer.delete({
            where: { id: customerId }
        });

        return NextResponse.json({ success: true, message: 'Customer deleted' });
    } catch (error) {
        console.error("Error deleting customer:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
