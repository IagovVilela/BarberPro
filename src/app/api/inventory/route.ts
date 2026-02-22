import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const where = search ? { name: { contains: search } } : {};

    const products = await prisma.product.findMany({
        where,
        orderBy: { name: 'asc' },
    });

    return NextResponse.json(products);
}

export async function POST(request: Request) {
    const body = await request.json();
    const product = await prisma.product.create({ data: body });
    return NextResponse.json(product, { status: 201 });
}
