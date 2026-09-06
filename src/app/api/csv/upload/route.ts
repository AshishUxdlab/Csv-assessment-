import { CsvController } from "@/controllers/csvController";

export async function POST(request: Request) {
  return CsvController.uploadCsvData(request);
}
