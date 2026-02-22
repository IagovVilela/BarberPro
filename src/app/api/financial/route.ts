import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: Record<string, unknown> = {};
    if (startDate && endDate) {
        where.createdAt = { gte: new Date(startDate), lte: new Date(endDate + 'T23:59:59') };
    }

    const transactions = await prisma.transaction.findMany({
        where,
        include: { barber: true, cashRegister: true },
        orderBy: { createdAt: 'desc' },
    });

    const income = transactions.filter(t => t.type === 'entrada').reduce((s, t) => s + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'saida').reduce((s, t) => s + t.amount, 0);

    return NextResponse.json({
        transactions,
        summary: { income, expenses, profit: income - expenses },
    });
}

export async function POST(request: Request) {
    const body = await request.json();
    const today = new Date().toISOString().split('T')[0];

    let cashRegister = await prisma.cashRegister.findUnique({ where: { date: today } });
    if (!cashRegister) {
        cashRegister = await prisma.cashRegister.create({
            data: { date: today, openingBalance: 0, status: 'aberto' },
        });
    }

    const transaction = await prisma.transaction.create({
        data: { ...body, cashRegisterId: cashRegister.id },
    });

    return NextResponse.json(transaction, { status: 201 });
}
