import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getCurrentUserAndCompanyIdsByToken } from '@/services/utils/auth';

export async function GET(req: NextRequest) {
    try {
        const { userId } = await getCurrentUserAndCompanyIdsByToken(req);
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';

        const customers = await prisma.customer.findMany({
            where: {
                userId,
                ...(search ? {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { email: { contains: search, mode: 'insensitive' } },
                        { phone: { contains: search, mode: 'insensitive' } },
                        { taxId: { contains: search, mode: 'insensitive' } },
                        { address: { contains: search, mode: 'insensitive' } },
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
        const { userId, companyId } = await getCurrentUserAndCompanyIdsByToken(req);

        if (!companyId) {
            return NextResponse.json({ error: 'ไม่พบข้อมูลบริษัท' }, { status: 400 });
        }

        const data = await req.json();

        // console.log(data)

        const {
            name,
            taxId,
            phone,
            email,
            address
        } = data;

        if (!name) {
            return NextResponse.json({ error: 'ชื่อลูกค้าจำเป็นต้องกรอก' }, { status: 400 });
        }

        const customer = await prisma.customer.create({
            data: {
                name,
                taxId: taxId || null,
                phone: phone || null,
                email: email || null,
                address: address || null,
                companyId,
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
