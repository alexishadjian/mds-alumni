import { mydigitalschoollogo } from '@/public/assets';
import Image from 'next/image';

const STATS = [
    { value: '500+', label: 'Alumni' },
    { value: '12', label: 'Promotions' },
    { value: '8', label: 'Programmes' },
] as const;

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-[#0a0a14]">
            {/* ── LEFT: dark branding panel ── */}
            <div className="relative hidden overflow-hidden lg:flex lg:w-[58%] flex-col justify-between p-12 xl:p-16">
                {/* Deep background gradient */}
                <div className="absolute inset-0 bg-linear-to-br from-[#0a0a14] via-[#0d1020] to-[#110820]" />

                {/* Animated orbs */}
                <div className="animate-blob absolute -top-24 -left-16 size-[480px] rounded-full bg-[#2CB8C5]/15 blur-[80px]" />
                <div className="animate-blob animation-delay-2000 absolute bottom-1/4 -right-20 size-[520px] rounded-full bg-[#662483]/18 blur-[90px]" />
                <div className="animate-blob animation-delay-4000 absolute top-1/2 left-1/3 size-[320px] rounded-full bg-[#2CB8C5]/8 blur-[70px]" />

                {/* Dot grid */}
                <div
                    className="absolute inset-0 opacity-100"
                    style={{
                        backgroundImage:
                            'radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px)',
                        backgroundSize: '26px 26px',
                    }}
                />

                {/* Top edge gradient line */}
                <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#2CB8C5]/40 to-transparent" />

                {/* ── Logo ── */}
                <div className="relative z-10">
                    <Image
                        src={mydigitalschoollogo}
                        alt="My Digital School"
                        width={130}
                        height={40}
                        className="h-8 w-auto brightness-0 invert opacity-85"
                    />
                </div>

                {/* ── Hero copy ── */}
                <div className="relative z-10 max-w-md">
                    <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/50 backdrop-blur-md">
                        <span className="size-1.5 rounded-full bg-[#2CB8C5] shadow-[0_0_8px_#2CB8C5] animate-pulse" />
                        Réseau Alumni · My Digital School
                    </div>

                    <h1 className="font-bricolage text-4xl font-bold leading-[1.12] text-white xl:text-5xl">
                        Le réseau qui
                        <br />
                        <span className="bg-linear-to-r from-[#2CB8C5] via-[#40d0dd] to-[#662483] bg-clip-text text-transparent">
                            t&apos;ouvre les portes
                        </span>
                        <br />
                        du futur.
                    </h1>

                    <p className="mt-5 text-sm leading-relaxed text-white/38">
                        Retrouve les anciens étudiants, explore des opportunités de carrière et
                        construis ton réseau professionnel durable.
                    </p>

                    {/* Decorative quote */}
                    <blockquote className="mt-8 border-l-2 border-[#2CB8C5]/40 pl-4">
                        <p className="text-sm italic text-white/30">
                            &quot;MDS m&apos;a donné les clés, le réseau alumni m&apos;a ouvert les
                            portes&quot;.
                        </p>
                        <footer className="mt-1.5 text-xs text-white/20">
                            — Alumni MDS, promo 2022
                        </footer>
                    </blockquote>
                </div>

                {/* ── Stats pills ── */}
                <div className="relative z-10 grid grid-cols-3 gap-3">
                    {STATS.map(({ value, label }) => (
                        <div
                            key={label}
                            className="rounded-2xl border border-white/8 bg-white/5 p-4 backdrop-blur-sm transition-colors hover:border-white/12 hover:bg-white/8"
                        >
                            <p className="font-bricolage text-2xl font-bold text-white">{value}</p>
                            <p className="mt-0.5 text-xs text-white/35">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Bottom edge gradient line */}
                <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-[#662483]/30 to-transparent" />
            </div>

            {/* ── RIGHT: form panel ── */}
            <div className="relative flex flex-1 flex-col items-center justify-center bg-white px-6 py-12 lg:px-14 xl:px-20">
                {/* Subtle top-left accent */}
                <div className="pointer-events-none absolute top-0 left-0 size-64 rounded-full bg-[#2CB8C5]/4 blur-3xl" />
                <div className="pointer-events-none absolute bottom-0 right-0 size-48 rounded-full bg-[#662483]/4 blur-3xl" />

                {/* Mobile logo */}
                <div className="mb-10 lg:hidden">
                    <Image
                        src={mydigitalschoollogo}
                        alt="My Digital School"
                        width={120}
                        height={36}
                        className="h-8 w-auto"
                    />
                </div>

                <div className="relative z-10 w-full max-w-[360px]">{children}</div>
            </div>
        </div>
    );
}
