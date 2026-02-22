import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Clean existing data
    await prisma.stockMovement.deleteMany();
    await prisma.product.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.cashRegister.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.service.deleteMany();
    await prisma.client.deleteMany();
    await prisma.barber.deleteMany();
    await prisma.user.deleteMany();

    // Users
    const adminPass = await bcrypt.hash('admin123', 10);
    const barberPass = await bcrypt.hash('barber123', 10);
    const receptionPass = await bcrypt.hash('recepcao123', 10);

    await prisma.user.createMany({
        data: [
            { name: 'Administrador', email: 'admin@barberpro.com', password: adminPass, role: 'admin' },
            { name: 'Carlos Barbeiro', email: 'carlos@barberpro.com', password: barberPass, role: 'barbeiro' },
            { name: 'Ana Recepção', email: 'ana@barberpro.com', password: receptionPass, role: 'recepcao' },
        ],
    });

    // Barbers
    const barber1 = await prisma.barber.create({
        data: { name: 'Carlos Silva', phone: '(11) 98765-4321', email: 'carlos@barberpro.com', specialties: 'Degradê, Barba', commission: 50 },
    });
    const barber2 = await prisma.barber.create({
        data: { name: 'Rafael Santos', phone: '(11) 91234-5678', email: 'rafael@barberpro.com', specialties: 'Corte Social, Pigmentação', commission: 45 },
    });
    const barber3 = await prisma.barber.create({
        data: { name: 'Lucas Oliveira', phone: '(11) 99876-5432', email: 'lucas@barberpro.com', specialties: 'Navalhado, Combo', commission: 50 },
    });

    // Services
    const services = await Promise.all([
        prisma.service.create({ data: { name: 'Corte Degradê', duration: 40, price: 45, commission: 50, category: 'corte' } }),
        prisma.service.create({ data: { name: 'Corte Social', duration: 30, price: 35, commission: 50, category: 'corte' } }),
        prisma.service.create({ data: { name: 'Corte Infantil', duration: 30, price: 30, commission: 50, category: 'corte' } }),
        prisma.service.create({ data: { name: 'Barba Completa', duration: 30, price: 30, commission: 50, category: 'barba' } }),
        prisma.service.create({ data: { name: 'Combo Corte + Barba', duration: 60, price: 65, commission: 50, category: 'combo' } }),
        prisma.service.create({ data: { name: 'Sobrancelha', duration: 15, price: 15, commission: 40, category: 'tratamento' } }),
        prisma.service.create({ data: { name: 'Pigmentação', duration: 45, price: 80, commission: 45, category: 'tratamento' } }),
        prisma.service.create({ data: { name: 'Hidratação Capilar', duration: 30, price: 40, commission: 40, category: 'tratamento' } }),
    ]);

    // Clients
    const clients = await Promise.all([
        prisma.client.create({ data: { name: 'João Pedro Almeida', phone: '(11) 97654-3210', whatsapp: '(11) 97654-3210', birthDate: '1990-05-15', totalVisits: 15, loyaltyPoints: 150 } }),
        prisma.client.create({ data: { name: 'Marcos Ribeiro', phone: '(11) 96543-2109', whatsapp: '(11) 96543-2109', birthDate: '1985-08-22', totalVisits: 22, loyaltyPoints: 220 } }),
        prisma.client.create({ data: { name: 'Felipe Costa', phone: '(11) 95432-1098', whatsapp: '(11) 95432-1098', birthDate: '1995-12-03', totalVisits: 8, loyaltyPoints: 80 } }),
        prisma.client.create({ data: { name: 'André Martins', phone: '(11) 94321-0987', whatsapp: '(11) 94321-0987', birthDate: '1988-03-10', totalVisits: 30, loyaltyPoints: 300 } }),
        prisma.client.create({ data: { name: 'Bruno Ferreira', phone: '(11) 93210-9876', whatsapp: '(11) 93210-9876', birthDate: '1992-07-28', totalVisits: 12, loyaltyPoints: 120 } }),
        prisma.client.create({ data: { name: 'Diego Souza', phone: '(11) 92109-8765', whatsapp: '(11) 92109-8765', birthDate: '1998-01-17', totalVisits: 5, loyaltyPoints: 50 } }),
        prisma.client.create({ data: { name: 'Eduardo Lima', phone: '(11) 91098-7654', whatsapp: '(11) 91098-7654', birthDate: '1987-11-05', totalVisits: 18, loyaltyPoints: 180 } }),
        prisma.client.create({ data: { name: 'Gabriel Santos', phone: '(11) 90987-6543', whatsapp: '(11) 90987-6543', birthDate: '1993-09-20', totalVisits: 25, loyaltyPoints: 250 } }),
    ]);

    // Appointments
    const today = new Date();
    const dates: string[] = [];
    for (let i = -15; i <= 7; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        dates.push(d.toISOString().split('T')[0]);
    }

    const times = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'];
    const barbers = [barber1, barber2, barber3];

    for (const date of dates) {
        const numAppointments = Math.floor(Math.random() * 6) + 3;
        const usedTimes = new Set<string>();

        for (let i = 0; i < numAppointments; i++) {
            let time: string;
            do {
                time = times[Math.floor(Math.random() * times.length)];
            } while (usedTimes.has(time));
            usedTimes.add(time);

            const client = clients[Math.floor(Math.random() * clients.length)];
            const service = services[Math.floor(Math.random() * services.length)];
            const barber = barbers[Math.floor(Math.random() * barbers.length)];
            const isPast = new Date(date) < today;
            const status = isPast
                ? (Math.random() > 0.15 ? 'concluido' : 'cancelado')
                : ['pendente', 'confirmado', 'cancelado'][Math.floor(Math.random() * 3)];

            await prisma.appointment.create({
                data: { date, time, status, clientId: client.id, serviceId: service.id, barberId: barber.id, price: service.price },
            });
        }
    }

    // Cash Register & Transactions
    for (let i = 15; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];

        const cashRegister = await prisma.cashRegister.create({
            data: {
                date: dateStr,
                openingBalance: 200,
                closingBalance: i === 0 ? null : 200 + Math.floor(Math.random() * 800) + 300,
                status: i === 0 ? 'aberto' : 'fechado',
            },
        });

        const dayAppointments = await prisma.appointment.findMany({
            where: { date: dateStr, status: 'concluido' },
            include: { service: true },
        });

        for (const appt of dayAppointments) {
            await prisma.transaction.create({
                data: {
                    type: 'entrada',
                    category: 'servico',
                    description: appt.service.name,
                    amount: appt.price,
                    paymentMethod: ['dinheiro', 'pix', 'cartao_credito', 'cartao_debito'][Math.floor(Math.random() * 4)],
                    cashRegisterId: cashRegister.id,
                    barberId: appt.barberId,
                },
            });
        }

        if (Math.random() > 0.5) {
            await prisma.transaction.create({
                data: {
                    type: 'saida',
                    category: 'despesa',
                    description: ['Material de limpeza', 'Produtos de barbeiro', 'Água e Luz', 'Aluguel parcial'][Math.floor(Math.random() * 4)],
                    amount: Math.floor(Math.random() * 150) + 30,
                    paymentMethod: 'dinheiro',
                    cashRegisterId: cashRegister.id,
                },
            });
        }
    }

    // Products
    await prisma.product.createMany({
        data: [
            { name: 'Pomada Modeladora', description: 'Pomada efeito matte', quantity: 25, minQuantity: 5, price: 35, category: 'Finalizadores' },
            { name: 'Gel Fixação Forte', description: 'Gel transparente', quantity: 18, minQuantity: 5, price: 20, category: 'Finalizadores' },
            { name: 'Shampoo Anticaspa', description: 'Shampoo profissional', quantity: 12, minQuantity: 3, price: 28, category: 'Higiene' },
            { name: 'Lâmina Descartável', description: 'Pacote c/ 10 unidades', quantity: 3, minQuantity: 10, price: 15, category: 'Descartáveis' },
            { name: 'Óleo para Barba', description: 'Óleo hidratante premium', quantity: 8, minQuantity: 3, price: 45, category: 'Barba' },
            { name: 'Pós-Barba', description: 'Loção pós-barba', quantity: 15, minQuantity: 5, price: 22, category: 'Barba' },
            { name: 'Cera Capilar', description: 'Cera de alta fixação', quantity: 20, minQuantity: 5, price: 30, category: 'Finalizadores' },
            { name: 'Toalha Descartável', description: 'Pacote c/ 50 unidades', quantity: 2, minQuantity: 5, price: 25, category: 'Descartáveis' },
        ],
    });

    console.log('✅ Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
