import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/../lib/prisma';
import { Company } from '@/interfaces/Company';
import { getCurrentUserAndCompanyIdsByToken } from '@/services/utils/auth';

type CompanyProfile = Company & {
    companyUsers: {
        user: {
            email: string | null;
            name: string | null;
        };
    }[];
};

// ============================================================================
// GET: Fetch All Companies
// ============================================================================
// Retrieves all company profiles.
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const showDeleted = searchParams.get('trash') === 'true';

        const companyProfiles = await prisma.company.findMany({
            where: {
                ...(showDeleted
                    ? { isDeleted: true }
                    : { NOT: { isDeleted: true } }
                ),
            },
            include: {
                companyUsers: {
                    include: {
                        user: {
                            select: {
                                email: true,
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(companyProfiles);
    } catch (error) {
        console.error("Error fetching company profiles:", error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: String(error) },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

// ============================================================================
// POST: Create New Company
// ============================================================================
// Create a NEW company profile.
export async function POST(req: NextRequest) {
    try {
        const { userId } = await getCurrentUserAndCompanyIdsByToken(req);

        const body: CompanyProfile & { companyImage?: string; companyImagePublicId?: string } = await req.json();
        const {
            companyName,
            companyAddress,
            companyTaxId,
            branch,
            companyEmail,
            companyWebsite,
            companyBusinessType,
            companyRegistrationDate,
            companyImage,
            companyImagePublicId,
        } = body;

        if (!companyName) {
            return NextResponse.json({ error: 'Company Name is required' }, { status: 400 });
        }

        const newProfile = await prisma.company.create({
            data: {
                companyName,
                companyAddress,
                companyTaxId,
                branch,
                companyEmail,
                companyWebsite,
                companyBusinessType,
                companyRegistrationDate: companyRegistrationDate ? new Date(companyRegistrationDate) : null,
                companyImage: companyImage || null,
                companyImagePublicId: companyImagePublicId || null,
                isDeleted: false,
                isFavorite: body.isFavorite || false,
                userId,
                companyUsers: {
                    create: {
                        userId,
                    }
                }
            },
        });

        return NextResponse.json(newProfile);

    } catch (error) {
        console.error("Error saving company profile:", error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: String(error) },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
