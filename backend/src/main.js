const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const compression = require('compression');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { z } = require('zod');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production';
const DEFAULT_SALON_ID = '00000000-0000-0000-0000-000000000001';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const BCRYPT_ROUNDS = 12;

// ============ SECURITY MIDDLEWARE ============

// Helmet - Security Headers (CSP, HSTS, X-Frame-Options, etc.)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS - Only allow frontend origin
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
}));

// Compression
app.use(compression());

// Body parsing with size limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Logging
app.use(morgan('combined', {
  skip: (req) => req.path === '/api/health'
}));

// ============ RATE LIMITING ============

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Muitas requisições, tente novamente mais tarde' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Muitas tentativas de login, tente novamente em 15 minutos' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message: { error: 'Limite de requisições excedido' },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/', apiLimiter);

// ============ AUTH MIDDLEWARE ============

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
    return res.status(403).json({ error: 'Token inválido ou expirado' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso não autorizado' });
    }
    next();
  };
}

// ============ ZOD VALIDATION SCHEMAS ============

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória')
});

const createUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
    .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos um caractere especial'),
  role: z.enum(['ADMIN', 'RECEPTIONIST', 'STYLIST']).optional()
});

const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum(['ADMIN', 'RECEPTIONIST', 'STYLIST']).optional(),
  isActive: z.boolean().optional()
});

const createClientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  phone: z.string().regex(/^[\d\s\(\)\-\+]{8,20}$/, 'Telefone inválido').optional().nullable(),
  email: z.string().email('Email inválido').optional().nullable(),
  notes: z.string().max(500).optional().nullable()
});

const updateClientSchema = createClientSchema.partial();

const createServiceSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  description: z.string().max(500).optional().nullable(),
  durationMinutes: z.number().int().min(5, 'Duração mínima 5 minutos').max(480, 'Duração máxima 8 horas'),
  price: z.number().positive('Preço deve ser positivo').max(99999.99),
  category: z.string().max(50).optional().nullable()
});

const updateServiceSchema = createServiceSchema.partial();

const createAppointmentSchema = z.object({
  customerId: z.string().uuid('ID do cliente inválido'),
  serviceId: z.string().uuid('ID do serviço inválido'),
  staffId: z.string().uuid('ID do profissional inválido'),
  startTime: z.string().datetime('Data/hora inválida'),
  notes: z.string().max(500).optional().nullable()
});

const updateAppointmentSchema = z.object({
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  notes: z.string().max(500).optional().nullable()
});

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: result.error.flatten().fieldErrors
      });
    }
    req.validated = result.data;
    next();
  };
}

// ============ AUDIT LOG ============

async function logAudit(userId, action, details, req) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        details: JSON.stringify(details),
        ip: req.ip,
        userAgent: req.headers['user-agent']
      }
    });
  } catch (e) {
    console.error('Audit log error:', e);
  }
}

// ============ AUTH ROUTES ============

app.post('/api/auth/login', validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.validated;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      await logAudit(null, 'LOGIN_FAILED', { email, reason: 'user_not_found_or_inactive' }, req);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      await logAudit(user.id, 'LOGIN_FAILED', { email, reason: 'invalid_password' }, req);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const staff = await prisma.staff.findUnique({ where: { userId: user.id } });
    const salonId = staff?.salonId || DEFAULT_SALON_ID;

    const accessToken = jwt.sign(
      { sub: user.id, email: user.email, role: user.role, salonId },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { sub: user.id, type: 'refresh' },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    await logAudit(user.id, 'LOGIN_SUCCESS', { email, role: user.role }, req);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        salonId
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
});

app.post('/api/auth/refresh', async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token não fornecido' });
  }

  try {
    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Refresh token inválido ou expirado' });
    }

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Usuário não encontrado ou inativo' });
    }

    const staff = await prisma.staff.findUnique({ where: { userId: user.id } });
    const salonId = staff?.salonId || DEFAULT_SALON_ID;

    const newAccessToken = jwt.sign(
      { sub: user.id, email: user.email, role: user.role, salonId },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const newRefreshToken = jwt.sign(
      { sub: user.id, type: 'refresh' },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    await prisma.refreshToken.update({
      where: { token: refreshToken },
      data: {
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(401).json({ error: 'Refresh token inválido' });
  }
});

app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    await logAudit(req.user.sub, 'LOGOUT', {}, req);
  }
  res.clearCookie('refreshToken');
  res.json({ success: true });
});

// ============ CLIENTS ROUTES ============

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

app.post('/api/clients', authenticateToken, validate(createClientSchema), async (req, res) => {
  try {
    const client = await prisma.customer.create({
      data: { ...req.validated, salonId: req.user.salonId }
    });
    await logAudit(req.user.sub, 'CLIENT_CREATE', { clientId: client.id }, req);
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar cliente' });
  }
});

app.put('/api/clients/:id', authenticateToken, validate(updateClientSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const client = await prisma.customer.update({
      where: { id },
      data: req.validated
    });
    await logAudit(req.user.sub, 'CLIENT_UPDATE', { clientId: id }, req);
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar cliente' });
  }
});

app.delete('/api/clients/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.customer.delete({ where: { id } });
    await logAudit(req.user.sub, 'CLIENT_DELETE', { clientId: id }, req);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir cliente' });
  }
});

// ============ SERVICES ROUTES ============

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

app.post('/api/services', authenticateToken, validate(createServiceSchema), async (req, res) => {
  try {
    const service = await prisma.service.create({
      data: { ...req.validated, salonId: req.user.salonId }
    });
    await logAudit(req.user.sub, 'SERVICE_CREATE', { serviceId: service.id }, req);
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar serviço' });
  }
});

app.put('/api/services/:id', authenticateToken, validate(updateServiceSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const service = await prisma.service.update({ where: { id }, data: req.validated });
    await logAudit(req.user.sub, 'SERVICE_UPDATE', { serviceId: id }, req);
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar serviço' });
  }
});

app.delete('/api/services/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.service.update({ where: { id }, data: { isActive: false } });
    await logAudit(req.user.sub, 'SERVICE_DELETE', { serviceId: id }, req);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir serviço' });
  }
});

// ============ APPOINTMENTS ROUTES ============

app.get('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, staffId, status, my } = req.query;
    const where = { salonId: req.user.salonId };

    if (my === 'true') {
      const myStaff = await prisma.staff.findUnique({ where: { userId: req.user.sub } });
      if (myStaff) where.staffId = myStaff.id;
    }

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

app.post('/api/appointments', authenticateToken, validate(createAppointmentSchema), async (req, res) => {
  try {
    const { customerId, serviceId, staffId, startTime, notes } = req.validated;

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) return res.status(404).json({ error: 'Serviço não encontrado' });

    const start = new Date(startTime);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + service.durationMinutes);

    const conflicting = await prisma.appointment.findFirst({
      where: {
        staffId,
        salonId: req.user.salonId,
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
        OR: [
          { startTime: { lt: end }, endTime: { gt: start } }
        ]
      }
    });

    if (conflicting) {
      return res.status(409).json({ error: 'Horário indisponível para este profissional' });
    }

    const appointment = await prisma.appointment.create({
      data: {
        customerId, serviceId, staffId,
        salonId: req.user.salonId,
        startTime: start, endTime: end,
        status: 'SCHEDULED', notes
      },
      include: {
        customer: { select: { name: true } },
        service: { select: { name: true } }
      }
    });

    await logAudit(req.user.sub, 'APPOINTMENT_CREATE', { appointmentId: appointment.id }, req);
    res.json(appointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Erro ao criar atendimento' });
  }
});

app.put('/api/appointments/:id', authenticateToken, validate(updateAppointmentSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment) return res.status(404).json({ error: 'Agendamento não encontrado' });

    const updated = await prisma.appointment.update({
      where: { id },
      data: req.validated,
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        service: { select: { id: true, name: true, durationMinutes: true, price: true } },
        staff: { include: { user: { select: { name: true } } } }
      }
    });

    await logAudit(req.user.sub, 'APPOINTMENT_UPDATE', { appointmentId: id, changes: req.validated }, req);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar agendamento' });
  }
});

// ============ STAFF ROUTES ============

app.get('/api/staff', authenticateToken, async (req, res) => {
  try {
    const staff = await prisma.staff.findMany({
      where: { salonId: req.user.salonId, isActive: true },
      include: { user: { select: { id: true, name: true, email: true, role: true } } }
    });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar profissionais' });
  }
});

app.get('/api/staff/me', authenticateToken, async (req, res) => {
  try {
    const staff = await prisma.staff.findUnique({
      where: { userId: req.user.sub },
      include: { user: { select: { id: true, name: true, email: true, role: true } } }
    });
    if (!staff) return res.status(404).json({ error: 'Profissional não encontrado' });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
});

app.post('/api/staff', authenticateToken, requireRole('ADMIN'), validate(createUserSchema), async (req, res) => {
  try {
    const { name, email, password, role } = req.validated;
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        name, email, password: hashedPassword, role: role || 'STYLIST',
        staff: { create: { salonId: req.user.salonId } }
      },
      include: { staff: true }
    });

    await logAudit(req.user.sub, 'STAFF_CREATE', { staffId: user.id, email }, req);
    res.json({
      id: user.id, name: user.name, email: user.email,
      role: user.role, isActive: user.isActive, staffId: user.staff.id
    });
  } catch (error) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Email já cadastrado' });
    res.status(500).json({ error: 'Erro ao criar profissional' });
  }
});

app.put('/api/staff/:id', authenticateToken, requireRole('ADMIN'), validate(updateUserSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await prisma.staff.findUnique({ where: { id }, include: { user: true } });
    if (!staff) return res.status(404).json({ error: 'Profissional não encontrado' });

    const data = {};
    if (req.validated.name) data.name = req.validated.name;
    if (req.validated.email) data.email = req.validated.email;
    if (req.validated.role) data.role = req.validated.role;
    if (req.validated.isActive !== undefined) data.isActive = req.validated.isActive;

    if (Object.keys(data).length > 0) {
      await prisma.user.update({ where: { id: staff.userId }, data });
    }

    const updated = await prisma.staff.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true, role: true, isActive: true } } }
    });

    await logAudit(req.user.sub, 'STAFF_UPDATE', { staffId: id }, req);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar profissional' });
  }
});

app.delete('/api/staff/:id', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await prisma.staff.findUnique({ where: { id }, include: { user: true } });
    if (!staff) return res.status(404).json({ error: 'Profissional não encontrado' });

    await prisma.user.update({ where: { id: staff.userId }, data: { isActive: false } });
    await prisma.staff.update({ where: { id }, data: { isActive: false } });
    await prisma.refreshToken.deleteMany({ where: { userId: staff.userId } });

    await logAudit(req.user.sub, 'STAFF_DELETE', { staffId: id }, req);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir profissional' });
  }
});

// ============ REPORTS ROUTES ============

app.get('/api/reports/dashboard', authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayAppointments, totalCustomers, totalServices] = await Promise.all([
      prisma.appointment.count({
        where: { salonId: req.user.salonId, startTime: { gte: today, lt: tomorrow } }
      }),
      prisma.customer.count({ where: { salonId: req.user.salonId } }),
      prisma.service.count({ where: { salonId: req.user.salonId, isActive: true } })
    ]);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

    const monthAppointments = await prisma.appointment.findMany({
      where: {
        salonId: req.user.salonId,
        status: 'COMPLETED',
        startTime: { gte: monthStart, lte: monthEnd }
      },
      include: { service: { select: { price: true } } }
    });

    const monthRevenue = monthAppointments.reduce((sum, apt) => sum + apt.service.price, 0);

    res.json({ todayAppointments, totalCustomers, totalServices, monthRevenue });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar dados' });
  }
});

// ============ HEALTH CHECK ============

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============ GLOBAL ERROR HANDLER ============

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// ============ START SERVER ============

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Security: Helmet | RateLimit | Zod | JWT(15m) | Refresh(7d) | AuditLog | CORS`);
});
