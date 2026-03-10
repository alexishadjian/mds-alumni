'use client';

import { useState, useTransition } from 'react';
import {
  Linkedin,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  RefreshCw,
  Info,
} from 'lucide-react';
import { updateSettings } from '@/lib/actions/settings';
import type { LinkedInTokenStatus } from '@/lib/actions/settings';

interface TokenInfo {
  status: LinkedInTokenStatus;
  lastError: string | null;
  lastCheck: string | null;
  hasDbTokens: boolean;
  hasEnvTokens: boolean;
}

interface Props {
  initialLiAt: string;
  initialJsessionId: string;
  tokenInfo: TokenInfo;
}

const STATUS_CONFIG: Record<
  LinkedInTokenStatus,
  { label: string; color: string; bg: string; border: string; Icon: typeof CheckCircle2 }
> = {
  valid: {
    label: 'Tokens valides',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    Icon: CheckCircle2,
  },
  expired: {
    label: 'Tokens expirés',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    Icon: XCircle,
  },
  not_configured: {
    label: 'Non configuré',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    Icon: AlertTriangle,
  },
  unknown: {
    label: 'Statut inconnu',
    color: 'text-gray-500',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    Icon: HelpCircle,
  },
};

function maskValue(value: string): string {
  if (value.length <= 8) return '••••••••';
  return value.slice(0, 4) + '••••••••' + value.slice(-4);
}

export function LinkedInSettingsForm({ initialLiAt, initialJsessionId, tokenInfo }: Props) {
  const [liAt, setLiAt] = useState(initialLiAt);
  const [jsessionId, setJsessionId] = useState(initialJsessionId);
  const [showLiAt, setShowLiAt] = useState(false);
  const [showJsession, setShowJsession] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const statusCfg = STATUS_CONFIG[tokenInfo.status];

  const handleSave = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await updateSettings([
        { key: 'linkedin_li_at', value: liAt.trim(), description: 'LinkedIn li_at cookie' },
        {
          key: 'linkedin_jsessionid',
          value: jsessionId.trim() || 'ajax:0',
          description: 'LinkedIn JSESSIONID cookie',
        },
        { key: 'linkedin_token_status', value: 'unknown' },
      ]);

      if (result.success) {
        setMessage({ type: 'success', text: 'Tokens enregistrés. Le statut sera vérifié au prochain scraping.' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Erreur inconnue' });
      }
    });
  };

  const hasChanges =
    liAt.trim() !== initialLiAt || (jsessionId.trim() || 'ajax:0') !== (initialJsessionId || 'ajax:0');

  return (
    <div className="space-y-6">
      {/* Status banner */}
      {tokenInfo.status === 'expired' && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5">
          <XCircle className="mt-0.5 size-5 shrink-0 text-red-500" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              Les tokens LinkedIn ont expiré
            </p>
            <p className="mt-1 text-sm text-red-600">
              Le scraping est interrompu. Connectez-vous à LinkedIn dans votre navigateur, récupérez
              les nouveaux cookies et mettez-les à jour ci-dessous.
            </p>
            {tokenInfo.lastError && (
              <p className="mt-2 text-xs text-red-500/80">
                Dernière erreur : {tokenInfo.lastError}
              </p>
            )}
          </div>
        </div>
      )}

      {/* LinkedIn tokens card */}
      <div className="overflow-hidden rounded-2xl border border-black/6 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#0A66C2]/10">
              <Linkedin className="size-5 text-[#0A66C2]" />
            </div>
            <div>
              <h2 className="font-bricolage text-base font-semibold text-[#3C3C3B]">
                Tokens LinkedIn
              </h2>
              <p className="text-xs text-[#3C3C3B]/40">
                Cookies d&apos;authentification pour le scraping de profils
              </p>
            </div>
          </div>

          {/* Status badge */}
          <div
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${statusCfg.bg} ${statusCfg.border} ${statusCfg.color}`}
          >
            <statusCfg.Icon className="size-3.5" />
            {statusCfg.label}
          </div>
        </div>

        <div className="space-y-6 p-6">
          {/* Source indicator */}
          <div className="flex items-start gap-2 rounded-xl bg-[#f8f9fc] p-4 text-xs text-[#3C3C3B]/60">
            <Info className="mt-0.5 size-4 shrink-0 text-[#2CB8C5]/60" />
            <div>
              <p>
                <span className="font-semibold text-[#3C3C3B]/80">Source actuelle :</span>{' '}
                {tokenInfo.hasDbTokens
                  ? 'Base de données (prioritaire)'
                  : tokenInfo.hasEnvTokens
                    ? 'Variables d\'environnement (.env)'
                    : 'Aucune — configurez les tokens ci-dessous'}
              </p>
              {tokenInfo.lastCheck && (
                <p className="mt-1">
                  Dernière vérification :{' '}
                  {new Date(tokenInfo.lastCheck).toLocaleString('fr-FR', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              )}
            </div>
          </div>

          {/* li_at input */}
          <div className="space-y-2">
            <label htmlFor="li_at" className="block text-sm font-semibold text-[#3C3C3B]">
              li_at
              <span className="ml-2 text-xs font-normal text-[#3C3C3B]/40">
                Cookie principal d&apos;authentification
              </span>
            </label>
            <div className="relative">
              <input
                id="li_at"
                type={showLiAt ? 'text' : 'password'}
                value={liAt}
                onChange={(e) => setLiAt(e.target.value)}
                placeholder="AQEDAQNh..."
                className="w-full rounded-xl border border-black/8 bg-white px-4 py-3 pr-12 font-mono text-sm text-[#3C3C3B] placeholder:text-[#3C3C3B]/25 focus:border-[#2CB8C5]/50 focus:ring-2 focus:ring-[#2CB8C5]/20 focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowLiAt(!showLiAt)}
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-lg p-1 text-[#3C3C3B]/30 hover:text-[#3C3C3B]/60 transition-colors"
              >
                {showLiAt ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {initialLiAt && !showLiAt && liAt === initialLiAt && (
              <p className="text-xs text-[#3C3C3B]/35 font-mono">{maskValue(initialLiAt)}</p>
            )}
          </div>

          {/* JSESSIONID input */}
          <div className="space-y-2">
            <label htmlFor="jsessionid" className="block text-sm font-semibold text-[#3C3C3B]">
              JSESSIONID
              <span className="ml-2 text-xs font-normal text-[#3C3C3B]/40">
                Cookie de session (optionnel, défaut: ajax:0)
              </span>
            </label>
            <div className="relative">
              <input
                id="jsessionid"
                type={showJsession ? 'text' : 'password'}
                value={jsessionId}
                onChange={(e) => setJsessionId(e.target.value)}
                placeholder="ajax:0"
                className="w-full rounded-xl border border-black/8 bg-white px-4 py-3 pr-12 font-mono text-sm text-[#3C3C3B] placeholder:text-[#3C3C3B]/25 focus:border-[#2CB8C5]/50 focus:ring-2 focus:ring-[#2CB8C5]/20 focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowJsession(!showJsession)}
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-lg p-1 text-[#3C3C3B]/30 hover:text-[#3C3C3B]/60 transition-colors"
              >
                {showJsession ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {/* How to get tokens */}
          <details className="group rounded-xl border border-black/5 bg-[#f8f9fc]">
            <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-xs font-semibold text-[#3C3C3B]/60 select-none">
              <HelpCircle className="size-3.5" />
              Comment récupérer ces tokens ?
            </summary>
            <div className="space-y-2 px-4 pb-4 text-xs text-[#3C3C3B]/50 leading-relaxed">
              <ol className="list-decimal space-y-1.5 pl-4">
                <li>Connectez-vous à <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="text-[#2CB8C5] underline">linkedin.com</a></li>
                <li>Ouvrez les DevTools (F12) &rarr; onglet <strong>Application</strong></li>
                <li>Dans <strong>Cookies</strong> &rarr; <strong>https://www.linkedin.com</strong></li>
                <li>Copiez la valeur du cookie <strong>li_at</strong></li>
                <li>Copiez la valeur du cookie <strong>JSESSIONID</strong> (sans les guillemets)</li>
              </ol>
              <p className="mt-2 text-[10px] text-[#3C3C3B]/35">
                Ces cookies expirent généralement après quelques semaines. Vous recevrez une alerte quand ils seront invalides.
              </p>
            </div>
          </details>

          {/* Save button + message */}
          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={handleSave}
              disabled={isPending || !liAt.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-[#2CB8C5] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#2CB8C5]/90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <RefreshCw className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {isPending ? 'Enregistrement…' : 'Enregistrer les tokens'}
            </button>

            {hasChanges && !message && (
              <p className="text-xs text-amber-600">Modifications non enregistrées</p>
            )}

            {message && (
              <p
                className={`text-xs font-medium ${
                  message.type === 'success' ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {message.type === 'success' ? (
                  <CheckCircle2 className="mr-1 inline size-3.5" />
                ) : (
                  <XCircle className="mr-1 inline size-3.5" />
                )}
                {message.text}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
