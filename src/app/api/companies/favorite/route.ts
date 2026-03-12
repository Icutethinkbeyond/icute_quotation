import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/../lib/prisma';

// ============================================================================
// GET: Fetch Favorite Customer Company
// ============================================================================
// Retrieves the first customer company marked as favorite.
export async function GET(req: NextRequest) {
    try {
        const favoriteCompany = await prisma.companyProfile.findFirst({
            where: {
                isFavorite: true,
            },
            // include: {
            //     contactors: {
            //         where: {
            //             isDeleted: false
            //         }
            //     }
            // }
        });

        if (!favoriteCompany) {
            return NextResponse.json({ message: 'No favorite customer company found' }, { status: 404 });
        }

        return NextResponse.json(favoriteCompany);
    } catch (error) {
        console.error("Error fetching favorite customer company:", error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: String(error) },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
