import {
  createSlice,
  PayloadAction,
  nanoid,
  createSelector,
  createAsyncThunk,
} from "@reduxjs/toolkit";

// ── Types ──────────────────────────────────────────────────────────
export type CsvRow = Record<string, string>;

export interface CsvState {
  rows: CsvRow[];
  columns: string[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  filters: Record<string, string>;
  selectedRowId: string | null;
  hiddenColumns: string[];
  viewMode: "table" | "card";
}

// ── Helpers ────────────────────────────────────────────────────────
const ROW_ID_KEY = "__row_id__";

function addRowId(row: CsvRow): CsvRow {
  return { ...row, [ROW_ID_KEY]: row[ROW_ID_KEY] || nanoid() };
}

function saveToStorage(
  rows: CsvRow[],
  columns: string[],
  hiddenColumns: string[],
  viewMode: "table" | "card"
) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(
        "csv_demo_state",
        JSON.stringify({ rows, columns, hiddenColumns, viewMode })
      );
    } catch (e) {
      console.error("Failed to save to localStorage", e);
    }
  }
}

// ── Async Thunks for MySQL Backend Integration ─────────────────────
export const fetchCsvData = createAsyncThunk("csv/fetchCsvData", async () => {
  const res = await fetch("/api/csv/data");
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Failed to fetch CSV data");
  return { rows: data.rows, columns: data.columns };
});

export const uploadCsvDataApi = createAsyncThunk(
  "csv/uploadCsvDataApi",
  async (payload: { rows: CsvRow[]; columns: string[] }) => {
    const res = await fetch("/api/csv/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to upload dataset");
    return { rows: data.rows, columns: data.columns };
  }
);

export const createRowApi = createAsyncThunk(
  "csv/createRowApi",
  async (rowData: CsvRow) => {
    const res = await fetch("/api/csv/rows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rowData),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to create row");
    return data.row as CsvRow;
  }
);

export const updateRowApi = createAsyncThunk(
  "csv/updateRowApi",
  async (payload: { rowId: string; data: CsvRow }) => {
    const res = await fetch(`/api/csv/rows/${payload.rowId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload.data),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to update row");
    return data.row as CsvRow;
  }
);

export const deleteRowApi = createAsyncThunk(
  "csv/deleteRowApi",
  async (rowId: string) => {
    const res = await fetch(`/api/csv/rows/${rowId}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to delete row");
    return rowId;
  }
);

export const clearDataApi = createAsyncThunk("csv/clearDataApi", async () => {
  const res = await fetch("/api/csv/data", { method: "DELETE" });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Failed to clear database");
  return true;
});

// ── Initial State ──────────────────────────────────────────────────
const initialState: CsvState = {
  rows: [],
  columns: [],
  isLoading: false,
  error: null,
  searchTerm: "",
  filters: {},
  selectedRowId: null,
  hiddenColumns: [],
  viewMode: "table",
};

// ── Slice ──────────────────────────────────────────────────────────
const csvSlice = createSlice({
  name: "csv",
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },

    loadFromStorage(state) {
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("csv_demo_state");
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.rows && state.rows.length === 0) state.rows = parsed.rows;
            if (parsed.columns && state.columns.length === 0) state.columns = parsed.columns;
            if (parsed.hiddenColumns) state.hiddenColumns = parsed.hiddenColumns;
            if (parsed.viewMode) state.viewMode = parsed.viewMode;
          }
        } catch (e) {
          console.error("Failed to load from localStorage", e);
        }
      }
    },

    setData(
      state,
      action: PayloadAction<{ rows: CsvRow[]; columns: string[] }>
    ) {
      state.columns = action.payload.columns.filter((c) => c !== ROW_ID_KEY);
      state.rows = action.payload.rows.map(addRowId);
      state.isLoading = false;
      state.searchTerm = "";
      state.filters = {};
      state.selectedRowId = null;
      state.hiddenColumns = [];
      saveToStorage(state.rows, state.columns, state.hiddenColumns, state.viewMode);
    },

    addRow(state, action: PayloadAction<CsvRow>) {
      state.rows.unshift(addRowId(action.payload));
      saveToStorage(state.rows, state.columns, state.hiddenColumns, state.viewMode);
    },

    updateRow(
      state,
      action: PayloadAction<{ rowId: string; data: CsvRow }>
    ) {
      const idx = state.rows.findIndex(
        (r) => r[ROW_ID_KEY] === action.payload.rowId
      );
      if (idx !== -1) {
        state.rows[idx] = {
          ...action.payload.data,
          [ROW_ID_KEY]: action.payload.rowId,
        };
        saveToStorage(state.rows, state.columns, state.hiddenColumns, state.viewMode);
      }
    },

    deleteRow(state, action: PayloadAction<string>) {
      state.rows = state.rows.filter((r) => r[ROW_ID_KEY] !== action.payload);
      if (state.selectedRowId === action.payload) {
        state.selectedRowId = null;
      }
      saveToStorage(state.rows, state.columns, state.hiddenColumns, state.viewMode);
    },

    toggleColumnVisibility(state, action: PayloadAction<string>) {
      const col = action.payload;
      if (state.hiddenColumns.includes(col)) {
        state.hiddenColumns = state.hiddenColumns.filter((c) => c !== col);
      } else {
        state.hiddenColumns.push(col);
      }
      saveToStorage(state.rows, state.columns, state.hiddenColumns, state.viewMode);
    },

    setViewMode(state, action: PayloadAction<"table" | "card">) {
      state.viewMode = action.payload;
      saveToStorage(state.rows, state.columns, state.hiddenColumns, state.viewMode);
    },

    setSearchTerm(state, action: PayloadAction<string>) {
      state.searchTerm = action.payload;
    },

    setFilter(
      state,
      action: PayloadAction<{ column: string; value: string }>
    ) {
      if (action.payload.value === "") {
        delete state.filters[action.payload.column];
      } else {
        state.filters[action.payload.column] = action.payload.value;
      }
    },

    clearFilters(state) {
      state.filters = {};
      state.searchTerm = "";
    },

    setSelectedRowId(state, action: PayloadAction<string | null>) {
      state.selectedRowId = action.payload;
    },

    clearData(state) {
      Object.assign(state, initialState);
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("csv_demo_state");
        } catch (e) {
          console.error("Failed to clear localStorage", e);
        }
      }
    },
  },

  extraReducers: (builder) => {
    // fetchCsvData
    builder.addCase(fetchCsvData.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchCsvData.fulfilled, (state, action) => {
      state.isLoading = false;
      state.columns = action.payload.columns.filter((c: string) => c !== ROW_ID_KEY);
      state.rows = action.payload.rows.map(addRowId);
      saveToStorage(state.rows, state.columns, state.hiddenColumns, state.viewMode);
    });
    builder.addCase(fetchCsvData.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || "Failed to connect to MySQL";
    });

    // uploadCsvDataApi
    builder.addCase(uploadCsvDataApi.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(uploadCsvDataApi.fulfilled, (state, action) => {
      state.isLoading = false;
      state.columns = action.payload.columns.filter((c: string) => c !== ROW_ID_KEY);
      state.rows = action.payload.rows.map(addRowId);
      state.searchTerm = "";
      state.filters = {};
      state.selectedRowId = null;
      state.hiddenColumns = [];
      saveToStorage(state.rows, state.columns, state.hiddenColumns, state.viewMode);
    });

    // createRowApi
    builder.addCase(createRowApi.fulfilled, (state, action) => {
      state.rows.unshift(addRowId(action.payload));
      saveToStorage(state.rows, state.columns, state.hiddenColumns, state.viewMode);
    });

    // updateRowApi
    builder.addCase(updateRowApi.fulfilled, (state, action) => {
      const idx = state.rows.findIndex(
        (r) => r[ROW_ID_KEY] === action.payload[ROW_ID_KEY]
      );
      if (idx !== -1) {
        state.rows[idx] = action.payload;
        saveToStorage(state.rows, state.columns, state.hiddenColumns, state.viewMode);
      }
    });

    // deleteRowApi
    builder.addCase(deleteRowApi.fulfilled, (state, action) => {
      state.rows = state.rows.filter((r) => r[ROW_ID_KEY] !== action.payload);
      if (state.selectedRowId === action.payload) {
        state.selectedRowId = null;
      }
      saveToStorage(state.rows, state.columns, state.hiddenColumns, state.viewMode);
    });

    // clearDataApi
    builder.addCase(clearDataApi.fulfilled, (state) => {
      Object.assign(state, initialState);
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("csv_demo_state");
        } catch (e) {
          console.error("Failed to clear localStorage", e);
        }
      }
    });
  },
});

export const {
  setLoading,
  loadFromStorage,
  setData,
  addRow,
  updateRow,
  deleteRow,
  toggleColumnVisibility,
  setViewMode,
  setSearchTerm,
  setFilter,
  clearFilters,
  setSelectedRowId,
  clearData,
} = csvSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────
export const selectFilteredRows = createSelector(
  [
    (state: { csv: CsvState }) => state.csv.rows,
    (state: { csv: CsvState }) => state.csv.searchTerm,
    (state: { csv: CsvState }) => state.csv.filters,
    (state: { csv: CsvState }) => state.csv.columns,
  ],
  (rows, searchTerm, filters, columns) => {
    return rows.filter((row) => {
      // Global search
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const match = columns.some((col) =>
          (row[col] ?? "").toLowerCase().includes(term)
        );
        if (!match) return false;
      }

      // Column-specific and Date filters
      const dateCol =
        columns.find(
          (c) =>
            c.toLowerCase() === "date" ||
            c.toLowerCase().includes("date") ||
            c.toLowerCase().includes("created_at")
        ) || "date";

      for (const [col, val] of Object.entries(filters)) {
        if (!val) continue;

        if (col === "date_from") {
          const rowDate = (row[dateCol] ?? "").trim();
          if (rowDate && rowDate < val) return false;
          continue;
        }

        if (col === "date_to") {
          const rowDate = (row[dateCol] ?? "").trim();
          if (rowDate && rowDate > val) return false;
          continue;
        }

        if (col === "date") {
          const rowDate = (row[dateCol] ?? "").trim();
          if (
            rowDate &&
            !rowDate.toLowerCase().startsWith(val.toLowerCase()) &&
            rowDate.toLowerCase() !== val.toLowerCase()
          ) {
            return false;
          }
          continue;
        }

        if ((row[col] ?? "").toLowerCase() !== val.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }
);

export const selectSelectedRow = (
  state: { csv: CsvState }
): CsvRow | null => {
  const { rows, selectedRowId } = state.csv;
  if (!selectedRowId) return null;
  return rows.find((r) => r[ROW_ID_KEY] === selectedRowId) ?? null;
};

export const selectUniqueValues = createSelector(
  [
    (state: { csv: CsvState }) => state.csv.rows,
    (state: { csv: CsvState }, column: string) => column,
  ],
  (rows, column) => {
    const values = new Set<string>();
    rows.forEach((row) => {
      const v = row[column];
      if (v !== undefined && v !== "") values.add(v);
    });
    return Array.from(values).sort();
  }
);

export { ROW_ID_KEY };
export default csvSlice.reducer;
