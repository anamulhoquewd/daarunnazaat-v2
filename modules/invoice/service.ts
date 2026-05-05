import { Invoice, type ILineItem } from "./schema";
import { Student } from "@/modules/student/schema";
import { nextNumber } from "@/modules/shared/numbering/service";
import { InvoiceStatus } from "@/validations";
import { schemaValidationError } from "@/server/error";
import {
  createInvoiceZ,
  bulkGenerateInvoicesZ,
  listInvoicesQueryZ,
  type ICreateInvoice,
  type IBulkGenerateInvoices,
  type IListInvoicesQuery,
} from "./validation";

function buildLineItemsForStudent(student: any): ILineItem[] {
  const items: ILineItem[] = [];

  items.push({
    feeType: "monthlyFee",
    label: "Monthly Fee",
    amount: student.monthlyFee,
    discount: 0,
    net: student.monthlyFee,
  });

  if (student.isResidential && student.residentialFee) {
    items.push({
      feeType: "residentialFee",
      label: "Residential Fee",
      amount: student.residentialFee,
      discount: 0,
      net: student.residentialFee,
    });
  }
  if (student.isMealIncluded && student.mealFee) {
    items.push({
      feeType: "mealFee",
      label: "Meal Fee",
      amount: student.mealFee,
      discount: 0,
      net: student.mealFee,
    });
  }
  if (student.needsCoaching && student.coachingFee) {
    items.push({
      feeType: "coachingFee",
      label: "Coaching Fee",
      amount: student.coachingFee,
      discount: 0,
      net: student.coachingFee,
    });
  }
  if (student.isDaycare && student.daycareFee) {
    items.push({
      feeType: "daycareFee",
      label: "Daycare Fee",
      amount: student.daycareFee,
      discount: 0,
      net: student.daycareFee,
    });
  }

  return items;
}

function recomputeTotals(lineItems: ILineItem[]) {
  const subtotal = lineItems.reduce((s, l) => s + l.amount, 0);
  const totalDiscount = lineItems.reduce((s, l) => s + l.discount, 0);
  const netPayable = subtotal - totalDiscount;
  return { subtotal, totalDiscount, netPayable };
}

export const createInvoice = async ({
  body,
  userId,
}: {
  body: ICreateInvoice;
  userId: string;
}) => {
  const parsed = createInvoiceZ.safeParse(body);
  if (!parsed.success) {
    return { error: schemaValidationError(parsed.error, "Invalid invoice data") };
  }
  const data = parsed.data;

  try {
    const student = await Student.findById(data.studentId).lean();
    if (!student || (student as any).isDeleted) {
      return { error: { message: "Student not found" } };
    }

    const now = new Date();
    const invoiceNumber = await nextNumber("DN-INV");

    const lineItems: ILineItem[] = data.lineItems.map((li) => ({
      feeType: li.feeType,
      label: li.label,
      amount: li.amount,
      discount: li.discount,
      net: li.amount - li.discount,
    }));
    const { subtotal, totalDiscount, netPayable } = recomputeTotals(lineItems);

    const invoice = await Invoice.create({
      invoiceNumber,
      studentId: data.studentId,
      sessionId: data.sessionId,
      branch: (student as any).branch,
      invoiceType: data.invoiceType,
      periodYear: data.periodYear ?? null,
      periodMonth: data.periodMonth ?? null,
      lineItems,
      subtotal,
      totalDiscount,
      netPayable,
      paidAmount: 0,
      dueAmount: netPayable,
      status: InvoiceStatus.UNPAID,
      isLocked: false,
      dueDate: data.dueDate,
      examId: data.examId,
      createdBy: userId,
      updatedBy: userId,
    });

    return { success: invoice };
  } catch (error: any) {
    if (error.code === 11000) {
      return { error: { message: "Invoice already exists for this student and period" } };
    }
    return {
      serverError: {
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? null : error.stack,
      },
    };
  }
};

export const generateMonthlyInvoices = async ({
  body,
  userId,
}: {
  body: IBulkGenerateInvoices;
  userId: string;
}) => {
  const parsed = bulkGenerateInvoicesZ.safeParse(body);
  if (!parsed.success) {
    return { error: schemaValidationError(parsed.error, "Invalid bulk generate parameters") };
  }
  const data = parsed.data;

  try {
    const studentFilter: any = {
      currentSessionId: data.sessionId,
      isDeleted: false,
      isActive: true,
    };
    if (data.branch) studentFilter.branch = data.branch;
    if (data.classId) studentFilter.classId = data.classId;

    const students = await Student.find(studentFilter).lean();

    if (data.dryRun) {
      return {
        success: {
          dryRun: true,
          eligible: students.length,
          message: `Would generate ${students.length} invoices for ${data.periodYear}-${String(data.periodMonth).padStart(2, "0")}`,
        },
      };
    }

    const now = new Date();
    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const student of students) {
      try {
        const lineItems = buildLineItemsForStudent(student);
        const { subtotal, totalDiscount, netPayable } = recomputeTotals(lineItems);
        const invoiceNumber = await nextNumber("DN-INV");

        await Invoice.create({
          invoiceNumber,
          studentId: student._id,
          sessionId: data.sessionId,
          branch: (student as any).branch,
          invoiceType: "monthly",
          periodYear: data.periodYear,
          periodMonth: data.periodMonth,
          lineItems,
          subtotal,
          totalDiscount,
          netPayable,
          paidAmount: 0,
          dueAmount: netPayable,
          status: InvoiceStatus.UNPAID,
          isLocked: false,
          createdBy: userId,
          updatedBy: userId,
        });
        created++;
      } catch (err: any) {
        if (err.code === 11000) {
          skipped++;
        } else {
          errors.push(`Student ${(student as any).studentId ?? student._id}: ${err.message}`);
        }
      }
    }

    return {
      success: {
        created,
        skipped,
        errors,
        message: `Created ${created} invoice(s), skipped ${skipped} (already existed)`,
      },
    };
  } catch (error: any) {
    return {
      serverError: {
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? null : error.stack,
      },
    };
  }
};

export const generateAdmissionInvoice = async ({
  studentId,
  sessionId,
  admissionFee,
  userId,
}: {
  studentId: string;
  sessionId: string;
  admissionFee: number; // paisa
  userId: string;
}) => {
  try {
    const student = await Student.findById(studentId).lean();
    if (!student) return { error: { message: "Student not found" } };

    const now = new Date();
    const invoiceNumber = await nextNumber("DN-INV");

    const lineItems: ILineItem[] = [
      {
        feeType: "admissionFee",
        label: "Admission Fee",
        amount: admissionFee,
        discount: 0,
        net: admissionFee,
      },
    ];

    const invoice = await Invoice.create({
      invoiceNumber,
      studentId,
      sessionId,
      branch: (student as any).branch,
      invoiceType: "admission",
      periodYear: null,
      periodMonth: null,
      lineItems,
      subtotal: admissionFee,
      totalDiscount: 0,
      netPayable: admissionFee,
      paidAmount: 0,
      dueAmount: admissionFee,
      status: InvoiceStatus.UNPAID,
      isLocked: false,
      createdBy: userId,
      updatedBy: userId,
    });

    return { success: invoice };
  } catch (error: any) {
    return {
      serverError: {
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? null : error.stack,
      },
    };
  }
};

export const voidInvoice = async ({
  invoiceId,
  userId,
  reason,
}: {
  invoiceId: string;
  userId: string;
  reason: string;
}) => {
  try {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice || invoice.isDeleted) {
      return { error: { message: "Invoice not found" } };
    }
    if (invoice.status === InvoiceStatus.VOID) {
      return { error: { message: "Invoice is already voided" } };
    }
    if (invoice.paidAmount > 0) {
      return {
        error: {
          message: "Cannot void an invoice that has payments. Undo the payments first.",
        },
      };
    }

    await Invoice.findByIdAndUpdate(invoiceId, {
      $set: {
        status: InvoiceStatus.VOID,
        voidedAt: new Date(),
        voidReason: reason,
        voidedBy: userId,
        updatedBy: userId,
      },
    });

    return { success: { message: "Invoice voided successfully" } };
  } catch (error: any) {
    return { serverError: { message: error.message } };
  }
};

export const listInvoices = async (rawQuery: Record<string, unknown>) => {
  const parsed = listInvoicesQueryZ.safeParse(rawQuery);
  if (!parsed.success) {
    return { error: schemaValidationError(parsed.error, "Invalid query parameters") };
  }
  const q = parsed.data;

  try {
    const filter: any = { isDeleted: false };
    if (q.studentId) filter.studentId = q.studentId;
    if (q.sessionId) filter.sessionId = q.sessionId;
    if (q.branch) filter.branch = q.branch;
    if (q.status) filter.status = q.status;
    if (q.periodYear != null) filter.periodYear = q.periodYear;
    if (q.periodMonth != null) filter.periodMonth = q.periodMonth;

    const skip = (q.page - 1) * q.limit;

    const [data, total] = await Promise.all([
      Invoice.find(filter).sort({ createdAt: -1 }).skip(skip).limit(q.limit).lean(),
      Invoice.countDocuments(filter),
    ]);

    return {
      success: {
        data,
        page: q.page,
        limit: q.limit,
        total,
        totalPages: Math.ceil(total / q.limit),
      },
    };
  } catch (error: any) {
    return { serverError: { message: error.message } };
  }
};

export const getInvoice = async (invoiceId: string) => {
  try {
    const invoice = await Invoice.findOne({ _id: invoiceId, isDeleted: false }).lean();
    if (!invoice) return { error: { message: "Invoice not found" } };
    return { success: invoice };
  } catch (error: any) {
    return { serverError: { message: error.message } };
  }
};
