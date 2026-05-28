import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// ============================================================================
// GET: Fetch All Units
// ============================================================================
export async function GET(req: NextRequest) {
    try {
        const units = await prisma.unit.findMany({
            orderBy: [
                { usageCount: 'desc' },
                { unitName: 'asc' }
            ]
        });
        return NextResponse.json(units);
    } catch (error) {
        console.error("Error fetching units:", error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: String(error) },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

// ============================================================================
// PATCH: Increment Unit Usage Count
// ============================================================================
export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { unitName } = body;

        if (!unitName) {
            return NextResponse.json({ error: 'Unit Name is required' }, { status: 400 });
        }

        const updatedUnit = await prisma.unit.update({
            where: { unitName },
            data: {
                usageCount: { increment: 1 }
            }
        });

        return NextResponse.json(updatedUnit);

    } catch (error) {
        console.error("Error updating unit usage count:", error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: String(error) },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

// ============================================================================
// POST: Create New Unit
// ============================================================================
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { unitName } = body;

        if (!unitName) {
            return NextResponse.json({ error: 'Unit Name is required' }, { status: 400 });
        }

        const newUnit = await prisma.unit.create({
            data: { unitName },
        });

        return NextResponse.json(newUnit);

    } catch (error) {
        console.error("Error saving unit:", error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: String(error) },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
