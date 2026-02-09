import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/../lib/prisma';

// GET - ดึงรายชื่อลูกค้าที่สร้างจากหน้า customer เท่านั้น (isStandalone = true)
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';
        const showDeleted = searchParams.get('trash') === 'true';

        const customers = await prisma.contactor.findMany({
            where: {
                isStandalone: true, // ดึงเฉพาะที่สร้างจากหน้า customer
                // กรองตาม isDeleted - รองรับข้อมูลเก่าที่ isDeleted เป็น null/undefined
                ...(showDeleted
                    ? { isDeleted: true }
                    : { NOT: { isDeleted: true } } // แสดงทุกอย่างยกเว้นที่ isDeleted = true
                ),
                ...(search ? {
                    OR: [
                        { contactorName: { contains: search, mode: 'insensitive' } },
                        { contactorEmail: { contains: search, mode: 'insensitive' } },
                        { contactorTel: { contains: search, mode: 'insensitive' } },
                    ]
                } : {})
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(customers);
    } catch (error) {
        console.error("Error fetching customers:", error);
        return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

// POST - สร้างลูกค้าใหม่ (จากหน้า customer = isStandalone: true)
export async function POST(req: NextRequest) {
    try {
        const data = await req.json();

        const {
            contactorName,
            contactorTel,
            contactorEmail,
            contactorAddress
        } = data;

        // Validation
        if (!contactorName) {
            return NextResponse.json({ error: 'ชื่อผู้ติดต่อจำเป็นต้องกรอก' }, { status: 400 });
        }

        // สร้าง Contactor พร้อมกำหนด isStandalone = true
        const customer = await prisma.contactor.create({
            data: {
                contactorName,
                contactorTel: contactorTel || null,
                contactorEmail: contactorEmail || null,
                contactorAddress: contactorAddress || null,
                isStandalone: true, // ระบุว่าสร้างจากหน้า customer
            }
        });

        return NextResponse.json(customer, { status: 201 });
    } catch (error) {
        console.error("Error creating customer:", error);
        return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
