import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';


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

// PUT - กู้คืนลูกค้าจากถังขยะ (Restore)
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const contactorId = params.id;

        const restoredCustomer = await prisma.contactor.update({
            where: { contactorId },
            data: {
                isDeleted: false,
                deletedAt: null,
            }
        });

        return NextResponse.json({ success: true, customer: restoredCustomer });
    } catch (error) {
        console.error("Error restoring customer:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

// DELETE - ลบลูกค้า (Soft delete หรือ Permanent delete)
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const contactorId = params.id;
        const { searchParams } = new URL(req.url);
        const permanent = searchParams.get('permanent') === 'true';

        if (permanent) {
            // Permanent delete - ลบออกจาก database จริงๆ
            await prisma.contactor.delete({
                where: { contactorId }
            });
            return NextResponse.json({ success: true, message: 'Customer permanently deleted' });
        } else {
            // Soft delete - ย้ายไปถังขยะ
            await prisma.contactor.update({
                where: { contactorId },
                data: {
                    isDeleted: true,
                    deletedAt: new Date(),
                }
            });
            return NextResponse.json({ success: true, message: 'Customer moved to trash' });
        }
    } catch (error) {
        console.error("Error deleting customer:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
