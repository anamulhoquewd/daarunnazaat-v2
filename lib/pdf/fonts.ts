import path from "path";
import fs from "fs";

export const FONTS_DIR = path.join(process.cwd(), "public", "fonts");
export const LOGO_PATH = path.join(process.cwd(), "public", "logo.jpg");

export const NOTO_BENGALI_REGULAR = path.join(FONTS_DIR, "NotoSansBengali-Regular.ttf");
export const NOTO_BENGALI_BOLD = path.join(FONTS_DIR, "NotoSansBengali-Bold.ttf");

export function isBengaliFontAvailable(): boolean {
  return fs.existsSync(NOTO_BENGALI_REGULAR);
}

export function isLogoAvailable(): boolean {
  return fs.existsSync(LOGO_PATH);
}

/**
 * Run once to download Noto Sans Bengali fonts into public/fonts/.
 * Usage: npx tsx scripts/download-fonts.ts
 */
export async function downloadBengaliFonts(): Promise<void> {
  const https = await import("https");
  const fsPromises = await import("fs/promises");

  await fsPromises.mkdir(FONTS_DIR, { recursive: true });

  const urls = [
    {
      url: "https://fonts.gstatic.com/s/notosansbengali/v21/Cn-SJsCGWQxOjaGwMQ6fIiMywrNJIky6nvd8BjzVMvJx2mcSPVFpVEqE-6KmsolKyMrhd_Tgw3LCDvI0Sg.ttf",
      dest: NOTO_BENGALI_REGULAR,
      name: "NotoSansBengali-Regular.ttf",
    },
    {
      url: "https://fonts.gstatic.com/s/notosansbengali/v21/Cn-SJsCGWQxOjaGwMQ6fIiMywrNJIky6nvd8BjzVMvJx2mcSPVFpVEqE-6KmsolKyMrhd_Tgw3LCDvI0Sg.ttf",
      dest: NOTO_BENGALI_BOLD,
      name: "NotoSansBengali-Bold.ttf",
    },
  ];

  for (const { url, dest, name } of urls) {
    if (fs.existsSync(dest)) {
      console.log(`${name} already exists, skipping.`);
      continue;
    }
    console.log(`Downloading ${name}…`);
    await new Promise<void>((resolve, reject) => {
      const file = fs.createWriteStream(dest);
      https.get(url, (res) => {
        res.pipe(file);
        file.on("finish", () => { file.close(); resolve(); });
      }).on("error", (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
    });
    console.log(`${name} saved to ${dest}`);
  }
}
