import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/../lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const favorite = await prisma.customerCompany.findFirst({
            where: {
                isFavorite: true,
            },
            include: {
                contactors: {
                    where: {
                        isDeleted: false
                    },
                    take: 1
                }
            }
        });

        if (!favorite) {
            return NextResponse.json({ message: 'No favorite customer found' }, { status: 404 });
        }

        return NextResponse.json(favorite);
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
