'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Linkedin, Loader2, CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface ProgressState {
  phase: 'scraping' | 'done' | 'error';
  current: number;
  total: number;
  name: string;
  succeeded: number;
  failed: number;
  errors: string[];
  errorMessage?: string;
}

export function ScrapeButton() {
  const [progress, setProgress] = useState<ProgressState | null>(null);

  const handleScrape = useCallback(async () => {
    setProgress({ phase: 'scraping', current: 0, total: 0, name: '', succeeded: 0, failed: 0, errors: [] });

    try {
      const res = await fetch('/api/scrape/linkedin', { method: 'POST' });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setProgress((p) => p ? { ...p, phase: 'error', errorMessage: data.error || `HTTP ${res.status}` } : null);
        return;
      }

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        setProgress({
          phase: 'done',
          current: data.total || 0,
          total: data.total || 0,
          name: '',
          succeeded: data.succeeded || 0,
          failed: data.failed || 0,
          errors: [],
        });
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const chunk of lines) {
          const dataLine = chunk.split('\n').find((l) => l.startsWith('data: '));
          if (!dataLine) continue;

          try {
            const event = JSON.parse(dataLine.slice(6));

            if (event.type === 'start') {
              setProgress((p) => p ? { ...p, total: event.total } : null);
            } else if (event.type === 'progress') {
              setProgress((p) => p ? { ...p, current: event.current, name: event.name } : null);
            } else if (event.type === 'done') {
              setProgress((p) => {
                if (!p) return null;
                return {
                  ...p,
                  current: event.current,
                  succeeded: event.status === 'success' || event.status === 'partial' ? p.succeeded + 1 : p.succeeded,
                  failed: event.status === 'error' ? p.failed + 1 : p.failed,
                };
              });
            } else if (event.type === 'error') {
              setProgress((p) => p ? { ...p, errors: [...p.errors, `${event.name}: ${event.error}`] } : null);
            } else if (event.type === 'complete') {
              setProgress((p) => p ? {
                ...p,
                phase: 'done',
                succeeded: event.succeeded,
                failed: event.failed,
                errors: event.errors || [],
              } : null);
            }
          } catch { /* skip malformed */ }
        }
      }
    } catch {
      setProgress((p) => p ? { ...p, phase: 'error', errorMessage: 'Erreur réseau' } : null);
    }
  }, []);

  const dismiss = () => setProgress(null);
  const isLoading = progress?.phase === 'scraping';

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={handleScrape}
        disabled={isLoading}
        className="h-9 gap-1.5 rounded-xl border-black/8 bg-white text-xs font-semibold hover:border-[#2CB8C5]/40 hover:bg-[#2CB8C5]/5 hover:text-[#2CB8C5]"
      >
        {isLoading ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Linkedin className="size-3.5" />
        )}
        {isLoading
          ? progress.total > 0
            ? `${progress.current}/${progress.total}`
            : 'Chargement…'
          : 'Scraper LinkedIn'}
      </Button>

      {progress && progress.phase !== 'scraping' && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-black/8 bg-white p-4 shadow-xl">
          <button
            onClick={dismiss}
            className="absolute right-3 top-3 text-[#3C3C3B]/30 transition-colors hover:text-[#3C3C3B]/60"
          >
            <X className="size-3.5" />
          </button>

          {progress.phase === 'error' ? (
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-500" />
              <div>
                <p className="text-sm font-semibold text-red-600">Erreur</p>
                <p className="mt-0.5 text-xs text-red-500/80">{progress.errorMessage}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                <div>
                  <p className="text-sm font-semibold text-[#3C3C3B]">Scraping terminé</p>
                  <p className="mt-0.5 text-xs text-[#3C3C3B]/50">
                    {progress.succeeded} profil{progress.succeeded > 1 ? 's' : ''} mis à jour
                    {progress.failed > 0 && `, ${progress.failed} échec${progress.failed > 1 ? 's' : ''}`}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-emerald-50 px-3 py-2 text-center">
                  <p className="text-lg font-bold text-emerald-600">{progress.succeeded}</p>
                  <p className="text-[10px] text-emerald-600/60">Succès</p>
                </div>
                <div className="rounded-xl bg-red-50 px-3 py-2 text-center">
                  <p className="text-lg font-bold text-red-500">{progress.failed}</p>
                  <p className="text-[10px] text-red-500/60">Échecs</p>
                </div>
              </div>

              {progress.errors.length > 0 && (
                <div className="max-h-24 overflow-y-auto rounded-xl bg-[#f8f9fc] p-2.5">
                  {progress.errors.map((err, i) => (
                    <p key={i} className="text-[10px] leading-relaxed text-[#3C3C3B]/50">
                      {err}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {isLoading && progress.total > 0 && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-black/8 bg-white p-4 shadow-xl">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Loader2 className="size-4 shrink-0 animate-spin text-[#2CB8C5]" />
              <div>
                <p className="text-sm font-semibold text-[#3C3C3B]">
                  Scraping en cours… {progress.current}/{progress.total}
                </p>
                {progress.name && (
                  <p className="mt-0.5 text-xs text-[#3C3C3B]/50">{progress.name}</p>
                )}
              </div>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-[#3C3C3B]/5">
              <div
                className="h-full rounded-full bg-[#2CB8C5] transition-all duration-500"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>

            <div className="flex justify-between text-[10px] text-[#3C3C3B]/40">
              <span>{progress.succeeded} succès{progress.failed > 0 ? `, ${progress.failed} échec${progress.failed > 1 ? 's' : ''}` : ''}</span>
              <span>{Math.round((progress.current / progress.total) * 100)}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
