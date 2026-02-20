'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import {
  Users,
  Briefcase,
  Calendar,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Building2,
} from 'lucide-react';
import { NetworkCanvas } from './network-canvas';

interface Props {
  stats: {
    alumniCount: number;
    promotionCount: number;
    companyCount: number;
  };
}

/* ────────────────────── Animated counter ────────────────────── */

function useCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const start = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(target * eased));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

function Counter({
  value,
  label,
  suffix = '',
}: {
  value: number;
  label: string;
  suffix?: string;
}) {
  const { count, ref } = useCounter(value);
  return (
    <div className="text-center">
      <span
        ref={ref}
        className="font-bricolage text-5xl font-bold text-white md:text-6xl lg:text-7xl"
      >
        {count}
        {suffix}
      </span>
      <p className="mt-2 text-sm text-white/35 uppercase tracking-wider">{label}</p>
    </div>
  );
}

/* ────────────────────── Features data ────────────────────── */

const FEATURES = [
  {
    icon: Users,
    title: 'Annuaire Alumni',
    description:
      'Retrouvez et connectez-vous avec les alumni de toutes les promotions MDS.',
    color: '#2CB8C5',
    href: '/annuaire',
  },
  {
    icon: Briefcase,
    title: 'Opportunités',
    description:
      "Découvrez des offres d'emploi et de stage partagées par la communauté.",
    color: '#662483',
    href: '/jobs',
  },
  {
    icon: Calendar,
    title: 'Événements',
    description:
      'Participez aux rencontres, afterworks et événements entre anciens.',
    color: '#2CB8C5',
    href: '/events',
  },
  {
    icon: Sparkles,
    title: 'Mentorat',
    description:
      "Bénéficiez de l'accompagnement et de l'expertise des alumni seniors.",
    color: '#662483',
    href: '/annuaire',
  },
];

/* ────────────────────── Animation variants ────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

/* ────────────────────── Homepage ────────────────────── */

export function HomePage({ stats }: Props) {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  const heroContentY = useTransform(scrollY, [0, 600], [0, 120]);
  const heroContentOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <div className="overflow-hidden">
      {/* ═══════════════════ HERO ═══════════════════ */}
      <section
        ref={heroRef}
        className="relative flex min-h-dvh flex-col items-center justify-center bg-[#0a0a14] px-4"
      >
        <NetworkCanvas />

        {/* Gradient overlays */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(44,184,197,0.06),transparent_70%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(102,36,131,0.05),transparent_60%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-[#0a0a14] to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-[#0a0a14]/60 to-transparent" />

        <motion.div
          style={{ y: heroContentY, opacity: heroContentOpacity }}
          className="relative z-10 mx-auto max-w-4xl text-center"
        >
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="flex flex-col items-center"
          >
            {/* Badge */}
            <motion.div
              variants={fadeUp}
              className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/3 px-5 py-2.5 text-xs font-semibold text-white/50 backdrop-blur-md"
            >
              <span className="size-1.5 rounded-full bg-[#2CB8C5] shadow-[0_0_8px_2px_rgba(44,184,197,0.6)] animate-pulse" />
              Réseau Alumni · My Digital School
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={fadeUp}
              className="font-bricolage text-[2.75rem] font-bold leading-[1.08] text-white sm:text-6xl md:text-7xl lg:text-8xl"
            >
              Le réseau qui
              <br />
              <span className="animate-gradient bg-size-[200%_auto] bg-linear-to-r from-[#2CB8C5] via-[#62d0da] to-[#662483] bg-clip-text text-transparent">
                propulse
              </span>{' '}
              votre
              <br />
              carrière
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              className="mx-auto mt-7 max-w-lg text-base text-white/35 leading-relaxed sm:text-lg"
            >
              Retrouvez les anciens étudiants de My Digital School, explorez des
              opportunités et construisez un réseau professionnel durable.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-wrap items-center justify-center gap-4"
            >
              <Link
                href="/annuaire"
                className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-[#2CB8C5] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#2CB8C5]/25 transition-all duration-300 hover:shadow-xl hover:shadow-[#2CB8C5]/35 hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <span className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                Explorer l&apos;annuaire
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2.5 rounded-full border border-white/12 px-8 py-3.5 text-sm font-semibold text-white/70 backdrop-blur-sm transition-all duration-300 hover:bg-white/8 hover:border-white/20 hover:text-white"
              >
                Rejoindre le réseau
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Stats bar at bottom */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 z-10 w-full max-w-xl -translate-x-1/2 px-4 sm:bottom-10"
        >
          <div className="flex items-center justify-center gap-6 rounded-2xl border border-white/6 bg-white/3 px-6 py-4 backdrop-blur-xl sm:gap-10 sm:px-10">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-[#2CB8C5]/10">
                <Users className="size-4 text-[#2CB8C5]" />
              </div>
              <div>
                <p className="font-bricolage text-lg font-bold text-white sm:text-xl">
                  {stats.alumniCount}
                </p>
                <p className="text-[10px] text-white/30 uppercase tracking-wider">Alumni</p>
              </div>
            </div>
            <div className="h-8 w-px bg-white/8" />
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-[#662483]/10">
                <GraduationCap className="size-4 text-[#662483]" />
              </div>
              <div>
                <p className="font-bricolage text-lg font-bold text-white sm:text-xl">
                  {stats.promotionCount}
                </p>
                <p className="text-[10px] text-white/30 uppercase tracking-wider">Promotions</p>
              </div>
            </div>
            <div className="h-8 w-px bg-white/8" />
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-[#2CB8C5]/10">
                <Building2 className="size-4 text-[#2CB8C5]" />
              </div>
              <div>
                <p className="font-bricolage text-lg font-bold text-white sm:text-xl">
                  {stats.companyCount}+
                </p>
                <p className="text-[10px] text-white/30 uppercase tracking-wider">Entreprises</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════ FEATURES ═══════════════════ */}
      <section className="relative bg-white px-4 py-24 md:py-32">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#2CB8C5]/20 to-transparent" />

        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center"
          >
            <motion.p
              variants={fadeUp}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2CB8C5]"
            >
              La plateforme
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="font-bricolage mt-3 text-3xl font-bold text-[#3C3C3B] md:text-5xl"
            >
              Tout ce dont vous avez besoin
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mx-auto mt-4 max-w-lg text-[#3C3C3B]/50"
            >
              Une plateforme complète pour rester connecté à la communauté My
              Digital School.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {FEATURES.map((feature) => (
              <motion.div key={feature.title} variants={fadeUp}>
                <Link
                  href={feature.href}
                  className="group relative block h-full overflow-hidden rounded-3xl border border-black/4 bg-[#f8f9fc] p-7 transition-all duration-300 hover:border-black/8 hover:shadow-2xl hover:shadow-black/4 hover:-translate-y-1.5"
                >
                  <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-transparent to-transparent group-hover:from-[#2CB8C5]/2 group-hover:to-[#662483]/2 transition-all duration-500" />

                  <div
                    className="relative flex size-12 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                    style={{
                      backgroundColor: `${feature.color}12`,
                      boxShadow: 'none',
                    }}
                  >
                    <feature.icon
                      className="size-5.5 transition-colors"
                      style={{ color: feature.color }}
                    />
                  </div>
                  <h3 className="relative mt-5 font-bricolage text-lg font-bold text-[#3C3C3B] transition-colors group-hover:text-[#2CB8C5]">
                    {feature.title}
                  </h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-[#3C3C3B]/45">
                    {feature.description}
                  </p>
                  <div className="relative mt-4 flex items-center gap-1 text-xs font-semibold text-[#2CB8C5] opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2">
                    Découvrir
                    <ArrowRight className="size-3" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ STATS ═══════════════════ */}
      <section className="relative overflow-hidden bg-[#0a0a14] px-4 py-24 md:py-32">
        <div className="pointer-events-none absolute -top-40 -left-40 size-[500px] rounded-full bg-[#2CB8C5]/6 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 size-[500px] rounded-full bg-[#662483]/8 blur-[120px]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />

        <div className="container relative z-10 mx-auto max-w-4xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center"
          >
            <motion.p
              variants={fadeUp}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2CB8C5]"
            >
              La communauté en chiffres
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="font-bricolage mt-3 text-3xl font-bold text-white md:text-5xl"
            >
              Un réseau qui grandit
            </motion.h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-16 grid grid-cols-3 gap-4 sm:gap-8"
          >
            <Counter value={stats.alumniCount} label="Alumni inscrits" />
            <Counter value={stats.promotionCount} label="Promotions" />
            <Counter value={stats.companyCount} label="Entreprises" suffix="+" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mx-auto mt-16 h-px w-48 bg-linear-to-r from-transparent via-[#2CB8C5]/30 to-transparent"
          />
        </div>
      </section>

      {/* ═══════════════════ CTA ═══════════════════ */}
      <section className="relative overflow-hidden bg-white px-4 py-24 md:py-32">
        <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-[#2CB8C5]/4 blur-[80px]" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 size-96 rounded-full bg-[#662483]/4 blur-[80px]" />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="container relative z-10 mx-auto max-w-2xl text-center"
        >
          <motion.h2
            variants={fadeUp}
            className="font-bricolage text-3xl font-bold text-[#3C3C3B] md:text-5xl"
          >
            Prêt à rejoindre
            <br />
            <span className="bg-linear-to-r from-[#2CB8C5] to-[#662483] bg-clip-text text-transparent">
              la communauté ?
            </span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-5 max-w-md text-[#3C3C3B]/45 leading-relaxed"
          >
            Créez votre profil et accédez à toutes les fonctionnalités du réseau
            alumni My Digital School.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/login"
              className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-linear-to-r from-[#2CB8C5] to-[#662483] px-10 py-4 text-sm font-bold text-white shadow-lg shadow-[#2CB8C5]/15 transition-all duration-300 hover:shadow-xl hover:shadow-[#2CB8C5]/25 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <span className="absolute inset-0 bg-linear-to-r from-white/0 via-white/15 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              Commencer maintenant
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/annuaire"
              className="text-sm font-semibold text-[#3C3C3B]/50 transition-colors hover:text-[#2CB8C5]"
            >
              ou explorer l&apos;annuaire →
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
