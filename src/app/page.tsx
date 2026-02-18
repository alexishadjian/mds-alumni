import { signOut } from '@/lib/actions/auth';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';

export default async function Home() {
    const supabase = createClient(await cookies());
    const {
        data: { user },
    } = await supabase.auth.getUser();
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
                <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
                    <p className="font-sans">Bricolage Grotesque</p>
                    <p className="font-bricolage">Bricolage Grotesque</p>
                    <p className="font-inter">Inter</p>
                    <p className="font-bricolage font-light">Light 300</p>
                    <p className="font-bricolage font-normal">Normal 400</p>
                    <p className="font-bricolage font-medium">Medium 500</p>
                    <p className="font-bricolage font-semibold">SemiBold 600</p>
                    <p className="font-bricolage font-bold">Bold 700</p>
                </div>
                <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
                    {user ? (
                        <form action={signOut}>
                            <button type="submit" className="rounded border px-4 py-2">
                                Déconnexion
                            </button>
                        </form>
                    ) : (
                        <>
                            <Link href="/login" className="rounded border px-4 py-2">
                                Connexion
                            </Link>
                            <Link
                                href="/register"
                                className="rounded bg-foreground px-4 py-2 text-background"
                            >
                                Inscription
                            </Link>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
