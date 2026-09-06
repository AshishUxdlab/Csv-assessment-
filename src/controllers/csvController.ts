import { NextResponse } from "next/server";
import { CsvModel } from "@/models/csvModel";
import { parseCsvString } from "@/lib/csv-parser";

const SAMPLE_CSV = `audit_id,date,store_id,store_name,store_format,city,region,brand,product_name,variant,size_ml,price_inr,shelf_level,shelf_position,facing_count,total_brand_facings,total_category_facings,share_of_shelf_pct,in_stock,on_promotion,promo_type,discount_pct,competitor_brand,competitor_facings,auditor_name,notes,image_url
AUD00001,2024-02-25,STR8262,Metro Cash & Carry,Hypermarket,Mumbai,West,Pantene,Pantene Anti-Dandruff Shampoo,Smooth & Silky,650,420,Eye Level,Left,13,54,120,45.0,true,false,BOGO,10,Sunsilk,20,Auditor_1,Promo display near entrance,https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d
AUD00002,2024-07-07,STR8992,Wellness Forever,Pharmacy,Delhi,North,Head & Shoulders,Head & Shoulders Smooth & Silky,Clean & Balanced,340,310,Bottom,Center,9,32,95,33.7,true,true,Discount,15,L'Oreal,18,Auditor_2,Stock well maintained,https://images.unsplash.com/photo-1526947425960-945c6e72858f
AUD00003,2024-02-04,STR2441,BigBazaar,Hypermarket,Bangalore,South,Sunsilk,Sunsilk Hairfall Solution,Shine & Strength,180,180,Top,Right,4,22,80,27.5,false,false,None,0,Dove,25,Auditor_3,Out of stock reported,https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d
AUD00004,2024-07-30,STR8413,Booker,Wholesale,Kolkata,East,Tresemme,Tresemme Keratin Smooth,Keratin Smooth,500,490,Eye Level,Center,15,60,130,46.2,true,true,Price Off,20,Pantene,30,Auditor_4,Top seller shelf,https://images.unsplash.com/photo-1526947425960-945c6e72858f
AUD00005,2024-06-09,STR5807,D-Mart,Supermarket,Chennai,South,Garnier,Garnier Fructis Long & Strong,Long & Strong,340,290,Middle,Left,8,30,90,33.3,true,false,None,0,Head & Shoulders,22,Auditor_5,Normal stock,https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d
`;

export class CsvController {
  /**
   * GET /api/csv/data
   * Controller to fetch columns and rows. Auto-seeds sample data if MySQL is empty.
   */
  static async getCsvData() {
    try {
      let columns = await CsvModel.getMetadata();
      let rows = await CsvModel.getAllRows();

      // Auto-seed sample CSV data if database is empty
      if (columns.length === 0 && rows.length === 0) {
        const parsed = parseCsvString(SAMPLE_CSV);
        const seeded = await CsvModel.seedDataset(parsed.columns, parsed.rows);
        columns = seeded.columns;
        rows = seeded.rows;
      }

      return NextResponse.json({ success: true, columns, rows });
    } catch (error: any) {
      console.error("CsvController.getCsvData error:", error);
      return NextResponse.json(
        { success: false, error: error.message || "Failed to fetch data from database" },
        { status: 500 }
      );
    }
  }

  /**
   * POST /api/csv/upload
   * Controller to handle CSV dataset upload and MySQL overwrite.
   */
  static async uploadCsvData(request: Request) {
    try {
      const { rows, columns } = await request.json();

      if (!Array.isArray(columns) || !Array.isArray(rows)) {
        return NextResponse.json(
          { success: false, error: "Invalid payload. Expected rows and columns arrays." },
          { status: 400 }
        );
      }

      const result = await CsvModel.uploadDataset(columns, rows);
      return NextResponse.json({
        success: true,
        columns: result.columns,
        rows: result.rows,
      });
    } catch (error: any) {
      console.error("CsvController.uploadCsvData error:", error);
      return NextResponse.json(
        { success: false, error: error.message || "Failed to upload CSV dataset" },
        { status: 500 }
      );
    }
  }

  /**
   * POST /api/csv/rows
   * Controller to create a new single row in MySQL.
   */
  static async createRow(request: Request) {
    try {
      const rowData = await request.json();
      if (!rowData || typeof rowData !== "object") {
        return NextResponse.json(
          { success: false, error: "Invalid row data payload" },
          { status: 400 }
        );
      }

      const createdRow = await CsvModel.createRow(rowData);
      return NextResponse.json({ success: true, row: createdRow });
    } catch (error: any) {
      console.error("CsvController.createRow error:", error);
      return NextResponse.json(
        { success: false, error: error.message || "Failed to create row" },
        { status: 500 }
      );
    }
  }

  /**
   * PUT /api/csv/rows/[id]
   * Controller to update a single row in MySQL.
   */
  static async updateRow(request: Request, id: string) {
    try {
      if (!id) {
        return NextResponse.json(
          { success: false, error: "Row ID is required" },
          { status: 400 }
        );
      }

      const rowData = await request.json();
      const updatedRow = await CsvModel.updateRow(id, rowData);

      return NextResponse.json({ success: true, row: updatedRow });
    } catch (error: any) {
      console.error("CsvController.updateRow error:", error);
      return NextResponse.json(
        { success: false, error: error.message || "Failed to update row" },
        { status: 500 }
      );
    }
  }

  /**
   * DELETE /api/csv/rows/[id]
   * Controller to delete a single row from MySQL.
   */
  static async deleteRow(id: string) {
    try {
      if (!id) {
        return NextResponse.json(
          { success: false, error: "Row ID is required" },
          { status: 400 }
        );
      }

      await CsvModel.deleteRow(id);
      return NextResponse.json({ success: true, id });
    } catch (error: any) {
      console.error("CsvController.deleteRow error:", error);
      return NextResponse.json(
        { success: false, error: error.message || "Failed to delete row" },
        { status: 500 }
      );
    }
  }

  /**
   * DELETE /api/csv/data
   * Controller to clear all data in MySQL.
   */
  static async clearCsvData() {
    try {
      await CsvModel.deleteAll();
      return NextResponse.json({ success: true, message: "Database cleared successfully" });
    } catch (error: any) {
      console.error("CsvController.clearCsvData error:", error);
      return NextResponse.json(
        { success: false, error: error.message || "Failed to clear database" },
        { status: 500 }
      );
    }
  }
}
