import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/../lib/prisma';


// GET - ดึงข้อมูลลูกค้ารายตัว
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const contactorId = params.id;

        const customer = await prisma.contactor.findUnique({
            where: { contactorId }
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

// PATCH - แก้ไขข้อมูลลูกค้า
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const contactorId = params.id;
        const data = await req.json();

        const {
            contactorName,
            contactorTel,
            contactorEmail,
            contactorAddress
        } = data;

        const updatedCustomer = await prisma.contactor.update({
            where: { contactorId },
            data: {
                contactorName,
                contactorTel: contactorTel || null,
                contactorEmail: contactorEmail || null,
                contactorAddress: contactorAddress || null,
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

// DELETE - ลบลูกค้า
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const contactorId = params.id;

        await prisma.contactor.delete({
            where: { contactorId }
        });

        return NextResponse.json({ success: true, message: 'Customer deleted' });
    } catch (error) {
        console.error("Error deleting customer:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
