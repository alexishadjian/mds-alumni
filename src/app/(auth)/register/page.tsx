import { signUp } from '@/lib/actions/auth';
import Link from 'next/link';

type Props = { searchParams: Promise<{ error?: string }> };

export const RegisterPage = async ({ searchParams }: Props) => {
    const { error } = await searchParams;
    return (
        <div className="flex min-h-screen items-center justify-center">
            <form action={signUp} className="flex w-full max-w-sm flex-col gap-4">
                <h1 className="text-2xl font-semibold">Inscription</h1>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    required
                    className="rounded border px-3 py-2"
                />
                <input
                    name="password"
                    type="password"
                    placeholder="Mot de passe"
                    required
                    minLength={6}
                    className="rounded border px-3 py-2"
                />
                <button type="submit" className="rounded bg-foreground px-4 py-2 text-background">
                    S&apos;inscrire
                </button>
                <Link href="/login" className="text-sm text-zinc-500">
                    Déjà un compte ? Se connecter
                </Link>
            </form>
        </div>
    );
};

export default RegisterPage;
