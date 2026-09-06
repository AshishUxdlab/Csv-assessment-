import { CsvController } from "@/controllers/csvController";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return CsvController.updateRow(request, id);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return CsvController.deleteRow(id);
}
