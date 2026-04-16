// ============================================================
// ZILLIT CODA — Step 8: Additional Documents
// Sections: 8A Standard Templates, 8B Upload Custom, 8C Signing Envelope
// ============================================================

import { useState, useRef, useCallback, useEffect } from 'react';
import { useDealMemoStore } from '../../../store/kate/useDealMemoStore';
import { Card, CardHeader, CardBody, Toggle, Badge, Alert } from '../../kate-ui/index';

// ── Template definitions ─────────────────────────────────────

interface DocTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  condition?: (territory: string, empStatus: string) => boolean;
}

const STANDARD_TEMPLATES: DocTemplate[] = [
  {
    id: 'psa',
    name: 'Production Services Agreement',
    icon: '\uD83D\uDCC4',
    description: 'Standard below-the-line crew contract — Gilded Hour Productions',
  },
  {
    id: 'nda',
    name: 'Non-Disclosure Agreement (NDA)',
    icon: '\uD83D\uDD12',
    description: 'Standard production NDA — includes all series information',
  },
  {
    id: 'schedule-d',
    name: 'Schedule D \u2014 Expenses Policy',
    icon: '\uD83D\uDCCB',
    description: 'Allowable expenses, receipt requirements, claims process',
  },
  {
    id: 'health-safety',
    name: 'Health & Safety Induction',
    icon: '\uD83C\uDFE5',
    description: 'Cast & crew H&S acknowledgement — on-location version',
  },
];

interface UploadedFile {
  id: string;
  name: string;
  size: number;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Component ────────────────────────────────────────────────

export default function Step8AdditionalDocs() {
  const store = useDealMemoStore();
  const territory = store.territory || 'uk';
  const empStatus = store.employmentStatusId || 'paye';

  // Template toggle state
  const [activeTemplates, setActiveTemplates] = useState<Record<string, boolean>>({
    psa: true,
    nda: true,
    'schedule-d': true,
    'health-safety': true,
  });

  // Uploaded files
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Signing envelope settings
  const [docusignEnabled, setDocusignEnabled] = useState((store as any).docusignEnabled ?? true);
  const [crewCounterSign, setCrewCounterSign] = useState((store as any).crewCounterSign ?? true);
  const [accountantSignOff, setAccountantSignOff] = useState((store as any).accountantSignOff ?? false);
  const [copyToProductionOffice, setCopyToProductionOffice] = useState((store as any).copyToProductionOffice ?? true);

  // Sync signing envelope settings to store
  useEffect(() => {
    store.update({ docusignEnabled, crewCounterSign, accountantSignOff, copyToProductionOffice } as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docusignEnabled, crewCounterSign, accountantSignOff, copyToProductionOffice]);

  // Filter templates by conditions
  const visibleTemplates = STANDARD_TEMPLATES.filter(
    t => !t.condition || t.condition(territory, empStatus),
  );

  function toggleTemplate(id: string) {
    setActiveTemplates(prev => ({ ...prev, [id]: !prev[id] }));
    // Sync active document IDs to store
    const next = { ...activeTemplates, [id]: !activeTemplates[id] };
    const docs = Object.entries(next).filter(([, v]) => v).map(([k]) => k);
    store.update({ documents: docs });
  }

  // File handling
  function handleFiles(files: FileList | null) {
    if (!files) return;
    const newFiles: UploadedFile[] = Array.from(files).map(f => ({
      id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: f.name,
      size: f.size,
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  }

  function removeFile(id: string) {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  }

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      {/* ── 8A: Standard Templates ──────────────────────────────── */}
      <Card accent="gold">
        <CardHeader>
          <span className="text-text-3 text-[11px] font-mono">8A</span>
          <span className="text-text-1 text-[13px] font-display font-bold ml-2">Standard Templates</span>
          <Badge variant="default" className="ml-auto">{visibleTemplates.length} available</Badge>
        </CardHeader>
        <CardBody className="space-y-2">
          {visibleTemplates.map(tmpl => {
            const attached = !!activeTemplates[tmpl.id];
            return (
              <div
                key={tmpl.id}
                className={`flex items-start gap-3 px-3 py-3 rounded-lg border transition-colors ${
                  attached ? 'bg-gold/10 border-gold/20' : 'bg-bg-elevated border-border'
                }`}
              >
                <span className="text-[18px] mt-0.5 flex-shrink-0">{tmpl.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] text-text-1 font-medium">{tmpl.name}</div>
                  <p className="text-[11px] text-text-3 mt-0.5 leading-relaxed">{tmpl.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleTemplate(tmpl.id)}
                  className={`flex-shrink-0 text-[11px] font-display font-bold tracking-wide transition-colors ${
                    attached ? 'text-green-400' : 'text-text-3 hover:text-gold'
                  }`}
                  title={attached ? 'Click to detach' : 'Click to attach'}
                >
                  {attached ? '✓ Attached' : '+ Attach'}
                </button>
              </div>
            );
          })}
        </CardBody>
      </Card>

      {/* ── 8B: Upload Custom Document ──────────────────────────── */}
      <Card>
        <CardHeader>
          <span className="text-text-3 text-[11px] font-mono">8B</span>
          <span className="text-text-1 text-[13px] font-display font-bold ml-2">Upload Custom Document</span>
        </CardHeader>
        <CardBody className="space-y-3">
          {/* Drop zone */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`flex flex-col items-center justify-center py-8 px-4 rounded-lg border-2 border-dashed transition-colors ${
              isDragging
                ? 'border-gold bg-gold/5'
                : 'border-border-medium bg-bg-elevated/30'
            }`}
          >
            <span className="text-[24px] mb-2 opacity-40">+</span>
            <p className="text-[12px] text-text-3 mb-2">
              Drop PDF or DOCX here · max 10MB per file
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 text-[11px] font-display font-bold text-gold border border-gold/20 rounded-lg bg-gold/10 hover:bg-gold/20 transition-colors"
            >
              Browse Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={e => handleFiles(e.target.files)}
            />
          </div>

          {/* Uploaded file list */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-1.5">
              {uploadedFiles.map(file => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg bg-bg-elevated border border-border"
                >
                  <span className="text-[14px] opacity-50">
                    {'\uD83D\uDCC4'}
                  </span>
                  <span className="flex-1 text-[12px] text-text-1 truncate">{file.name}</span>
                  <span className="text-[10px] text-text-4 font-mono">{formatFileSize(file.size)}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(file.id)}
                    className="text-text-4 hover:text-red-400 transition-colors text-[12px] ml-1"
                    title="Remove file"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* ── 8C: Signing Envelope ────────────────────────────────── */}
      <Card accent="blue">
        <CardHeader>
          <span className="text-text-3 text-[11px] font-mono">8C</span>
          <span className="text-text-1 text-[13px] font-display font-bold ml-2">Signing Envelope</span>
        </CardHeader>
        <CardBody className="space-y-3">
          <Alert variant="blue" className="mb-2">
            Configure the signing workflow. DocuSign integration will create an envelope and route the deal memo for electronic signatures.
          </Alert>

          <div className="space-y-3">
            <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-bg-elevated border border-border">
              <div>
                <div className="text-[12px] text-text-1 font-medium">DocuSign — electronic signing</div>
                <p className="text-[10px] text-text-4 mt-0.5">Send deal memo via DocuSign for electronic signing</p>
              </div>
              <Toggle on={docusignEnabled} onToggle={() => setDocusignEnabled(!docusignEnabled)} />
            </div>

            <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-bg-elevated border border-border">
              <div>
                <div className="text-[12px] text-text-1 font-medium">Require Crew Counter-Signature</div>
                <p className="text-[10px] text-text-4 mt-0.5">Crew member must sign and return the deal memo</p>
              </div>
              <Toggle on={crewCounterSign} onToggle={() => setCrewCounterSign(!crewCounterSign)} />
            </div>

            <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-bg-elevated border border-border">
              <div>
                <div className="text-[12px] text-text-1 font-medium">Require Senior Accountant Sign-Off</div>
                <p className="text-[10px] text-text-4 mt-0.5">Route to senior accountant for financial approval before issue</p>
              </div>
              <Toggle on={accountantSignOff} onToggle={() => setAccountantSignOff(!accountantSignOff)} />
            </div>

            <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-bg-elevated border border-border">
              <div>
                <div className="text-[12px] text-text-1 font-medium">Copy to production office</div>
                <p className="text-[10px] text-text-4 mt-0.5">Send a copy of the signed deal memo to the production office email</p>
              </div>
              <Toggle on={copyToProductionOffice} onToggle={() => setCopyToProductionOffice(!copyToProductionOffice)} />
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
