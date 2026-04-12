import PDFDocument from "pdfkit";
import { Model, FilterQuery } from "mongoose";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const FONT_REGULAR = path.join(
  process.cwd(),
  "server/fonts/NotoSerifBengali-Regular.ttf",
);
const FONT_BOLD = path.join(
  process.cwd(),
  "server/fonts/NotoSerifBengali-Bold.ttf",
);

interface PDFOptions {
  title: string;
  madrasaName?: string;
  madrasaAddress?: string;
  columns: { key: string; label: string }[];
}

export const generateTablePDF = async <T>(
  Model: Model<T>,
  filter: FilterQuery<T> = {},
  pipeline: any[] = [],
  options: PDFOptions,
) => {
  try {
    const data =
      pipeline.length > 0
        ? await Model.aggregate(pipeline)
        : await Model.find(filter).lean();

    if (!data.length) {
      return {
        error: { message: "No data found for the given filter criteria" },
      };
    }

    const pdf = await buildPDF(data, options);

    return {
      success: {
        success: true,
        message: `PDF generated with ${data.length} records`,
        pdf,
      },
    };
  } catch (error: any) {
    return {
      serverError: {
        success: false,
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? null : error.stack,
      },
    };
  }
};

function buildPDF(data: any[], options: PDFOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const {
      title,
      madrasaName = "দারুন নাজাত আদর্শ বালিকা মাদরাসা",
      madrasaAddress = "কাওলার, জমিদার বাড়ী, দক্ষিণখান, ঢাকা-১২২৯",
      columns,
    } = options;

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const buffers: Buffer[] = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    const pageWidth = doc.page.width - 80; // margin বাদে

    /* =========================
       HEADER
    ========================= */
    doc.fontSize(18).font(FONT_BOLD).text(madrasaName, { align: "center" });

    doc
      .fontSize(11)
      .font(FONT_REGULAR)
      .text(madrasaAddress, { align: "center" });

    doc.moveDown(0.5);

    // divider
    doc
      .moveTo(40, doc.y)
      .lineTo(doc.page.width - 40, doc.y)
      .lineWidth(1.5)
      .stroke();

    doc.moveDown(0.5);

    /* =========================
       TITLE
    ========================= */
    doc
      .fontSize(14)
      .font(FONT_BOLD)
      .text(title, { align: "center", underline: true });

    doc.moveDown(0.3);

    // meta
    doc
      .fontSize(10)
      .font(FONT_REGULAR)
      .text(`Total Records: ${data.length}`, 40, doc.y, { continued: true })
      .text(`Date: ${new Date().toLocaleDateString("en-BD")}`, {
        align: "right",
      });

    doc.moveDown(0.5);

    /* =========================
       TABLE
    ========================= */
    const colCount = columns.length + 1; // +1 for serial
    const colWidth = pageWidth / colCount;
    const rowHeight = 24;
    const tableTop = doc.y;

    // Header row background
    doc.rect(40, tableTop, pageWidth, rowHeight).fill("#1a1a2e");

    // Header text
    doc.fillColor("white").fontSize(10).font(FONT_BOLD);

    doc.text("NO", 40 + 4, tableTop + 7, { width: colWidth, align: "left" });

    columns.forEach((col, i) => {
      doc.text(col.label, 40 + colWidth * (i + 1) + 4, tableTop + 7, {
        width: colWidth,
        align: "left",
      });
    });

    // Data rows
    doc.font(FONT_REGULAR).fontSize(9);

    data.forEach((row, rowIndex) => {
      const y = tableTop + rowHeight * (rowIndex + 1);

      // Alternate row color
      if (rowIndex % 2 === 0) {
        doc.rect(40, y, pageWidth, rowHeight).fill("#f5f5f5");
      } else {
        doc.rect(40, y, pageWidth, rowHeight).fill("white");
      }

      // Row border
      doc.rect(40, y, pageWidth, rowHeight).stroke("#dddddd");

      doc.fillColor("black");

      // Serial number
      doc.text(String(rowIndex + 1), 40 + 4, y + 7, {
        width: colWidth,
        align: "left",
      });

      // Data cells
      columns.forEach((col, colIndex) => {
        const val = col.key.split(".").reduce((obj: any, k) => obj?.[k], row);

        let displayVal = "-";
        if (val !== null && val !== undefined) {
          if (val instanceof Date) {
            displayVal = new Date(val).toLocaleDateString("en-BD");
          } else {
            displayVal = String(val);
          }
        }

        doc.text(displayVal, 40 + colWidth * (colIndex + 1) + 4, y + 7, {
          width: colWidth - 8,
          align: "left",
          ellipsis: true,
        });
      });
    });

    /* =========================
       FOOTER
    ========================= */
    const footerY = tableTop + rowHeight * (data.length + 1) + 20;

    doc
      .moveTo(40, footerY)
      .lineTo(doc.page.width - 40, footerY)
      .lineWidth(0.5)
      .stroke("#cccccc");

    doc
      .fontSize(9)
      .fillColor("#666666")
      .text(madrasaName, 40, footerY + 8, { continued: true })
      .text(`Printed: ${new Date().toLocaleString("en-BD")}`, {
        align: "right",
      });

    doc.end();
  });
}
