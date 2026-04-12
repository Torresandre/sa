const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const DEFAULT_SALON_ID = '00000000-0000-0000-0000-000000000001';

app.use(cors());
app.use(express.json());

// Auth middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido' });
  }
}

// Default salon ID for single salon app
const DEFAULT_SALON_ID = '00000000-0000-0000-0000-000000000001';

// Routes - Auth
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Get staff to find salonId
    const staff = await prisma.staff.findUnique({
      where: { userId: user.id }
    });

    const salonId = staff?.salonId || DEFAULT_SALON_ID;

    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role, salonId: salonId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        salonId: salonId
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// Routes - Clients
app.get('/api/clients', authenticateToken, async (req, res) => {
  try {
    const clients = await prisma.customer.findMany({
      where: { salonId: req.user.salonId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
});

app.post('/api/clients', authenticateToken, async (req, res) => {
  try {
    const { name, phone, email, notes } = req.body;
    const client = await prisma.customer.create({
      data: {
        name,
        phone,
        email,
        notes,
        salonId: req.user.salonId
      }
    });
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar cliente' });
  }
});

app.put('/api/clients/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, notes } = req.body;
    const client = await prisma.customer.update({
      where: { id },
      data: { name, phone, email, notes }
    });
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar cliente' });
  }
});

app.delete('/api/clients/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.customer.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir cliente' });
  }
});

// Routes - Services
app.get('/api/services', authenticateToken, async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      where: { salonId: req.user.salonId, isActive: true },
      orderBy: { name: 'asc' }
    });
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar serviços' });
  }
});

app.post('/api/services', authenticateToken, async (req, res) => {
  try {
    const { name, description, durationMinutes, price, category } = req.body;
    const service = await prisma.service.create({
      data: {
        name,
        description,
        durationMinutes: parseInt(durationMinutes),
        price: parseFloat(price),
        category,
        salonId: req.user.salonId
      }
    });
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar serviço' });
  }
});

// Routes - Appointments
app.get('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, staffId, status } = req.query;
    
    const where = { salonId: req.user.salonId };
    
    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) where.startTime.gte = new Date(startDate);
      if (endDate) where.startTime.lte = new Date(endDate);
    }
    
    if (staffId) where.staffId = staffId;
    if (status) where.status = status;

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        service: { select: { id: true, name: true, durationMinutes: true, price: true } },
        staff: { include: { user: { select: { name: true } } } }
      },
      orderBy: { startTime: 'asc' }
    });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar atendimentos' });
  }
});

app.post('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const { customerId, serviceId, staffId, startTime, notes } = req.body;
    
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    const start = new Date(startTime);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + service.durationMinutes);

    const appointment = await prisma.appointment.create({
      data: {
        customerId,
        serviceId,
        staffId,
        salonId: req.user.salonId,
        startTime: start,
        endTime: end,
        status: 'SCHEDULED',
        notes
      },
      include: {
        customer: { select: { name: true } },
        service: { select: { name: true } }
      }
    });
    res.json(appointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Erro ao criar atendimento' });
  }
});

// Routes - Staff
app.get('/api/staff', authenticateToken, async (req, res) => {
  try {
    const staff = await prisma.staff.findMany({
      where: { salonId: req.user.salonId, isActive: true },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } }
      }
    });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar profissionais' });
  }
});

// Routes - Reports
app.get('/api/reports/dashboard', authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayAppointments, totalCustomers, totalServices] = await Promise.all([
      prisma.appointment.count({
        where: {
          salonId: req.user.salonId,
          startTime: { gte: today, lt: tomorrow }
        }
      }),
      prisma.customer.count({ where: { salonId: req.user.salonId } }),
      prisma.service.count({ where: { salonId: req.user.salonId, isActive: true } })
    ]);

    res.json({
      todayAppointments,
      totalCustomers,
      totalServices,
      monthRevenue: 12450
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar dados' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API docs: http://localhost:${PORT}/api/health`);
});
