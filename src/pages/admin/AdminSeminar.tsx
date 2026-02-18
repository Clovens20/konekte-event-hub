import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSeminarInfo } from '@/hooks/useSeminarData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import { format } from 'date-fns';
import { logError, showError } from '@/lib/error-handler';

const AdminSeminar = () => {
  const queryClient = useQueryClient();
  
  // Utiliser le hook partagé pour éviter la duplication de requête
  const { data: seminar, isLoading } = useSeminarInfo();

  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    lieu: '',
    date_debut: '',
    date_fin: '',
    prix_base: 0,
    nombre_places_total: 0,
    organisateur: '',
    pricing_badge_text: '',
    pricing_title: '',
    pricing_subtitle: '',
    pricing_features: [] as string[],
    pricing_promo_notice: '',
  });

  // Update form when data loads
  useEffect(() => {
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
        pricing_badge_text: (seminar as any).pricing_badge_text || 'Tarif spécial lancement',
        pricing_title: (seminar as any).pricing_title || 'Investissez dans votre avenir',
        pricing_subtitle: (seminar as any).pricing_subtitle || 'Un investissement unique pour des compétences qui vous accompagneront toute votre carrière',
        pricing_features: ((seminar as any).pricing_features as string[]) || [
          '3 jours de formation intensive',
          'Certificat officiel Konekte Group',
          'Matériel pédagogique complet',
          'Accès à la communauté exclusive',
          '3 mois de support post-formation',
          'Projets pratiques guidés',
        ],
        pricing_promo_notice: (seminar as any).pricing_promo_notice || 'Codes promo disponibles lors de l\'inscription',
      });
    }
  }, [seminar]);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('seminar_info')
        .update({
          titre: data.titre,
          description: data.description,
          lieu: data.lieu,
          date_debut: data.date_debut,
          date_fin: data.date_fin,
          prix_base: data.prix_base,
          nombre_places_total: data.nombre_places_total,
          organisateur: data.organisateur,
          pricing_badge_text: data.pricing_badge_text,
          pricing_title: data.pricing_title,
          pricing_subtitle: data.pricing_subtitle,
          pricing_features: data.pricing_features,
          pricing_promo_notice: data.pricing_promo_notice,
          updated_at: new Date().toISOString(),
        })
        .eq('id', seminar?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      // Invalider et forcer le refetch immédiat de toutes les queries liées
      queryClient.invalidateQueries({ queryKey: ['seminar-info'] });
      // Forcer le refetch immédiat des queries actives
      queryClient.refetchQueries({ queryKey: ['seminar-info'], type: 'active' });
      toast({
        title: 'Siksè',
        description: 'Enfòmasyon seminè a mete ajou.',
      });
    },
    onError: (error) => {
      logError(error, 'UpdateSeminar');
      showError(error, 'Erè lè w ap mete ajou');
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
          <h1 className="text-3xl font-bold">Enfòmasyon Seminè a</h1>
          <p className="text-muted-foreground">Jere detay seminè a</p>
        </div>
        <Skeleton className="h-[600px]" />
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Enfòmasyon Seminè a</h1>
        <p className="text-muted-foreground">Jere detay seminè a</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detay seminè a</CardTitle>
          <CardDescription>
            Modifye enfòmasyon ki parèt sou paj akèy la
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="titre">Tit seminè a</Label>
                <Input
                  id="titre"
                  value={formData.titre}
                  onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="organisateur">Òganizatè</Label>
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
              <Label htmlFor="lieu">Kote</Label>
              <Input
                id="lieu"
                value={formData.lieu}
                onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date_debut">Dat kòmansman</Label>
                <Input
                  id="date_debut"
                  type="date"
                  value={formData.date_debut}
                  onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date_fin">Dat fen</Label>
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
                <Label htmlFor="nombre_places_total">Kantite kote</Label>
                <Input
                  id="nombre_places_total"
                  type="number"
                  value={formData.nombre_places_total}
                  onChange={(e) => setFormData({ ...formData, nombre_places_total: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            {/* Section Tarification */}
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">Seksyon Tarifikasyon</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pricing_badge_text">Badj (egz: "Pri espesyal lansman")</Label>
                  <Input
                    id="pricing_badge_text"
                    value={formData.pricing_badge_text}
                    onChange={(e) => setFormData({ ...formData, pricing_badge_text: e.target.value })}
                    placeholder="Pri espesyal lansman"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pricing_title">Tit prensipal</Label>
                  <Input
                    id="pricing_title"
                    value={formData.pricing_title}
                    onChange={(e) => setFormData({ ...formData, pricing_title: e.target.value })}
                    placeholder="Investissez dans votre avenir"
                  />
                  <p className="text-xs text-muted-foreground">
                    Dènye mo a ap mete an evidans otomatikman
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pricing_subtitle">Sou-tit</Label>
                  <Textarea
                    id="pricing_subtitle"
                    value={formData.pricing_subtitle}
                    onChange={(e) => setFormData({ ...formData, pricing_subtitle: e.target.value })}
                    rows={2}
                    placeholder="Un investissement unique pour des compétences qui vous accompagneront toute votre carrière"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Avantaj enkli (yon pa liy)</Label>
                  <Textarea
                    value={formData.pricing_features.join('\n')}
                    onChange={(e) => {
                      const features = e.target.value.split('\n').filter(f => f.trim() !== '');
                      setFormData({ ...formData, pricing_features: features });
                    }}
                    rows={6}
                    placeholder="3 jours de formation intensive&#10;Certificat officiel Konekte Group&#10;Matériel pédagogique complet"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separe chak avantaj pa yon nouvo liy
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pricing_promo_notice">Avi kòd promosyon</Label>
                  <Input
                    id="pricing_promo_notice"
                    value={formData.pricing_promo_notice}
                    onChange={(e) => setFormData({ ...formData, pricing_promo_notice: e.target.value })}
                    placeholder="Kòd promosyon disponib lè w ap enskri"
                  />
                </div>
              </div>
            </div>

            {/* Section Tarification */}
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">Seksyon Tarifikasyon</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pricing_badge_text">Badj (egz: "Pri espesyal lansman")</Label>
                  <Input
                    id="pricing_badge_text"
                    value={formData.pricing_badge_text}
                    onChange={(e) => setFormData({ ...formData, pricing_badge_text: e.target.value })}
                    placeholder="Pri espesyal lansman"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pricing_title">Tit prensipal</Label>
                  <Input
                    id="pricing_title"
                    value={formData.pricing_title}
                    onChange={(e) => setFormData({ ...formData, pricing_title: e.target.value })}
                    placeholder="Investissez dans votre avenir"
                  />
                  <p className="text-xs text-muted-foreground">
                    Dènye mo a ap mete an evidans otomatikman
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pricing_subtitle">Sou-tit</Label>
                  <Textarea
                    id="pricing_subtitle"
                    value={formData.pricing_subtitle}
                    onChange={(e) => setFormData({ ...formData, pricing_subtitle: e.target.value })}
                    rows={2}
                    placeholder="Un investissement unique pour des compétences qui vous accompagneront toute votre carrière"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Avantaj enkli (yon pa liy)</Label>
                  <Textarea
                    value={formData.pricing_features.join('\n')}
                    onChange={(e) => {
                      const features = e.target.value.split('\n').filter(f => f.trim() !== '');
                      setFormData({ ...formData, pricing_features: features });
                    }}
                    rows={6}
                    placeholder="3 jours de formation intensive&#10;Certificat officiel Konekte Group&#10;Matériel pédagogique complet"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separe chak avantaj pa yon nouvo liy
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pricing_promo_notice">Avi kòd promosyon</Label>
                  <Input
                    id="pricing_promo_notice"
                    value={formData.pricing_promo_notice}
                    onChange={(e) => setFormData({ ...formData, pricing_promo_notice: e.target.value })}
                    placeholder="Kòd promosyon disponib lè w ap enskri"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ap anrejistre...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Anrejistre chanjman yo
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
