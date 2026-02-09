import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/../lib/prisma';

// ============================================================================
// GET: Fetch All Companies
// ============================================================================
// Retrieves all company profiles.
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const showDeleted = searchParams.get('trash') === 'true';

        // Fallback Strategy: Get ALL CompanyProfiles
        const companyProfiles = await prisma.companyProfile.findMany({
            where: {
                // กรองตาม isDeleted - รองรับข้อมูลเก่าที่ isDeleted เป็น null/undefined
                ...(showDeleted
                    ? { isDeleted: true }
                    : { NOT: { isDeleted: true } } // แสดงทุกอย่างยกเว้นที่ isDeleted = true
                ),
            },
            include: {
                user: {
                    select: {
                        userEmail: true,
                        name: true
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

        // Validation
        if (!companyName) {
            return NextResponse.json({ error: 'Company Name is required' }, { status: 400 });
        }

        // We try to link to a fallback user if available, but it is no longer mandatory.
        const firstUser = await prisma.user.findFirst();

        // if (!firstUser) {
        //     return NextResponse.json({ error: 'No users found in system to link company profile to.' }, { status: 400 });
        // }

        // Note: The schema has `userId String?`, so we can leave it null.

        // Create NEW Company Profile
        const newProfile = await prisma.companyProfile.create({
            data: {
                companyName,
                companyAddress,
                companyTaxId,
                companyPhoneNumber,
                companyEmail,
                companyWebsite,
                companyBusinessType,
                companyRegistrationDate: companyRegistrationDate ? new Date(companyRegistrationDate) : null,
                userId: firstUser?.userId ?? undefined,
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
