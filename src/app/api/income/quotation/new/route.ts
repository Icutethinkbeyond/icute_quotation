import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';
import { DocumentStatus } from '@prisma/client';
import { getCurrentUserAndCompanyIdsByToken } from '@/services/utils/auth';

interface QuotationInput {
    quotationNumber?: string;
    companyName: string;
    companyTel: string;
    taxId: string;
    branch: string;
    companyAddress: string;
    customerCompanyName: string;
    customerCompanyTel: string;
    customerCompanyAddress: string;
    customerTaxId: string;
    customerBranch: string;
    contactorName: string;
    contactorTel: string;
    contactorEmail: string;
    contactorAddress: string;
    dateCreate: string;
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

export async function POST(req: NextRequest) {
    try {
        const { userId } = await getCurrentUserAndCompanyIdsByToken(req);
        const data: QuotationInput = await req.json();
        console.log("Creating quotation with data:", JSON.stringify(data, null, 2));

        const docIdNo = data.quotationNumber || `QT-${Date.now()}`;

        let documentStatus: DocumentStatus = DocumentStatus.Draft;
        if (data.status === 'approve') {
            documentStatus = DocumentStatus.Approve;
        } else if (data.status === 'waiting') {
            documentStatus = DocumentStatus.Waiting;
        }

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
                        userId,
                    }
                });
                console.log("Auto-created new Company:", data.companyName);
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

        let customer;
        if (data.customerCompanyName) {
            customer = await prisma.customer.findFirst({
                where: { name: data.customerCompanyName, companyId: issuerProfile?.companyId }
            });

            if (!customer) {
                customer = await prisma.customer.create({
                    data: {
                        name: data.customerCompanyName,
                        taxId: data.customerTaxId,
                        phone: data.customerCompanyTel,
                        address: data.customerCompanyAddress,
                        companyId: issuerProfile?.companyId as string,
                        userId,
                    }
                });
                console.log("Auto-created new Customer:", data.customerCompanyName);
            } else {
                customer = await prisma.customer.update({
                    where: { id: customer.id },
                    data: {
                        taxId: data.customerTaxId,
                        phone: data.customerCompanyTel,
                        address: data.customerCompanyAddress,
                        companyId: issuerProfile?.companyId || customer.companyId,
                    }
                });
            }
        }

        let contactor;
        if (data.contactorName) {
            contactor = await prisma.contactor.findFirst({
                where: {
                    contactorName: data.contactorName,
                    companyId: issuerProfile?.companyId || null
                }
            });

            if (!contactor) {
                contactor = await prisma.contactor.create({
                    data: {
                        contactorName: data.contactorName,
                        contactorTel: data.contactorTel,
                        contactorEmail: data.contactorEmail,
                        contactorAddress: data.contactorAddress,
                        companyId: issuerProfile?.companyId || null,
                        userId,
                    }
                });
                console.log("Auto-created new Contactor:", data.contactorName);
            } else {
                contactor = await prisma.contactor.update({
                    where: { contactorId: contactor.contactorId },
                    data: {
                        contactorTel: data.contactorTel,
                        contactorEmail: data.contactorEmail,
                        contactorAddress: data.contactorAddress,
                        companyId: issuerProfile?.companyId || contactor.companyId,
                    }
                });
            }
        }

        for (const cat of data.categories) {
            for (const item of cat.subItems) {
                if (item.unit) {
                    const existingUnit = await prisma.unit.findUnique({
                        where: { unitName: item.unit }
                    });
                    if (!existingUnit) {
                        await prisma.unit.create({
                            data: { 
                                unitName: item.unit,
                                usageCount: 1
                            }
                        });
                    } else {
                        await prisma.unit.update({
                            where: { unitName: item.unit },
                            data: { usageCount: { increment: 1 } }
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
                                userId,
                                aboutItems: {
                                    create: {
                                        itemsPrice: item.pricePerUnit,
                                        unitName: item.unit,
                                        userId,
                                    }
                                }
                            }
                        });
                    }
                }
            }
        }

        const document = await prisma.documentPaper.create({
            data: {
                documentIdNo: docIdNo,
                docType: "Quotation",
                documentDetials: "Generated from Web Form",
                userId,
                companyName: data.companyName,
                companyTel: data.companyTel,
                companyAddress: data.companyAddress,
                companyTaxId: data.taxId,
                companyBranch: data.branch,

                customerId: customer?.id || null,
                contactorId: contactor?.contactorId || null,
                documentStatus: documentStatus,

                includeVat: data.includeVat,
                taxRate: data.taxRate || 7,
                globalDiscount: data.globalDiscount,
                withholdingTax: data.withholdingTax,
                note: data.note || null,

                paymentDate: new Date(),
                method: 'CASH',

                categories: {
                    create: data.categories.map((cat, index) => ({
                        name: cat.name,
                        orderIndex: index,
                        userId,
                        items: {
                            create: cat.subItems.map((item, iIndex) => ({
                                name: item.name,
                                description: item.description,
                                unit: item.unit,
                                qty: item.qty,
                                pricePerUnit: item.pricePerUnit,
                                remark: item.remark,
                                totalPrice: (item.qty * item.pricePerUnit),
                                orderIndex: iIndex,
                                userId,
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
