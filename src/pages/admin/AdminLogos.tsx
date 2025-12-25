import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Loader2, Save, Upload, Image as ImageIcon, Plus } from 'lucide-react';
import { logError, showError } from '@/lib/error-handler';

interface LogoConfig {
  id: string;
  location: string;
  logo_type: string;
  file_path: string | null;
  file_name: string | null;
  display_text: string | null;
  display_order: number;
  is_active: boolean;
}

const AdminLogos = () => {
  const queryClient = useQueryClient();
  
  const { data: logos, isLoading } = useQuery({
    queryKey: ['logo-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('logo_config')
        .select('*')
        .order('location', { ascending: true })
        .order('display_order', { ascending: true });
      
      if (error) {
        logError(error, 'AdminLogos');
        throw error;
      }
      return data as LogoConfig[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const [editingLogo, setEditingLogo] = useState<LogoConfig | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    location: 'footer' as 'header' | 'footer',
    logo_type: 'ggtc' as 'ggtc' | 'konekte-group' | 'innovaport',
    file_name: '',
    display_text: '',
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    if (editingLogo) {
      setFormData({
        location: editingLogo.location as 'header' | 'footer',
        logo_type: editingLogo.logo_type as 'ggtc' | 'konekte-group' | 'innovaport',
        file_name: editingLogo.file_name || '',
        display_text: editingLogo.display_text || '',
        display_order: editingLogo.display_order,
        is_active: editingLogo.is_active,
      });
      setIsCreating(false);
    } else if (isCreating) {
      // Réinitialiser le formulaire pour la création
      setFormData({
        location: 'footer',
        logo_type: 'ggtc',
        file_name: '',
        display_text: '',
        display_order: 0,
        is_active: true,
      });
    }
  }, [editingLogo, isCreating]);

  const createMutation = useMutation({
    mutationFn: async (data: Omit<LogoConfig, 'id' | 'created_at' | 'updated_at'>) => {
      const { error } = await supabase
        .from('logo_config')
        .insert({
          location: data.location,
          logo_type: data.logo_type,
          file_path: data.file_name ? `/logos/${data.file_name}` : null,
          file_name: data.file_name,
          display_text: data.display_text,
          display_order: data.display_order,
          is_active: data.is_active,
        });
      
      if (error) {
        logError(error, 'CreateLogoConfig');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logo-config'] });
      toast({ title: 'Succès', description: 'Logo créé avec succès.' });
      setIsCreating(false);
      setEditingLogo(null);
    },
    onError: (error) => {
      showError(error, 'Erreur lors de la création');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<LogoConfig> & { id: string }) => {
      const { error } = await supabase
        .from('logo_config')
        .update({
          ...updates,
          file_path: updates.file_name ? `/logos/${updates.file_name}` : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      
      if (error) {
        logError(error, 'UpdateLogoConfig');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logo-config'] });
      toast({ title: 'Succès', description: 'Configuration du logo mise à jour.' });
      setEditingLogo(null);
      setIsCreating(false);
    },
    onError: (error) => {
      showError(error, 'Erreur lors de la mise à jour');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreating) {
      createMutation.mutate({
        location: formData.location,
        logo_type: formData.logo_type,
        file_name: formData.file_name,
        display_text: formData.display_text,
        display_order: formData.display_order,
        is_active: formData.is_active,
        file_path: formData.file_name ? `/logos/${formData.file_name}` : null,
      });
    } else if (editingLogo) {
      updateMutation.mutate({ id: editingLogo.id, ...formData });
    }
  };

  const handleCreateNew = (location: 'header' | 'footer', logoType?: 'ggtc' | 'konekte-group' | 'innovaport') => {
    setIsCreating(true);
    setEditingLogo(null);
    setFormData({
      location,
      logo_type: logoType || 'ggtc',
      file_name: '',
      display_text: '',
      display_order: location === 'header' ? 1 : (logos?.filter(l => l.location === location).length || 0) + 1,
      is_active: true,
    });
  };

  const getLocationLabel = (location: string) => {
    switch (location) {
      case 'header': return 'Header';
      case 'footer': return 'Footer';
      default: return location;
    }
  };

  const getLogoTypeLabel = (type: string) => {
    switch (type) {
      case 'ggtc': return 'GGTC';
      case 'konekte-group': return 'Konekte Group';
      case 'innovaport': return 'InnovaPort';
      default: return type;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Logos</h1>
          <p className="text-muted-foreground">Gérez les logos du header et du footer</p>
        </div>
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  const headerLogos = logos?.filter(l => l.location === 'header') || [];
  const footerLogos = logos?.filter(l => l.location === 'footer') || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestion des Logos</h1>
        <p className="text-muted-foreground">Gérez les logos affichés dans le header et le footer</p>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>1. Placez vos fichiers logo dans le dossier <code className="bg-muted px-1 rounded">public/logos/</code></p>
            <p>2. Entrez le nom exact du fichier (ex: <code className="bg-muted px-1 rounded">ggtc-logo.jpg</code>)</p>
            <p>3. Le système chargera automatiquement le logo depuis <code className="bg-muted px-1 rounded">/logos/</code></p>
            <p className="text-destructive font-medium">⚠️ Assurez-vous que le fichier existe dans public/logos/ avant de sauvegarder</p>
          </div>
        </CardContent>
      </Card>

      {/* Header Logos */}
      <Card>
        <CardHeader>
          <CardTitle>Logos du Header</CardTitle>
          <CardDescription>Logo affiché dans la barre de navigation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {headerLogos.map((logo) => (
              <div key={logo.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{getLogoTypeLabel(logo.logo_type)}</h4>
                    <p className="text-sm text-muted-foreground">Emplacement: {getLocationLabel(logo.location)}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingLogo(logo)}
                  >
                    Modifier
                  </Button>
                </div>
                {logo.file_name && (
                  <div className="flex items-center gap-3">
                    <ImageIcon className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm">{logo.file_name}</span>
                    {logo.file_path && (
                      <img 
                        src={logo.file_path} 
                        alt={logo.display_text || logo.logo_type}
                        className="h-8 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer Logos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Logos du Footer</CardTitle>
              <CardDescription>Logos affichés dans la section "Financé par"</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCreateNew('footer')}
            >
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un logo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {footerLogos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Aucun logo configuré pour le footer.</p>
                <p className="text-sm mt-2">Cliquez sur "Ajouter un logo" pour en créer un.</p>
              </div>
            ) : (
              footerLogos.map((logo) => (
                <div key={logo.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{getLogoTypeLabel(logo.logo_type)}</h4>
                      <p className="text-sm text-muted-foreground">Emplacement: {getLocationLabel(logo.location)}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingLogo(logo);
                        setIsCreating(false);
                      }}
                    >
                      Modifier
                    </Button>
                  </div>
                  {logo.file_name && (
                    <div className="flex items-center gap-3">
                      <ImageIcon className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm">{logo.file_name}</span>
                      {logo.file_path && (
                        <img 
                          src={logo.file_path} 
                          alt={logo.display_text || logo.logo_type}
                          className="h-8 object-contain filter brightness-0 invert"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit/Create Dialog */}
      {(editingLogo || isCreating) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isCreating ? 'Ajouter un nouveau logo' : `Modifier le logo: ${getLogoTypeLabel(editingLogo?.logo_type || formData.logo_type)}`}
            </CardTitle>
            <CardDescription>
              Emplacement: {getLocationLabel(editingLogo?.location || formData.location)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isCreating && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="logo_type">Type de logo</Label>
                    <Select
                      value={formData.logo_type}
                      onValueChange={(value) => setFormData({ ...formData, logo_type: value as 'ggtc' | 'konekte-group' | 'innovaport' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ggtc">GGTC</SelectItem>
                        <SelectItem value="konekte-group">Konekte Group</SelectItem>
                        <SelectItem value="innovaport">InnovaPort</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="file_name">Nom du fichier *</Label>
                <Input
                  id="file_name"
                  value={formData.file_name}
                  onChange={(e) => setFormData({ ...formData, file_name: e.target.value })}
                  placeholder="ggtc-logo.jpg"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Nom exact du fichier dans public/logos/ (ex: ggtc-logo.jpg, konekte-group-logo.png, innovaport-logo.png)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_text">Texte d'affichage (optionnel)</Label>
                <Input
                  id="display_text"
                  value={formData.display_text}
                  onChange={(e) => setFormData({ ...formData, display_text: e.target.value })}
                  placeholder={getLogoTypeLabel(formData.logo_type)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_order">Ordre d'affichage</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="is_active">Actif</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={updateMutation.isPending || createMutation.isPending}>
                  {(updateMutation.isPending || createMutation.isPending) ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {isCreating ? 'Créer' : 'Enregistrer'}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingLogo(null);
                    setIsCreating(false);
                  }}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminLogos;

