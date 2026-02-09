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
// PUT: Update Company OR Restore from Trash
// ============================================================================
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await req.json();

        if (!id) {
            return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
        }

        // ถ้าไม่มี body หรือ body ว่างเปล่า = Restore from trash
        if (!body || Object.keys(body).length === 0) {
            const restoredCompany = await prisma.companyProfile.update({
                where: { companyId: id },
                data: {
                    isDeleted: false,
                    deletedAt: null,
                },
            });
            return NextResponse.json(restoredCompany);
        }

        // มี body = Update company data
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
// DELETE: Soft Delete OR Permanent Delete Company
// ============================================================================
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const { searchParams } = new URL(req.url);
        const permanent = searchParams.get('permanent') === 'true';

        if (!id) {
            return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
        }

        if (permanent) {
            // Permanent delete - ลบออกจาก database จริงๆ
            await prisma.companyProfile.delete({
                where: { companyId: id },
            });
            return NextResponse.json({ message: 'Company permanently deleted' });
        } else {
            // Soft delete - ย้ายไปถังขยะ
            await prisma.companyProfile.update({
                where: { companyId: id },
                data: {
                    isDeleted: true,
                    deletedAt: new Date(),
                },
            });
            return NextResponse.json({ message: 'Company moved to trash' });
        }
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
