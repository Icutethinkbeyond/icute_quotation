import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/../lib/prisma';

interface QuotationInput {
    companyName: string;
    companyTel: string;
    taxId: string;
    branch: string;
    dateCreate: string;
    companyAddress: string;

    contactorName: string;
    contactorTel: string;
    contactorEmail: string;
    contactorAddress: string;

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
                customerCompany: true,
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

        // 1. Handle CompanyProfile (Our Company)
        if (data.companyName) {
            const existingCompanyProfile = await prisma.companyProfile.findFirst({
                where: { companyName: data.companyName }
            });

            if (!existingCompanyProfile) {
                const firstUser = await prisma.user.findFirst();
                await prisma.companyProfile.create({
                    data: {
                        companyName: data.companyName,
                        companyTaxId: data.taxId,
                        branch: data.branch,
                        companyPhoneNumber: data.companyTel,
                        companyAddress: data.companyAddress,
                        userId: firstUser?.userId,
                    }
                });
                console.log("✅ Auto-created new CompanyProfile during edit:", data.companyName);
            }
        }

        // 2. Handle Products and Units
        for (const cat of data.categories) {
            for (const item of cat.subItems) {
                // Check and create Unit
                if (item.unit) {
                    const existingUnit = await prisma.unit.findUnique({
                        where: { unitName: item.unit }
                    });
                    if (!existingUnit) {
                        await prisma.unit.create({
                            data: { unitName: item.unit }
                        });
                        console.log("✅ Auto-created new Unit during edit:", item.unit);
                    }
                }

                // Check and create Product
                if (item.name) {
                    const existingProduct = await prisma.product.findFirst({
                        where: { productName: item.name }
                    });

                    if (!existingProduct) {
                        await prisma.product.create({
                            data: {
                                productName: item.name,
                                productDescription: item.description,
                                aboutProduct: {
                                    create: {
                                        productPrice: item.pricePerUnit,
                                        unitName: item.unit
                                    }
                                }
                            }
                        });
                        console.log("✅ Auto-created new Product during edit:", item.name);
                    }
                }
            }
        }

        // 3. Update or Create CustomerCompany
        let customerCompanyId = existingQuotation.customerCompanyId;
        // Search for customer company by name if it's not linked correctly
        const existingCustomerByName = await prisma.customerCompany.findFirst({
            where: { companyName: data.companyName }
        });

        if (existingCustomerByName) {
            customerCompanyId = existingCustomerByName.customerCompanyId;
            await prisma.customerCompany.update({
                where: { customerCompanyId },
                data: {
                    taxId: data.taxId,
                    companyTel: data.companyTel,
                    branch: data.branch,
                    companyAddress: data.companyAddress,
                }
            });
        } else if (customerCompanyId) {
            await prisma.customerCompany.update({
                where: { customerCompanyId },
                data: {
                    companyName: data.companyName,
                    taxId: data.taxId,
                    companyTel: data.companyTel,
                    branch: data.branch,
                    companyAddress: data.companyAddress,
                }
            });
        } else {
            const newCustomer = await prisma.customerCompany.create({
                data: {
                    companyName: data.companyName,
                    taxId: data.taxId,
                    companyTel: data.companyTel,
                    branch: data.branch,
                    companyAddress: data.companyAddress,
                }
            });
            customerCompanyId = newCustomer.customerCompanyId;
        }

        // 4. Update or Create Contactor
        let contactorId = existingQuotation.contactorId;
        const existingContactorByName = await prisma.contactor.findFirst({
            where: {
                contactorName: data.contactorName,
                customerCompanyId: customerCompanyId
            }
        });

        if (existingContactorByName) {
            contactorId = existingContactorByName.contactorId;
            await prisma.contactor.update({
                where: { contactorId },
                data: {
                    contactorTel: data.contactorTel,
                    contactorEmail: data.contactorEmail,
                    contactorAddress: data.contactorAddress,
                }
            });
        } else if (contactorId) {
            await prisma.contactor.update({
                where: { contactorId },
                data: {
                    contactorName: data.contactorName,
                    contactorTel: data.contactorTel,
                    contactorEmail: data.contactorEmail,
                    contactorAddress: data.contactorAddress,
                    customerCompanyId: customerCompanyId
                }
            });
        } else {
            const newContactor = await prisma.contactor.create({
                data: {
                    contactorName: data.contactorName,
                    contactorTel: data.contactorTel,
                    contactorEmail: data.contactorEmail,
                    contactorAddress: data.contactorAddress,
                    customerCompanyId: customerCompanyId
                }
            });
            contactorId = newContactor.contactorId;
        }

        // Ensure DocumentPaper is linked to the (potentially newly created) records
        if (customerCompanyId !== existingQuotation.customerCompanyId || contactorId !== existingQuotation.contactorId) {
            await prisma.documentPaper.update({
                where: { documentId },
                data: { customerCompanyId, contactorId }
            });
        }

        // Delete old categories before creating new ones
        await prisma.documentCategory.deleteMany({
            where: { documentPaperId: documentId }
        });

        const updatedDocument = await prisma.documentPaper.update({
            where: { documentId },
            data: {
                includeVat: data.includeVat,
                taxRate: data.taxRate || 7,
                globalDiscount: data.globalDiscount,
                withholdingTax: data.withholdingTax,
                note: data.note || null,

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
