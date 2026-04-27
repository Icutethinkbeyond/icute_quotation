import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const product = await prisma.items.findUnique({
            where: { itemsId: params.id },
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
        const data = await req.json();

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

        const product = await prisma.items.update({
            where: { itemsId: params.id },
            data: {
                itemsName: data.itemsName,
                itemsDescription: data.itemsDescription,
                aboutItems: {
                    update: {
                        itemsPrice: data.price,
                        unitName: data.unit,
                        // ไม่อัปเดต itemsStock
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

// PUT - กู้คืนสินค้าจากถังขยะ (Restore)
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const restoredProduct = await prisma.items.update({
            where: { itemsId: params.id },
            data: {
                isDeleted: false,
                deletedAt: null,
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

// DELETE - ลบสินค้า (Soft delete หรือ Permanent delete)
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { searchParams } = new URL(req.url);
        const permanent = searchParams.get('permanent') === 'true';

        if (permanent) {
            // Permanent delete - ลบออกจาก database จริงๆ
            await prisma.items.delete({
                where: { itemsId: params.id }
            });
            return NextResponse.json({ success: true, message: 'Product permanently deleted' });
        } else {
            // Soft delete - ย้ายไปถังขยะ
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
