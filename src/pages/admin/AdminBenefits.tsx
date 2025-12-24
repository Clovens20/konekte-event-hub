import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Loader2, Plus, Pencil, Trash2, Award, Users, Clock, Target, Zap, Brain, Lightbulb, Rocket, Star } from 'lucide-react';

const iconOptions = [
  { value: 'Award', icon: Award, label: 'Award' },
  { value: 'Users', icon: Users, label: 'Users' },
  { value: 'Clock', icon: Clock, label: 'Clock' },
  { value: 'Target', icon: Target, label: 'Target' },
  { value: 'Zap', icon: Zap, label: 'Zap' },
  { value: 'Brain', icon: Brain, label: 'Brain' },
  { value: 'Lightbulb', icon: Lightbulb, label: 'Lightbulb' },
  { value: 'Rocket', icon: Rocket, label: 'Rocket' },
  { value: 'Star', icon: Star, label: 'Star' },
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Award, Users, Clock, Target, Zap, Brain, Lightbulb, Rocket, Star,
};

interface Benefit {
  id: string;
  titre: string;
  description: string;
  icon: string;
  ordre: number;
}

const AdminBenefits = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBenefit, setEditingBenefit] = useState<Benefit | null>(null);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    icon: 'Award',
    ordre: 0,
  });

  const { data: benefits, isLoading } = useQuery({
    queryKey: ['benefits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('benefits')
        .select('*')
        .order('ordre', { ascending: true });
      if (error) throw error;
      return data as Benefit[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<Benefit, 'id'>) => {
      const { error } = await supabase.from('benefits').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefits'] });
      toast({ title: 'Succès', description: 'Avantage ajouté avec succès.' });
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Benefit) => {
      const { error } = await supabase.from('benefits').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefits'] });
      toast({ title: 'Succès', description: 'Avantage mis à jour.' });
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('benefits').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefits'] });
      toast({ title: 'Succès', description: 'Avantage supprimé.' });
    },
    onError: (error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({ titre: '', description: '', icon: 'Award', ordre: 0 });
    setEditingBenefit(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (benefit: Benefit) => {
    setEditingBenefit(benefit);
    setFormData({
      titre: benefit.titre,
      description: benefit.description,
      icon: benefit.icon,
      ordre: benefit.ordre,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBenefit) {
      updateMutation.mutate({ id: editingBenefit.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet avantage ?')) {
      deleteMutation.mutate(id);
    }
  };

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || Award;
    return <IconComponent className="h-5 w-5" />;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Avantages</h1>
          <p className="text-muted-foreground">Gérez les avantages affichés</p>
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Avantages</h1>
          <p className="text-muted-foreground">Gérez les avantages affichés sur la page d'accueil</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un avantage
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingBenefit ? 'Modifier l\'avantage' : 'Ajouter un avantage'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="icon">Icône</Label>
                  <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <option.icon className="h-4 w-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  Annuler
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingBenefit ? 'Mettre à jour' : 'Ajouter'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des avantages</CardTitle>
        </CardHeader>
        <CardContent>
          {benefits?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Aucun avantage pour le moment
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Icône</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-20">Ordre</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {benefits?.map((benefit) => (
                  <TableRow key={benefit.id}>
                    <TableCell>{getIcon(benefit.icon)}</TableCell>
                    <TableCell className="font-medium">{benefit.titre}</TableCell>
                    <TableCell className="max-w-xs truncate">{benefit.description}</TableCell>
                    <TableCell>{benefit.ordre}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(benefit)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(benefit.id)}
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

export default AdminBenefits;
