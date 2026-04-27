import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

// ============================================================================
// DELETE: Remove Unit
// ============================================================================
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;

        if (!id) {
            return NextResponse.json({ error: 'Unit ID is required' }, { status: 400 });
        }

        await prisma.unit.delete({
            where: { unitId: id },
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Error deleting unit:", error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: String(error) },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
