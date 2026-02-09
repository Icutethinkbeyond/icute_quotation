import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/../lib/prisma';

// Define input types based on what we see in the contexts
interface QuotationInput {
    // Header Info
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

        // Create Customer Company
        const customer = await prisma.customerCompany.create({
            data: {
                companyName: data.companyName,
                taxId: data.taxId,
                companyTel: data.companyTel,
                branch: data.branch,
                companyAddress: data.companyAddress,
            }
        });

        // Create Contactor
        const contactor = await prisma.contactor.create({
            data: {
                contactorName: data.contactorName,
                contactorTel: data.contactorTel,
                contactorEmail: data.contactorEmail,
                contactorAddress: data.contactorAddress,
                customerCompanyId: customer.customerCompanyId,
            }
        });

        // Create DocumentPaper
        const document = await prisma.documentPaper.create({
            data: {
                documentIdNo: docIdNo,
                docType: "Quotation",
                documentDetials: "Generated from Web Form",
                customerCompanyId: customer.customerCompanyId,
                contactorId: contactor.contactorId,

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

        // revalidatePath("/protected/income/quotation"); // Not strictly needed in API route unless we want to clear cache, but client will re-fetch

        return NextResponse.json({ success: true, documentId: document.documentId });

    } catch (error) {
        console.error("Error creating quotation:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

// export async function POST(req: NextRequest) {

//     try {

//         const { categoryName, categoryDesc } = await req.json() as Category;

//         // Validation
//         if (!categoryName) {
//             return new NextResponse(JSON.stringify('Category name is required'), { status: 400 });
//         }

//         //check name is exist
//         const nameIsAlready = await prisma.category.findFirst({ where: { categoryName: { equals: categoryName } } })

//         if (nameIsAlready) {
//             return new NextResponse(JSON.stringify('Category name is Already'), { status: 400 });
//         }

//         // Create a new category
//         const newCategory = await prisma.category.create({
//             data: {
//                 categoryName,
//                 categoryDesc,
//                 // equipments: equipments ? { connect: equipments } : undefined, // Assuming `equipments` is an array of IDs
//             },
//         });

//         return new NextResponse(JSON.stringify(newCategory), { status: 201 });

//     } catch (error) {

//         console.error("Error Connect Local Server:", error);
//         return new NextResponse(JSON.stringify({ error }), { status: 500 });

//     } finally {
//         await prisma.$disconnect();
//     }

// };

// export async function DELETE(req: NextRequest) {

//     try {
//         // รับ categoryId จาก query parameter
//         const { searchParams } = new URL(req.url);
//         const categoryId = searchParams.get('categoryId');

//         // ตรวจสอบว่ามี categoryId หรือไม่
//         if (!categoryId) {
//             return new NextResponse(JSON.stringify('Category ID is required'), { status: 400 });
//         }

//         // ลบ category โดยใช้ categoryId
//         const deletedCategory = await prisma.category.delete({
//             where: {
//                 categoryId,
//             },
//         });

//         // ส่งข้อมูล category ที่ถูกลบกลับ
//         return new NextResponse(JSON.stringify(deletedCategory), { status: 200 });
//     } catch (error: any) {
//         console.error('Error deleting category:', error);

//         if (error.code === 'P2025') {
//             // Prisma error code สำหรับการไม่พบ record ที่ต้องการลบ
//             return new NextResponse(JSON.stringify('Category not found'), { status: 404 });
//         }

//         return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
//     } finally {
//         await prisma.$disconnect();
//     }
// }

// export async function PATCH(req: NextRequest) {

//     try {

//         const { categoryId, categoryName, categoryDesc } = await req.json() as Category;

//         if (!(categoryId && categoryName)) {
//             return new NextResponse(JSON.stringify('Category ID is required'), { status: 400 });
//         }

//         const updatedCategory = await prisma.category.update({
//             where: { categoryId: categoryId },
//             data: {
//                 categoryName, categoryDesc
//             },
//             // Update fields based on the request body
//         });

//         return new NextResponse(JSON.stringify(updatedCategory), { status: 200 });

//     } catch (error: any) {

//         console.error('Error updating category:', error);

//         if (error.code === 'P2025') {
//             // Prisma error code สำหรับการไม่พบ record ที่ต้องการลบ
//             return new NextResponse(JSON.stringify('Category not found'), { status: 404 });
//         }

//         return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
//     } finally {
//         await prisma.$disconnect();
//     }
// }