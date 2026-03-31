import { useState } from "react";
import { Download, Loader2, FileSpreadsheet, FileJson, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import api from "@/lib/axios";

/**
 * Reusable export button with format dropdown (CSV / JSON).
 *
 * @param {Object}  props
 * @param {string}  props.endpoint  - API path, e.g. "/export/rate-cards"
 * @param {string}  props.filename  - Base filename without extension
 * @param {Object}  [props.params]  - Query params forwarded to the GET request
 * @param {string}  [props.label]   - Button label (default "Export")
 * @param {string}  [props.variant] - shadcn Button variant (default "outline")
 * @param {string}  [props.size]    - shadcn Button size
 * @param {string}  [props.className]
 */
export default function ExportButton({
  endpoint,
  filename = "export",
  params = {},
  label = "Export",
  variant = "outline",
  size,
  className,
}) {
  const [loading, setLoading] = useState(false);

  const handleExport = async (format) => {
    setLoading(true);
    try {
      const response = await api.get(endpoint, {
        params: { ...params, format },
        responseType: "blob",
      });

      const contentDisposition = response.headers["content-disposition"];
      let downloadName = `${filename}-${new Date().toISOString().slice(0, 10)}.${format}`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^";\n]+)"?/);
        if (match) downloadName = match[1];
      }

      const blob = new Blob([response.data], {
        type:
          format === "csv"
            ? "text/csv;charset=utf-8;"
            : "application/json;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`${format.toUpperCase()} exported successfully`);
    } catch (err) {
      const message =
        err?.response?.data?.message || `Failed to export ${format.toUpperCase()}`;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={loading}
        render={
          <Button variant={variant} size={size} className={className} disabled={loading}>
            {loading ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-1.5 h-4 w-4" />
            )}
            {label}
            <ChevronDown className="ml-1 h-3.5 w-3.5 opacity-60" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Export format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport("csv")}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          CSV (.csv)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("json")}>
          <FileJson className="mr-2 h-4 w-4" />
          JSON (.json)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
