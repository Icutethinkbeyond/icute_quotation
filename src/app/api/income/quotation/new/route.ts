import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/../lib/prisma';

// Define input types based on what we see in the contexts
interface QuotationInput {
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
    
    // Footer/Calculation Info
    includeVat: boolean;
    taxRate: number;
    globalDiscount: number;
    withholdingTax: number;
    note?: string;

    // Items
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

export async function POST(req: NextRequest) {
    try {
        const data: QuotationInput = await req.json();
        console.log("Creating quotation with data:", JSON.stringify(data, null, 2));

        // Generate a Document ID
        const docIdNo = `QT-${Date.now()}`;

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
                console.log("✅ Auto-created new CompanyProfile:", data.companyName);
            } else {
                // Update existing company profile info
                await prisma.companyProfile.update({
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

        // 2. Handle CustomerCompany
        let customer;
        if (data.customerCompanyName) {
            customer = await prisma.customerCompany.findFirst({
                where: { companyName: data.customerCompanyName }
            });

            if (!customer) {
                customer = await prisma.customerCompany.create({
                    data: {
                        companyName: data.customerCompanyName,
                        taxId: data.customerTaxId,
                        companyTel: data.customerCompanyTel,
                        branch: data.customerBranch,
                        companyAddress: data.customerCompanyAddress,
                    }
                });
                console.log("✅ Auto-created new CustomerCompany:", data.customerCompanyName);
            } else {
                customer = await prisma.customerCompany.update({
                    where: { customerCompanyId: customer.customerCompanyId },
                    data: {
                        taxId: data.customerTaxId,
                        companyTel: data.customerCompanyTel,
                        branch: data.customerBranch,
                        companyAddress: data.customerCompanyAddress,
                    }
                });
            }
        }

        // 3. Handle Contactor
        let contactor;
        if (data.contactorName && customer) {
            contactor = await prisma.contactor.findFirst({
                where: {
                    contactorName: data.contactorName,
                    customerCompanyId: customer.customerCompanyId
                }
            });

            if (!contactor) {
                contactor = await prisma.contactor.create({
                    data: {
                        contactorName: data.contactorName,
                        contactorTel: data.contactorTel,
                        contactorEmail: data.contactorEmail,
                        contactorAddress: data.contactorAddress,
                        customerCompanyId: customer.customerCompanyId,
                    }
                });
                console.log("✅ Auto-created new Contactor:", data.contactorName);
            } else {
                contactor = await prisma.contactor.update({
                    where: { contactorId: contactor.contactorId },
                    data: {
                        contactorTel: data.contactorTel,
                        contactorEmail: data.contactorEmail,
                        contactorAddress: data.contactorAddress,
                    }
                });
            }
        }

        // 4. Handle Products and Units
        for (const cat of data.categories) {
            for (const item of cat.subItems) {
                if (item.unit) {
                    const existingUnit = await prisma.unit.findUnique({
                        where: { unitName: item.unit }
                    });
                    if (!existingUnit) {
                        await prisma.unit.create({
                            data: { unitName: item.unit }
                        });
                    }
                }

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
                    }
                }
            }
        }

        // 5. Create DocumentPaper
        const document = await prisma.documentPaper.create({
            data: {
                documentIdNo: docIdNo,
                docType: "Quotation",
                documentDetials: "Generated from Web Form",
                customerCompanyId: customer?.customerCompanyId || null,
                contactorId: contactor?.contactorId || null,

                includeVat: data.includeVat,
                taxRate: data.taxRate || 7,
                globalDiscount: data.globalDiscount,
                withholdingTax: data.withholdingTax,
                note: data.note || null,

                // Items
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
            }
        });

        return NextResponse.json({ success: true, documentId: document.documentId });

    } catch (error) {
        console.error("Error creating quotation:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
