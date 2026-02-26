import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { getCollection } from '@/lib/db';
import { 
  hashPassword, 
  comparePassword, 
  generateToken, 
  authenticateRequest 
} from '@/lib/auth';
import { sendPaymentConfirmation, sendSalaryConfirmation } from '@/lib/email';

// Helper function to handle CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }));
}

// Validation schemas
const loginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
});

const studentSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(10),
  email: z.string().email().optional().nullable(),
  guardian_name: z.string().min(1),
  guardian_phone: z.string().min(10),
  address: z.string().optional(),
  date_of_birth: z.string().optional(),
  branch_id: z.string().min(1),
  session_id: z.string().min(1),
  class_id: z.string().min(1),
  roll_number: z.number().positive(),
  avatar: z.string().optional(),
  fee_structure: z.object({
    monthly_fee: z.number().default(0),
    residential_fee: z.number().default(0),
    meal_fee: z.number().default(0),
    utility_fee: z.number().default(0),
    examination_fee: z.number().default(0),
    other_fees: z.number().default(0),
  }),
});

const teacherSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(10),
  email: z.string().email().optional().nullable(),
  designation: z.string().min(1),
  rank: z.number().positive(),
  primary_branch_id: z.string().min(1),
  branch_ids: z.array(z.string()),
  recruitment_date: z.string(),
  monthly_salary: z.number().positive(),
  avatar: z.string().optional(),
});

const sessionSchema = z.object({
  name: z.string().min(1),
  branch_id: z.string().min(1),
  is_active: z.boolean().default(true),
  start_date: z.string(),
  end_date: z.string().optional(),
});

const classSchema = z.object({
  name: z.string().min(1),
  branch_id: z.string().min(1),
  order: z.number().positive(),
});

const paymentSchema = z.object({
  student_id: z.string().min(1),
  amount: z.number().positive(),
  fee_type: z.string().min(1),
  remarks: z.string().optional(),
});

// Route handler
async function handleRoute(request, { params }) {
  const { path = [] } = params;
  const route = `/${path.join('/')}`;
  const method = request.method;

  try {
    // Public routes (no auth required)
    if (route === '/' && method === 'GET') {
      return handleCORS(NextResponse.json({ message: "Darun Nazat Madrasa API" }));
    }

    // Public info endpoint
    if (route === '/public/info' && method === 'GET') {
      const branchesCol = await getCollection('branches');
      const studentsCol = await getCollection('students');
      const teachersCol = await getCollection('teachers');
      const classesCol = await getCollection('classes');

      const branches = await branchesCol.find({}).toArray();
      const totalStudents = await studentsCol.countDocuments();
      const totalTeachers = await teachersCol.countDocuments();

      const branchesWithCounts = await Promise.all(
        branches.map(async (branch) => {
          const branchStudents = await studentsCol.countDocuments({ branch_id: branch.id });
          const branchTeachers = await teachersCol.countDocuments({ 
            branch_ids: branch.id 
          });
          const branchClasses = await classesCol.find({ branch_id: branch.id }).sort({ order: 1 }).toArray();

          const classesWithCounts = await Promise.all(
            branchClasses.map(async (cls) => {
              const classStudents = await studentsCol.countDocuments({ 
                branch_id: branch.id,
                class_id: cls.id 
              });
              return {
                ...cls,
                student_count: classStudents,
              };
            })
          );

          return {
            ...branch,
            student_count: branchStudents,
            teacher_count: branchTeachers,
            classes: classesWithCounts,
          };
        })
      );

      return handleCORS(NextResponse.json({
        madrasa_name: 'Darun Nazat Madrasa',
        address: 'Kawla Zamindarbari, Dakshinkhan, Dhaka',
        branches: branchesWithCounts,
        total_students: totalStudents,
        total_teachers: totalTeachers,
      }));
    }

    // Auth: Login
    if (route === '/auth/login' && method === 'POST') {
      const body = await request.json();
      const validation = loginSchema.safeParse(body);

      if (!validation.success) {
        return handleCORS(NextResponse.json(
          { error: 'Invalid input', details: validation.error },
          { status: 400 }
        ));
      }

      const { identifier, password } = validation.data;
      const usersCol = await getCollection('users');

      const user = await usersCol.findOne({
        $or: [{ email: identifier }, { phone: identifier }],
      });

      if (!user || !comparePassword(password, user.password)) {
        return handleCORS(NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        ));
      }

      const token = generateToken({
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        phone: user.phone,
      });

      const { password: _, ...userWithoutPassword } = user;

      return handleCORS(NextResponse.json({
        token,
        user: userWithoutPassword,
      }));
    }

    // Auth: Get current user
    if (route === '/auth/me' && method === 'GET') {
      const authUser = await authenticateRequest(request);
      if (!authUser) {
        return handleCORS(NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        ));
      }

      const usersCol = await getCollection('users');
      const user = await usersCol.findOne({ id: authUser.id });

      if (!user) {
        return handleCORS(NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        ));
      }

      const { password: _, ...userWithoutPassword } = user;
      return handleCORS(NextResponse.json(userWithoutPassword));
    }

    // All other routes require authentication
    const authUser = await authenticateRequest(request);
    if (!authUser) {
      return handleCORS(NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ));
    }

    // Branches
    if (route === '/branches' && method === 'GET') {
      const branchesCol = await getCollection('branches');
      const branches = await branchesCol.find({}).toArray();
      return handleCORS(NextResponse.json(branches));
    }

    if (route === '/branches' && method === 'POST') {
      if (authUser.role !== 'super_admin') {
        return handleCORS(NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        ));
      }

      const body = await request.json();
      const branchesCol = await getCollection('branches');

      const newBranch = {
        id: uuidv4(),
        name: body.name,
        address: body.address,
        created_at: new Date(),
      };

      await branchesCol.insertOne(newBranch);
      return handleCORS(NextResponse.json(newBranch));
    }

    // Sessions
    if (route === '/sessions' && method === 'GET') {
      const { branch_id } = Object.fromEntries(new URL(request.url).searchParams);
      const sessionsCol = await getCollection('sessions');

      const query = branch_id ? { branch_id } : {};
      const sessions = await sessionsCol.find(query).sort({ start_date: -1 }).toArray();

      return handleCORS(NextResponse.json(sessions));
    }

    if (route === '/sessions' && method === 'POST') {
      if (!['super_admin', 'admin'].includes(authUser.role)) {
        return handleCORS(NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        ));
      }

      const body = await request.json();
      const validation = sessionSchema.safeParse(body);

      if (!validation.success) {
        return handleCORS(NextResponse.json(
          { error: 'Invalid input', details: validation.error },
          { status: 400 }
        ));
      }

      const sessionsCol = await getCollection('sessions');
      const newSession = {
        id: uuidv4(),
        ...validation.data,
        created_at: new Date(),
        created_by: authUser.id,
      };

      await sessionsCol.insertOne(newSession);
      return handleCORS(NextResponse.json(newSession));
    }

    // Classes
    if (route === '/classes' && method === 'GET') {
      const { branch_id } = Object.fromEntries(new URL(request.url).searchParams);
      const classesCol = await getCollection('classes');

      const query = branch_id ? { branch_id } : {};
      const classes = await classesCol.find(query).sort({ order: 1 }).toArray();

      return handleCORS(NextResponse.json(classes));
    }

    if (route === '/classes' && method === 'POST') {
      if (!['super_admin', 'admin'].includes(authUser.role)) {
        return handleCORS(NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        ));
      }

      const body = await request.json();
      const validation = classSchema.safeParse(body);

      if (!validation.success) {
        return handleCORS(NextResponse.json(
          { error: 'Invalid input', details: validation.error },
          { status: 400 }
        ));
      }

      const classesCol = await getCollection('classes');
      const newClass = {
        id: uuidv4(),
        ...validation.data,
        created_at: new Date(),
        created_by: authUser.id,
      };

      await classesCol.insertOne(newClass);
      return handleCORS(NextResponse.json(newClass));
    }

    // Students - List
    if (route === '/students' && method === 'GET') {
      const params = Object.fromEntries(new URL(request.url).searchParams);
      const studentsCol = await getCollection('students');

      const query = {};
      if (params.branch_id) query.branch_id = params.branch_id;
      if (params.session_id) query.session_id = params.session_id;
      if (params.class_id) query.class_id = params.class_id;

      const students = await studentsCol.find(query).sort({ roll_number: 1 }).toArray();
      return handleCORS(NextResponse.json(students));
    }

    // Students - Create (Admission)
    if (route === '/students' && method === 'POST') {
      if (!['super_admin', 'admin'].includes(authUser.role)) {
        return handleCORS(NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        ));
      }

      const body = await request.json();
      const validation = studentSchema.safeParse(body);

      if (!validation.success) {
        return handleCORS(NextResponse.json(
          { error: 'Invalid input', details: validation.error },
          { status: 400 }
        ));
      }

      const studentsCol = await getCollection('students');
      const usersCol = await getCollection('users');
      const feeTransactionsCol = await getCollection('fee_transactions');

      const studentId = uuidv4();

      // Create student record
      const newStudent = {
        id: studentId,
        ...validation.data,
        running_balance: 0,
        session_history: [
          {
            session_id: validation.data.session_id,
            class_id: validation.data.class_id,
            from_date: new Date(),
            to_date: null,
          },
        ],
        created_at: new Date(),
        created_by: authUser.id,
      };

      await studentsCol.insertOne(newStudent);

      // Auto-create user account with phone as password
      const studentUser = {
        id: uuidv4(),
        name: validation.data.name,
        email: validation.data.email || null,
        phone: validation.data.phone,
        password: hashPassword(validation.data.phone),
        role: 'student',
        student_id: studentId,
        created_at: new Date(),
      };

      await usersCol.insertOne(studentUser);

      return handleCORS(NextResponse.json({
        student: newStudent,
        user: { ...studentUser, password: undefined },
      }));
    }

    // Students - Get by ID
    if (route.startsWith('/students/') && !route.includes('/ledger') && !route.includes('/payment') && method === 'GET') {
      const studentId = path[1];
      const studentsCol = await getCollection('students');

      const student = await studentsCol.findOne({ id: studentId });

      if (!student) {
        return handleCORS(NextResponse.json(
          { error: 'Student not found' },
          { status: 404 }
        ));
      }

      return handleCORS(NextResponse.json(student));
    }

    // Students - Update
    if (route.startsWith('/students/') && method === 'PUT') {
      const studentId = path[1];
      const body = await request.json();
      const studentsCol = await getCollection('students');

      const student = await studentsCol.findOne({ id: studentId });

      if (!student) {
        return handleCORS(NextResponse.json(
          { error: 'Student not found' },
          { status: 404 }
        ));
      }

      // Students can only update limited fields
      if (authUser.role === 'student') {
        const allowedFields = ['address', 'phone', 'date_of_birth'];
        const updates = {};
        
        for (const field of allowedFields) {
          if (body[field] !== undefined) {
            updates[field] = body[field];
          }
        }

        if (Object.keys(updates).length === 0) {
          return handleCORS(NextResponse.json(
            { error: 'No valid fields to update' },
            { status: 400 }
          ));
        }

        updates.updated_at = new Date();
        await studentsCol.updateOne({ id: studentId }, { $set: updates });

        const updatedStudent = await studentsCol.findOne({ id: studentId });
        return handleCORS(NextResponse.json(updatedStudent));
      }

      // Admin can update more fields
      if (['super_admin', 'admin'].includes(authUser.role)) {
        const updates = { ...body };
        delete updates.id;
        updates.updated_at = new Date();
        updates.updated_by = authUser.id;

        // If class or session changed, log it in session history
        if (body.class_id && body.class_id !== student.class_id) {
          const currentHistory = student.session_history[student.session_history.length - 1];
          currentHistory.to_date = new Date();

          updates.session_history = [
            ...student.session_history,
            {
              session_id: body.session_id || student.session_id,
              class_id: body.class_id,
              from_date: new Date(),
              to_date: null,
            },
          ];
        }

        await studentsCol.updateOne({ id: studentId }, { $set: updates });

        const updatedStudent = await studentsCol.findOne({ id: studentId });
        return handleCORS(NextResponse.json(updatedStudent));
      }

      return handleCORS(NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      ));
    }

    // Student Ledger
    if (route.startsWith('/students/') && route.includes('/ledger') && method === 'GET') {
      const studentId = path[1];
      const params = Object.fromEntries(new URL(request.url).searchParams);
      
      const studentsCol = await getCollection('students');
      const feeTransactionsCol = await getCollection('fee_transactions');

      const student = await studentsCol.findOne({ id: studentId });

      if (!student) {
        return handleCORS(NextResponse.json(
          { error: 'Student not found' },
          { status: 404 }
        ));
      }

      const query = { student_id: studentId };
      if (params.session_id) {
        query.session_id = params.session_id;
      }

      const transactions = await feeTransactionsCol
        .find(query)
        .sort({ date: -1 })
        .toArray();

      return handleCORS(NextResponse.json({
        student,
        running_balance: student.running_balance,
        transactions,
      }));
    }

    // Student Payment
    if (route.startsWith('/students/') && route.includes('/payment') && method === 'POST') {
      if (!['super_admin', 'admin'].includes(authUser.role)) {
        return handleCORS(NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        ));
      }

      const studentId = path[1];
      const body = await request.json();
      const validation = paymentSchema.safeParse({ ...body, student_id: studentId });

      if (!validation.success) {
        return handleCORS(NextResponse.json(
          { error: 'Invalid input', details: validation.error },
          { status: 400 }
        ));
      }

      const studentsCol = await getCollection('students');
      const feeTransactionsCol = await getCollection('fee_transactions');
      const financialTransactionsCol = await getCollection('financial_transactions');

      const student = await studentsCol.findOne({ id: studentId });

      if (!student) {
        return handleCORS(NextResponse.json(
          { error: 'Student not found' },
          { status: 404 }
        ));
      }

      const transactionId = `TXN-${Date.now()}-${uuidv4().slice(0, 8)}`;

      // Create fee transaction (payment)
      const feeTransaction = {
        id: uuidv4(),
        transaction_id: transactionId,
        student_id: studentId,
        branch_id: student.branch_id,
        session_id: student.session_id,
        type: 'payment',
        amount: validation.data.amount,
        fee_type: validation.data.fee_type,
        date: new Date(),
        remarks: validation.data.remarks || `Payment received for ${validation.data.fee_type}`,
        processed_by: authUser.id,
        running_balance_after: student.running_balance + validation.data.amount,
      };

      await feeTransactionsCol.insertOne(feeTransaction);

      // Update student running balance
      const newBalance = student.running_balance + validation.data.amount;
      await studentsCol.updateOne(
        { id: studentId },
        { $set: { running_balance: newBalance } }
      );

      // Create financial transaction (income)
      const financialTransaction = {
        id: uuidv4(),
        transaction_id: transactionId,
        branch_id: student.branch_id,
        type: 'income',
        category: 'student_fee',
        amount: validation.data.amount,
        date: new Date(),
        remarks: `Fee payment from ${student.name} (Roll: ${student.roll_number})`,
        processed_by: authUser.id,
      };

      await financialTransactionsCol.insertOne(financialTransaction);

      // Send email notification
      if (student.email) {
        await sendPaymentConfirmation(student, feeTransaction);
      }

      return handleCORS(NextResponse.json({
        transaction: feeTransaction,
        new_balance: newBalance,
      }));
    }

    // Teachers - List
    if (route === '/teachers' && method === 'GET') {
      const params = Object.fromEntries(new URL(request.url).searchParams);
      const teachersCol = await getCollection('teachers');

      const query = {};
      if (params.branch_id) {
        query.branch_ids = params.branch_id;
      }

      const teachers = await teachersCol.find(query).sort({ rank: 1 }).toArray();
      return handleCORS(NextResponse.json(teachers));
    }

    // Teachers - Create
    if (route === '/teachers' && method === 'POST') {
      if (!['super_admin', 'admin'].includes(authUser.role)) {
        return handleCORS(NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        ));
      }

      const body = await request.json();
      const validation = teacherSchema.safeParse(body);

      if (!validation.success) {
        return handleCORS(NextResponse.json(
          { error: 'Invalid input', details: validation.error },
          { status: 400 }
        ));
      }

      const teachersCol = await getCollection('teachers');
      const usersCol = await getCollection('users');

      const teacherId = uuidv4();

      const newTeacher = {
        id: teacherId,
        ...validation.data,
        status: 'active',
        created_at: new Date(),
        created_by: authUser.id,
      };

      await teachersCol.insertOne(newTeacher);

      // Auto-create user account with phone as password
      const teacherUser = {
        id: uuidv4(),
        name: validation.data.name,
        email: validation.data.email || null,
        phone: validation.data.phone,
        password: hashPassword(validation.data.phone),
        role: 'teacher',
        teacher_id: teacherId,
        created_at: new Date(),
      };

      await usersCol.insertOne(teacherUser);

      return handleCORS(NextResponse.json({
        teacher: newTeacher,
        user: { ...teacherUser, password: undefined },
      }));
    }

    // Teacher Salary Payment
    if (route.startsWith('/teachers/') && route.includes('/salary') && method === 'POST') {
      if (!['super_admin', 'admin'].includes(authUser.role)) {
        return handleCORS(NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        ));
      }

      const teacherId = path[1];
      const body = await request.json();

      const teachersCol = await getCollection('teachers');
      const financialTransactionsCol = await getCollection('financial_transactions');

      const teacher = await teachersCol.findOne({ id: teacherId });

      if (!teacher) {
        return handleCORS(NextResponse.json(
          { error: 'Teacher not found' },
          { status: 404 }
        ));
      }

      const transactionId = `SAL-${Date.now()}-${uuidv4().slice(0, 8)}`;

      const salaryTransaction = {
        id: uuidv4(),
        transaction_id: transactionId,
        branch_id: teacher.primary_branch_id,
        type: 'expense',
        category: 'salary',
        amount: body.amount || teacher.monthly_salary,
        date: new Date(),
        month: body.month,
        teacher_id: teacherId,
        teacher_name: teacher.name,
        remarks: body.remarks || `Salary payment for ${body.month}`,
        processed_by: authUser.id,
      };

      await financialTransactionsCol.insertOne(salaryTransaction);

      // Send email notification
      if (teacher.email) {
        await sendSalaryConfirmation(teacher, salaryTransaction);
      }

      return handleCORS(NextResponse.json(salaryTransaction));
    }

    // Dashboard
    if (route === '/dashboard' && method === 'GET') {
      const params = Object.fromEntries(new URL(request.url).searchParams);
      const branchId = params.branch_id;

      if (!branchId) {
        return handleCORS(NextResponse.json(
          { error: 'branch_id is required' },
          { status: 400 }
        ));
      }

      const studentsCol = await getCollection('students');
      const teachersCol = await getCollection('teachers');
      const classesCol = await getCollection('classes');
      const financialTransactionsCol = await getCollection('financial_transactions');

      // Get current month's date range
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const totalStudents = await studentsCol.countDocuments({ branch_id: branchId });
      const totalTeachers = await teachersCol.countDocuments({ 
        branch_ids: branchId 
      });

      // Students by class
      const classes = await classesCol.find({ branch_id: branchId }).sort({ order: 1 }).toArray();
      const studentsByClass = await Promise.all(
        classes.map(async (cls) => {
          const count = await studentsCol.countDocuments({
            branch_id: branchId,
            class_id: cls.id,
          });
          return {
            class_name: cls.name,
            count,
          };
        })
      );

      // Monthly income
      const monthlyIncome = await financialTransactionsCol
        .aggregate([
          {
            $match: {
              branch_id: branchId,
              type: 'income',
              date: { $gte: startOfMonth, $lte: endOfMonth },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' },
            },
          },
        ])
        .toArray();

      // Monthly expenses
      const monthlyExpenses = await financialTransactionsCol
        .aggregate([
          {
            $match: {
              branch_id: branchId,
              type: 'expense',
              date: { $gte: startOfMonth, $lte: endOfMonth },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' },
            },
          },
        ])
        .toArray();

      // Recent transactions
      const recentTransactions = await financialTransactionsCol
        .find({ branch_id: branchId })
        .sort({ date: -1 })
        .limit(10)
        .toArray();

      // Pending fees (students with negative balance)
      const pendingFees = await studentsCol
        .aggregate([
          {
            $match: {
              branch_id: branchId,
              running_balance: { $lt: 0 },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: { $abs: '$running_balance' } },
              count: { $sum: 1 },
            },
          },
        ])
        .toArray();

      return handleCORS(NextResponse.json({
        total_students: totalStudents,
        total_teachers: totalTeachers,
        students_by_class: studentsByClass,
        monthly_income: monthlyIncome[0]?.total || 0,
        monthly_expenses: monthlyExpenses[0]?.total || 0,
        pending_fees: pendingFees[0]?.total || 0,
        pending_fees_count: pendingFees[0]?.count || 0,
        recent_transactions: recentTransactions,
      }));
    }

    // Route not found
    return handleCORS(NextResponse.json(
      { error: `Route ${route} not found` },
      { status: 404 }
    ));

  } catch (error) {
    console.error('API Error:', error);
    return handleCORS(NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    ));
  }
}

// Export all HTTP methods
export const GET = handleRoute;
export const POST = handleRoute;
export const PUT = handleRoute;
export const DELETE = handleRoute;
export const PATCH = handleRoute;
