import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/../lib/prisma';
import { DocumentStatus } from '@prisma/client';

interface QuotationInput {
    // Document Number
    quotationNumber?: string;

    // Our Company Info
    companyName: string;
    companyTel: string;
    taxId: string;
    branch: string;
    companyAddress: string;

    // Customer Company Info
    customerCompanyName: string;
    customerCompanyTel: string;
    customerCompanyAddress: string;
    customerTaxId: string;
    customerBranch: string;

    // Contactor Info
    contactorName: string;
    contactorTel: string;
    contactorEmail: string;
    contactorAddress: string;

    dateCreate: string;

    // Status
    status?: string;

    includeVat: boolean;
    taxRate: number;
    globalDiscount: number;
    withholdingTax: number;
    note?: string;

    categories: {
        id: string;
        name: string;
        subItems: {
            id: string;
            name: string;
            description: string;
            unit: string;
            qty: number;
            pricePerUnit: number;
            remark: string;
        }[];
    }[];
}

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const documentId = params.id;

        const quotation = await prisma.documentPaper.findUnique({
            where: {
                documentId: documentId
            },
            include: {
                customerCompany: {
                    include: {
                        companyProfile: true
                    }
                },
                contactor: true,
                categories: {
                    include: {
                        items: {
                            orderBy: {
                                orderIndex: 'asc'
                            }
                        }
                    },
                    orderBy: {
                        orderIndex: 'asc'
                    }
                }
            }
        });

        if (!quotation) {
            return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
        }

        return NextResponse.json(quotation);
    } catch (error) {
        console.error("Error fetching quotation:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const documentId = params.id;
        const data: QuotationInput = await req.json();

        console.log("Updating quotation with data:", JSON.stringify(data, null, 2));

        const existingQuotation = await prisma.documentPaper.findUnique({
            where: { documentId },
            include: {
                customerCompany: true,
                contactor: true,
                categories: {
                    include: {
                        items: true
                    }
                }
            }
        });

        if (!existingQuotation) {
            return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
        }

        // Map status
        let documentStatus: DocumentStatus = existingQuotation.documentStatus;
        if (data.status === 'approve') {
            documentStatus = DocumentStatus.Approve;
        } else if (data.status === 'draft') {
            documentStatus = DocumentStatus.Draft;
        } else if (data.status === 'waiting') {
            documentStatus = DocumentStatus.Waiting;
        }

        // 1. Handle CompanyProfile (Our Company)
        let issuerProfile;
        if (data.companyName) {
            const existingCompanyProfile = await prisma.companyProfile.findFirst({
                where: { companyName: data.companyName }
            });

            if (!existingCompanyProfile) {
                const firstUser = await prisma.user.findFirst();
                issuerProfile = await prisma.companyProfile.create({
                    data: {
                        companyName: data.companyName,
                        companyTaxId: data.taxId,
                        branch: data.branch,
                        companyPhoneNumber: data.companyTel,
                        companyAddress: data.companyAddress,
                        userId: firstUser?.userId,
                    }
                });
            } else {
                issuerProfile = await prisma.companyProfile.update({
                    where: { companyId: existingCompanyProfile.companyId },
                    data: {
                        companyTaxId: data.taxId,
                        branch: data.branch,
                        companyPhoneNumber: data.companyTel,
                        companyAddress: data.companyAddress,
                    }
                });
            }
        }

        // 2. Handle Products and Units
        // ... (skipping for brevity but keeping in mind)

        // 3. Update or Create CustomerCompany
        let customer;
        if (data.customerCompanyName) {
            customer = await prisma.customerCompany.findFirst({
                where: { companyName: data.customerCompanyName }
            });

            if (customer) {
                customer = await prisma.customerCompany.update({
                    where: { customerCompanyId: customer.customerCompanyId },
                    data: {
                        taxId: data.customerTaxId,
                        companyTel: data.customerCompanyTel,
                        branch: data.customerBranch,
                        companyAddress: data.customerCompanyAddress,
                        companyId: issuerProfile?.companyId || customer.companyId, // Ensure link
                    }
                });
            } else {
                customer = await prisma.customerCompany.create({
                    data: {
                        companyName: data.customerCompanyName,
                        taxId: data.customerTaxId,
                        companyTel: data.customerCompanyTel,
                        branch: data.customerBranch,
                        companyAddress: data.customerCompanyAddress,
                        companyId: issuerProfile?.companyId, // Link to issuer
                    }
                });
            }
        }

        // 4. Update or Create Contactor
        let contactor;
        if (data.contactorName) {
            contactor = await prisma.contactor.findFirst({
                where: {
                    contactorName: data.contactorName,
                    customerCompanyId: customer?.customerCompanyId || null
                }
            });

            if (contactor) {
                contactor = await prisma.contactor.update({
                    where: { contactorId: contactor.contactorId },
                    data: {
                        contactorTel: data.contactorTel,
                        contactorEmail: data.contactorEmail,
                        contactorAddress: data.contactorAddress,
                        customerCompanyId: customer?.customerCompanyId || contactor.customerCompanyId
                    }
                });
            } else {
                contactor = await prisma.contactor.create({
                    data: {
                        contactorName: data.contactorName,
                        contactorTel: data.contactorTel,
                        contactorEmail: data.contactorEmail,
                        contactorAddress: data.contactorAddress,
                        customerCompanyId: customer?.customerCompanyId || null
                    }
                });
            }
        }

        // Ensure DocumentPaper is linked correctly
        const customerCompanyId = customer?.customerCompanyId || null;
        const contactorId = contactor?.contactorId || null;

        // Delete old categories before creating new ones
        await prisma.documentCategory.deleteMany({
            where: { documentPaperId: documentId }
        });

        const updatedDocument = await prisma.documentPaper.update({
            where: { documentId },
            data: {
                documentIdNo: data.quotationNumber || existingQuotation.documentIdNo,
                
                // Issuer Info Snapshot
                companyName: data.companyName,
                companyTel: data.companyTel,
                companyAddress: data.companyAddress,
                companyTaxId: data.taxId,
                companyBranch: data.branch,

                // Customer Relations
                customerCompanyId: customerCompanyId,
                contactorId: contactorId,

                includeVat: data.includeVat,
                taxRate: data.taxRate || 7,
                globalDiscount: data.globalDiscount,
                withholdingTax: data.withholdingTax,
                note: data.note || null,
                documentStatus: documentStatus,

                categories: {
                    create: data.categories.map((cat, index) => ({
                        name: cat.name,
                        orderIndex: index,
                        items: {
                            create: cat.subItems.map((item, iIndex) => ({
                                name: item.name,
                                description: item.description,
                                unit: item.unit,
                                qty: item.qty,
                                pricePerUnit: item.pricePerUnit,
                                remark: item.remark,
                                totalPrice: (item.qty * item.pricePerUnit),
                                orderIndex: iIndex
                            }))
                        }
                    }))
                }
            },
            include: {
                customerCompany: true,
                contactor: true,
                categories: {
                    include: {
                        items: true
                    }
                }
            }
        });

        return NextResponse.json({ success: true, document: updatedDocument });

    } catch (error) {
        console.error("Error updating quotation:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const documentId = params.id;
        const { searchParams } = new URL(req.url);
        const permanent = searchParams.get('permanent') === 'true';

        if (permanent) {
            await prisma.documentPaper.delete({
                where: { documentId }
            });
            return NextResponse.json({ success: true, message: 'Deleted permanently' });
        } else {
            await prisma.documentPaper.update({
                where: { documentId },
                data: {
                    isDeleted: true,
                    deletedAt: new Date()
                }
            });
            return NextResponse.json({ success: true, message: 'Moved to trash' });
        }
    } catch (error) {
        console.error("Error deleting quotation:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
        const documentId = params.id;
        // Restore from trash
        await prisma.documentPaper.update({
            where: { documentId },
            data: {
                isDeleted: false,
                deletedAt: null
            }
        });
        return NextResponse.json({ success: true, message: 'Restored from trash' });
    } catch (error) {
        console.error("Error restoring quotation:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
  }

  export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
        const documentId = params.id;
        const body = await req.json();
        const duplicateType = body.duplicateType || 'full'; // 'full' or 'items_only'

        // Fetch the original quotation
        const originalQuotation = await prisma.documentPaper.findUnique({
            where: { documentId },
            include: {
                customerCompany: true,
                contactor: true,
                categories: {
                    include: {
                        items: {
                            orderBy: { orderIndex: 'asc' }
                        }
                    }
                }
            }
        });

        if (!originalQuotation) {
            return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
        }

        // Generate new quotation number
        const newQuotationNumber = `QT-${Date.now()}`;

        // Create new quotation data
        const newQuotationData: any = {
            documentIdNo: newQuotationNumber,
            docType: 'Quotation',
            documentDetials: 'Duplicated from ' + originalQuotation.documentIdNo,
            
            // Copy issuer info from original
            companyName: originalQuotation.companyName,
            companyTel: originalQuotation.companyTel,
            companyAddress: originalQuotation.companyAddress,
            companyTaxId: originalQuotation.companyTaxId,
            companyBranch: originalQuotation.companyBranch,
            
            // Copy customer and contactor relations
            customerCompanyId: originalQuotation.customerCompanyId,
            contactorId: originalQuotation.contactorId,
            
            // Copy pricing settings
            includeVat: originalQuotation.includeVat,
            taxRate: originalQuotation.taxRate,
            globalDiscount: duplicateType === 'full' ? originalQuotation.globalDiscount : 0,
            withholdingTax: duplicateType === 'full' ? originalQuotation.withholdingTax : 0,
            note: duplicateType === 'full' ? originalQuotation.note : 'Duplicated from ' + originalQuotation.documentIdNo,
            
            documentStatus: 'Draft',
            isDeleted: false,
            
            // Copy categories and items
            categories: {
                create: originalQuotation.categories.map((cat, catIndex) => ({
                    name: cat.name,
                    orderIndex: catIndex,
                    items: {
                        create: cat.items.map((item, itemIndex) => ({
                            name: item.name,
                            description: item.description,
                            unit: item.unit,
                            qty: item.qty,
                            pricePerUnit: item.pricePerUnit,
                            remark: item.remark,
                            totalPrice: item.qty * item.pricePerUnit,
                            orderIndex: itemIndex
                        }))
                    }
                }))
            }
        };

        // Create the duplicated quotation
        const duplicatedQuotation = await prisma.documentPaper.create({
            data: newQuotationData,
            include: {
                customerCompany: true,
                contactor: true,
                categories: {
                    include: {
                        items: true
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Quotation duplicated successfully',
            document: duplicatedQuotation
        });

    } catch (error) {
        console.error("Error duplicating quotation:", error);
        return NextResponse.json({ error: 'Failed to duplicate quotation', details: String(error) }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
  }
