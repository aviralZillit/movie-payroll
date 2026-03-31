import { Info, ExternalLink, FileText } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

export default function InfoTooltip({ sourceUrl, sourceDocument }) {
  if (!sourceUrl && !sourceDocument) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full p-0.5 text-muted-foreground/60 transition-colors hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Rate source information"
          >
            <Info className="size-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs space-y-1.5 p-3">
          {sourceDocument && (
            <div className="flex items-center gap-1.5 text-xs">
              <FileText className="size-3 shrink-0" />
              <span>{sourceDocument}</span>
            </div>
          )}
          {sourceUrl && (
            <div className="flex items-center gap-1.5 text-xs">
              <ExternalLink className="size-3 shrink-0" />
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-primary"
                onClick={(e) => e.stopPropagation()}
              >
                View source document
              </a>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
