'use client';

import { signOut } from '@/lib/actions/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOutIcon, UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useTransparentHeader } from './header-shell';

type Props = { isLoggedIn: boolean; displayName: string; initials: string };

export const AuthButton = ({ isLoggedIn, displayName, initials }: Props) => {
  const transparent = useTransparentHeader();

  if (!isLoggedIn)
    return (
      <Link
        href="/login"
        className={`rounded-full px-5 py-2 text-sm font-medium transition-all active:scale-95 ${
          transparent
            ? 'text-white bg-white/10 hover:bg-white/20 border border-white/15'
            : 'text-white bg-[#662483] hover:bg-[#662483]/90 hover:shadow-lg hover:shadow-[#662483]/20'
        }`}
      >
        Se connecter
      </Link>
    );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`flex items-center gap-2.5 rounded-full pl-1 pr-3.5 py-1 text-sm font-medium transition-all outline-none ${
          transparent
            ? 'hover:bg-white/10 text-white'
            : 'hover:bg-black/5 text-[#3C3C3B]'
        }`}
      >
        <span className="size-8 rounded-full bg-linear-to-br from-[#2CB8C5] to-[#662483] flex items-center justify-center text-white text-xs font-bold shrink-0">
          {initials}
        </span>
        <span className={`hidden sm:block ${transparent ? 'text-white' : 'text-[#3C3C3B]'}`}>
          {displayName}
        </span>
        <svg
          className={`size-3.5 hidden sm:block ${transparent ? 'text-white/40' : 'text-[#3C3C3B]/40'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 rounded-2xl p-1.5">
        <DropdownMenuItem asChild className="rounded-xl">
          <Link href="/profile/edit" className="flex items-center gap-2.5">
            <UserIcon className="size-4 text-[#3C3C3B]/50" />
            Mon profil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-1" />
        <form action={signOut}>
          <DropdownMenuItem asChild className="rounded-xl">
            <button type="submit" className="flex w-full items-center gap-2.5 text-red-500">
              <LogOutIcon className="size-4" />
              Déconnexion
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
