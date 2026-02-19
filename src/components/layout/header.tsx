import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { mydigitalschoollogo } from '@/public/assets';
import { AuthButton } from './auth-button';
import { ClientNav } from './client-nav';

export const Header = async () => {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  const profile = user
    ? (await supabase.from('profiles').select('first_name, last_name').eq('id', user.id).single()).data
    : null;
  const displayName = profile?.first_name || user?.email?.split('@')[0] || 'Profil';
  const initials = [profile?.first_name?.[0], profile?.last_name?.[0]]
    .filter(Boolean).join('').toUpperCase() || displayName[0]?.toUpperCase() || '?';

  return (
    <header className="sticky top-0 z-50 h-16 bg-white/80 backdrop-blur-xl border-b border-black/5 shadow-[0_1px_0_0_rgba(0,0,0,0.04)]">
      <div className="container mx-auto flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center">
            <Image
              src={mydigitalschoollogo}
              alt="My Digital School"
              width={130}
              height={40}
              className="h-8 w-auto object-contain"
            />
          </Link>
          <ClientNav />
        </div>
        <AuthButton isLoggedIn={!!user} displayName={displayName} initials={initials} />
      </div>
    </header>
  );
};
