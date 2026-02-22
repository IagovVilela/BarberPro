import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const client = await prisma.client.findUnique({
        where: { id },
        include: {
            appointments: {
                include: { service: true, barber: true },
                orderBy: { date: 'desc' },
                take: 20,
            },
        },
    });
    if (!client) return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    return NextResponse.json(client);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await request.json();
    const client = await prisma.client.update({ where: { id }, data: body });
    return NextResponse.json(client);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await prisma.client.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
