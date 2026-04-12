import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create salon
  const salon = await prisma.salon.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'SA Salão',
      address: 'Rua Example, 123 - Centro',
      phone: '(11) 99999-9999',
      email: 'contato@salon.com',
      country: 'BR',
      currency: 'BRL',
      timezone: 'America/Sao_Paulo',
    },
  });

  console.log('Created salon:', salon.name);

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@salon.com' },
    update: {},
    create: {
      email: 'admin@salon.com',
      password: adminPassword,
      name: 'Administrador',
      role: UserRole.ADMIN,
      salonId: salon.id,
    },
  });

  // Create staff record for admin
  await prisma.staff.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      salonId: salon.id,
    },
  });

  console.log('Created admin user:', admin.email);

  // Create stylist users
  const stylistPassword = await bcrypt.hash('stylist123', 10);
  const stylist1 = await prisma.user.upsert({
    where: { email: 'ana@salon.com' },
    update: {},
    create: {
      email: 'ana@salon.com',
      password: stylistPassword,
      name: 'Ana Silva',
      role: UserRole.STYLIST,
      salonId: salon.id,
    },
  });

  const stylist2 = await prisma.user.upsert({
    where: { email: 'carlos@salon.com' },
    update: {},
    create: {
      email: 'carlos@salon.com',
      password: stylistPassword,
      name: 'Carlos Santos',
      role: UserRole.STYLIST,
      salonId: salon.id,
    },
  });

  // Create staff records
  const staff1 = await prisma.staff.upsert({
    where: { userId: stylist1.id },
    update: {},
    create: {
      userId: stylist1.id,
      salonId: salon.id,
    },
  });

  const staff2 = await prisma.staff.upsert({
    where: { userId: stylist2.id },
    update: {},
    create: {
      userId: stylist2.id,
      salonId: salon.id,
    },
  });

  console.log('Created stylist users');

  // Create receptionist
  const receptionistPassword = await bcrypt.hash('recep123', 10);
  const receptionist = await prisma.user.upsert({
    where: { email: 'recep@salon.com' },
    update: {},
    create: {
      email: 'recep@salon.com',
      password: receptionistPassword,
      name: 'Maria Recepcionista',
      role: UserRole.RECEPTIONIST,
      salonId: salon.id,
    },
  });

  console.log('Created receptionist user');

  // Create services
  const services = [
    { name: 'Corte Feminino', durationMinutes: 45, price: 80, category: 'Corte' },
    { name: 'Corte Masculino', durationMinutes: 30, price: 50, category: 'Corte' },
    { name: 'Barba', durationMinutes: 20, price: 30, category: 'Barba' },
    { name: 'Corte + Barba', durationMinutes: 45, price: 70, category: 'Corte' },
    { name: 'Pintura', durationMinutes: 90, price: 150, category: 'Coloração' },
    { name: 'Mechas', durationMinutes: 120, price: 200, category: 'Coloração' },
    { name: 'Escova', durationMinutes: 40, price: 60, category: 'Finalização' },
    { name: 'Progressiva', durationMinutes: 120, price: 250, category: 'Tratamento' },
    { name: 'Manicure', durationMinutes: 30, price: 35, category: 'Unhas' },
    { name: 'Pedicure', durationMinutes: 45, price: 45, category: 'Unhas' },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { id: `${service.name.toLowerCase().replace(/\s+/g, '-')}-${salon.id}` },
      update: {},
      create: {
        name: service.name,
        durationMinutes: service.durationMinutes,
        price: service.price,
        category: service.category,
        salonId: salon.id,
      },
    });
  }

  console.log('Created services');

  // Create sample customers
  const customers = [
    { name: 'Maria Silva', phone: '(11) 99999-1111', email: 'maria@email.com' },
    { name: 'João Santos', phone: '(11) 99999-2222', email: 'joao@email.com' },
    { name: 'Ana Costa', phone: '(11) 99999-3333', email: 'ana@email.com' },
    { name: 'Pedro Oliveira', phone: '(11) 99999-4444', email: 'pedro@email.com' },
    { name: 'Julia Ferreira', phone: '(11) 99999-5555', email: 'julia@email.com' },
  ];

  for (const customer of customers) {
    await prisma.customer.upsert({
      where: { id: `${customer.phone}-${salon.id}` },
      update: {},
      create: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        salonId: salon.id,
      },
    });
  }

  console.log('Created customers');

  // Create schedules for staff
  const daysOfWeek = [1, 2, 3, 4, 5]; // Monday to Friday
  for (const day of daysOfWeek) {
    await prisma.schedule.upsert({
      where: { 
        staffId_dayOfWeek: { staffId: staff1.id, dayOfWeek: day }
      },
      update: {},
      create: {
        staffId: staff1.id,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '18:00',
        isAvailable: true,
      },
    });

    await prisma.schedule.upsert({
      where: { 
        staffId_dayOfWeek: { staffId: staff2.id, dayOfWeek: day }
      },
      update: {},
      create: {
        staffId: staff2.id,
        dayOfWeek: day,
        startTime: '10:00',
        endTime: '19:00',
        isAvailable: true,
      },
    });
  }

  console.log('Created schedules');

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
