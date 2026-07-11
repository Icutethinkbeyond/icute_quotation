import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';
import { getCurrentUserAndCompanyIdsByToken } from '@/services/utils/auth';

export async function GET(req: NextRequest) {
    try {
        const { userId } = await getCurrentUserAndCompanyIdsByToken(req);

        const categories = await prisma.category.findMany({
            where: { userId },
            orderBy: {
                categoryName: 'asc'
            }
        });

        return NextResponse.json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

export async function POST(req: NextRequest) {
    try {
        const { userId } = await getCurrentUserAndCompanyIdsByToken(req);
        const data = await req.json();

        if (!data.categoryName) {
            return NextResponse.json({ error: 'ชื่อหมวดหมู่จำเป็นต้องกรอก' }, { status: 400 });
        }

        const category = await prisma.category.create({
            data: {
                categoryName: data.categoryName,
                categoryDesc: data.categoryDesc || null,
                userId,
            }
        });

        return NextResponse.json({ success: true, category }, { status: 201 });
    } catch (error) {
        console.error("Error creating category:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
