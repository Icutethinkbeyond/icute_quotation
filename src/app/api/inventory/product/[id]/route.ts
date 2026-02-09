import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/../lib/prisma';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const product = await prisma.product.findUnique({
            where: { productId: params.id },
            include: {
                category: true,
                aboutProduct: true,
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
        const data = await req.json();

        const product = await prisma.product.update({
            where: { productId: params.id },
            data: {
                productName: data.productName,
                productDescription: data.productDescription,
                aboutProduct: {
                    update: {
                        productPrice: data.price,
                        unitName: data.unit,
                        // ไม่อัปเดต productStock
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
        console.error("Error updating product:", error);
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
        await prisma.product.delete({
            where: { productId: params.id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting product:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
