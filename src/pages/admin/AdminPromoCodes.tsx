import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PromoCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  valeur: number;
  date_expiration: string | null;
  utilisations_max: number | null;
  utilisations_actuelles: number;
  actif: boolean;
}

const AdminPromoCodes = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    valeur: 0,
    date_expiration: '',
    utilisations_max: '',
    actif: true,
  });

  const { data: promoCodes, isLoading } = useQuery({
    queryKey: ['promo-codes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as PromoCode[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<PromoCode, 'id' | 'utilisations_actuelles'>) => {
      const { error } = await supabase.from('promo_codes').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
      toast({ title: 'Succès', description: 'Code promo créé avec succès.' });
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<PromoCode> & { id: string }) => {
      const { error } = await supabase.from('promo_codes').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
      toast({ title: 'Succès', description: 'Code promo mis à jour.' });
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('promo_codes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
      toast({ title: 'Succès', description: 'Code promo supprimé.' });
    },
    onError: (error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, actif }: { id: string; actif: boolean }) => {
      const { error } = await supabase.from('promo_codes').update({ actif }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
    },
    onError: (error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'percentage',
      valeur: 0,
      date_expiration: '',
      utilisations_max: '',
      actif: true,
    });
    setEditingCode(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (code: PromoCode) => {
    setEditingCode(code);
    setFormData({
      code: code.code,
      type: code.type,
      valeur: code.valeur,
      date_expiration: code.date_expiration || '',
      utilisations_max: code.utilisations_max?.toString() || '',
      actif: code.actif,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      code: formData.code.toUpperCase(),
      type: formData.type,
      valeur: formData.valeur,
      date_expiration: formData.date_expiration || null,
      utilisations_max: formData.utilisations_max ? Number(formData.utilisations_max) : null,
      actif: formData.actif,
    };

    if (editingCode) {
      updateMutation.mutate({ id: editingCode.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce code promo ?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Codes Promo</h1>
          <p className="text-muted-foreground">Gérez les codes promotionnels</p>
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Codes Promo</h1>
          <p className="text-muted-foreground">Gérez les codes promotionnels</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Créer un code
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCode ? 'Modifier le code' : 'Créer un code promo'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="EX: PROMO20"
                  required
                />
              </div>
              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value: 'percentage' | 'fixed') => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Pourcentage (%)</SelectItem>
                      <SelectItem value="fixed">Montant fixe (HTG)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valeur">Valeur</Label>
                  <Input
                    id="valeur"
                    type="number"
                    min="0"
                    value={formData.valeur}
                    onChange={(e) => setFormData({ ...formData, valeur: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date_expiration">Date d'expiration</Label>
                  <Input
                    id="date_expiration"
                    type="date"
                    value={formData.date_expiration}
                    onChange={(e) => setFormData({ ...formData, date_expiration: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="utilisations_max">Limite d'utilisations</Label>
                  <Input
                    id="utilisations_max"
                    type="number"
                    min="0"
                    placeholder="Illimité"
                    value={formData.utilisations_max}
                    onChange={(e) => setFormData({ ...formData, utilisations_max: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="actif"
                  checked={formData.actif}
                  onCheckedChange={(checked) => setFormData({ ...formData, actif: checked })}
                />
                <Label htmlFor="actif">Actif</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Annuler
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingCode ? 'Mettre à jour' : 'Créer'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Codes promotionnels</CardTitle>
        </CardHeader>
        <CardContent>
          {promoCodes?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Aucun code promo pour le moment
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Valeur</TableHead>
                  <TableHead>Expiration</TableHead>
                  <TableHead>Utilisations</TableHead>
                  <TableHead>Actif</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promoCodes?.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell className="font-mono font-bold">{code.code}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {code.type === 'percentage' ? 'Pourcentage' : 'Fixe'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {code.type === 'percentage' ? `${code.valeur}%` : `${code.valeur} HTG`}
                    </TableCell>
                    <TableCell>
                      {code.date_expiration 
                        ? format(new Date(code.date_expiration), 'dd MMM yyyy', { locale: fr })
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {code.utilisations_actuelles}
                      {code.utilisations_max ? ` / ${code.utilisations_max}` : ' / ∞'}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={code.actif}
                        onCheckedChange={(checked) => toggleActiveMutation.mutate({ id: code.id, actif: checked })}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(code)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(code.id)}
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

export default AdminPromoCodes;
