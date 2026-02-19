import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { getProfileById } from '@/lib/actions/profile';
import { ProfileEditForm } from '@/components/profile/profile-edit-form';
import { ArrowLeft, Pencil } from 'lucide-react';

type Props = { searchParams: Promise<{ id?: string }> };

export default async function ProfileEditPage({ searchParams }: Props) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { id } = await searchParams;
  const profileId = id || user.id;

  const profile = await getProfileById(profileId);
  if (!profile) redirect('/');

  const { data: myProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (user.id !== profileId && myProfile?.role !== 'admin') redirect(`/profile/${profileId}`);

  const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Profil';

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50/80 to-white">
      {/* Page header */}
      <div className="border-b border-black/5 bg-white/80 backdrop-blur-xl sticky top-16 z-40">
        <div className="container mx-auto max-w-3xl px-4 py-3 flex items-center gap-4">
          <Link
            href={`/profile/${profile.id}`}
            className="size-9 rounded-xl flex items-center justify-center border border-black/8 text-[#3C3C3B]/50 transition-all hover:border-black/15 hover:text-[#3C3C3B] hover:bg-black/3 shrink-0"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#3C3C3B]/40 font-medium">Modification du profil</p>
            <p className="font-semibold text-[#3C3C3B] text-sm truncate">{name}</p>
          </div>
          <div className="size-8 rounded-xl bg-[#2CB8C5]/10 flex items-center justify-center shrink-0">
            <Pencil className="size-3.5 text-[#2CB8C5]" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <ProfileEditForm profile={profile} />
      </div>
    </div>
  );
}
