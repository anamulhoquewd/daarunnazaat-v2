import PDFDocument from "pdfkit";
import { Model, FilterQuery } from "mongoose";

import path from "path";

const FONT_REGULAR = path.join(
  process.cwd(),
  "server/fonts/NotoSerifBengali-Regular.ttf",
);
const FONT_BOLD = path.join(
  process.cwd(),
  "server/fonts/NotoSerifBengali-Bold.ttf",
);
const FONT_EXTRABOLD = path.join(
  process.cwd(),
  "server/fonts/NotoSerifBengali-ExtraBold.ttf",
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

    const doc = new PDFDocument({
      margin: 0,
      size: "A4",
      autoFirstPage: true,
    });
    const buffers: Buffer[] = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    const pageWidth = doc.page.width - 80;
    const pageHeight = doc.page.height;
    const rowHeight = 32;
    const fontSize = 9;
    const colCount = columns.length + 1;
    const colWidth = pageWidth / colCount;

    // Row এর ভেতরে text vertically center করার জন্য
    const textY = (y: number) => y + 3; // + (rowHeight - fontSize) / 2;

    /* =========================
       HEADER
    ========================= */
    const drawHeader = () => {
      doc
        .font(FONT_EXTRABOLD)
        .fontSize(18)
        .fillColor("black")
        .text(madrasaName, 40, 40, { align: "center", width: pageWidth });

      doc
        .font(FONT_EXTRABOLD)
        .fontSize(11)
        .text(madrasaAddress, 40, doc.y + 4, {
          align: "center",
          width: pageWidth,
        });

      doc.moveDown(0.5);

      doc
        .moveTo(40, doc.y)
        .lineTo(doc.page.width - 40, doc.y)
        .lineWidth(1.5)
        .stroke("black");

      doc.moveDown(0.5);

      doc
        .font(FONT_EXTRABOLD)
        .fontSize(14)
        .fillColor("black")
        .text(title, 40, doc.y, {
          align: "center",
          width: pageWidth,
          underline: true,
        });

      doc.moveDown(0.3);

      doc
        .font(FONT_REGULAR)
        .fontSize(10)
        .fillColor("black")
        .text(`Total Records: ${data.length}`, 40, doc.y, {
          continued: true,
          width: pageWidth,
        })
        .text(`Date: ${new Date().toLocaleDateString("en-BD")}`, {
          align: "right",
        });

      doc.moveDown(0.5);
    };

    /* =========================
       TABLE HEADER ROW
    ========================= */
    const drawTableHeader = (y: number) => {
      doc.rect(40, y, pageWidth, rowHeight).fill("#1a1a2e");

      doc.fillColor("white").font(FONT_BOLD).fontSize(fontSize);

      doc.text("#", 44, textY(y), {
        width: colWidth - 8,
        align: "left",
        lineBreak: false,
      });

      columns.forEach((col, i) => {
        doc.text(col.label, 40 + colWidth * (i + 1) + 4, textY(y), {
          width: colWidth - 8,
          align: "left",
          lineBreak: false,
        });
      });
    };

    /* =========================
       FOOTER
    ========================= */
    const drawFooter = () => {
      const footerY = pageHeight - 40;

      doc
        .moveTo(40, footerY)
        .lineTo(doc.page.width - 40, footerY)
        .lineWidth(0.5)
        .stroke("#cccccc");

      doc
        .font(FONT_REGULAR)
        .fontSize(9)
        .fillColor("#666666")
        .text(madrasaName, 40, footerY + 8, {
          continued: true,
          width: pageWidth,
        })
        .text(`Printed: ${new Date().toLocaleString("en-BD")}`, {
          align: "right",
        });
    };

    /* =========================
       FIRST PAGE
    ========================= */
    drawHeader();

    let currentY = doc.y;
    drawTableHeader(currentY);
    currentY += rowHeight;

    /* =========================
       DATA ROWS
    ========================= */
    data.forEach((row, rowIndex) => {
      // Page শেষ হলে নতুন page
      if (currentY + rowHeight > pageHeight - 50) {
        drawFooter();
        doc.addPage();
        drawHeader();
        currentY = doc.y;
        drawTableHeader(currentY);
        currentY += rowHeight;
      }

      // Alternate row background
      doc
        .rect(40, currentY, pageWidth, rowHeight)
        .fill(rowIndex % 2 === 0 ? "#f5f5f5" : "white");

      // Row border
      doc
        .rect(40, currentY, pageWidth, rowHeight)
        .lineWidth(0.5)
        .stroke("#dddddd");

      doc.fillColor("black").font(FONT_REGULAR).fontSize(fontSize);

      // Serial number
      doc.text(String(rowIndex + 1), 44, textY(currentY), {
        width: colWidth - 8,
        align: "left",
        lineBreak: false,
      });

      // Data cells
      columns.forEach((col, colIndex) => {
        const val = col.key.split(".").reduce((obj: any, k) => obj?.[k], row);

        let displayVal = "-";
        if (val !== null && val !== undefined) {
          displayVal =
            val instanceof Date
              ? new Date(val).toLocaleDateString("en-BD")
              : String(val);
        }

        doc.text(
          displayVal,
          40 + colWidth * (colIndex + 1) + 4,
          textY(currentY),
          {
            width: colWidth - 8,
            align: "left",
            ellipsis: true,
            lineBreak: false,
          },
        );
      });

      currentY += rowHeight;
    });

    drawFooter();
    doc.end();
  });
}
