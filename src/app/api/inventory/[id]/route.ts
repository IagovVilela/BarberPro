import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await request.json();

    // Handle stock movement
    if (body.movement) {
        const { type, quantity, reason } = body.movement;
        await prisma.stockMovement.create({
            data: { type, quantity, reason, productId: id },
        });
        const product = await prisma.product.update({
            where: { id },
            data: { quantity: { [type === 'entrada' ? 'increment' : 'decrement']: quantity } },
        });
        return NextResponse.json(product);
    }

    const product = await prisma.product.update({ where: { id }, data: body });
    return NextResponse.json(product);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await prisma.stockMovement.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
