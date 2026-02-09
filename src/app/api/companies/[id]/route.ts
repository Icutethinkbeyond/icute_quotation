import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/../lib/prisma';

// ============================================================================
// GET: Fetch Single Company by ID
// ============================================================================
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        if (!id) {
            return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
        }

        const companyProfile = await prisma.companyProfile.findUnique({
            where: { companyId: id },
            include: {
                user: {
                    select: {
                        userEmail: true,
                        name: true
                    }
                }
            }
        });

        if (!companyProfile) {
            return NextResponse.json({ error: 'Company not found' }, { status: 404 });
        }

        return NextResponse.json(companyProfile);
    } catch (error) {
        console.error("Error fetching company profile:", error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: String(error) },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

// ============================================================================
// PUT: Update Single Company by ID
// ============================================================================
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await req.json();
        const {
            companyName,
            companyAddress,
            companyTaxId,
            companyPhoneNumber,
            companyEmail,
            companyWebsite,
            companyBusinessType,
            companyRegistrationDate,
        } = body;

        if (!id) {
            return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
        }

        const updatedProfile = await prisma.companyProfile.update({
            where: { companyId: id },
            data: {
                companyName,
                companyAddress,
                companyTaxId,
                companyPhoneNumber,
                companyEmail,
                companyWebsite,
                companyBusinessType,
                companyRegistrationDate: companyRegistrationDate ? new Date(companyRegistrationDate) : null,
            },
        });

        return NextResponse.json(updatedProfile);
    } catch (error) {
        console.error("Error updating company profile:", error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: String(error) },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

// ============================================================================
// DELETE: Remove Single Company by ID
// ============================================================================
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        if (!id) {
            return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
        }

        await prisma.companyProfile.delete({
            where: { companyId: id },
        });

        return NextResponse.json({ message: 'Company deleted successfully' });
    } catch (error) {
        console.error("Error deleting company profile:", error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: String(error) },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
