import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/../lib/prisma';
import { getCurrentUserAndCompanyIdsByToken } from '@/services/utils/auth';

// ============================================================================
// GET: Fetch the current user's own company (from session companyId)
// ============================================================================
export async function GET(req: NextRequest) {
    try {
        const { companyId } = await getCurrentUserAndCompanyIdsByToken(req);

        if (!companyId) {
            return NextResponse.json({ error: 'No company associated with this account' }, { status: 404 });
        }

        const company = await prisma.company.findUnique({
            where: { companyId },
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
            }
        });

        if (!company) {
            return NextResponse.json({ error: 'Company not found' }, { status: 404 });
        }

        return NextResponse.json(company);
    } catch (error: any) {
        if (error?.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error("Error fetching own company:", error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: String(error) },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

// ============================================================================
// PUT: Update the current user's own company (from session companyId)
// ============================================================================
export async function PUT(req: NextRequest) {
    try {
        const { companyId } = await getCurrentUserAndCompanyIdsByToken(req);

        if (!companyId) {
            return NextResponse.json({ error: 'No company associated with this account' }, { status: 404 });
        }

        const body = await req.json();

        const {
            companyName,
            companyAddress,
            companyTaxId,
            branch,
            companyPhoneNumber,
            companyEmail,
            companyWebsite,
            companyBusinessType,
            companyRegistrationDate,
            isFavorite,
            companyImage,
            companyImagePublicId,
        } = body;

        if (isFavorite === true) {
            await prisma.company.updateMany({
                where: {
                    companyId: { not: companyId },
                },
                data: {
                    isFavorite: false,
                },
            });
        }

        const updatedProfile = await prisma.company.update({
            where: { companyId },
            data: {
                ...(companyName !== undefined && { companyName }),
                ...(companyAddress !== undefined && { companyAddress }),
                ...(companyTaxId !== undefined && { companyTaxId }),
                ...(branch !== undefined && { branch }),
                ...(companyPhoneNumber !== undefined && { companyPhoneNumber }),
                ...(companyEmail !== undefined && { companyEmail }),
                ...(companyWebsite !== undefined && { companyWebsite }),
                ...(companyBusinessType !== undefined && { companyBusinessType }),
                ...(companyRegistrationDate !== undefined && { companyRegistrationDate: companyRegistrationDate ? new Date(companyRegistrationDate) : null }),
                ...(isFavorite !== undefined && { isFavorite }),
                ...(companyImage !== undefined && { companyImage }),
                ...(companyImagePublicId !== undefined && { companyImagePublicId }),
            },
        });

        return NextResponse.json(updatedProfile);
    } catch (error: any) {
        if (error?.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error("Error updating own company:", error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: String(error) },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
