import { pool, initDatabase } from "@/lib/db";
import crypto from "crypto";

export interface CsvRowRecord {
  id: string;
  data: Record<string, string>;
}

export class CsvModel {
  /**
   * Ensure database and tables exist
   */
  static async initSchema() {
    await initDatabase();
  }

  /**
   * Get column metadata from MySQL
   */
  static async getMetadata(): Promise<string[]> {
    await this.initSchema();
    const connection = await pool.getConnection();

    try {
      const [rows] = await connection.query<any[]>(
        "SELECT columns FROM csv_metadata WHERE id = 1 LIMIT 1;"
      );
      if (rows.length > 0 && rows[0].columns) {
        return typeof rows[0].columns === "string"
          ? JSON.parse(rows[0].columns)
          : rows[0].columns;
      }
      return [];
    } finally {
      connection.release();
    }
  }

  /**
   * Get all rows from MySQL
   */
  static async getAllRows(): Promise<Record<string, string>[]> {
    await this.initSchema();
    const connection = await pool.getConnection();

    try {
      const [rows] = await connection.query<any[]>(
        "SELECT id, data FROM csv_rows ORDER BY created_at ASC;"
      );

      return rows.map((r) => {
        const parsed = typeof r.data === "string" ? JSON.parse(r.data) : r.data;
        return { ...parsed, __row_id__: r.id };
      });
    } finally {
      connection.release();
    }
  }

  /**
   * Seed sample CSV data into MySQL if empty
   */
  static async seedDataset(columns: string[], rows: Record<string, string>[]): Promise<{ columns: string[]; rows: Record<string, string>[] }> {
    await this.initSchema();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Insert Metadata
      await connection.query(
        "INSERT INTO csv_metadata (id, columns) VALUES (1, ?) ON DUPLICATE KEY UPDATE columns = VALUES(columns);",
        [JSON.stringify(columns)]
      );

      // Insert Rows
      const savedRows = [];
      for (const row of rows) {
        const cleanRow = { ...row };
        const rowId = cleanRow["__row_id__"] || crypto.randomUUID();
        delete cleanRow["__row_id__"];

        await connection.query(
          "INSERT INTO csv_rows (id, data) VALUES (?, ?);",
          [rowId, JSON.stringify(cleanRow)]
        );
        savedRows.push({ ...cleanRow, __row_id__: rowId });
      }

      await connection.commit();
      return { columns, rows: savedRows };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  /**
   * Overwrite full CSV dataset in MySQL
   */
  static async uploadDataset(columns: string[], rows: Record<string, string>[]): Promise<{ columns: string[]; rows: Record<string, string>[] }> {
    await this.initSchema();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      await connection.query("DELETE FROM csv_rows;");
      await connection.query("DELETE FROM csv_metadata;");

      const cleanColumns = columns.filter((c) => c !== "__row_id__");
      await connection.query(
        "INSERT INTO csv_metadata (id, columns) VALUES (1, ?);",
        [JSON.stringify(cleanColumns)]
      );

      const savedRows = [];
      for (const row of rows) {
        const cleanRow = { ...row };
        const rowId = cleanRow["__row_id__"] || crypto.randomUUID();
        delete cleanRow["__row_id__"];

        await connection.query(
          "INSERT INTO csv_rows (id, data) VALUES (?, ?);",
          [rowId, JSON.stringify(cleanRow)]
        );
        savedRows.push({ ...cleanRow, __row_id__: rowId });
      }

      await connection.commit();
      return { columns: cleanColumns, rows: savedRows };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  /**
   * Insert a new single row in MySQL
   */
  static async createRow(rowData: Record<string, string>): Promise<Record<string, string>> {
    await this.initSchema();
    const connection = await pool.getConnection();

    try {
      const cleanRow = { ...rowData };
      const rowId = cleanRow["__row_id__"] || crypto.randomUUID();
      delete cleanRow["__row_id__"];

      await connection.query(
        "INSERT INTO csv_rows (id, data) VALUES (?, ?);",
        [rowId, JSON.stringify(cleanRow)]
      );

      return { ...cleanRow, __row_id__: rowId };
    } finally {
      connection.release();
    }
  }

  /**
   * Update an existing row by ID in MySQL
   */
  static async updateRow(id: string, rowData: Record<string, string>): Promise<Record<string, string>> {
    await this.initSchema();
    const connection = await pool.getConnection();

    try {
      const cleanRow = { ...rowData };
      delete cleanRow["__row_id__"];

      await connection.query(
        "UPDATE csv_rows SET data = ? WHERE id = ?;",
        [JSON.stringify(cleanRow), id]
      );

      return { ...cleanRow, __row_id__: id };
    } finally {
      connection.release();
    }
  }

  /**
   * Delete a single row by ID from MySQL
   */
  static async deleteRow(id: string): Promise<string> {
    await this.initSchema();
    const connection = await pool.getConnection();

    try {
      await connection.query("DELETE FROM csv_rows WHERE id = ?;", [id]);
      return id;
    } finally {
      connection.release();
    }
  }

  /**
   * Delete all metadata and rows from MySQL
   */
  static async deleteAll(): Promise<boolean> {
    await this.initSchema();
    const connection = await pool.getConnection();

    try {
      await connection.query("DELETE FROM csv_rows;");
      await connection.query("DELETE FROM csv_metadata;");
      return true;
    } finally {
      connection.release();
    }
  }
}
