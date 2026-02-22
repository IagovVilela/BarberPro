import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await request.json();
    const appointment = await prisma.appointment.update({
        where: { id },
        data: body,
        include: { client: true, service: true, barber: true },
    });

    // If completed, create financial transaction
    if (body.status === 'concluido') {
        const today = new Date().toISOString().split('T')[0];
        let cashRegister = await prisma.cashRegister.findUnique({ where: { date: today } });
        if (!cashRegister) {
            cashRegister = await prisma.cashRegister.create({
                data: { date: today, openingBalance: 0, status: 'aberto' },
            });
        }
        await prisma.transaction.create({
            data: {
                type: 'entrada',
                category: 'servico',
                description: `${appointment.service.name} - ${appointment.client.name}`,
                amount: appointment.price,
                paymentMethod: body.paymentMethod || 'dinheiro',
                cashRegisterId: cashRegister.id,
                barberId: appointment.barberId,
            },
        });
    }

    return NextResponse.json(appointment);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await prisma.appointment.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
