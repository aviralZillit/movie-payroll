import { useState, useRef, useCallback } from "react";
import {
  Upload,
  FileSpreadsheet,
  FileJson,
  Download,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import api from "@/lib/axios";

// ---------------------------------------------------------------------------
// CSV parser — handles quoted fields, embedded commas & newlines
// ---------------------------------------------------------------------------

function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentField = "";
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') {
          currentField += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      currentField += char;
      i++;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (char === ",") {
      currentRow.push(currentField.trim());
      currentField = "";
      i++;
      continue;
    }
    if (char === "\r") {
      i++;
      continue;
    }
    if (char === "\n") {
      currentRow.push(currentField.trim());
      if (currentRow.some((c) => c !== "")) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = "";
      i++;
      continue;
    }
    currentField += char;
    i++;
  }

  // last row
  currentRow.push(currentField.trim());
  if (currentRow.some((c) => c !== "")) {
    rows.push(currentRow);
  }

  return rows;
}

function csvRowsToObjects(rows) {
  if (rows.length < 2) return [];
  const headers = rows[0];
  return rows.slice(1).map((row) => {
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = row[idx] ?? "";
    });
    return obj;
  });
}

// ---------------------------------------------------------------------------
// Template generator
// ---------------------------------------------------------------------------

function downloadTemplate(headers, filenameBase) {
  const csvContent = headers.map((h) => `"${h}"`).join(",") + "\n";
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filenameBase}-template.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Format file size
// ---------------------------------------------------------------------------

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Reusable import dialog with file upload, preview, and submission.
 *
 * @param {Object}    props
 * @param {boolean}   props.open
 * @param {Function}  props.onOpenChange
 * @param {string}    props.title
 * @param {string}    [props.description]
 * @param {string[]}  props.templateHeaders  - Column names for the CSV template
 * @param {string}    props.endpoint         - POST endpoint, e.g. "/import/rate-cards"
 * @param {Function}  [props.onSuccess]      - Callback after successful import
 */
export default function ImportDialog({
  open,
  onOpenChange,
  title = "Import Data",
  description,
  templateHeaders = [],
  endpoint,
  onSuccess,
}) {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [parseError, setParseError] = useState("");
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const reset = useCallback(() => {
    setFile(null);
    setParsedData([]);
    setParseError("");
    setImporting(false);
    setResults(null);
  }, []);

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  };

  // ---- File reading ----

  const processFile = useCallback((f) => {
    setResults(null);
    setParseError("");
    setFile(f);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const ext = f.name.split(".").pop().toLowerCase();

        if (ext === "json") {
          const json = JSON.parse(text);
          const data = Array.isArray(json) ? json : json.data ? json.data : [json];
          setParsedData(data);
        } else if (ext === "csv") {
          const rows = parseCSV(text);
          if (rows.length < 2) {
            setParseError("CSV file must contain a header row and at least one data row.");
            setParsedData([]);
            return;
          }
          const objects = csvRowsToObjects(rows);
          setParsedData(objects);
        } else {
          setParseError("Unsupported file type. Please use CSV or JSON.");
          setParsedData([]);
        }
      } catch (err) {
        setParseError(`Failed to parse file: ${err.message}`);
        setParsedData([]);
      }
    };
    reader.readAsText(f);
  }, []);

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const droppedFile = e.dataTransfer.files?.[0];
      if (droppedFile) processFile(droppedFile);
    },
    [processFile]
  );

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  };

  // ---- Import ----

  const handleImport = async () => {
    if (parsedData.length === 0) return;
    setImporting(true);
    setResults(null);
    try {
      const { data } = await api.post(endpoint, parsedData);
      setResults({
        success: true,
        created: data.created ?? data.inserted ?? 0,
        updated: data.updated ?? 0,
        errors: data.errors ?? [],
        total: data.total ?? parsedData.length,
      });
      toast.success(`Import complete: ${data.created ?? data.inserted ?? 0} created, ${data.updated ?? 0} updated`);
      if (onSuccess) onSuccess(data);
    } catch (err) {
      const errData = err?.response?.data;
      if (errData?.errors && Array.isArray(errData.errors)) {
        setResults({
          success: false,
          created: errData.created ?? 0,
          updated: errData.updated ?? 0,
          errors: errData.errors,
          total: errData.total ?? parsedData.length,
        });
      } else {
        setResults({
          success: false,
          created: 0,
          updated: 0,
          errors: [{ message: errData?.message || "Import failed. Please check your data and try again." }],
          total: parsedData.length,
        });
      }
      toast.error("Import encountered errors");
    } finally {
      setImporting(false);
    }
  };

  // ---- Preview table columns ----

  const previewRows = parsedData.slice(0, 5);
  const previewHeaders = previewRows.length > 0 ? Object.keys(previewRows[0]) : [];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {/* Template download */}
        {templateHeaders.length > 0 && (
          <div className="flex items-center justify-between rounded-lg border border-dashed p-3">
            <div className="text-sm text-muted-foreground">
              Need a template? Download a blank CSV with the correct headers.
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                downloadTemplate(
                  templateHeaders,
                  title.toLowerCase().replace(/\s+/g, "-")
                )
              }
            >
              <Download className="mr-1.5 h-4 w-4" />
              Template
            </Button>
          </div>
        )}

        {/* Drop zone */}
        {!results && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`
              flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 text-center transition-colors
              ${dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/40"}
            `}
          >
            <Upload
              className={`h-8 w-8 ${dragOver ? "text-primary" : "text-muted-foreground/50"}`}
            />
            <div>
              <p className="text-sm font-medium">
                {dragOver ? "Drop file here" : "Drag & drop a file, or click to browse"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Supports CSV and JSON files
              </p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.json"
              onChange={onFileChange}
              className="hidden"
            />
          </div>
        )}

        {/* File info */}
        {file && !results && (
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
            {file.name.endsWith(".csv") ? (
              <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
            ) : (
              <FileJson className="h-5 w-5 text-blue-600" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatSize(file.size)} &middot; {parsedData.length} rows detected
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                reset();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Parse error */}
        {parseError && (
          <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            {parseError}
          </div>
        )}

        {/* Preview table */}
        {previewRows.length > 0 && !results && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Preview (first {previewRows.length} of {parsedData.length} rows)
            </p>
            <div className="max-h-[200px] overflow-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {previewHeaders.map((h) => (
                      <TableHead key={h} className="whitespace-nowrap text-xs">
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewRows.map((row, idx) => (
                    <TableRow key={idx}>
                      {previewHeaders.map((h) => (
                        <TableCell key={h} className="whitespace-nowrap text-xs">
                          {String(row[h] ?? "").slice(0, 50)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {parsedData.length > 5 && (
              <p className="text-xs text-muted-foreground">
                ...and {parsedData.length - 5} more rows
              </p>
            )}
          </div>
        )}

        {/* Results summary */}
        <AnimatePresence>
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div
                className={`flex items-center gap-2 rounded-lg p-4 ${
                  results.success
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                    : "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                }`}
              >
                {results.success ? (
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {results.success ? "Import completed successfully" : "Import completed with errors"}
                  </p>
                  <p className="mt-0.5 text-xs opacity-80">
                    {results.total} rows processed
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                  {results.created} created
                </Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                  {results.updated} updated
                </Badge>
                {results.errors.length > 0 && (
                  <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                    {results.errors.length} errors
                  </Badge>
                )}
              </div>

              {results.errors.length > 0 && (
                <div className="max-h-[160px] overflow-auto rounded-lg border border-red-200 dark:border-red-800">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Row</TableHead>
                        <TableHead className="text-xs">Error</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.errors.slice(0, 20).map((err, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="text-xs font-mono">
                            {err.row ?? idx + 1}
                          </TableCell>
                          <TableCell className="text-xs text-destructive">
                            {err.message || JSON.stringify(err)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {results.errors.length > 20 && (
                    <p className="p-2 text-xs text-muted-foreground text-center">
                      ...and {results.errors.length - 20} more errors
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <DialogFooter>
          {results ? (
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Close
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={parsedData.length === 0 || importing || !!parseError}
              >
                {importing ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-1.5 h-4 w-4" />
                )}
                Import {parsedData.length > 0 ? `${parsedData.length} rows` : ""}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
