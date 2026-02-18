import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSeminarInfo } from '@/hooks/useSeminarData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Loader2, Plus, Pencil, Trash2, Settings } from 'lucide-react';

interface ProgramModule {
  id: string;
  jour: number;
  titre: string;
  description: string;
  ordre: number;
}

const AdminProgram = () => {
  const queryClient = useQueryClient();
  const { data: seminarInfo } = useSeminarInfo();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<ProgramModule | null>(null);
  const [formData, setFormData] = useState({
    jour: 1,
    titre: '',
    description: '',
    ordre: 0,
  });
  const [sectionFormData, setSectionFormData] = useState({
    program_badge_text: '',
    program_title: '',
    program_subtitle: '',
  });

  const { data: modules, isLoading } = useQuery({
    queryKey: ['program-modules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('program_modules')
        .select('*')
        .order('jour', { ascending: true })
        .order('ordre', { ascending: true });
      if (error) {
        console.error('Error fetching modules:', error);
        throw error;
      }
      return data as ProgramModule[];
    },
    staleTime: 5 * 60 * 1000, // Cache 5 minutes
  });

  // Initialiser les données de la section quand seminarInfo est chargé
  useEffect(() => {
    if (seminarInfo) {
      setSectionFormData({
        program_badge_text: seminarInfo.program_badge_text || 'Pwogram konplè',
        program_title: seminarInfo.program_title || 'Pwogram Seminè a',
        program_subtitle: seminarInfo.program_subtitle || 'Twa jou entansif pou mete men sou zouti IA ki transfòme devlopman entènèt',
      });
    }
  }, [seminarInfo]);

  const createMutation = useMutation({
    mutationFn: async (data: Omit<ProgramModule, 'id'>) => {
      const { error } = await supabase.from('program_modules').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-modules'] });
      queryClient.refetchQueries({ queryKey: ['program-modules'], type: 'active' });
      toast({ title: 'Siksè', description: 'Modil ajoute avèk siksè.' });
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Erè', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: ProgramModule) => {
      const { error } = await supabase.from('program_modules').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-modules'] });
      queryClient.refetchQueries({ queryKey: ['program-modules'], type: 'active' });
      toast({ title: 'Siksè', description: 'Modil mete ajou.' });
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Erè', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('program_modules').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-modules'] });
      queryClient.refetchQueries({ queryKey: ['program-modules'], type: 'active' });
      toast({ title: 'Siksè', description: 'Modil efase.' });
    },
    onError: (error) => {
      toast({ title: 'Erè', description: error.message, variant: 'destructive' });
    },
  });

  // Mutation pour mettre à jour la section Programme
  const updateSectionMutation = useMutation({
    mutationFn: async (data: typeof sectionFormData) => {
      if (!seminarInfo?.id) throw new Error('Pa jwenn enfòmasyon seminè a');
      const { error } = await supabase
        .from('seminar_info')
        .update({
          program_badge_text: data.program_badge_text,
          program_title: data.program_title,
          program_subtitle: data.program_subtitle,
          updated_at: new Date().toISOString(),
        })
        .eq('id', seminarInfo.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seminar-info'] });
      queryClient.refetchQueries({ queryKey: ['seminar-info'], type: 'active' });
      toast({ title: 'Siksè', description: 'Seksyon Pwogram mete ajou.' });
      setIsSectionDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: 'Erè', description: error.message, variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({ jour: 1, titre: '', description: '', ordre: 0 });
    setEditingModule(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (module: ProgramModule) => {
    setEditingModule(module);
    setFormData({
      jour: module.jour,
      titre: module.titre,
      description: module.description,
      ordre: module.ordre,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingModule) {
      updateMutation.mutate({ id: editingModule.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Ou sèten ou vle efase modil sa a ?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Pwogram Seminè a</h1>
          <p className="text-muted-foreground">Jere modil pwogram nan</p>
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
<h1 className="text-3xl font-bold">Pwogram Seminè a</h1>
        <p className="text-muted-foreground">Jere modil pwogram nan</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isSectionDialogOpen} onOpenChange={setIsSectionDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Modifye seksyon an
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Modifye seksyon Pwogram</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); updateSectionMutation.mutate(sectionFormData); }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="program_badge_text">Badj (tèks badj la)</Label>
                  <Input
                    id="program_badge_text"
                    value={sectionFormData.program_badge_text}
                    onChange={(e) => setSectionFormData({ ...sectionFormData, program_badge_text: e.target.value })}
                    placeholder="Pwogram konplè"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="program_title">Tit prensipal</Label>
                  <Input
                    id="program_title"
                    value={sectionFormData.program_title}
                    onChange={(e) => setSectionFormData({ ...sectionFormData, program_title: e.target.value })}
                    placeholder="Pwogram Seminè a"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="program_subtitle">Sou-tit / Deskripsyon</Label>
                  <Textarea
                    id="program_subtitle"
                    value={sectionFormData.program_subtitle}
                    onChange={(e) => setSectionFormData({ ...sectionFormData, program_subtitle: e.target.value })}
                    rows={3}
                    placeholder="Twa jou entansif pou mete men sou zouti IA ki transfòme devlopman entènèt"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsSectionDialogOpen(false)}>
                    Anile
                  </Button>
                  <Button type="submit" disabled={updateSectionMutation.isPending}>
                    {updateSectionMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Anrejistre
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Ajoute yon modil
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingModule ? 'Modifye modil la' : 'Ajoute yon modil'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="jour">Jou</Label>
                  <Input
                    id="jour"
                    type="number"
                    min="1"
                    value={formData.jour}
                    onChange={(e) => setFormData({ ...formData, jour: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ordre">Ordre</Label>
                  <Input
                    id="ordre"
                    type="number"
                    value={formData.ordre}
                    onChange={(e) => setFormData({ ...formData, ordre: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="titre">Titre</Label>
                <Input
                  id="titre"
                  value={formData.titre}
                  onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Anile
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingModule ? 'Mete ajou' : 'Ajoute'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Modil pwogram nan</CardTitle>
        </CardHeader>
        <CardContent>
          {modules?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Pa gen modil pou kounye a
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Jou</TableHead>
                  <TableHead>Tit</TableHead>
                  <TableHead>Deskripsyon</TableHead>
                  <TableHead className="w-20">Òd</TableHead>
                  <TableHead className="w-24">Aksyon</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modules?.map((module) => (
                  <TableRow key={module.id}>
                    <TableCell className="font-medium">Jou {module.jour}</TableCell>
                    <TableCell>{module.titre}</TableCell>
                    <TableCell className="max-w-xs truncate">{module.description}</TableCell>
                    <TableCell>{module.ordre}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(module)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(module.id)}
                          disabled={deleteMutation.isPending}
                        >
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

export default AdminProgram;
