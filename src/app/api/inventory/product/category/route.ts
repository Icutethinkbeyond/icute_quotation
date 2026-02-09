import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/../lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const categories = await prisma.category.findMany({
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
