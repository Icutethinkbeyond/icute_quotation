import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../../lib/prisma';
import { getCurrentUserAndCompanyIdsByToken } from '@/services/utils/auth';

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await getCurrentUserAndCompanyIdsByToken(req);
        const { id } = params;
        const data = await req.json();

        if (!data.categoryName) {
            return NextResponse.json({ error: 'ชื่อหมวดหมู่จำเป็นต้องกรอก' }, { status: 400 });
        }

        const category = await prisma.category.update({
            where: { categoryId: id, userId },
            data: {
                categoryName: data.categoryName,
                categoryDesc: data.categoryDesc || null,
                userId,
            }
        });

        return NextResponse.json({ success: true, category });
    } catch (error) {
        console.error("Error updating category:", error);
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
        const { userId } = await getCurrentUserAndCompanyIdsByToken(req);
        const { id } = params;

        await prisma.category.delete({
            where: { categoryId: id, userId }
        });

        return NextResponse.json({ success: true, message: 'Category deleted' });
    } catch (error) {
        console.error("Error deleting category:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
