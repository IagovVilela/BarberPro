import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const barberId = searchParams.get('barberId');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (date) where.date = date;
    if (barberId) where.barberId = barberId;
    if (status) where.status = status;

    const appointments = await prisma.appointment.findMany({
        where,
        include: { client: true, service: true, barber: true },
        orderBy: [{ date: 'asc' }, { time: 'asc' }],
    });

    return NextResponse.json(appointments);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Check for conflicts
        const conflict = await prisma.appointment.findFirst({
            where: {
                date: body.date,
                time: body.time,
                barberId: body.barberId,
                status: { not: 'cancelado' },
            },
        });

        if (conflict) {
            return NextResponse.json({ error: 'Conflito de horário' }, { status: 409 });
        }

        const appointment = await prisma.appointment.create({
            data: body,
            include: { client: true, service: true, barber: true },
        });

        // Update client visit count
        await prisma.client.update({
            where: { id: body.clientId },
            data: { totalVisits: { increment: 1 }, loyaltyPoints: { increment: 10 } },
        });

        return NextResponse.json(appointment, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao criar agendamento' }, { status: 500 });
    }
}
