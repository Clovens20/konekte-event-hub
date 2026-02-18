import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';

const AdminFooter = () => {
  const queryClient = useQueryClient();
  
  const { data: footer, isLoading } = useQuery({
    queryKey: ['footer-config'],
    queryFn: async () => {
      const { data, error } = await supabase.from('footer_config').select('*').single();
      if (error) throw error;
      return data;
    },
  });

  const [formData, setFormData] = useState({
    email: '', telephone: '', adresse: '', facebook: '', instagram: '', linkedin: '', copyright: '',
  });

  useEffect(() => {
    if (footer) {
      setFormData({
        email: footer.email,
        telephone: footer.telephone,
        adresse: footer.adresse,
        facebook: footer.facebook || '',
        instagram: footer.instagram || '',
        linkedin: footer.linkedin || '',
        copyright: footer.copyright,
      });
    }
  }, [footer]);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('footer_config').update({ ...data, updated_at: new Date().toISOString() }).eq('id', footer?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['footer-config'] });
      toast({ title: 'Siksè', description: 'Konfigirasyon pye paj la mete ajou.' });
    },
    onError: (error) => {
      toast({ title: 'Erè', description: error.message, variant: 'destructive' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) return <Skeleton className="h-[500px]" />;

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Konfigirasyon Pye paj</h1></div>
      <Card>
        <CardHeader><CardTitle>Enfòmasyon kontak</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Imèl</Label>
                <Input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Telefòn</Label>
                <Input value={formData.telephone} onChange={(e) => setFormData({ ...formData, telephone: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Adrès</Label>
              <Input value={formData.adresse} onChange={(e) => setFormData({ ...formData, adresse: e.target.value })} />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Facebook</Label>
                <Input value={formData.facebook} onChange={(e) => setFormData({ ...formData, facebook: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Instagram</Label>
                <Input value={formData.instagram} onChange={(e) => setFormData({ ...formData, instagram: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>LinkedIn</Label>
                <Input value={formData.linkedin} onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Copyright</Label>
              <Input value={formData.copyright} onChange={(e) => setFormData({ ...formData, copyright: e.target.value })} />
            </div>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Anrejistre
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFooter;
