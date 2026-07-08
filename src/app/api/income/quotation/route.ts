import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { exec as execCallback } from 'child_process';
import { promisify } from 'util';
import { IQuotation } from '@/contexts/QuotationContext';
import { calculateQuotationTotals } from '@/services/utils/quotationCalculations';
import { getCurrentUserAndCompanyIdsByToken } from '@/services/utils/auth';

const exec = promisify(execCallback);

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const showDeleted = searchParams.get('trash') === 'true';

    try {
        const allDocs = await prisma.documentPaper.findMany({
            where: {
                docType: "Quotation"
            },
            include: {
                customer: true,
                contactor: true,
                categories: {
                    include: {
                        items: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const filteredDocs = allDocs.filter((doc: any) =>
            showDeleted ? doc.isDeleted === true : doc.isDeleted !== true
        );

        const docsWithCalculations = filteredDocs.map((doc: any) => {
            const calculations = calculateQuotationTotals(
                doc.categories || [],
                doc.globalDiscount || 0,
                doc.includeVat || false,
                doc.taxRate || 7,
                doc.withholdingTax || 0
            );

            return {
                ...doc,
                calculated: calculations,
                grandTotal: calculations.grandTotal,
                subtotal: calculations.subtotal,
                vatAmount: calculations.vatAmount,
            };
        });

        console.log(`Fetched ${docsWithCalculations.length} quotations (trash=${showDeleted})`);
        return NextResponse.json(docsWithCalculations);
    } catch (error) {
        console.error("Error fetching quotations:", error);
        return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 });
    }
}

export async function POST(req: NextRequest, res: NextResponse) {
    try {
        const { userId } = await getCurrentUserAndCompanyIdsByToken(req);
        const templatePath = path.join(process.cwd(), 'public', 'templates', 'quotation-template-ezy.xlsx');
        const tempExcelPath = path.join(process.cwd(), 'public', 'temp', 'excels', 'temp.xlsx');
        const tempPdfPath = path.join(process.cwd(), 'public', 'temp', 'pdfs', 'temp.pdf');

        if (!fs.existsSync(templatePath)) {
            throw new Error(`Template file not found at ${templatePath}`);
        }

        const workbook = new ExcelJS.Workbook();

        await workbook.xlsx.readFile(templatePath);
        const worksheet = workbook.getWorksheet("QUOTE");

        if (!worksheet) {
            console.log('WorkSheet NotFound')
            return new NextResponse(JSON.stringify({ error: 'WorkSheet NotFound' }), { status: 404 });
        }

        worksheet.getCell("I5").value = "#1234567";
        let currentDate = new Date();
        worksheet.getCell("B2").value = currentDate;
        let futureDate = new Date(currentDate);
        futureDate.setDate(currentDate.getDate() + 30);
        worksheet.getCell("D2").value = futureDate;
        worksheet.getCell("D2").alignment = { horizontal: "left" };
        worksheet.getCell("A3").value = "บริษัท ไอคิวท์ธิงค์บียอนด์ จำกัด";
        worksheet.getCell("B4").value = "32/93 หมู่ 2 ต.แม่เหียะ อ.เมือง จ.เชียงใหม่ 32/93 หมู่ 2 ต.แม่เหียะ อ.เมือง จ.เชียงใหม่ ";
        worksheet.getCell("D3").value = "โทร.095-446-4746";
        worksheet.getCell("B5").value = "012345678948";
        worksheet.getCell("B6").value = "icutethink.beyond@gmail.com";

        worksheet.getCell("B8").value = "นายรัฐพงษ์  หน่อแก้ว";
        worksheet.getCell("B9").value = "32/93 หมู่ 2 ต.แม่เหียะ อ.เมือง จ.เชียงใหม่ 32/93 หมู่ 2 ต.แม่เหียะ อ.เมือง จ.เชียงใหม่";
        worksheet.getCell("D8").value = "โทร.095-999-4444";
        worksheet.getCell("B10").value = "012345678948";
        worksheet.getCell("B11").value = "icutethink.beyond@gmail.com";

        const jsonData = [
            { product: "Service Fee 1", qty: 1, price: 120.0, discount: 0, total: 120.0 },
            { product: "Service Fee 6", qty: 1, price: 30.0, discount: 0, total: 30.0 },
            { product: "Service Fee 11", qty: 2, price: 50.0, discount: 0, total: 100.0 },
            { product: "Service Fee 16", qty: 3, price: 200.0, discount: 0, total: 600.0 },
        ];

        let rowIndex = 15;
        jsonData.forEach((data, index) => {
            if (rowIndex + index <= 30) {
                worksheet.getCell(`A${rowIndex + index}`).value = data.product;
                worksheet.getCell(`E${rowIndex + index}`).value = data.qty;
                worksheet.getCell(`E${rowIndex + index}`).alignment = { vertical: "middle", horizontal: "center" };
                worksheet.getCell(`F${rowIndex + index}`).value = data.discount;
                worksheet.getCell(`F${rowIndex + index}`).alignment = { vertical: "middle", horizontal: "center" };
                worksheet.getCell(`G${rowIndex + index}`).value = data.price;
                worksheet.getCell(`H${rowIndex + index}`).value = data.total;
            }
        });
        worksheet.getCell("A36").value = "ใส่ข้อมูลหมายตามสมควรในเอกสารนี้";

        await workbook.xlsx.writeFile(tempExcelPath);

        try {
            await exec(`soffice --headless --convert-to pdf ${tempExcelPath} --outdir ${path.dirname(tempPdfPath)}`);
        } catch (error) {
            console.error(`Error: ${error}`);
            return new NextResponse(JSON.stringify({ error: 'Failed to convert file' }), { status: 500 });
        }

        if (!fs.existsSync(tempPdfPath)) {
            console.log('File not found')
            return new NextResponse(JSON.stringify({ error: 'File not found' }), { status: 500 });
        }

        const fileBuffer = fs.readFileSync(tempPdfPath);
        fs.unlinkSync(tempExcelPath);
        fs.unlinkSync(tempPdfPath);

        return new Response(fileBuffer as any, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename=example.pdf',
            },
        });

    } catch (error) {
        console.error('Error fetching categories:', error);
        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}