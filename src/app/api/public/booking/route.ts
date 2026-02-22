import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, phone, serviceId, barberId, date, time } = body;

        if (!name || !phone || !serviceId || !barberId || !date || !time) {
            return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 });
        }

        // Check for conflict
        const conflict = await prisma.appointment.findFirst({
            where: { date, time, barberId, status: { not: 'cancelado' } },
        });
        if (conflict) {
            return NextResponse.json({ error: 'Horário indisponível. Escolha outro horário.' }, { status: 409 });
        }

        // Get service for price
        const service = await prisma.service.findUnique({ where: { id: serviceId } });
        if (!service) {
            return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 });
        }

        // Find or create client by phone
        let client = await prisma.client.findFirst({ where: { phone } });
        if (!client) {
            client = await prisma.client.create({
                data: { name, phone, whatsapp: phone, totalVisits: 0, loyaltyPoints: 0 },
            });
        }

        // Create appointment
        const appointment = await prisma.appointment.create({
            data: {
                date,
                time,
                status: 'pendente',
                clientId: client.id,
                serviceId,
                barberId,
                price: service.price,
            },
            include: { client: true, service: true, barber: true },
        });

        // Update client visits
        await prisma.client.update({
            where: { id: client.id },
            data: { totalVisits: { increment: 1 }, loyaltyPoints: { increment: 10 } },
        });

        return NextResponse.json({
            success: true,
            appointment: {
                id: appointment.id,
                date: appointment.date,
                time: appointment.time,
                service: appointment.service.name,
                barber: appointment.barber.name,
                price: appointment.price,
                client: appointment.client.name,
            },
        }, { status: 201 });
    } catch (error) {
        console.error('Booking error:', error);
        return NextResponse.json({ error: 'Erro ao criar agendamento' }, { status: 500 });
    }
}
