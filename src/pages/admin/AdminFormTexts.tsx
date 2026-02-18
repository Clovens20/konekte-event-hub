import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';

const FORM_KEYS: { key: string; label: string }[] = [
  { key: 'form_modal_title', label: 'Tit modil (Rezève kote m)' },
  { key: 'form_label_name', label: 'Etikèt Non' },
  { key: 'form_placeholder_name', label: 'Placeholder Non' },
  { key: 'form_label_email', label: 'Etikèt Imèl' },
  { key: 'form_placeholder_email', label: 'Placeholder Imèl' },
  { key: 'form_label_phone', label: 'Etikèt Telefòn' },
  { key: 'form_placeholder_phone', label: 'Placeholder Telefòn' },
  { key: 'form_label_level', label: 'Etikèt Nivo' },
  { key: 'form_placeholder_level', label: 'Placeholder Nivo (Chwazi...)' },
  { key: 'form_option_beginner', label: 'Opsyon Kòmanse' },
  { key: 'form_option_intermediate', label: 'Opsyon Mwayen' },
  { key: 'form_option_advanced', label: 'Opsyon Avanse' },
  { key: 'form_label_motivation', label: 'Etikèt Motivasyon' },
  { key: 'form_placeholder_motivation', label: 'Placeholder Motivasyon' },
  { key: 'form_label_payment', label: 'Etikèt Opsyon peman' },
  { key: 'form_label_promo', label: 'Etikèt Kòd promosyon' },
  { key: 'form_placeholder_promo', label: 'Placeholder Kòd' },
  { key: 'form_btn_apply', label: 'Bouton Aplike' },
  { key: 'form_label_amount', label: 'Etikèt Montan' },
  { key: 'form_label_discount', label: 'Etikèt Rediksyon' },
  { key: 'form_label_total', label: 'Etikèt Total' },
  { key: 'form_btn_submit', label: 'Bouton Kontinye pou peye' },
  { key: 'form_btn_loading', label: 'Tèks ap trete' },
];

const AdminFormTexts = () => {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>({});

  const { data: texts = {}, isLoading } = useQuery({
    queryKey: ['site-texts'],
    queryFn: async (): Promise<Record<string, string>> => {
      const { data, error } = await supabase.from('site_texts').select('key, value');
      if (error) throw error;
      const map: Record<string, string> = {};
      (data || []).forEach((row: { key: string; value: string }) => {
        map[row.key] = row.value ?? '';
      });
      return map;
    },
  });

  useEffect(() => {
    setValues(texts);
  }, [texts]);

  const updateMutation = useMutation({
    mutationFn: async (updates: Record<string, string>) => {
      for (const [key, value] of Object.entries(updates)) {
        const { error } = await supabase
          .from('site_texts')
          .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-texts'] });
      toast({ title: 'Siksè', description: 'Tèks fòmilè anrejistre.' });
    },
    onError: (e) => toast({ title: 'Erè', description: (e as Error).message, variant: 'destructive' }),
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-3xl font-bold">Tèks Fòmilè</h1></div>
        <Skeleton className="h-[500px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tèks Fòmilè</h1>
        <p className="text-muted-foreground">Modifye tout etikèt ak tèks ki parèt nan fòmilè enskripsyon an.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Libellés fòmilè</CardTitle>
          <CardDescription>Chak chan sa a kontwole yon tèks sou fòmilè "Rezève kote m" sou sit la.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            {FORM_KEYS.map(({ key, label }) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key}>{label}</Label>
                <Input
                  id={key}
                  value={values[key] ?? ''}
                  onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                />
              </div>
            ))}
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Anrejistre tout chanjman
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFormTexts;
