import { NextRequest, NextResponse } from 'next/server';
import { handleImageUpload } from '@/services/module/cloudinary';
import { prisma } from '../../../../../lib/prisma';
import { getCurrentUserAndCompanyIdsByToken } from '@/services/utils/auth';

export async function POST(req: NextRequest) {
    try {
        const { userId } = await getCurrentUserAndCompanyIdsByToken(req);
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const currentPublicId = formData.get('publicId') as string;
        const companyId = formData.get('companyId') as string;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

        const result = await handleImageUpload({
            file: base64,
            publicId: currentPublicId || undefined,
            folder: '/icute-quotation/company-logos',
        });

        if (companyId) {
            await prisma.company.update({
                where: { companyId },
                data: {
                    companyImage: result.url,
                    companyImagePublicId: result.publicId,
                    userId,
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
