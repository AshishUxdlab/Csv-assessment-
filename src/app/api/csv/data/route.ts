import { CsvController } from "@/controllers/csvController";

export async function GET() {
  return CsvController.getCsvData();
}

export async function DELETE() {
  return CsvController.clearCsvData();
}
