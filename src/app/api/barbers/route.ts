import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    const barbers = await prisma.barber.findMany({
        where: { active: true },
        orderBy: { name: 'asc' },
    });
    return NextResponse.json(barbers);
}

export async function POST(request: Request) {
    const body = await request.json();
    const barber = await prisma.barber.create({ data: body });
    return NextResponse.json(barber, { status: 201 });
}
