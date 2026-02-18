import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import type { FormationModule } from '@/lib/types';

const AdminFormation = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<FormationModule | null>(null);
  const [formData, setFormData] = useState({
    ordre: 0,
    emoji: '🟣',
    titre: '',
    subtitle: '',
    pointsText: '',
  });

  const { data: modules = [], isLoading } = useQuery({
    queryKey: ['formation-modules'],
    queryFn: async (): Promise<FormationModule[]> => {
      const { data, error } = await supabase
        .from('formation_modules')
        .select('*')
        .order('ordre', { ascending: true });
      if (error) throw error;
      return (data || []).map((row) => ({
        ...row,
        points: Array.isArray(row.points) ? row.points : [],
      })) as FormationModule[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { ordre: number; emoji: string; titre: string; subtitle: string; points: string[] }) => {
      const { error } = await supabase.from('formation_modules').insert({
        ordre: data.ordre,
        emoji: data.emoji,
        titre: data.titre,
        subtitle: data.subtitle || null,
        points: data.points,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formation-modules'] });
      toast({ title: 'Siksè', description: 'Modil ajoute.' });
      resetForm();
    },
    onError: (e) => toast({ title: 'Erè', description: (e as Error).message, variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: FormationModule) => {
      const { error } = await supabase
        .from('formation_modules')
        .update({
          ordre: data.ordre,
          emoji: data.emoji,
          titre: data.titre,
          subtitle: data.subtitle || null,
          points: data.points,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formation-modules'] });
      toast({ title: 'Siksè', description: 'Modil mete ajou.' });
      resetForm();
    },
    onError: (e) => toast({ title: 'Erè', description: (e as Error).message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('formation_modules').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formation-modules'] });
      toast({ title: 'Siksè', description: 'Modil efase.' });
    },
    onError: (e) => toast({ title: 'Erè', description: (e as Error).message, variant: 'destructive' }),
  });

  const resetForm = () => {
    setFormData({ ordre: modules.length + 1, emoji: '🟣', titre: '', subtitle: '', pointsText: '' });
    setEditingModule(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (mod: FormationModule) => {
    setEditingModule(mod);
    setFormData({
      ordre: mod.ordre,
      emoji: mod.emoji || '🟣',
      titre: mod.titre,
      subtitle: mod.subtitle || '',
      pointsText: (mod.points || []).join('\n'),
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const points = formData.pointsText.split('\n').map((s) => s.trim()).filter(Boolean);
    if (editingModule) {
      updateMutation.mutate({
        ...editingModule,
        ordre: formData.ordre,
        emoji: formData.emoji,
        titre: formData.titre,
        subtitle: formData.subtitle || null,
        points,
      });
    } else {
      createMutation.mutate({
        ordre: formData.ordre,
        emoji: formData.emoji,
        titre: formData.titre,
        subtitle: formData.subtitle || null,
        points,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-3xl font-bold">Modil Fòmasyon</h1></div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Modil Fòmasyon</h1>
          <p className="text-muted-foreground">Modil ki parèt sou paj Pwogram (fòmasyon anliy)</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(o) => { setIsDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormData({ ...formData, ordre: modules.length + 1 })}>
              <Plus className="mr-2 h-4 w-4" />
              Ajoute modil
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingModule ? 'Modifye modil la' : 'Ajoute yon modil'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Òd</Label>
                  <Input
                    type="number"
                    value={formData.ordre}
                    onChange={(e) => setFormData({ ...formData, ordre: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Emoji</Label>
                  <Input
                    value={formData.emoji}
                    onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                    placeholder="🟣"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tit</Label>
                <Input
                  value={formData.titre}
                  onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Sou-tit</Label>
                <Input
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Pwen (yon pa liy)</Label>
                <Textarea
                  value={formData.pointsText}
                  onChange={(e) => setFormData({ ...formData, pointsText: e.target.value })}
                  rows={8}
                  placeholder="Premye pwen&#10;Dezyèm pwen"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>Anile</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingModule ? 'Mete ajou' : 'Ajoute'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lis modil</CardTitle>
        </CardHeader>
        <CardContent>
          {modules.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Pa gen modil. Ajoute yon modil pou paj Pwogram la.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Òd</TableHead>
                  <TableHead className="w-14">Emoji</TableHead>
                  <TableHead>Tit</TableHead>
                  <TableHead className="w-24">Aksyon</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modules.map((mod) => (
                  <TableRow key={mod.id}>
                    <TableCell>{mod.ordre}</TableCell>
                    <TableCell>{mod.emoji}</TableCell>
                    <TableCell className="font-medium">{mod.titre}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(mod)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(mod.id)} disabled={deleteMutation.isPending}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFormation;
