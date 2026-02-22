import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const firstDayOfMonth = today.substring(0, 7) + '-01';

        // Today's revenue
        const todayTransactions = await prisma.transaction.findMany({
            where: {
                type: 'entrada',
                createdAt: {
                    gte: new Date(today + 'T00:00:00'),
                    lt: new Date(today + 'T23:59:59'),
                },
            },
        });
        const todayRevenue = todayTransactions.reduce((sum, t) => sum + t.amount, 0);

        // Month revenue
        const monthTransactions = await prisma.transaction.findMany({
            where: {
                type: 'entrada',
                createdAt: {
                    gte: new Date(firstDayOfMonth + 'T00:00:00'),
                },
            },
        });
        const monthRevenue = monthTransactions.reduce((sum, t) => sum + t.amount, 0);

        // Today's appointments
        const todayAppointments = await prisma.appointment.count({
            where: { date: today },
        });

        const completedToday = await prisma.appointment.count({
            where: { date: today, status: 'concluido' },
        });

        const cancelledMonth = await prisma.appointment.count({
            where: {
                date: { gte: firstDayOfMonth },
                status: 'cancelado',
            },
        });

        const totalMonth = await prisma.appointment.count({
            where: { date: { gte: firstDayOfMonth } },
        });

        const cancellationRate = totalMonth > 0 ? ((cancelledMonth / totalMonth) * 100).toFixed(1) : '0';

        // Top services
        const allAppointments = await prisma.appointment.findMany({
            where: {
                date: { gte: firstDayOfMonth },
                status: 'concluido',
            },
            include: { service: true },
        });

        const serviceCount: Record<string, { name: string; count: number; revenue: number }> = {};
        allAppointments.forEach(a => {
            if (!serviceCount[a.serviceId]) {
                serviceCount[a.serviceId] = { name: a.service.name, count: 0, revenue: 0 };
            }
            serviceCount[a.serviceId].count++;
            serviceCount[a.serviceId].revenue += a.price;
        });

        const topServices = Object.values(serviceCount)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Top barbers
        const barberStats: Record<string, { name: string; revenue: number; count: number }> = {};
        const barberAppointments = await prisma.appointment.findMany({
            where: {
                date: { gte: firstDayOfMonth },
                status: 'concluido',
            },
            include: { barber: true },
        });

        barberAppointments.forEach(a => {
            if (!barberStats[a.barberId]) {
                barberStats[a.barberId] = { name: a.barber.name, revenue: 0, count: 0 };
            }
            barberStats[a.barberId].revenue += a.price;
            barberStats[a.barberId].count++;
        });

        const topBarbers = Object.values(barberStats)
            .sort((a, b) => b.revenue - a.revenue);

        // Revenue by day (last 15 days)
        const revenueByDay: { date: string; revenue: number }[] = [];
        for (let i = 14; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dayTxs = await prisma.transaction.findMany({
                where: {
                    type: 'entrada',
                    createdAt: {
                        gte: new Date(dateStr + 'T00:00:00'),
                        lt: new Date(dateStr + 'T23:59:59'),
                    },
                },
            });
            revenueByDay.push({
                date: dateStr,
                revenue: dayTxs.reduce((s, t) => s + t.amount, 0),
            });
        }

        // Peak hours
        const allHourAppointments = await prisma.appointment.findMany({
            where: { status: 'concluido' },
            select: { time: true },
        });
        const hourCount: Record<string, number> = {};
        allHourAppointments.forEach(a => {
            const hour = a.time.split(':')[0] + ':00';
            hourCount[hour] = (hourCount[hour] || 0) + 1;
        });
        const peakHours = Object.entries(hourCount)
            .map(([hour, count]) => ({ hour, count }))
            .sort((a, b) => b.count - a.count);

        // Total clients
        const totalClients = await prisma.client.count();

        return NextResponse.json({
            todayRevenue,
            monthRevenue,
            todayAppointments,
            completedToday,
            cancellationRate: Number(cancellationRate),
            topServices,
            topBarbers,
            revenueByDay,
            peakHours,
            totalClients,
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json({ error: 'Erro ao carregar dados' }, { status: 500 });
    }
}
