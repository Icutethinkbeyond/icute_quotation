import { NextRequest, NextResponse } from 'next/server';
import { handleImageUpload } from '@/services/module/cloudinary';
import prisma from '@/../lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const currentPublicId = formData.get('publicId') as string;
        const companyId = formData.get('companyId') as string;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Convert file to base64
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

        // Upload to Cloudinary
        const result = await handleImageUpload({
            file: base64,
            publicId: currentPublicId || undefined,
            folder: '/icute-quotation/company-logos',
        });

        // Update company record with new image data
        if (companyId) {
            await prisma.companyProfile.update({
                where: { companyId },
                data: {
                    companyImage: result.url,
                    companyImagePublicId: result.publicId,
                },
            });
        }

        return NextResponse.json({
            success: true,
            url: result.url,
            publicId: result.publicId,
        });
    } catch (error) {
        console.error('Image upload error:', error);
        return NextResponse.json(
            { error: 'Image upload failed' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
