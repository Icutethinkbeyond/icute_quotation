import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { getCurrentUserAndCompanyIdsByToken } from '@/services/utils/auth';

export async function GET(req: NextRequest) {
    try {
        const { userId } = await getCurrentUserAndCompanyIdsByToken(req);
        const { searchParams } = new URL(req.url);
        const showDeleted = searchParams.get('trash') === 'true';
        const search = searchParams.get('search') || '';

        const products = await prisma.items.findMany({
            where: {
                userId,
                ...(showDeleted
                    ? { isDeleted: true }
                    : { NOT: { isDeleted: true } }
                ),
                ...(search ? {
                    OR: [
                        { itemsName: { contains: search, mode: 'insensitive' } },
                        { itemsSKU: { contains: search, mode: 'insensitive' } },
                        { itemsDescription: { contains: search, mode: 'insensitive' } },
                    ]
                } : {})
            },
            include: {
                category: true,
                aboutItems: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

export async function POST(req: NextRequest) {
    try {
        const { userId } = await getCurrentUserAndCompanyIdsByToken(req);
        const data = await req.json();

        if (!data.itemsName) {
            return NextResponse.json({ error: 'ชื่อสินค้าจำเป็นต้องกรอก' }, { status: 400 });
        }

        const sku = data.itemsSKU || `SKU-${Date.now()}`;
        const unitName = data.unitName || "ชิ้น";

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

        const product = await prisma.items.create({
            data: {
                itemsName: data.itemsName,
                itemsSKU: sku,
                itemsDescription: data.itemsDescription || "",
                itemsImage: data.itemsImage || null,
                categoryId: data.categoryId || null,
                userId,
                aboutItems: {
                    create: {
                        itemsPrice: Number(data.itemsPrice) || 0,
                        itemsDiscountPrice: data.itemsDiscountPrice ? Number(data.itemsDiscountPrice) : null,
                        itemsStock: Number(data.itemsStock) || 0,
                        itemsBrand: data.itemsBrand || null,
                        unitName,
                        userId,
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
        console.error("Error creating product:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
