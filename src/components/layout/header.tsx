import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { AuthButton } from './auth-button';
import { ClientNav } from './client-nav';
import { HeaderShell } from './header-shell';
import { HeaderLogo } from './header-logo';

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
    <HeaderShell>
      <div className="container mx-auto flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <HeaderLogo />
          <ClientNav />
        </div>
        <AuthButton isLoggedIn={!!user} displayName={displayName} initials={initials} />
      </div>
    </HeaderShell>
  );
};
