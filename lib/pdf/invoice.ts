import PDFDocument from "pdfkit";
import {
  isBengaliFontAvailable,
  isLogoAvailable,
  LOGO_PATH,
  NOTO_BENGALI_REGULAR,
  NOTO_BENGALI_BOLD,
} from "./fonts";
import { toMoney } from "@/lib/money";
import type { InvoiceStatus } from "@/validations";

export interface InvoiceLineItemData {
  feeType: string;
  label: string;
  amount: number;
  discount: number;
  net: number;
}

export interface InvoicePDFData {
  invoiceNumber: string;
  invoiceType: string;
  periodYear?: number | null;
  periodMonth?: number | null;
  createdAt: Date;
  dueDate?: Date;

  studentName: string;
  studentId: string;
  branch: string;
  className: string;

  lineItems: InvoiceLineItemData[];
  subtotal: number;
  totalDiscount: number;
  adjustmentAmount: number;
  netPayable: number;
  paidAmount: number;
  dueAmount: number;
  status: InvoiceStatus;
}

const MONTH_NAMES = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const STATUS_COLORS: Record<string, string> = {
  unpaid: "#dc2626",
  partial: "#d97706",
  paid: "#16a34a",
  void: "#6b7280",
};

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-BD", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export async function generateInvoicePDF(data: InvoicePDFData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const hasBengaliFont = isBengaliFontAvailable();
    const hasLogo = isLogoAvailable();

    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      info: {
        Title: `Invoice ${data.invoiceNumber}`,
        Author: "Daarunnazaat",
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    if (hasBengaliFont) {
      doc.registerFont("Bengali", NOTO_BENGALI_REGULAR);
      doc.registerFont("Bengali-Bold", NOTO_BENGALI_BOLD);
    }

    const W = 595 - 100; // A4 usable width with 50px margins
    const textFont = hasBengaliFont ? "Bengali" : "Helvetica";
    const boldFont = hasBengaliFont ? "Bengali-Bold" : "Helvetica-Bold";

    // ── Header ─────────────────────────────────────────────────────────────
    if (hasLogo) {
      doc.image(LOGO_PATH, 50, 40, { width: 60, height: 60 });
    }

    doc.font(boldFont).fontSize(16)
      .text("Daarunnazaat", hasLogo ? 120 : 50, 44);

    doc.font(textFont).fontSize(9).fillColor("#555555")
      .text(
        hasBengaliFont
          ? "দারুন্নাজাত মাদরাসা • ঢাকা, বাংলাদেশ"
          : "Daarunnazaat Madrasah • Dhaka, Bangladesh",
        hasLogo ? 120 : 50,
        63,
      );

    // Invoice title + status badge
    doc.font(boldFont).fontSize(20).fillColor("#1e293b")
      .text("INVOICE", 50, 44, { align: "right", width: W });

    const statusColor = STATUS_COLORS[data.status] ?? "#6b7280";
    doc.font(boldFont).fontSize(10).fillColor(statusColor)
      .text(data.status.toUpperCase(), 50, 70, { align: "right", width: W });

    doc.moveTo(50, 115).lineTo(50 + W, 115).strokeColor("#e2e8f0").lineWidth(1).stroke();

    // ── Invoice meta ───────────────────────────────────────────────────────
    let y = 128;

    doc.font(textFont).fontSize(9).fillColor("#64748b")
      .text("Invoice No.", 50, y).text("Issue Date", 200, y)
      .text("Due Date", 350, y);

    y += 13;
    doc.font(boldFont).fontSize(9).fillColor("#0f172a")
      .text(data.invoiceNumber, 50, y)
      .text(formatDate(data.createdAt), 200, y)
      .text(data.dueDate ? formatDate(data.dueDate) : "—", 350, y);

    y += 22;

    const periodStr = (data.periodYear && data.periodMonth)
      ? `${MONTH_NAMES[data.periodMonth]} ${data.periodYear}`
      : null;

    doc.font(textFont).fontSize(9).fillColor("#64748b")
      .text("Student", 50, y).text("Class / Branch", 200, y)
      .text("Type / Period", 350, y);

    y += 13;
    doc.font(boldFont).fontSize(9).fillColor("#0f172a")
      .text(data.studentName, 50, y, { width: 145 })
      .text(`${data.className} / ${data.branch}`, 200, y, { width: 145 })
      .text(periodStr ?? data.invoiceType.replace(/_/g, " "), 350, y);

    y += 30;
    doc.moveTo(50, y).lineTo(50 + W, y).strokeColor("#e2e8f0").stroke();
    y += 14;

    // ── Line items table ───────────────────────────────────────────────────
    doc.font(boldFont).fontSize(8).fillColor("#64748b")
      .text("#", 50, y, { width: 20 })
      .text("DESCRIPTION", 75, y, { width: 200 })
      .text("BASE AMOUNT", 280, y, { width: 100, align: "right" })
      .text("DISCOUNT", 385, y, { width: 80, align: "right" })
      .text("NET", 50 + W - 70, y, { width: 70, align: "right" });

    y += 12;
    doc.moveTo(50, y).lineTo(50 + W, y).strokeColor("#cbd5e1").stroke();
    y += 8;

    data.lineItems.forEach((item, i) => {
      doc.font(textFont).fontSize(9).fillColor("#0f172a")
        .text(String(i + 1), 50, y, { width: 20 })
        .text(item.label, 75, y, { width: 200 })
        .text(` ${toMoney(item.amount, "en")}`, 280, y, { width: 100, align: "right" })
        .text(item.discount > 0 ? ` ${toMoney(item.discount, "en")}` : "—", 385, y, {
          width: 80,
          align: "right",
        })
        .text(` ${toMoney(item.net, "en")}`, 50 + W - 70, y, { width: 70, align: "right" });
      y += 18;
    });

    y += 4;
    doc.moveTo(50, y).lineTo(50 + W, y).strokeColor("#e2e8f0").stroke();
    y += 12;

    // ── Totals ─────────────────────────────────────────────────────────────
    const col1 = 50 + W - 220;
    const col2 = 50 + W - 80;

    const addTotalRow = (
      label: string,
      amount: number,
      opts: { bold?: boolean; color?: string; size?: number } = {},
    ) => {
      const font = opts.bold ? boldFont : textFont;
      const color = opts.color ?? "#0f172a";
      const size = opts.size ?? 9;

      doc.font(font).fontSize(size).fillColor("#64748b")
        .text(label, col1, y, { width: 135, align: "right" });
      doc.font(font).fontSize(size).fillColor(color)
        .text(` ${toMoney(Math.abs(amount), "en")}${amount < 0 ? " CR" : ""}`, col2, y, {
          width: 80,
          align: "right",
        });
      y += 16;
    };

    addTotalRow("Subtotal", data.subtotal);
    if (data.totalDiscount > 0) addTotalRow("Discount", -data.totalDiscount, { color: "#16a34a" });
    if (data.adjustmentAmount !== 0) {
      addTotalRow(
        data.adjustmentAmount < 0 ? "Adjustment (Waiver)" : "Adjustment (Late Fee)",
        data.adjustmentAmount,
        { color: data.adjustmentAmount < 0 ? "#16a34a" : "#dc2626" },
      );
    }

    doc.moveTo(col1, y).lineTo(50 + W, y).strokeColor("#94a3b8").stroke();
    y += 8;

    addTotalRow("Net Payable", data.netPayable + data.adjustmentAmount, {
      bold: true,
      size: 10,
    });

    if (data.paidAmount > 0) {
      addTotalRow("Paid", -data.paidAmount, { color: "#16a34a" });

      doc.moveTo(col1, y).lineTo(50 + W, y).strokeColor("#94a3b8").stroke();
      y += 8;

      const dueColor = data.dueAmount > 0 ? "#dc2626" : "#16a34a";
      addTotalRow(
        data.dueAmount > 0 ? "Balance Due" : "Credit",
        data.dueAmount,
        { bold: true, color: dueColor, size: 11 },
      );
    }

    // ── Footer ─────────────────────────────────────────────────────────────
    doc.font(textFont).fontSize(8).fillColor("#94a3b8")
      .text(
        "This is a computer-generated invoice. No signature required.",
        50,
        doc.page.height - 55,
        { width: W, align: "center" },
      );

    doc.end();
  });
}
