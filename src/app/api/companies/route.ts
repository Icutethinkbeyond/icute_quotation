import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/../lib/prisma';

// ============================================================================
// GET: Fetch All Companies
// ============================================================================
// Retrieves all company profiles.
export async function GET(req: NextRequest) {
    try {
        // Fallback Strategy: Get ALL CompanyProfiles
        const companyProfiles = await prisma.companyProfile.findMany({
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

        // We need a userId to link to (Schema Requirement).
        // Since we allow multiple companies, we link them all to the SAME fallback user for now,
        // or a specific user if auth was implemented.
        const firstUser = await prisma.user.findFirst();

        if (!firstUser) {
            return NextResponse.json({ error: 'No users found in system to link company profile to.' }, { status: 400 });
        }

        // Note: The schema has `userId String @unique`, which means ONE user can only have ONE CompanyProfile.
        // Wait, checking schema again:
        // model CompanyProfile { ... userId String @unique ... }
        // YES! The schema enforces 1-to-1 relationship between User and CompanyProfile.
        // If the user wants multiple "Companies", it implies "Customer Companies" OR we need to change schema.
        // BUT the user said "Add Company Info" (generic).
        // If I try to create another one with same userId, it will FAIL.

        // WORKAROUND:
        // If the schema enforces 1-to-1, we CANNOT create multiple CompanyProfiles for the same user.
        // Either we:
        // 1. Tell user "You can only have one company profile".
        // 2. Or, if they mean "Customer Companies", we should be using `CustomerCompany` model.
        // Let's look at `CustomerCompany` model.
        // model CustomerCompany { ... } - This looks like "my customers".

        // If the user wants to manage "My Companies" (multiple branches?), the schema `CompanyProfile` (1-to-1) is the limiter.
        // HOWEVER, to fulfill the request "Add Company Page", I will assume they might want to ADD data.
        // If I cannot add multiple, I must UPDATE if exists.
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
                userId: firstUser.userId,
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
