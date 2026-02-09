import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/../lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const products = await prisma.product.findMany({
            include: {
                category: true,
                aboutProduct: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        console.log(`Fetched ${products.length} products`);
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
