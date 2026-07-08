import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { getCurrentUserAndCompanyIdsByToken } from '@/services/utils/auth';

export async function GET(req: NextRequest) {
    try {
        const { userId } = await getCurrentUserAndCompanyIdsByToken(req);
        const { searchParams } = new URL(req.url);
        const showDeleted = searchParams.get('trash') === 'true';

        const products = await prisma.items.findMany({
            where: {
                userId,
                ...(showDeleted
                    ? { isDeleted: true }
                    : { NOT: { isDeleted: true } }
                ),
            },
            include: {
                category: true,
                aboutItems: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        console.log(`Fetched ${products.length} products (trash=${showDeleted})`);
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

        const sku = data.productSKU || `SKU-${Date.now()}`;

        if (data.unit) {
            const existingUnit = await prisma.unit.findUnique({
                where: { unitName: data.unit }
            });
            if (!existingUnit) {
                await prisma.unit.create({
                    data: { 
                        unitName: data.unit,
                        usageCount: 1
                    }
                });
            } else {
                await prisma.unit.update({
                    where: { unitName: data.unit },
                    data: { usageCount: { increment: 1 } }
                });
            }
        }

        const product = await prisma.items.create({
            data: {
                itemsName: data.itemsName,
                itemsSKU: sku,
                itemsDescription: data.itemsDescription || "",
                categoryId: null,
                itemsImage: null,
                userId,
                aboutItems: {
                    create: {
                        itemsPrice: data.price || 0,
                        itemsStock: 0,
                        unitName: data.unit || "ชิ้น",
                        itemsBrand: null,
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
