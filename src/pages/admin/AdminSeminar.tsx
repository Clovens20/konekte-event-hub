import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import { format } from 'date-fns';

const AdminSeminar = () => {
  const queryClient = useQueryClient();
  
  const { data: seminar, isLoading } = useQuery({
    queryKey: ['seminar-info'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seminar_info')
        .select('*')
        .single();
      if (error) throw error;
      return data;
    },
  });

  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    lieu: '',
    date_debut: '',
    date_fin: '',
    prix_base: 0,
    nombre_places_total: 0,
    organisateur: '',
  });

  // Update form when data loads
  useState(() => {
    if (seminar) {
      setFormData({
        titre: seminar.titre,
        description: seminar.description,
        lieu: seminar.lieu,
        date_debut: seminar.date_debut,
        date_fin: seminar.date_fin,
        prix_base: seminar.prix_base,
        nombre_places_total: seminar.nombre_places_total,
        organisateur: seminar.organisateur,
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('seminar_info')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', seminar?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seminar-info'] });
      toast({
        title: 'Succès',
        description: 'Les informations du séminaire ont été mises à jour.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Informations du Séminaire</h1>
          <p className="text-muted-foreground">Gérez les détails du séminaire</p>
        </div>
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  // Initialize form data if seminar loaded
  if (seminar && !formData.titre) {
    setFormData({
      titre: seminar.titre,
      description: seminar.description,
      lieu: seminar.lieu,
      date_debut: seminar.date_debut,
      date_fin: seminar.date_fin,
      prix_base: seminar.prix_base,
      nombre_places_total: seminar.nombre_places_total,
      organisateur: seminar.organisateur,
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Informations du Séminaire</h1>
        <p className="text-muted-foreground">Gérez les détails du séminaire</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Détails du séminaire</CardTitle>
          <CardDescription>
            Modifiez les informations affichées sur la page d'accueil
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="titre">Titre du séminaire</Label>
                <Input
                  id="titre"
                  value={formData.titre}
                  onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="organisateur">Organisateur</Label>
                <Input
                  id="organisateur"
                  value={formData.organisateur}
                  onChange={(e) => setFormData({ ...formData, organisateur: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lieu">Lieu</Label>
              <Input
                id="lieu"
                value={formData.lieu}
                onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date_debut">Date de début</Label>
                <Input
                  id="date_debut"
                  type="date"
                  value={formData.date_debut}
                  onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date_fin">Date de fin</Label>
                <Input
                  id="date_fin"
                  type="date"
                  value={formData.date_fin}
                  onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="prix_base">Prix (HTG)</Label>
                <Input
                  id="prix_base"
                  type="number"
                  value={formData.prix_base}
                  onChange={(e) => setFormData({ ...formData, prix_base: Number(e.target.value) })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nombre_places_total">Nombre de places</Label>
                <Input
                  id="nombre_places_total"
                  type="number"
                  value={formData.nombre_places_total}
                  onChange={(e) => setFormData({ ...formData, nombre_places_total: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer les modifications
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSeminar;
