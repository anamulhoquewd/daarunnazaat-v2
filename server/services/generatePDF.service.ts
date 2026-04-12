import { FilterQuery, Model } from "mongoose";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

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

    const html = buildHTML(data, options);
    const pdf = await htmlToPDF(html);

    return {
      success: {
        success: true,
        message: `PDF generated with ${data.length} records`,
        pdf, // ← Buffer
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

function buildHTML(data: any[], options: PDFOptions) {
  const {
    title,
    madrasaName = "দারুন নাজাত মাদরাসা",
    madrasaAddress = "কাওলার, দক্ষিণখান, ঢাকা-১২২৯",
    columns,
  } = options;

  const tableHeaders = columns.map((col) => `<th>${col.label}</th>`).join("");

  const tableRows = data
    .map(
      (doc, index) => `
        <tr>
          <td>${index + 1}</td>
          ${columns
            .map((col) => {
              const val = col.key.split(".").reduce((obj, k) => obj?.[k], doc);
              if (val === null || val === undefined) return "<td>-</td>";
              if (val instanceof Date)
                return `<td>${new Date(val).toLocaleDateString("bn-BD")}</td>`;
              return `<td>${val}</td>`;
            })
            .join("")}
        </tr>
      `,
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="bn">
    <head>
      <meta charset="UTF-8"/>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          font-family: 'Noto Serif Bengali', serif;
          font-size: 12px;
          color: #000;
          padding: 24px;
        }

        .header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 2px solid #000;
          padding-bottom: 12px;
        }

        .header h1 {
          font-size: 22px;
          font-weight: bold;
          margin-bottom: 4px;
        }

        .header p {
          font-size: 13px;
          color: #444;
        }

        .document-title {
          text-align: center;
          font-size: 16px;
          font-weight: bold;
          margin: 16px 0;
          text-decoration: underline;
        }

        .meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-size: 11px;
          color: #555;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
        }

        th {
          background-color: #1a1a2e;
          color: #fff;
          padding: 8px 10px;
          text-align: left;
          font-size: 11px;
        }

        td {
          padding: 7px 10px;
          border-bottom: 1px solid #ddd;
          font-size: 11px;
        }

        tr:nth-child(even) td {
          background-color: #f5f5f5;
        }

        .footer {
          margin-top: 24px;
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #555;
          border-top: 1px solid #ccc;
          padding-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${madrasaName}</h1>
        <p>${madrasaAddress}</p>
      </div>

      <div class="document-title">${title}</div>

      <div class="meta">
        <span>মোট রেকর্ড: ${data.length}</span>
        <span>তারিখ: ${new Date().toLocaleDateString("bn-BD")}</span>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            ${tableHeaders}
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>

      <div class="footer">
        <span>দারুননাজাত মাদ্রাসা</span>
        <span>Printed: ${new Date().toLocaleString("bn-BD")}</span>
      </div>
    </body>
    </html>
  `;
}

async function htmlToPDF(html: string): Promise<Buffer> {
  const isProduction = process.env.NODE_ENV === "production";

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 1280, height: 720 },
    executablePath: isProduction
      ? await chromium.executablePath()
      : process.platform === "win32"
        ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
        : "/usr/bin/google-chrome",
    headless: true,
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
  });

  await browser.close();
  return Buffer.from(pdf);
}