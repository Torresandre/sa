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
      phone: '+351 900 000 000',
      email: 'contato@salon.com',
      country: 'PT',
      currency: 'EUR',
      timezone: 'Europe/Lisbon',
    },
  });

  console.log('Created salon:', salon.name);

  // Create users
  const hashPassword = async (pw) => bcrypt.hash(pw, 10);

  const users = [
    { email: 'admin@salon.com', password: await hashPassword('admin123'), name: 'Administrador', role: UserRole.ADMIN },
    { email: 'ana@salon.com', password: await hashPassword('stylist123'), name: 'Ana Silva', role: UserRole.STYLIST },
    { email: 'carlos@salon.com', password: await hashPassword('stylist123'), name: 'Carlos Santos', role: UserRole.STYLIST },
    { email: 'recep@salon.com', password: await hashPassword('recep123'), name: 'Maria Recepcionista', role: UserRole.RECEPTIONIST },
  ];

  const createdUsers = [];
  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    });
    const staff = await prisma.staff.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, salonId: salon.id },
    });
    createdUsers.push({ user, staff });
  }

  console.log('Created users');

  // Create services
  const services = [
    { name: 'Corte Feminino', durationMinutes: 45, price: 25, category: 'Corte' },
    { name: 'Corte Masculino', durationMinutes: 30, price: 15, category: 'Corte' },
    { name: 'Barba', durationMinutes: 20, price: 10, category: 'Barba' },
    { name: 'Corte + Barba', durationMinutes: 45, price: 22, category: 'Corte' },
    { name: 'Pintura', durationMinutes: 90, price: 50, category: 'Coloração' },
    { name: 'Mechas', durationMinutes: 120, price: 70, category: 'Coloração' },
    { name: 'Escova', durationMinutes: 40, price: 20, category: 'Finalização' },
    { name: 'Progressiva', durationMinutes: 120, price: 80, category: 'Tratamento' },
    { name: 'Manicure', durationMinutes: 30, price: 12, category: 'Unhas' },
    { name: 'Pedicure', durationMinutes: 45, price: 15, category: 'Unhas' },
  ];

  for (const service of services) {
    await prisma.service.create({
      data: { ...service, salonId: salon.id },
    });
  }

  console.log('Created services');

  // Create customers
  const customers = [
    { name: 'Maria Silva', phone: '+351 911 111 111', email: 'maria@email.com' },
    { name: 'João Santos', phone: '+351 922 222 222', email: 'joao@email.com' },
    { name: 'Ana Costa', phone: '+351 933 333 333', email: 'ana@email.com' },
    { name: 'Pedro Oliveira', phone: '+351 944 444 444', email: 'pedro@email.com' },
  ];

  const createdCustomers = [];
  for (const customer of customers) {
    const created = await prisma.customer.create({
      data: { ...customer, salonId: salon.id },
    });
    createdCustomers.push(created);
  }

  console.log('Created customers');

  // Create appointments
  const allServices = await prisma.service.findMany({ where: { salonId: salon.id } });
  const stylist1Staff = createdUsers[1].staff;

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
        staffId: stylist1Staff.id,
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
  console.log('  Stylist: carlos@salon.com / stylist123');
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
