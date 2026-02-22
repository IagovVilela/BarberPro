import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const serviceId = searchParams.get('serviceId');

    if (!date || !serviceId) {
        return NextResponse.json({ error: 'date and serviceId required' }, { status: 400 });
    }

    // Get service duration
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
        return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Get all active barbers
    const barbers = await prisma.barber.findMany({ where: { active: true } });

    // Get all appointments for that date (not cancelled)
    const appointments = await prisma.appointment.findMany({
        where: { date, status: { not: 'cancelado' } },
        include: { service: true },
    });

    // Generate time slots (09:00 - 18:00, every 30 min)
    const allSlots: string[] = [];
    for (let h = 9; h < 18; h++) {
        allSlots.push(`${h.toString().padStart(2, '0')}:00`);
        allSlots.push(`${h.toString().padStart(2, '0')}:30`);
    }

    // For each barber, calculate available slots
    const slotsNeeded = Math.ceil(service.duration / 30);
    const availability = barbers.map(barber => {
        // Get this barber's booked slots
        const barberAppts = appointments.filter(a => a.barberId === barber.id);
        const busySlots = new Set<string>();

        barberAppts.forEach(appt => {
            const [h, m] = appt.time.split(':').map(Number);
            const apptSlots = Math.ceil((appt.service?.duration || 30) / 30);
            for (let i = 0; i < apptSlots; i++) {
                const totalMin = h * 60 + m + i * 30;
                const slotH = Math.floor(totalMin / 60);
                const slotM = totalMin % 60;
                busySlots.add(`${slotH.toString().padStart(2, '0')}:${slotM.toString().padStart(2, '0')}`);
            }
        });

        // Check which slots have enough consecutive free slots
        const availableSlots = allSlots.filter((slot, idx) => {
            for (let i = 0; i < slotsNeeded; i++) {
                const checkIdx = idx + i;
                if (checkIdx >= allSlots.length) return false;
                if (busySlots.has(allSlots[checkIdx])) return false;
            }
            return true;
        });

        return {
            id: barber.id,
            name: barber.name,
            avatar: barber.avatar,
            specialties: barber.specialties,
            availableSlots,
        };
    }).filter(b => b.availableSlots.length > 0);

    return NextResponse.json({
        service: { id: service.id, name: service.name, duration: service.duration, price: service.price },
        date,
        barbers: availability,
    });
}
