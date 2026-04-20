import { google } from "googleapis";
import { Model, FilterQuery } from "mongoose";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID!;
const SHEET_NAME = process.env.GOOGLE_SHEET_NAME ?? "Students";

async function getSheetClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, "../config/credentials.json"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

async function ensureSheetExists(sheets: any, sheetName: string) {
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });

  const existingSheets = spreadsheet.data.sheets?.map(
    (s: any) => s.properties?.title,
  );

  if (!existingSheets?.includes(sheetName)) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: { title: sheetName },
            },
          },
        ],
      },
    });
  }
}

export const exportCollection = async <T>(
  Model: Model<T>,
  filter: FilterQuery<T> = {},
  projection: Record<string, 0 | 1> = {},
  sheetName: string = SHEET_NAME,
  pipeline: any[] = [],
) => {
  try {
    if (!SPREADSHEET_ID) {
      return {
        error: {
          message: "GOOGLE_SHEET_ID is not set in environment variables",
        },
      };
    }

    // pipeline.push({ $match: filter });
    // আগে $match করো, তারপর বাকি pipeline
    if (Object.keys(filter).length > 0) {
      pipeline.unshift({ $match: filter }); // ← push এর বদলে unshift
    }
    const data =
      Object.keys(projection).length > 0
        ? await Model.aggregate(pipeline).project(projection)
        : await Model.aggregate(pipeline);

    if (!data.length) {
      return {
        error: {
          message: "No data found for the given filter criteria",
        },
      };
    }

    const headers = Object.keys(data[0] as object).filter(
      (key) => key !== "__v",
    );

    const rows = data.map((doc) =>
      headers.map((key) => {
        const val = (doc as Record<string, unknown>)[key];
        if (val === null || val === undefined) return "";
        if (val instanceof Date) return val.toISOString();
        if (typeof val === "object") return JSON.stringify(val);
        return String(val);
      }),
    );

    const sheets = await getSheetClient();
    const range = `${sheetName}!A1`;

    await ensureSheetExists(sheets, sheetName);

    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range,
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueInputOption: "RAW",
      requestBody: {
        values: [headers, ...rows],
      },
    });

    return {
      success: {
        success: true,
        message: `${data.length} records exported successfully to Google Sheets`,
        data: {
          data,
          exported: data.length,
          sheet: SPREADSHEET_ID,
          sheetName,
          url: `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit#gid=0`,
        },
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
