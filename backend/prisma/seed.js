const { PrismaClient, UserRole } = require('@prisma/client');
const bcrypt = require('bcrypt');

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

  // Create admin user and staff
  const adminPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@salon.com' },
    update: {},
    create: {
      email: 'admin@salon.com',
      password: adminPassword,
      name: 'Administrador',
      role: UserRole.ADMIN,
    },
  });

  const adminStaff = await prisma.staff.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      salonId: salon.id,
    },
  });

  console.log('Created admin user:', adminUser.email);

  // Create stylist users
  const stylistPassword = await bcrypt.hash('stylist123', 10);
  
  const stylist1User = await prisma.user.upsert({
    where: { email: 'ana@salon.com' },
    update: {},
    create: {
      email: 'ana@salon.com',
      password: stylistPassword,
      name: 'Ana Silva',
      role: UserRole.STYLIST,
    },
  });

  const stylist2User = await prisma.user.upsert({
    where: { email: 'carlos@salon.com' },
    update: {},
    create: {
      email: 'carlos@salon.com',
      password: stylistPassword,
      name: 'Carlos Santos',
      role: UserRole.STYLIST,
    },
  });

  const stylist1 = await prisma.staff.upsert({
    where: { userId: stylist1User.id },
    update: {},
    create: {
      userId: stylist1User.id,
      salonId: salon.id,
    },
  });

  await prisma.staff.upsert({
    where: { userId: stylist2User.id },
    update: {},
    create: {
      userId: stylist2User.id,
      salonId: salon.id,
    },
  });

  console.log('Created stylist users');

  // Create receptionist
  const receptionistPassword = await bcrypt.hash('recep123', 10);
  const recepUser = await prisma.user.upsert({
    where: { email: 'recep@salon.com' },
    update: {},
    create: {
      email: 'recep@salon.com',
      password: receptionistPassword,
      name: 'Maria Recepcionista',
      role: UserRole.RECEPTIONIST,
    },
  });

  await prisma.staff.upsert({
    where: { userId: recepUser.id },
    update: {},
    create: {
      userId: recepUser.id,
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
    { name: 'Escova', durationMinutes: 40, price: 60, category: 'Finalização' },
  ];

  for (const service of services) {
    await prisma.service.create({
      data: {
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
  ];

  const createdCustomers = [];
  for (const customer of customers) {
    const created = await prisma.customer.create({
      data: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        salonId: salon.id,
      },
    });
    createdCustomers.push(created);
  }

  console.log('Created customers');

  // Create sample appointments
  const allServices = await prisma.service.findMany({ where: { salonId: salon.id } });
  
  for (let i = 0; i < 3; i++) {
    const customer = createdCustomers[i];
    const service = allServices[i % allServices.length];
    const appointmentDate = new Date();
    appointmentDate.setDate(appointmentDate.getDate() + i);
    appointmentDate.setHours(9 + i * 2, 0, 0, 0);
    
    const endTime = new Date(appointmentDate);
    endTime.setMinutes(endTime.getMinutes() + service.durationMinutes);

    await prisma.appointment.create({
      data: {
        customerId: customer.id,
        serviceId: service.id,
        staffId: staff1.id,
        salonId: salon.id,
        startTime: appointmentDate,
        endTime: endTime,
        status: 'CONFIRMED',
      },
    });
  }

  console.log('Created appointments');

  console.log('Seed completed successfully!');
  console.log('\nLogin credentials:');
  console.log('  Admin: admin@salon.com / admin123');
  console.log('  Stylist: ana@salon.com / stylist123');
  console.log('  Receptionist: recep@salon.com / recep123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
