'use client';

import { useState } from 'react';
import { Post } from '@/types';
import { 
  Plus, Search, Edit2, Trash2, Calendar, 
  MapPin, MessageSquare, MoreHorizontal, Eye, EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EventDialog } from './event-dialog';
import { deletePost } from '@/lib/actions/posts';

interface EventsTableProps {
  initialPosts: Post[];
}

export function EventsTable({ initialPosts }: EventsTableProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(search.toLowerCase()) ||
    post.content.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;
    const result = await deletePost(id);
    if (result.success) {
      setPosts(posts.filter(p => p.id !== id));
    }
  };

  const openEdit = (post: Post) => {
    setSelectedPost(post);
    setIsDialogOpen(true);
  };

  const openCreate = () => {
    setSelectedPost(null);
    setIsDialogOpen(true);
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#3C3C3B]/30" />
          <Input 
            placeholder="Rechercher un événement..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 w-full rounded-2xl border-black/5 bg-[#F8F9FB] pl-11 text-sm font-medium transition-all focus:bg-white focus:ring-4 focus:ring-[#2CB8C5]/10"
          />
        </div>
        
        <Button 
          onClick={openCreate}
          className="h-12 rounded-2xl bg-[#3C3C3B] hover:bg-[#2CB8C5] text-white font-black uppercase tracking-widest text-[10px] px-8 transition-all hover:-translate-y-0.5 shadow-lg shadow-black/5"
        >
          <Plus className="mr-2 size-4" />
          Nouvel article
        </Button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-black/5">
        <table className="w-full text-left">
          <thead className="bg-[#F8F9FB] border-b border-black/5">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#3C3C3B]/30">Type / Titre</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#3C3C3B]/30">Date / Lieu</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#3C3C3B]/30 text-center">Statut</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#3C3C3B]/30 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {filteredPosts.map((post) => (
              <tr key={post.id} className="group hover:bg-[#F8F9FB]/50 transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className={`size-10 rounded-xl flex items-center justify-center border shrink-0 ${post.type === 'event' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-purple-50 border-purple-100 text-purple-600'}`}>
                        {post.type === 'event' ? <Calendar className="size-5" /> : <MessageSquare className="size-5" />}
                    </div>
                    <div>
                        <p className="font-bold text-[#3C3C3B] leading-tight group-hover:text-[#2CB8C5] transition-colors">{post.title}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#3C3C3B]/30 mt-1">{post.type === 'event' ? 'Événement' : 'Actualité'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-[#3C3C3B]/70">{formatDate(post.date)}</p>
                        {post.location && (
                            <p className="text-[10px] font-black text-[#3C3C3B]/30 uppercase flex items-center gap-1.5">
                                <MapPin className="size-3" />
                                {post.location}
                            </p>
                        )}
                    </div>
                </td>
                <td className="px-6 py-5 text-center">
                    <div className="flex justify-center">
                        {post.is_published ? (
                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                <Eye className="size-3" />
                                Public
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest border border-gray-200">
                                <EyeOff className="size-3" />
                                Brouillon
                            </span>
                        )}
                    </div>
                </td>
                <td className="px-6 py-5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="size-10 rounded-xl p-0 hover:bg-black/5 transition-colors">
                          <MoreHorizontal className="size-5 text-[#3C3C3B]/40" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-2xl border-black/5 shadow-xl shadow-black/5 p-2 min-w-[160px]">
                        <DropdownMenuItem onClick={() => openEdit(post)} className="rounded-xl px-4 py-3 text-sm font-bold text-[#3C3C3B] flex items-center gap-3 cursor-pointer hover:bg-[#2CB8C5]/10 hover:text-[#2CB8C5] transition-all">
                          <Edit2 className="size-4" /> Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(post.id)} className="rounded-xl px-4 py-3 text-sm font-bold text-red-600 flex items-center gap-3 cursor-pointer hover:bg-red-50 transition-all">
                          <Trash2 className="size-4" /> Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EventDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        post={selectedPost} 
        onSuccess={() => {
          // Re-fetch or manually update
          window.location.reload();
        }}
      />
    </div>
  );
}
