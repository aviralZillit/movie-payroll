import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  ExternalLink,
  Download,
  Info,
  ChevronDown,
  ChevronRight,
  Lock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const RATE_SOURCES = [
  {
    union: "BECTU Camera",
    source: "Camera Branch website",
    url: "https://camerabranch.org.uk/rates/",
    isPublic: true,
  },
  {
    union: "BECTU Sparks",
    source: "Sparks Branch",
    url: "https://sites.google.com/view/sparksbranch/rates-agreements",
    isPublic: true,
  },
  {
    union: "BECTU Art Dept",
    source: "Art Dept branch",
    url: "https://www.bectuartdepartment.co.uk/rate-card-2024",
    isPublic: true,
  },
  {
    union: "BECTU Costume",
    source: "Costume branch",
    url: "https://www.bectucostume.com/rate-card-1",
    isPublic: true,
  },
  {
    union: "BECTU Graphics",
    source: "Graphics Union",
    url: "https://www.graphicsunion.co.uk/rates",
    isPublic: true,
  },
  {
    union: "Equity",
    source: "Pact agreements",
    url: "https://www.pact.co.uk/resource-hub",
    isPublic: true,
  },
  {
    union: "FAA",
    source: "Casting Collective",
    url: "https://www.castingcollective.co.uk/production/payrates",
    isPublic: true,
  },
  {
    union: "WGGB",
    source: "Writers Guild",
    url: "https://writersguild.org.uk/rates-and-agreements",
    isPublic: true,
  },
  {
    union: "BECTU (other depts)",
    source: "BECTU members area",
    url: "https://members.bectu.org.uk",
    isPublic: false,
  },
];

export default function RateSourcesGuide({ defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-blue-500/20">
      <CardHeader
        className="cursor-pointer select-none pb-3"
        onClick={() => setIsOpen((v) => !v)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-blue-500/10 p-1.5 text-blue-500">
              <Info className="size-4" />
            </div>
            <div>
              <CardTitle className="text-sm">
                Official Union Rate Card Sources
              </CardTitle>
              <CardDescription className="text-xs">
                Download official rate cards from these union sources to import
                verified rates
              </CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="size-7">
            {isOpen ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <CardContent className="pt-0">
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs">Union</TableHead>
                      <TableHead className="text-xs">Source</TableHead>
                      <TableHead className="text-xs">URL</TableHead>
                      <TableHead className="text-xs text-center">
                        Public?
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {RATE_SOURCES.map((src, idx) => (
                      <TableRow
                        key={idx}
                        className={idx % 2 === 0 ? "bg-background" : "bg-muted/10"}
                      >
                        <TableCell className="text-sm font-medium whitespace-nowrap">
                          {src.union}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {src.source}
                        </TableCell>
                        <TableCell>
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 hover:underline transition-colors"
                          >
                            {src.url.replace(/^https?:\/\/(www\.)?/, "")}
                            <ExternalLink className="size-3 shrink-0" />
                          </a>
                        </TableCell>
                        <TableCell className="text-center">
                          {src.isPublic ? (
                            <Badge
                              variant="secondary"
                              className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px]"
                            >
                              <ShieldCheck className="mr-1 size-3" />
                              Yes
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px]"
                            >
                              <Lock className="mr-1 size-3" />
                              Member login
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">
                Download the official PDF or CSV rate card from each source, then
                use the Import function to upload and verify rates automatically.
              </p>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
