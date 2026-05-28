import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

// ============================================================================
// GET: Fetch Favorite Company
// ============================================================================
// Retrieves the first company profile marked as favorite.
export async function GET(req: NextRequest) {
    try {
        const favoriteCompany = await prisma.company.findFirst({
            where: {
                isFavorite: true,
            },
        });

        if (!favoriteCompany) {
            return NextResponse.json({ message: 'No favorite company profile found' }, { status: 404 });
        }

        return NextResponse.json(favoriteCompany);
    } catch (error) {
        console.error("Error fetching favorite company profile:", error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: String(error) },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
