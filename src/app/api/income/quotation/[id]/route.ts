import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';
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
                customer: {
                    include: {
                        company: true
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
                customer: true,
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

        // 1. Handle Company (Our Company)
        let issuerProfile;
        if (data.companyName) {
            const existingCompany = await prisma.company.findFirst({
                where: { companyName: data.companyName }
            });

            if (!existingCompany) {
                issuerProfile = await prisma.company.create({
                    data: {
                        companyName: data.companyName,
                        companyTaxId: data.taxId,
                        branch: data.branch,
                        companyPhoneNumber: data.companyTel,
                        companyAddress: data.companyAddress,
                    }
                });
            } else {
                issuerProfile = await prisma.company.update({
                    where: { companyId: existingCompany.companyId },
                    data: {
                        companyTaxId: data.taxId,
                        branch: data.branch,
                        companyPhoneNumber: data.companyTel,
                        companyAddress: data.companyAddress,
                    }
                });
            }
        }

        // 2. Handle Items and Units
        for (const cat of data.categories) {
            for (const item of cat.subItems) {
                if (item.unit) {
                    const existingUnit = await prisma.unit.findUnique({
                        where: { unitName: item.unit }
                    });
                    if (!existingUnit) {
                        await prisma.unit.create({
                            data: { unitName: item.unit, usageCount: 1 }
                        });
                    }
                }

                if (item.name) {
                    const existingItem = await prisma.items.findFirst({
                        where: { itemsName: item.name }
                    });
                    if (!existingItem) {
                        await prisma.items.create({
                            data: {
                                itemsName: item.name,
                                itemsDescription: item.description,
                                aboutItems: {
                                    create: {
                                        itemsPrice: item.pricePerUnit,
                                        unitName: item.unit
                                    }
                                }
                            }
                        });
                    }
                }
            }
        }

        // 3. Update or Create Customer
        let customer;
        if (data.customerCompanyName) {
            customer = await prisma.customer.findFirst({
                where: { name: data.customerCompanyName, companyId: issuerProfile?.companyId }
            });

            if (customer) {
                customer = await prisma.customer.update({
                    where: { id: customer.id },
                    data: {
                        taxId: data.customerTaxId,
                        phone: data.customerCompanyTel,
                        address: data.customerCompanyAddress,
                        companyId: issuerProfile?.companyId || customer.companyId, // Ensure link
                    }
                });
            } else {
                customer = await prisma.customer.create({
                    data: {
                        name: data.customerCompanyName,
                        taxId: data.customerTaxId,
                        phone: data.customerCompanyTel,
                        address: data.customerCompanyAddress,
                        companyId: issuerProfile?.companyId as string, // Link to issuer
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
                    companyId: issuerProfile?.companyId || null
                }
            });

            if (contactor) {
                contactor = await prisma.contactor.update({
                    where: { contactorId: contactor.contactorId },
                    data: {
                        contactorTel: data.contactorTel,
                        contactorEmail: data.contactorEmail,
                        contactorAddress: data.contactorAddress,
                        companyId: issuerProfile?.companyId || contactor.companyId
                    }
                });
            } else {
                contactor = await prisma.contactor.create({
                    data: {
                        contactorName: data.contactorName,
                        contactorTel: data.contactorTel,
                        contactorEmail: data.contactorEmail,
                        contactorAddress: data.contactorAddress,
                        companyId: issuerProfile?.companyId || null
                    }
                });
            }
        }

        // Ensure DocumentPaper is linked correctly
        const customerId = customer?.id || null;
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
                customerId: customerId,
                contactorId: contactorId,

                includeVat: data.includeVat,
                taxRate: data.taxRate || 7,
                globalDiscount: data.globalDiscount,
                withholdingTax: data.withholdingTax,
                note: data.note || null,
                documentStatus: documentStatus,

                paymentDate: existingQuotation.paymentDate || new Date(),
                method: existingQuotation.method || 'CASH',

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
                customer: true,
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
                customer: true,
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
            customerId: originalQuotation.customerId,
            contactorId: originalQuotation.contactorId,
            
            // Copy pricing settings
            includeVat: originalQuotation.includeVat,
            taxRate: originalQuotation.taxRate,
            globalDiscount: duplicateType === 'full' ? originalQuotation.globalDiscount : 0,
            withholdingTax: duplicateType === 'full' ? originalQuotation.withholdingTax : 0,
            note: duplicateType === 'full' ? originalQuotation.note : 'Duplicated from ' + originalQuotation.documentIdNo,
            
            documentStatus: 'Draft',
            isDeleted: false,

            paymentDate: new Date(),
            method: 'CASH',
            
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
                customer: true,
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
