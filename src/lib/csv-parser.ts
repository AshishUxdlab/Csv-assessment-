import Papa from "papaparse";
import type { CsvRow } from "@/store/csvSlice";

export interface ParseResult {
  rows: CsvRow[];
  columns: string[];
}

export function parseCsvFile(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete(results) {
        const columns = (results.meta.fields ?? []).filter(Boolean) as string[];
        const rows = results.data as CsvRow[];
        resolve({ rows, columns });
      },
      error(err: Error) {
        reject(err);
      },
    });
  });
}

export function parseCsvString(csv: string): ParseResult {
  const results = Papa.parse(csv, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });
  const columns = (results.meta.fields ?? []).filter(Boolean) as string[];
  const rows = results.data as CsvRow[];
  return { rows, columns };
}

export function exportToCsv(rows: CsvRow[], columns: string[]): string {
  return Papa.unparse(rows, { columns });
}
