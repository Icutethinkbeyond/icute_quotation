import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/../lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const showDeleted = searchParams.get('trash') === 'true';

        const products = await prisma.product.findMany({
            where: {
                // กรองตาม isDeleted - รองรับข้อมูลเก่าที่ isDeleted เป็น null/undefined
                ...(showDeleted
                    ? { isDeleted: true }
                    : { NOT: { isDeleted: true } } // แสดงทุกอย่างยกเว้นที่ isDeleted = true
                ),
            },
            include: {
                category: true,
                aboutProduct: true,
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
        const data = await req.json();

        // Auto-generate SKU if not provided
        const sku = data.productSKU || `SKU-${Date.now()}`;

        // Handle Units and Increment Frequency
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

        const product = await prisma.product.create({
            data: {
                productName: data.productName,
                productSKU: sku,
                productDescription: data.productDescription || "",
                categoryId: null,
                productImage: null,
                aboutProduct: {
                    create: {
                        productPrice: data.price || 0,
                        productStock: 0, // ไม่ใช้ stock แต่ตั้งค่าเป็น 0
                        unitName: data.unit || "ชิ้น",
                        productBrand: null,
                    }
                }
            },
            include: {
                category: true,
                aboutProduct: true,
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
