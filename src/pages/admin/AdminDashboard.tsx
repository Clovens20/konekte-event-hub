import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StatsCard } from '@/components/admin/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Wallet, TrendingUp, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const AdminDashboard = () => {
  // Fetch seminar info
  const { data: seminarInfo } = useQuery({
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

  // Fetch inscriptions stats
  const { data: inscriptions, isLoading } = useQuery({
    queryKey: ['inscriptions-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inscriptions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const totalInscriptions = inscriptions?.filter(i => i.statut !== 'Annulé').length || 0;
  const placesRestantes = (seminarInfo?.nombre_places_total || 0) - totalInscriptions;
  const revenusConfirmes = inscriptions
    ?.filter(i => i.statut === 'Confirmé')
    .reduce((sum, i) => sum + i.montant_paye, 0) || 0;
  const tauxRemplissage = seminarInfo?.nombre_places_total 
    ? Math.round((totalInscriptions / seminarInfo.nombre_places_total) * 100) 
    : 0;

  const recentInscriptions = inscriptions?.slice(0, 5) || [];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-HT', {
      style: 'currency',
      currency: 'HTG',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmé':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Confirmé</Badge>;
      case 'En attente':
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">En attente</Badge>;
      case 'Annulé':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Annulé</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Vue d'ensemble du séminaire</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Vue d'ensemble du séminaire</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Inscriptions Totales"
          value={totalInscriptions}
          icon={Users}
          description={`sur ${seminarInfo?.nombre_places_total || 0} places`}
          trend="neutral"
        />
        <StatsCard
          title="Places Restantes"
          value={placesRestantes}
          icon={Calendar}
          description={placesRestantes < 10 ? 'Presque complet !' : 'Disponibles'}
          trend={placesRestantes < 10 ? 'down' : 'neutral'}
        />
        <StatsCard
          title="Revenus Confirmés"
          value={formatPrice(revenusConfirmes)}
          icon={Wallet}
          description="Total des paiements confirmés"
          trend="up"
        />
        <StatsCard
          title="Taux de Remplissage"
          value={`${tauxRemplissage}%`}
          icon={TrendingUp}
          description={tauxRemplissage >= 80 ? 'Excellent !' : 'En progression'}
          trend={tauxRemplissage >= 50 ? 'up' : 'neutral'}
        />
      </div>

      {/* Recent Inscriptions */}
      <Card>
        <CardHeader>
          <CardTitle>Inscriptions Récentes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentInscriptions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Aucune inscription pour le moment
            </p>
          ) : (
            <div className="space-y-4">
              {recentInscriptions.map((inscription) => (
                <div
                  key={inscription.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{inscription.nom_complet}</p>
                    <p className="text-sm text-muted-foreground">{inscription.email}</p>
                  </div>
                  <div className="text-right space-y-1">
                    {getStatusBadge(inscription.statut)}
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(inscription.created_at), 'dd MMM yyyy', { locale: fr })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
