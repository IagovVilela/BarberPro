import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    const services = await prisma.service.findMany({ orderBy: { category: 'asc' } });
    return NextResponse.json(services);
}

export async function POST(request: Request) {
    const body = await request.json();
    const service = await prisma.service.create({ data: body });
    return NextResponse.json(service, { status: 201 });
}
