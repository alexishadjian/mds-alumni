'use client';

import { useState, useTransition } from 'react';
import { useActionState } from 'react';
import {
  createEducationExperience, createProfessionalExperience,
  deleteEducationExperience, deleteProfessionalExperience,
  updateEducationExperience, updateProfessionalExperience,
  updateProfile,
} from '@/lib/actions/profile';
import type { Profile, ProfessionalExperience, EducationExperience } from '@/types';
import Link from 'next/link';
import {
  User, Briefcase, GraduationCap, Plus, Pencil,
  Trash2, X, Check, MapPin, Sparkles,
} from 'lucide-react';

// ─── Design tokens ────────────────────────────────────────────────────────────
const INPUT = 'w-full rounded-2xl border border-black/8 bg-[#f8f8fb] px-4 py-3.5 text-sm text-[#3C3C3B] placeholder:text-[#3C3C3B]/25 outline-none transition-all duration-200 focus:border-[#2CB8C5]/60 focus:bg-white focus:ring-4 focus:ring-[#2CB8C5]/10 disabled:opacity-50';
const LABEL = 'text-xs font-bold uppercase tracking-wider text-[#3C3C3B]/35 mb-2 block';
const BTN_PRIMARY = 'relative overflow-hidden rounded-2xl bg-[#3C3C3B] px-5 py-3 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/15 active:translate-y-0 disabled:opacity-60 disabled:translate-y-0 disabled:cursor-not-allowed group';
const BTN_OUTLINE = 'rounded-2xl border border-black/10 px-5 py-3 text-sm font-medium text-[#3C3C3B]/55 transition-all hover:border-black/20 hover:text-[#3C3C3B] hover:bg-black/3';
const ICON_BTN = 'size-8 rounded-xl flex items-center justify-center transition-all';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (d: string | null | undefined) => {
  if (!d) return '?';
  const [y, m] = d.split('-');
  const months = ['jan', 'fév', 'mar', 'avr', 'mai', 'jun', 'jul', 'aoû', 'sep', 'oct', 'nov', 'déc'];
  return m ? `${months[parseInt(m) - 1]}. ${y}` : y;
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const SectionCard = ({
  icon, title, badge, accent, children,
}: {
  icon: React.ReactNode; title: string; badge?: string;
  accent: string; children: React.ReactNode;
}) => (
  <div className="rounded-3xl bg-white border border-black/6 overflow-hidden shadow-sm">
    <div className="flex items-center gap-3 px-6 py-4 border-b border-black/5">
      <div className={`size-9 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
        {icon}
      </div>
      <h2 className="font-semibold text-[#3C3C3B] flex-1">{title}</h2>
      {badge && (
        <span className="rounded-full bg-black/5 px-2.5 py-0.5 text-xs font-bold text-[#3C3C3B]/40">
          {badge}
        </span>
      )}
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const Field = ({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) => (
  <div className={className}>
    <label className={LABEL}>{label}</label>
    {children}
  </div>
);

// ─── Pro experience item with inline edit ─────────────────────────────────────
const ProExpItem = ({ exp, profileId }: { exp: ProfessionalExperience; profileId: string }) => {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await updateProfessionalExperience(exp.id, profileId, {
        job_title: formData.get('job_title') as string,
        company_name: formData.get('company_name') as string,
        start_date: (formData.get('start_date') as string) || undefined,
        end_date: (formData.get('end_date') as string) || undefined,
        description: (formData.get('description') as string) || undefined,
      });
      if (result.success) setEditing(false);
      else setError(result.error ?? 'Erreur');
    });
  };

  return (
    <div className="rounded-2xl border border-black/6 overflow-hidden transition-all hover:border-black/10">
      <div className="flex items-start gap-3 p-4">
        <div className="size-8 rounded-xl bg-[#2CB8C5]/10 flex items-center justify-center mt-0.5 shrink-0">
          <Briefcase className="size-3.5 text-[#2CB8C5]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-[#3C3C3B]">{exp.job_title}</p>
          <p className="text-xs text-[#3C3C3B]/55 mt-0.5">{exp.company_name}</p>
          {(exp.start_date || exp.end_date) && (
            <p className="text-xs text-[#3C3C3B]/35 mt-1">
              {formatDate(exp.start_date)} → {exp.end_date ? formatDate(exp.end_date) : 'Présent'}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => { setEditing(!editing); setError(null); }}
            title={editing ? 'Fermer' : 'Modifier'}
            className={`${ICON_BTN} ${editing ? 'bg-[#2CB8C5]/10 text-[#2CB8C5]' : 'text-[#3C3C3B]/30 hover:bg-black/5 hover:text-[#3C3C3B]'}`}
          >
            {editing ? <X className="size-3.5" /> : <Pencil className="size-3.5" />}
          </button>
          <form action={async () => { await deleteProfessionalExperience(exp.id, profileId); }}>
            <button type="submit" title="Supprimer" className={`${ICON_BTN} text-[#3C3C3B]/25 hover:bg-red-50 hover:text-red-500`}>
              <Trash2 className="size-3.5" />
            </button>
          </form>
        </div>
      </div>

      {editing && (
        <div className="border-t border-black/5 bg-[#f8f8fb]/60 p-4">
          <form action={handleUpdate} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Poste *">
                <input name="job_title" required defaultValue={exp.job_title} className={INPUT} />
              </Field>
              <Field label="Entreprise *">
                <input name="company_name" required defaultValue={exp.company_name} className={INPUT} />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Date de début">
                <input name="start_date" type="date" defaultValue={exp.start_date ?? ''} className={INPUT} />
              </Field>
              <Field label="Date de fin">
                <input name="end_date" type="date" defaultValue={exp.end_date ?? ''} className={INPUT} />
              </Field>
            </div>
            <Field label="Description">
              <textarea name="description" rows={2} defaultValue={exp.description ?? ''} className={`${INPUT} resize-none`} placeholder="Décris tes responsabilités..." />
            </Field>
            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
            <div className="flex gap-2">
              <button type="submit" disabled={isPending} className={BTN_PRIMARY}>
                <span className="absolute inset-0 bg-linear-to-r from-[#2CB8C5] to-[#662483] opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="relative">{isPending ? 'Enregistrement…' : 'Sauvegarder'}</span>
              </button>
              <button type="button" onClick={() => setEditing(false)} className={BTN_OUTLINE}>Annuler</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// ─── Education item with inline edit ─────────────────────────────────────────
const EduExpItem = ({ edu, profileId }: { edu: EducationExperience; profileId: string }) => {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await updateEducationExperience(edu.id, profileId, {
        school_name: formData.get('school_name') as string,
        program: (formData.get('program') as string) || undefined,
        start_year: formData.get('start_year') ? parseInt(formData.get('start_year') as string) : undefined,
        end_year: formData.get('end_year') ? parseInt(formData.get('end_year') as string) : undefined,
        description: (formData.get('description') as string) || undefined,
      });
      if (result.success) setEditing(false);
      else setError(result.error ?? 'Erreur');
    });
  };

  return (
    <div className="rounded-2xl border border-black/6 overflow-hidden transition-all hover:border-black/10">
      <div className="flex items-start gap-3 p-4">
        <div className="size-8 rounded-xl bg-[#662483]/10 flex items-center justify-center mt-0.5 shrink-0">
          <GraduationCap className="size-3.5 text-[#662483]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-[#3C3C3B]">{edu.school_name}</p>
          {edu.program && <p className="text-xs text-[#3C3C3B]/55 mt-0.5">{edu.program}</p>}
          {(edu.start_year || edu.end_year) && (
            <p className="text-xs text-[#3C3C3B]/35 mt-1">
              {edu.start_year ?? '?'} → {edu.end_year ?? 'Présent'}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => { setEditing(!editing); setError(null); }}
            title={editing ? 'Fermer' : 'Modifier'}
            className={`${ICON_BTN} ${editing ? 'bg-[#662483]/10 text-[#662483]' : 'text-[#3C3C3B]/30 hover:bg-black/5 hover:text-[#3C3C3B]'}`}
          >
            {editing ? <X className="size-3.5" /> : <Pencil className="size-3.5" />}
          </button>
          <form action={async () => { await deleteEducationExperience(edu.id, profileId); }}>
            <button type="submit" title="Supprimer" className={`${ICON_BTN} text-[#3C3C3B]/25 hover:bg-red-50 hover:text-red-500`}>
              <Trash2 className="size-3.5" />
            </button>
          </form>
        </div>
      </div>

      {editing && (
        <div className="border-t border-black/5 bg-[#f8f8fb]/60 p-4">
          <form action={handleUpdate} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="École *">
                <input name="school_name" required defaultValue={edu.school_name} className={INPUT} />
              </Field>
              <Field label="Programme">
                <input name="program" defaultValue={edu.program ?? ''} className={INPUT} placeholder="ex: Bachelor Marketing" />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Année de début">
                <input name="start_year" type="number" defaultValue={edu.start_year ?? ''} className={INPUT} placeholder="2020" />
              </Field>
              <Field label="Année de fin">
                <input name="end_year" type="number" defaultValue={edu.end_year ?? ''} className={INPUT} placeholder="2023" />
              </Field>
            </div>
            <Field label="Description">
              <textarea name="description" rows={2} defaultValue={edu.description ?? ''} className={`${INPUT} resize-none`} />
            </Field>
            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
            <div className="flex gap-2">
              <button type="submit" disabled={isPending} className={BTN_PRIMARY}>
                <span className="absolute inset-0 bg-linear-to-r from-[#662483] to-[#2CB8C5] opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="relative">{isPending ? 'Enregistrement…' : 'Sauvegarder'}</span>
              </button>
              <button type="button" onClick={() => setEditing(false)} className={BTN_OUTLINE}>Annuler</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// ─── Add Professional form ─────────────────────────────────────────────────────
const AddProForm = ({ profileId }: { profileId: string }) => {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<{ success?: boolean; error?: string } | null, FormData>(
    async (_, formData) => {
      const result = await createProfessionalExperience(profileId, {
        job_title: formData.get('job_title') as string,
        company_name: formData.get('company_name') as string,
        start_date: (formData.get('start_date') as string) || undefined,
        end_date: (formData.get('end_date') as string) || undefined,
        description: (formData.get('description') as string) || undefined,
      });
      if (result.success) setOpen(false);
      return result;
    },
    null,
  );

  if (!open)
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-black/8 py-3.5 text-sm font-medium text-[#3C3C3B]/35 transition-all hover:border-[#2CB8C5]/30 hover:text-[#2CB8C5] hover:bg-[#2CB8C5]/3"
      >
        <Plus className="size-4" /> Ajouter une expérience
      </button>
    );

  return (
    <form action={formAction} className="mt-3 space-y-3 rounded-2xl border border-[#2CB8C5]/25 bg-[#2CB8C5]/3 p-5">
      <p className="text-xs font-bold text-[#2CB8C5] uppercase tracking-wider mb-1">Nouvelle expérience</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Poste *">
          <input name="job_title" required className={INPUT} placeholder="Développeur Front-end" />
        </Field>
        <Field label="Entreprise *">
          <input name="company_name" required className={INPUT} placeholder="Google" />
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Début">
          <input name="start_date" type="date" className={INPUT} />
        </Field>
        <Field label="Fin (laisser vide si en cours)">
          <input name="end_date" type="date" className={INPUT} />
        </Field>
      </div>
      <Field label="Description">
        <textarea name="description" rows={2} className={`${INPUT} resize-none`} placeholder="Décris tes missions et responsabilités..." />
      </Field>
      {state?.error && <p className="text-xs text-red-500">{state.error}</p>}
      <div className="flex gap-2">
        <button type="submit" className={BTN_PRIMARY}>
          <span className="relative flex items-center gap-2"><Plus className="size-4" /> Ajouter</span>
        </button>
        <button type="button" onClick={() => setOpen(false)} className={BTN_OUTLINE}>Annuler</button>
      </div>
    </form>
  );
};

// ─── Add Education form ───────────────────────────────────────────────────────
const AddEduForm = ({ profileId }: { profileId: string }) => {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<{ success?: boolean; error?: string } | null, FormData>(
    async (_, formData) => {
      const result = await createEducationExperience(profileId, {
        school_name: formData.get('school_name') as string,
        program: (formData.get('program') as string) || undefined,
        start_year: formData.get('start_year') ? parseInt(formData.get('start_year') as string) : undefined,
        end_year: formData.get('end_year') ? parseInt(formData.get('end_year') as string) : undefined,
        description: (formData.get('description') as string) || undefined,
      });
      if (result.success) setOpen(false);
      return result;
    },
    null,
  );

  if (!open)
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-black/8 py-3.5 text-sm font-medium text-[#3C3C3B]/35 transition-all hover:border-[#662483]/30 hover:text-[#662483] hover:bg-[#662483]/3"
      >
        <Plus className="size-4" /> Ajouter une formation
      </button>
    );

  return (
    <form action={formAction} className="mt-3 space-y-3 rounded-2xl border border-[#662483]/25 bg-[#662483]/3 p-5">
      <p className="text-xs font-bold text-[#662483] uppercase tracking-wider mb-1">Nouvelle formation</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="École *">
          <input name="school_name" required className={INPUT} placeholder="My Digital School" />
        </Field>
        <Field label="Programme">
          <input name="program" className={INPUT} placeholder="Bachelor Web Design" />
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Année début">
          <input name="start_year" type="number" className={INPUT} placeholder="2020" />
        </Field>
        <Field label="Année fin">
          <input name="end_year" type="number" className={INPUT} placeholder="2023" />
        </Field>
      </div>
      <Field label="Description">
        <textarea name="description" rows={2} className={`${INPUT} resize-none`} />
      </Field>
      {state?.error && <p className="text-xs text-red-500">{state.error}</p>}
      <div className="flex gap-2">
        <button type="submit" className={BTN_PRIMARY}>
          <span className="relative flex items-center gap-2"><Plus className="size-4" /> Ajouter</span>
        </button>
        <button type="button" onClick={() => setOpen(false)} className={BTN_OUTLINE}>Annuler</button>
      </div>
    </form>
  );
};

// ─── Main export ──────────────────────────────────────────────────────────────
type Props = { profile: Profile };

const updateAction = async (formData: FormData) => {
  await updateProfile(formData.get('profileId') as string, formData);
};

export const ProfileEditForm = ({ profile }: Props) => {
  const proBadge = profile.professional_experiences?.length
    ? String(profile.professional_experiences.length)
    : undefined;
  const eduBadge = profile.education_experiences?.length
    ? String(profile.education_experiences.length)
    : undefined;

  return (
    <div className="space-y-6">
      {/* ── Section 1: Identité ── */}
      <SectionCard
        icon={<User className="size-4 text-[#2CB8C5]" />}
        title="Informations personnelles"
        accent="bg-[#2CB8C5]/10"
      >
        <form action={updateAction} className="space-y-5">
          <input type="hidden" name="profileId" value={profile.id} />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Prénom">
              <input name="first_name" defaultValue={profile.first_name ?? ''} className={INPUT} placeholder="Prénom" />
            </Field>
            <Field label="Nom">
              <input name="last_name" defaultValue={profile.last_name ?? ''} className={INPUT} placeholder="Nom" />
            </Field>
          </div>

          <Field label="Bio — À propos de toi">
            <textarea
              name="bio"
              defaultValue={profile.bio ?? ''}
              rows={3}
              className={`${INPUT} resize-none`}
              placeholder="Partage ton parcours, tes passions, ce qui te définit..."
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Poste actuel">
              <input name="current_job_title" defaultValue={profile.current_job_title ?? ''} className={INPUT} placeholder="ex: Lead Developer" />
            </Field>
            <Field label="Entreprise actuelle">
              <input name="current_company" defaultValue={profile.current_company ?? ''} className={INPUT} placeholder="ex: Spotify" />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Secteur d'activité">
              <input name="current_sector" defaultValue={profile.current_sector ?? ''} className={INPUT} placeholder="ex: Tech, Finance, Santé..." />
            </Field>
            <Field label="Type de contrat">
              <select name="current_contract_type" defaultValue={profile.current_contract_type ?? ''} className={INPUT}>
                <option value="">— Non précisé</option>
                {['CDI', 'CDD', 'Freelance', 'Stage', 'Alternance', 'Intérim', 'Autre'].map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ville">
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-[#3C3C3B]/25" />
                <input name="location_city" defaultValue={profile.location_city ?? ''} className={`${INPUT} pl-9`} placeholder="Paris" />
              </div>
            </Field>
            <Field label="Pays">
              <input name="location_country" defaultValue={profile.location_country ?? ''} className={INPUT} placeholder="France" />
            </Field>
          </div>

          <Field label="URL LinkedIn">
            <input name="linkedin_url" type="url" defaultValue={profile.linkedin_url ?? ''} className={INPUT} placeholder="https://linkedin.com/in/votre-profil" />
          </Field>

          <Field label="Compétences (séparées par des virgules)">
            <input
              name="skills_raw"
              defaultValue={profile.skills?.join(', ') ?? ''}
              className={INPUT}
              placeholder="React, TypeScript, Figma, SEO, Data Analysis..."
            />
            {profile.skills && profile.skills.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {profile.skills.map(skill => (
                  <span key={skill} className="rounded-full bg-[#2CB8C5]/8 px-2.5 py-0.5 text-xs font-medium text-[#2CB8C5]">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </Field>

          {/* Mentor toggle */}
          <div className="flex items-center gap-4 rounded-2xl border border-black/6 bg-[#f8f8fb] p-4">
            <div className="size-9 rounded-xl bg-[#662483]/10 flex items-center justify-center shrink-0">
              <Sparkles className="size-4 text-[#662483]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#3C3C3B]">Disponible en tant que mentor</p>
              <p className="text-xs text-[#3C3C3B]/40 mt-0.5">Partage ton expérience avec les étudiants</p>
            </div>
            <label className="cursor-pointer">
              <input type="checkbox" name="is_mentor" defaultChecked={profile.is_mentor ?? false} className="sr-only peer" />
              <div className="relative w-11 h-6 bg-black/10 rounded-full peer-checked:bg-[#662483] transition-colors after:absolute after:left-1 after:top-1 after:size-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5" />
            </label>
          </div>

          <div className="flex flex-wrap gap-3 pt-2 border-t border-black/5">
            <button type="submit" className={`${BTN_PRIMARY} flex-1 sm:flex-none`}>
              <span className="absolute inset-0 bg-linear-to-r from-[#2CB8C5] to-[#662483] opacity-0 transition-opacity group-hover:opacity-100" />
              <span className="relative flex items-center justify-center gap-2">
                <Check className="size-4" />
                Enregistrer les informations
              </span>
            </button>
            <Link href={`/profile/${profile.id}`} className={BTN_OUTLINE}>
              Annuler
            </Link>
          </div>
        </form>
      </SectionCard>

      {/* ── Section 2: Expériences pro ── */}
      <SectionCard
        icon={<Briefcase className="size-4 text-[#2CB8C5]" />}
        title="Expériences professionnelles"
        badge={proBadge}
        accent="bg-[#2CB8C5]/10"
      >
        <div className="space-y-3">
          {(profile.professional_experiences?.length ?? 0) === 0 && (
            <p className="text-sm text-[#3C3C3B]/35 text-center py-4">Aucune expérience ajoutée</p>
          )}
          {profile.professional_experiences?.map(exp => (
            <ProExpItem key={exp.id} exp={exp} profileId={profile.id} />
          ))}
        </div>
        <AddProForm profileId={profile.id} />
      </SectionCard>

      {/* ── Section 3: Formations ── */}
      <SectionCard
        icon={<GraduationCap className="size-4 text-[#662483]" />}
        title="Formations"
        badge={eduBadge}
        accent="bg-[#662483]/10"
      >
        <div className="space-y-3">
          {(profile.education_experiences?.length ?? 0) === 0 && (
            <p className="text-sm text-[#3C3C3B]/35 text-center py-4">Aucune formation ajoutée</p>
          )}
          {profile.education_experiences?.map(edu => (
            <EduExpItem key={edu.id} edu={edu} profileId={profile.id} />
          ))}
        </div>
        <AddEduForm profileId={profile.id} />
      </SectionCard>
    </div>
  );
};
