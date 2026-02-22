import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where = search
        ? {
            OR: [
                { name: { contains: search } },
                { phone: { contains: search } },
                { whatsapp: { contains: search } },
            ],
        }
        : {};

    const [clients, total] = await Promise.all([
        prisma.client.findMany({
            where,
            orderBy: { name: 'asc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.client.count({ where }),
    ]);

    return NextResponse.json({ clients, total, pages: Math.ceil(total / limit) });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const client = await prisma.client.create({ data: body });
        return NextResponse.json(client, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao criar cliente' }, { status: 500 });
    }
}
