import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { Search, Download, ChevronLeft, ChevronRight, MoreVertical, CheckCircle, XCircle, Clock, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import { showError, logError } from '@/lib/error-handler';
import { useSeminarInfo } from '@/hooks/useSeminarData';
import type { InscriptionStatus } from '@/lib/types';

const ITEMS_PER_PAGE = 20;

// Debounce hook pour optimiser la recherche
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const AdminInscriptions = () => {
  const queryClient = useQueryClient();
  const { data: seminarInfo } = useSeminarInfo();
  const prixBase = seminarInfo?.prix_base || 5000;
  
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300); // Debounce de 300ms
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const { data: inscriptionsData, isLoading } = useQuery({
    queryKey: ['inscriptions-admin', page, statusFilter, levelFilter, debouncedSearch],
    queryFn: async () => {
      let query = supabase
        .from('inscriptions')
        .select('*', { count: 'exact' });

      // Filtres
      if (statusFilter !== 'all') {
        query = query.eq('statut', statusFilter);
      }
      if (levelFilter !== 'all') {
        query = query.eq('niveau_experience', levelFilter);
      }
      if (debouncedSearch) {
        query = query.or(`nom_complet.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%,telephone.ilike.%${debouncedSearch}%`);
      }

      // Pagination
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to).order('created_at', { ascending: false });

      const { data, error, count } = await query;
      
      if (error) {
        logError(error, 'AdminInscriptions');
        throw error;
      }
      
      return { data: data || [], count: count || 0 };
    },
    staleTime: 30000, // Cache pendant 30 secondes
    gcTime: 5 * 60 * 1000, // Garde en cache 5 minutes
  });

  const inscriptions = inscriptionsData?.data || [];
  const totalCount = inscriptionsData?.count || 0;

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Mutation pour changer le statut
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: InscriptionStatus }) => {
      const { error } = await supabase
        .from('inscriptions')
        .update({ statut: status })
        .eq('id', id);
      
      if (error) {
        logError(error, 'UpdateInscriptionStatus');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inscriptions-admin'] });
      queryClient.invalidateQueries({ queryKey: ['inscription-count'] });
      toast({ title: 'Statut mis à jour', description: 'Le statut de l\'inscription a été modifié.' });
    },
    onError: (error) => {
      showError(error, 'Erreur lors de la mise à jour');
    },
  });

  // Mutation pour supprimer toutes les inscriptions
  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      // D'abord, récupérer le nombre total d'inscriptions pour l'affichage
      const { count: totalCount, error: countError } = await supabase
        .from('inscriptions')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        logError(countError, 'CountInscriptions');
        throw countError;
      }
      
      // Supprimer toutes les inscriptions
      // Utiliser une condition qui correspond toujours à toutes les lignes
      // (tous les IDs sont différents de ce UUID qui n'existe jamais)
      const { error, count } = await supabase
        .from('inscriptions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (error) {
        logError(error, 'DeleteAllInscriptions');
        throw error;
      }
      
      console.log(`Deleted ${count || totalCount || 0} inscriptions from database`);
      
      // Retourner le nombre d'inscriptions supprimées
      return count || totalCount || 0;
    },
    onSuccess: (deletedCount) => {
      queryClient.invalidateQueries({ queryKey: ['inscriptions-admin'] });
      queryClient.invalidateQueries({ queryKey: ['inscription-count'] });
      toast({ 
        title: '✅ Suppression réussie', 
        description: `${deletedCount} inscription(s) supprimée(s) définitivement de la base de données.`,
      });
    },
    onError: (error) => {
      showError(error, 'Erreur lors de la suppression');
    },
  });

  const handleDeleteAll = async () => {
    setIsDeletingAll(true);
    try {
      await deleteAllMutation.mutateAsync();
    } finally {
      setIsDeletingAll(false);
    }
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      // Récupérer toutes les inscriptions pour l'export (sans pagination)
      let query = supabase.from('inscriptions').select('*');
      
      if (statusFilter !== 'all') {
        query = query.eq('statut', statusFilter);
      }
      if (levelFilter !== 'all') {
        query = query.eq('niveau_experience', levelFilter);
      }
      if (debouncedSearch) {
        query = query.or(`nom_complet.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%,telephone.ilike.%${debouncedSearch}%`);
      }
      
      const { data: allInscriptions, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        showError(error, 'Erreur lors de l\'export');
        setIsExporting(false);
        return;
      }

      // Calculer le montant restant pour chaque inscription
      const exportData = (allInscriptions || []).map((i) => {
        const montantRestant = Math.max(0, prixBase - i.montant_paye);
        return {
          'Nom Complet': i.nom_complet,
          'Numéro de Téléphone': i.telephone,
          'Montant Donné (HTG)': i.montant_paye,
          'Montant Restant (HTG)': montantRestant,
          'Email': i.email,
          'Niveau d\'Expérience': i.niveau_experience,
          'Statut': i.statut,
          'Pourcentage Payé': `${i.pourcentage_paye}%`,
          'Code Promo': i.code_promo || '-',
          'Date Inscription': format(new Date(i.created_at), 'dd/MM/yyyy HH:mm'),
        };
      });

      // Créer un workbook Excel
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Inscriptions');

      // Ajuster la largeur des colonnes
      const columnWidths = [
        { wch: 25 }, // Nom Complet
        { wch: 18 }, // Téléphone
        { wch: 18 }, // Montant Donné
        { wch: 18 }, // Montant Restant
        { wch: 30 }, // Email
        { wch: 18 }, // Niveau
        { wch: 12 }, // Statut
        { wch: 15 }, // Pourcentage
        { wch: 15 }, // Code Promo
        { wch: 20 }, // Date
      ];
      worksheet['!cols'] = columnWidths;

      // Générer le fichier Excel
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `inscriptions_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({ 
        title: 'Export réussi', 
        description: `${exportData.length} inscription(s) exportée(s) avec succès.` 
      });
    } catch (error) {
      logError(error, 'ExportExcel');
      showError(error, 'Erreur lors de l\'export');
    } finally {
      setIsExporting(false);
    }
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
        <div><h1 className="text-3xl font-bold">Inscriptions</h1></div>
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inscriptions</h1>
          <p className="text-muted-foreground">{totalCount} inscription(s)</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToExcel} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Export en cours...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Exporter Excel
              </>
            )}
          </Button>
          
          {totalCount > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeletingAll || deleteAllMutation.isPending}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer tout
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Confirmer la suppression
                  </AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p className="font-semibold text-foreground">
                      Êtes-vous sûr de vouloir supprimer toutes les inscriptions ?
                    </p>
                    <p>
                      Cette action supprimera définitivement <strong>{totalCount} inscription(s)</strong> de la base de données.
                    </p>
                    <p className="text-destructive font-medium">
                      ⚠️ Cette action est irréversible et ne peut pas être annulée.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Si vous souhaitez conserver les données, exportez-les d'abord en Excel avant de supprimer.
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeletingAll || deleteAllMutation.isPending}>
                    Annuler
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAll}
                    disabled={isDeletingAll || deleteAllMutation.isPending}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeletingAll || deleteAllMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Suppression...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Oui, supprimer tout
                      </>
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={search}
                  onChange={(e) => { 
                    setSearch(e.target.value); 
                    setPage(1); // Reset à la page 1 lors de la recherche
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Statut" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="Confirmé">Confirmé</SelectItem>
                <SelectItem value="En attente">En attente</SelectItem>
                <SelectItem value="Annulé">Annulé</SelectItem>
              </SelectContent>
            </Select>
            <Select value={levelFilter} onValueChange={(v) => { setLevelFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Niveau" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les niveaux</SelectItem>
                <SelectItem value="Débutant">Débutant</SelectItem>
                <SelectItem value="Intermédiaire">Intermédiaire</SelectItem>
                <SelectItem value="Avancé">Avancé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Niveau</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Montant Payé</TableHead>
                <TableHead>Montant Restant</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Aucune inscription trouvée
                  </TableCell>
                </TableRow>
              ) : (
                inscriptions.map((i) => {
                  const montantRestant = Math.max(0, prixBase - i.montant_paye);
                  const formatMontant = (montant: number) => new Intl.NumberFormat('fr-HT').format(montant);
                  
                  return (
                    <TableRow key={i.id}>
                      <TableCell className="font-medium">{i.nom_complet}</TableCell>
                      <TableCell>{i.email}</TableCell>
                      <TableCell>{i.telephone}</TableCell>
                      <TableCell><Badge variant="outline">{i.niveau_experience}</Badge></TableCell>
                      <TableCell>{getStatusBadge(i.statut)}</TableCell>
                      <TableCell>
                        <div className="font-medium">{formatMontant(i.montant_paye)} HTG</div>
                        <div className="text-xs text-muted-foreground">{i.pourcentage_paye}%</div>
                      </TableCell>
                      <TableCell>
                        {montantRestant > 0 ? (
                          <div className="font-medium text-orange-600">{formatMontant(montantRestant)} HTG</div>
                        ) : (
                          <div className="font-medium text-green-600">Payé intégralement</div>
                        )}
                      </TableCell>
                      <TableCell>{format(new Date(i.created_at), 'dd MMM yyyy', { locale: fr })}</TableCell>
                      <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => updateStatusMutation.mutate({ id: i.id, status: 'Confirmé' })}
                            disabled={i.statut === 'Confirmé' || updateStatusMutation.isPending}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Confirmer
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateStatusMutation.mutate({ id: i.id, status: 'En attente' })}
                            disabled={i.statut === 'En attente' || updateStatusMutation.isPending}
                          >
                            <Clock className="mr-2 h-4 w-4" />
                            Mettre en attente
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateStatusMutation.mutate({ id: i.id, status: 'Annulé' })}
                            disabled={i.statut === 'Annulé' || updateStatusMutation.isPending}
                            className="text-destructive"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Annuler
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="icon" disabled={page === 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">Page {page} sur {totalPages}</span>
          <Button variant="outline" size="icon" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminInscriptions;
