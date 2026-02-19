import { signUp } from '@/lib/actions/auth';
import Link from 'next/link';

type Props = { searchParams: Promise<{ error?: string }> };

export const RegisterPage = async ({ searchParams }: Props) => {
    const { error } = await searchParams;

    return (
        <form action={signUp} className="flex flex-col gap-7">
            {/* Heading */}
            <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#662483] mb-2">
                    Inscription
                </p>
                <h2 className="font-bricolage text-3xl font-bold text-[#3C3C3B] leading-tight">
                    Rejoins le
                    <br />
                    réseau MDS
                </h2>
                <p className="mt-2 text-sm text-[#3C3C3B]/45">
                    Crée ton profil et connecte-toi avec les alumni.
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3.5">
                    <span className="mt-0.5 size-4 shrink-0 rounded-full bg-red-500/15 text-red-500 flex items-center justify-center text-xs font-bold">
                        !
                    </span>
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {/* Fields */}
            <div className="space-y-4">
                <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#3C3C3B]/35">
                        Adresse email
                    </label>
                    <input
                        name="email"
                        type="email"
                        placeholder="prenom.nom@email.com"
                        required
                        className="w-full rounded-2xl border border-black/8 bg-[#f8f8fb] px-4 py-3.5 text-sm text-[#3C3C3B] placeholder:text-[#3C3C3B]/25 outline-none transition-all duration-200 focus:border-[#662483]/50 focus:bg-white focus:ring-4 focus:ring-[#662483]/8"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#3C3C3B]/35">
                        Mot de passe
                    </label>
                    <input
                        name="password"
                        type="password"
                        placeholder="••••••••••"
                        required
                        minLength={6}
                        className="w-full rounded-2xl border border-black/8 bg-[#f8f8fb] px-4 py-3.5 text-sm text-[#3C3C3B] placeholder:text-[#3C3C3B]/25 outline-none transition-all duration-200 focus:border-[#662483]/50 focus:bg-white focus:ring-4 focus:ring-[#662483]/8"
                    />
                    <p className="mt-1.5 text-xs text-[#3C3C3B]/30">Minimum 6 caractères</p>
                </div>
            </div>

            {/* CTA button */}
            <div className="space-y-3">
                <button
                    type="submit"
                    className="relative w-full overflow-hidden rounded-2xl bg-[#662483] px-6 py-4 text-sm font-bold text-white shadow-lg shadow-[#662483]/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#662483]/30 active:translate-y-0 group"
                >
                    {/* Shimmer sweep */}
                    <span className="absolute inset-0 overflow-hidden">
                        <span className="animate-shimmer absolute inset-y-0 w-1/3 bg-linear-to-r from-transparent via-white/20 to-transparent" />
                    </span>
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        Créer mon compte
                        <svg
                            className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                            />
                        </svg>
                    </span>
                </button>

                <p className="text-center text-sm text-[#3C3C3B]/40">
                    Déjà un compte ?{' '}
                    <Link
                        href="/login"
                        className="font-bold text-[#2CB8C5] transition-colors hover:text-[#2CB8C5]/70"
                    >
                        Se connecter
                    </Link>
                </p>
            </div>

            {/* Fine print */}
            <p className="text-center text-xs text-[#3C3C3B]/25 leading-relaxed">
                En créant un compte, tu acceptes nos{' '}
                <span className="underline decoration-dotted cursor-pointer">
                    conditions d&apos;utilisation
                </span>{' '}
                et notre{' '}
                <span className="underline decoration-dotted cursor-pointer">
                    politique de confidentialité
                </span>
                .
            </p>
        </form>
    );
};

export default RegisterPage;
