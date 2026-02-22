import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const barber = await prisma.barber.findUnique({ where: { id } });
    if (!barber) return NextResponse.json({ error: 'Barbeiro não encontrado' }, { status: 404 });

    // Get stats
    const firstDayOfMonth = new Date().toISOString().substring(0, 7) + '-01';
    const appointments = await prisma.appointment.findMany({
        where: { barberId: id, date: { gte: firstDayOfMonth }, status: 'concluido' },
        include: { service: true, client: true },
    });

    const totalRevenue = appointments.reduce((s, a) => s + a.price, 0);
    const commission = totalRevenue * (barber.commission / 100);

    return NextResponse.json({
        ...barber,
        stats: {
            monthlyAppointments: appointments.length,
            monthlyRevenue: totalRevenue,
            monthlyCommission: commission,
            recentAppointments: appointments.slice(0, 10),
        },
    });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await request.json();
    const barber = await prisma.barber.update({ where: { id }, data: body });
    return NextResponse.json(barber);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await prisma.barber.update({ where: { id }, data: { active: false } });
    return NextResponse.json({ success: true });
}
