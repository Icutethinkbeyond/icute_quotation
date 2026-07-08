import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getCurrentUserAndCompanyIdsByToken } from '@/services/utils/auth';

export async function GET(req: NextRequest) {
    try {
        const { userId } = await getCurrentUserAndCompanyIdsByToken(req);
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';
        const showDeleted = searchParams.get('trash') === 'true';

        const customers = await prisma.contactor.findMany({
            where: {
                isStandalone: true,
                userId,
                ...(showDeleted
                    ? { isDeleted: true }
                    : { NOT: { isDeleted: true } }
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

export async function POST(req: NextRequest) {
    try {
        const { userId } = await getCurrentUserAndCompanyIdsByToken(req);
        const data = await req.json();

        const {
            contactorName,
            contactorTel,
            contactorEmail,
            contactorAddress
        } = data;

        if (!contactorName) {
            return NextResponse.json({ error: 'ชื่อผู้ติดต่อจำเป็นต้องกรอก' }, { status: 400 });
        }

        const customer = await prisma.contactor.create({
            data: {
                contactorName,
                contactorTel: contactorTel || null,
                contactorEmail: contactorEmail || null,
                contactorAddress: contactorAddress || null,
                isStandalone: true,
                userId,
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
