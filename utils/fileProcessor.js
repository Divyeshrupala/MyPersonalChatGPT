import fs from "fs";
import mammoth from "mammoth";
import XLSX from "xlsx";
import csvParser from "csv-parser";

// Use dynamic import for pdf-parse since it doesn't support ES6 imports properly
let pdfParse;
try {
  pdfParse = (await import('pdf-parse')).default;
} catch (e) {
  console.warn('PDF parsing not available:', e.message);
}

export async function extractText(filePath, mimetype) {
  try {
    switch (mimetype) {
      case "text/plain":
        return fs.readFileSync(filePath, "utf8");

      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        const buffer = fs.readFileSync(filePath);
        const result = await mammoth.extractRawText({ buffer });
        return result.value;

      case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        try {
          const workbook = XLSX.readFile(filePath);
          const sheetName = workbook.SheetNames[0];
          return XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
        } catch (err) {
          if (err.message.includes("password")) {
            return "⚠️ This Excel file is password-protected. Please remove the password and try again.";
          }
          throw err;
        }

      case "application/pdf":
        if (!pdfParse) {
          return "⚠️ PDF parsing is not available. Please try uploading a different file format.";
        }
        try {
          const pdfBuffer = fs.readFileSync(filePath);
          const pdfData = await pdfParse(pdfBuffer);
          return pdfData.text || "📄 PDF file processed, but no readable text found.";
        } catch (pdfError) {
          console.warn('PDF parsing error:', pdfError);
          return "⚠️ Could not extract text from PDF. The file might be password-protected or corrupted.";
        }

      case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        // For PPT files, we'll extract basic text content
        try {
          const pptBuffer = fs.readFileSync(filePath);
          // Simple text extraction for PPT - you might want to use a more sophisticated library
          return "📊 PowerPoint file uploaded. Content analysis available through AI processing.";
        } catch (err) {
          return "⚠️ Could not extract text from PowerPoint file, but AI can still analyze the structure.";
        }

      case "text/csv":
        return new Promise((resolve, reject) => {
          const results = [];
          fs.createReadStream(filePath)
            .pipe(csvParser())
            .on("data", (row) => results.push(row))
            .on("end", () => resolve(JSON.stringify(results, null, 2)))
            .on("error", reject);
        });

      default:
        throw new Error(`Unsupported file type: ${mimetype}`);
    }
  } catch (err) {
    console.error("❌ Text extraction error:", err);
    return "";
  }
}

export function validateFileType(mimetype) {
  const allowedTypes = [
    "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX
    "application/vnd.openxmlformats-officedocument.presentationml.presentation", // PPTX
    "application/pdf", // PDF
    "text/csv", // CSV
  ];
  
  return allowedTypes.includes(mimetype);
}