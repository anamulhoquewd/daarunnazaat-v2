import PDFDocument from "pdfkit";
import {
  isBengaliFontAvailable,
  isLogoAvailable,
  LOGO_PATH,
  NOTO_BENGALI_REGULAR,
  NOTO_BENGALI_BOLD,
} from "./fonts";
import { toMoney } from "@/lib/money";

export interface ReceiptAllocation {
  invoiceNumber: string;
  invoiceType: string;
  periodYear?: number | null;
  periodMonth?: number | null;
  allocatedAmount: number; // paisa
}

export interface ReceiptData {
  receiptNumber: string;
  paymentDate: Date;
  studentName: string;
  studentId: string;
  branch: string;
  paymentMethod: string;
  totalPaid: number;         // paisa
  allocations: ReceiptAllocation[];
  unallocatedAmount: number; // paisa — added to credit balance
  notes?: string;
  collectedBy?: string;
}

const MONTH_NAMES = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatPeriod(year?: number | null, month?: number | null): string {
  if (!year || !month) return "";
  return `${MONTH_NAMES[month]} ${year}`;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-BD", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export async function generateReceiptPDF(data: ReceiptData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const hasBengaliFont = isBengaliFontAvailable();
    const hasLogo = isLogoAvailable();

    const doc = new PDFDocument({
      size: [595, 420], // A5 landscape-ish
      margin: 40,
      info: {
        Title: `Receipt ${data.receiptNumber}`,
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

    const W = 595 - 80; // usable width
    const textFont = hasBengaliFont ? "Bengali" : "Helvetica";
    const boldFont = hasBengaliFont ? "Bengali-Bold" : "Helvetica-Bold";

    // ── Header ─────────────────────────────────────────────────────────────
    if (hasLogo) {
      doc.image(LOGO_PATH, 40, 30, { width: 55, height: 55 });
    }

    doc
      .font(boldFont)
      .fontSize(14)
      .text("Daarunnazaat", hasLogo ? 105 : 40, 32, { align: hasLogo ? "left" : "center" });

    doc
      .font(textFont)
      .fontSize(9)
      .text(hasBengaliFont ? "দারুন্নাজাত মাদরাসা, ঢাকা" : "Islamic Madrasah", hasLogo ? 105 : 40, 50, {
        align: hasLogo ? "left" : "center",
      });

    doc
      .font(boldFont)
      .fontSize(11)
      .text("FEE RECEIPT", 40, 32, { align: "right", width: W });

    doc.moveTo(40, 95).lineTo(40 + W, 95).strokeColor("#cccccc").stroke();

    // ── Receipt meta ───────────────────────────────────────────────────────
    let y = 108;

    doc.font(textFont).fontSize(9).fillColor("#666666")
      .text("Receipt No.", 40, y).text("Date", 200, y)
      .text("Payment Method", 360, y);

    y += 13;
    doc.font(boldFont).fontSize(9).fillColor("#000000")
      .text(data.receiptNumber, 40, y)
      .text(formatDate(data.paymentDate), 200, y)
      .text(data.paymentMethod.replace(/_/g, " ").toUpperCase(), 360, y);

    y += 20;
    doc.font(textFont).fontSize(9).fillColor("#666666")
      .text("Student", 40, y).text("Student ID", 200, y).text("Branch", 360, y);

    y += 13;
    doc.font(boldFont).fontSize(9).fillColor("#000000")
      .text(data.studentName, 40, y, { width: 155 })
      .text(data.studentId, 200, y)
      .text(data.branch, 360, y);

    y += 28;
    doc.moveTo(40, y).lineTo(40 + W, y).strokeColor("#e0e0e0").stroke();
    y += 10;

    // ── Allocations table ──────────────────────────────────────────────────
    doc.font(boldFont).fontSize(8).fillColor("#555555")
      .text("INVOICE", 40, y, { width: 120 })
      .text("TYPE / PERIOD", 165, y, { width: 130 })
      .text("AMOUNT", 40 + W - 80, y, { width: 80, align: "right" });

    y += 14;
    doc.moveTo(40, y).lineTo(40 + W, y).strokeColor("#cccccc").stroke();
    y += 6;

    for (const alloc of data.allocations) {
      const period = formatPeriod(alloc.periodYear, alloc.periodMonth);
      const typeLabel = alloc.invoiceType.replace(/_/g, " ");
      const desc = period ? `${typeLabel} — ${period}` : typeLabel;

      doc.font(textFont).fontSize(8).fillColor("#000000")
        .text(alloc.invoiceNumber, 40, y, { width: 120 })
        .text(desc, 165, y, { width: 130 })
        .text(` ${toMoney(alloc.allocatedAmount, "en")}`, 40 + W - 80, y, {
          width: 80,
          align: "right",
        });
      y += 16;
    }

    if (data.unallocatedAmount > 0) {
      doc.font(textFont).fontSize(8).fillColor("#666666")
        .text("— Added to Credit Balance —", 40, y, { width: 250 })
        .text(` ${toMoney(data.unallocatedAmount, "en")}`, 40 + W - 80, y, {
          width: 80,
          align: "right",
        });
      y += 16;
    }

    y += 4;
    doc.moveTo(40, y).lineTo(40 + W, y).strokeColor("#cccccc").stroke();
    y += 10;

    // ── Total ─────────────────────────────────────────────────────────────
    doc.font(boldFont).fontSize(11).fillColor("#000000")
      .text("TOTAL PAID", 40 + W - 200, y, { width: 115, align: "right" })
      .text(` ${toMoney(data.totalPaid, "en")}`, 40 + W - 80, y, {
        width: 80,
        align: "right",
      });

    y += 30;

    // ── Notes & signature ─────────────────────────────────────────────────
    if (data.notes) {
      doc.font(textFont).fontSize(8).fillColor("#666666")
        .text(`Note: ${data.notes}`, 40, y, { width: W / 2 });
    }

    doc.font(textFont).fontSize(8).fillColor("#666666")
      .text(data.collectedBy ? `Collected by: ${data.collectedBy}` : "Authorised Signature", 40 + W - 150, y, {
        width: 150,
        align: "right",
      });

    doc.end();
  });
}
