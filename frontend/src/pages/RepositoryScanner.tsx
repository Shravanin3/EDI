import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Link, Loader2, FileArchive, Code2, Brain, Calculator, Check } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const STEPS = [
  { label: 'Extracting Files', icon: FileArchive },
  { label: 'AST Parsing', icon: Code2 },
  { label: 'NLP Embedding', icon: Brain },
  { label: 'Reconciling Math', icon: Calculator },
];

function ProcessingStepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="enterprise-card p-6">
      <div className="flex items-center justify-between">
        {STEPS.map((step, i) => {
          const isComplete = i < currentStep;
          const isActive = i === currentStep;
          const Icon = step.icon;
          return (
            <div key={step.label} className="flex items-center flex-1 last:flex-initial">
              <div className="flex flex-col items-center">
                <div className={cn(
                  'w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors',
                  isComplete ? 'bg-primary border-primary' : isActive ? 'border-primary bg-primary/10' : 'border-border bg-secondary'
                )}>
                  {isComplete ? (
                    <Check className="h-4 w-4 text-primary-foreground" />
                  ) : (
                    <Icon className={cn('h-4 w-4', isActive ? 'text-primary' : 'text-muted-foreground')} />
                  )}
                </div>
                <span className={cn('text-xs mt-2 text-center', isActive ? 'text-foreground font-medium' : 'text-muted-foreground')}>
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn('flex-1 h-px mx-3 mt-[-20px]', isComplete ? 'bg-primary' : 'bg-border')} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function RepositoryScanner() {
  const [url, setUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [processingStep, setProcessingStep] = useState<number | null>(null);
  const { toast } = useToast();

  const simulateProcessing = async () => {
    for (let i = 0; i < STEPS.length; i++) {
      setProcessingStep(i);
      await new Promise((r) => setTimeout(r, 1500));
    }
    setProcessingStep(null);
  };

  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.name.endsWith('.zip')) {
      toast({ title: 'Invalid file', description: 'Please upload a .zip file.', variant: 'destructive' });
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.post('/api/scan/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast({ title: 'Upload complete', description: 'Repository scan initiated.' });
      await simulateProcessing();
    } catch {
      toast({ title: 'Upload failed', description: 'Could not connect to the backend.', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleUrlScan = async () => {
    if (!url.trim()) return;
    setScanning(true);
    try {
      await api.post('/api/scan/upload', { github_url: url });
      toast({ title: 'Scan initiated', description: 'Repository is being analyzed.' });
      await simulateProcessing();
    } catch {
      toast({ title: 'Scan failed', description: 'Could not connect to the backend.', variant: 'destructive' });
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">Repository Scanner</h1>
        <p className="page-subtitle">Upload a .zip archive or provide a GitHub URL to scan for OAuth permission sprawl</p>
      </div>

      {processingStep !== null && <ProcessingStepper currentStep={processingStep} />}

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleFileDrop}
        className="enterprise-card border-2 border-dashed border-border flex flex-col items-center justify-center py-16 px-6 cursor-pointer hover:border-primary/40 transition-colors"
      >
        {uploading ? (
          <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
        ) : (
          <Upload className="h-8 w-8 text-muted-foreground mb-3" />
        )}
        <p className="text-sm font-medium text-foreground mb-1">
          {uploading ? 'Uploading…' : 'Drag & drop a .zip file here'}
        </p>
        <p className="text-xs text-muted-foreground">Apps Script project archive</p>
      </div>

      <div className="enterprise-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Link className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Or scan from GitHub</span>
        </div>
        <div className="flex gap-3">
          <Input placeholder="https://github.com/org/repo" value={url} onChange={(e) => setUrl(e.target.value)} className="flex-1 h-9 text-sm" />
          <Button onClick={handleUrlScan} disabled={scanning || !url.trim()} size="sm">
            {scanning && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
            Scan Repository
          </Button>
        </div>
      </div>
    </div>
  );
}
