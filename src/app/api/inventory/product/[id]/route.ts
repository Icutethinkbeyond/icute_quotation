import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';
import { getCurrentUserAndCompanyIdsByToken } from '@/services/utils/auth';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await getCurrentUserAndCompanyIdsByToken(req);
        const product = await prisma.items.findFirst({
            where: {
                itemsId: params.id,
                userId,
            },
            include: {
                category: true,
                aboutItems: true,
            }
        });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error("Error fetching product:", error);
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
        const data = await req.json();

        if (data.unitName) {
            const existingUnit = await prisma.unit.findUnique({
                where: { unitName: data.unitName }
            });
            if (!existingUnit) {
                await prisma.unit.create({
                    data: {
                        unitName: data.unitName,
                        usageCount: 1
                    }
                });
            } else {
                await prisma.unit.update({
                    where: { unitName: data.unitName },
                    data: { usageCount: { increment: 1 } }
                });
            }
        }

        const product = await prisma.items.update({
            where: { itemsId: params.id },
            data: {
                itemsName: data.itemsName,
                itemsSKU: data.itemsSKU,
                itemsDescription: data.itemsDescription,
                itemsImage: data.itemsImage || null,
                categoryId: data.categoryId || null,
                userId,
                aboutItems: {
                    upsert: {
                        create: {
                            itemsPrice: Number(data.itemsPrice) || 0,
                            itemsDiscountPrice: data.itemsDiscountPrice ? Number(data.itemsDiscountPrice) : null,
                            itemsStock: Number(data.itemsStock) || 0,
                            itemsBrand: data.itemsBrand || null,
                            unitName: data.unitName || "ชิ้น",
                            userId,
                        },
                        update: {
                            itemsPrice: Number(data.itemsPrice) || 0,
                            itemsDiscountPrice: data.itemsDiscountPrice ? Number(data.itemsDiscountPrice) : null,
                            itemsStock: Number(data.itemsStock) || 0,
                            itemsBrand: data.itemsBrand || null,
                            unitName: data.unitName || "ชิ้น",
                        }
                    }
                }
            },
            include: {
                category: true,
                aboutItems: true,
            }
        });

        return NextResponse.json({ success: true, product });
    } catch (error) {
        console.error("Error updating product:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await getCurrentUserAndCompanyIdsByToken(req);
        const restoredProduct = await prisma.items.update({
            where: { itemsId: params.id },
            data: {
                isDeleted: false,
                deletedAt: null,
                userId,
            },
            include: {
                category: true,
                aboutItems: true,
            }
        });

        return NextResponse.json({ success: true, product: restoredProduct });
    } catch (error) {
        console.error("Error restoring product:", error);
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
        const { searchParams } = new URL(req.url);
        const permanent = searchParams.get('permanent') === 'true';

        if (permanent) {
            await prisma.items.delete({
                where: { itemsId: params.id }
            });
            return NextResponse.json({ success: true, message: 'Product permanently deleted' });
        } else {
            await prisma.items.update({
                where: { itemsId: params.id },
                data: {
                    isDeleted: true,
                    deletedAt: new Date(),
                }
            });
            return NextResponse.json({ success: true, message: 'Product moved to trash' });
        }
    } catch (error) {
        console.error("Error deleting product:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
