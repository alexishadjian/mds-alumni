'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, X, ChevronDown, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const CONTRACT_TYPES = [
  { value: 'all', label: 'Tous les contrats' },
  { value: 'cdi', label: 'CDI' },
  { value: 'cdd', label: 'CDD' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'stage', label: 'Stage' },
  { value: 'alternance', label: 'Alternance' },
];

const SECTORS = [
  { value: 'all', label: 'Tous les secteurs' },
  { value: 'Tech', label: 'Tech' },
  { value: 'Design', label: 'Design' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Data', label: 'Data' },
  { value: 'Communication', label: 'Communication' },
  { value: 'Management', label: 'Management' },
  { value: 'Autre', label: 'Autre' },
];

export function JobFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const [contract, setContract] = useState(searchParams.get('type') ?? 'all');
  const [sector, setSector] = useState(searchParams.get('sector') ?? 'all');

  const updateFilters = (newSearch: string, newContract: string, newSector: string) => {
    const params = new URLSearchParams();
    if (newSearch) params.set('q', newSearch);
    if (newContract !== 'all') params.set('type', newContract);
    if (newSector !== 'all') params.set('sector', newSector);
    
    startTransition(() => {
      router.push(`/jobs?${params.toString()}`);
    });
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== (searchParams.get('q') ?? '')) {
        updateFilters(search, contract, sector);
      }
    }, 400)
    return () => clearTimeout(timer);
  }, [search]);

  const handleContractChange = (val: string) => {
    setContract(val);
    updateFilters(search, val, sector);
  };

  const handleSectorChange = (val: string) => {
    setSector(val);
    updateFilters(search, contract, val);
  };

  const clearFilters = () => {
    setSearch('');
    setContract('all');
    setSector('all');
    router.push('/jobs');
  };

  const hasActiveFilters = search || contract !== 'all' || sector !== 'all';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#3C3C3B]/25" />
          <Input 
            placeholder="Rechercher par poste, entreprise..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 pl-11 rounded-2xl border-black/8 bg-white focus:ring-4 focus:ring-[#2CB8C5]/10 focus:border-[#2CB8C5]/40 text-sm placeholder:text-[#3C3C3B]/30"
          />
        </div>

        {/* Contract Type Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-12 rounded-2xl border-black/8 px-5 gap-2 font-semibold text-[#3C3C3B]/70 hover:bg-black/2 transition-all">
              {CONTRACT_TYPES.find(c => c.value === contract)?.label || 'Contrat'}
              <ChevronDown className="size-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="rounded-2xl p-2 min-w-[180px]">
            {CONTRACT_TYPES.map(item => (
              <DropdownMenuItem 
                key={item.value} 
                onClick={() => handleContractChange(item.value)}
                className="rounded-xl px-4 py-2 gap-2 text-sm font-medium cursor-pointer"
              >
                {item.label}
                {contract === item.value && <Check className="size-4 ml-auto text-[#2CB8C5]" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sector Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-12 rounded-2xl border-black/8 px-5 gap-2 font-semibold text-[#3C3C3B]/70 hover:bg-black/2 transition-all">
              {SECTORS.find(s => s.value === sector)?.label || 'Secteur'}
              <ChevronDown className="size-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="rounded-2xl p-2 min-w-[180px]">
            {SECTORS.map(item => (
              <DropdownMenuItem 
                key={item.value} 
                onClick={() => handleSectorChange(item.value)}
                className="rounded-xl px-4 py-2 gap-2 text-sm font-medium cursor-pointer"
              >
                {item.label}
                {sector === item.value && <Check className="size-4 ml-auto text-[#2CB8C5]" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            onClick={clearFilters}
            className="h-12 px-5 gap-2 rounded-2xl text-[#3C3C3B]/40 hover:text-red-500 hover:bg-red-50 font-bold transition-all"
          >
            <X className="size-4" />
            Réinitialiser
          </Button>
        )}
      </div>

      {isPending && (
        <div className="flex items-center gap-2 px-2 text-[10px] font-black uppercase tracking-widest text-[#2CB8C5]/60 animate-pulse">
           Mise à jour des résultats...
        </div>
      )}
    </div>
  );
}
