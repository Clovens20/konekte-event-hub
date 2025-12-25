import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Loader2, Save, FileText, Code, Image, Settings, Search, RefreshCw, Upload, Download } from 'lucide-react';
import { logError, showError } from '@/lib/error-handler';

interface EditableFile {
  id: string;
  file_path: string;
  file_name: string;
  file_type: 'component' | 'config' | 'style' | 'content' | 'static';
  content: string;
  description: string | null;
  category: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const AdminFiles = () => {
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<EditableFile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [editedContent, setEditedContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch all editable files
  const { data: files, isLoading } = useQuery({
    queryKey: ['editable-files'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('editable_files')
        .select('*')
        .order('file_path', { ascending: true });
      
      if (error) {
        logError(error, 'AdminFiles');
        throw error;
      }
      return data as EditableFile[];
    },
    staleTime: 2 * 60 * 1000, // Cache 2 minutes
  });

  // Filter files
  const filteredFiles = files?.filter(file => {
    const matchesSearch = !searchTerm || 
      file.file_path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (file.description && file.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || file.file_type === filterType;
    const matchesCategory = filterCategory === 'all' || file.category === filterCategory;
    
    return matchesSearch && matchesType && matchesCategory && file.is_active;
  }) || [];

  // Load file content when selected
  useEffect(() => {
    if (selectedFile) {
      setEditedContent(selectedFile.content);
    }
  }, [selectedFile]);

  // Save file mutation
  const saveFileMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const { error } = await supabase
        .from('editable_files')
        .update({ 
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) {
        logError(error, 'SaveFile');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['editable-files'] });
      toast({
        title: 'Fichier sauvegardé',
        description: 'Le fichier a été mis à jour avec succès.',
      });
      // Recharger le fichier sélectionné
      if (selectedFile) {
        const updatedFile = files?.find(f => f.id === selectedFile.id);
        if (updatedFile) {
          setSelectedFile(updatedFile);
        }
      }
    },
    onError: (error) => {
      showError(error, 'Erreur lors de la sauvegarde');
    },
  });

  // Create new file mutation
  const createFileMutation = useMutation({
    mutationFn: async (fileData: Omit<EditableFile, 'id' | 'created_at' | 'updated_at'>) => {
      const { error } = await supabase
        .from('editable_files')
        .insert([fileData]);
      
      if (error) {
        logError(error, 'CreateFile');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['editable-files'] });
      toast({
        title: 'Fichier créé',
        description: 'Le nouveau fichier a été créé avec succès.',
      });
    },
    onError: (error) => {
      showError(error, 'Erreur lors de la création');
    },
  });

  const handleSave = async () => {
    if (!selectedFile) return;
    
    setIsSaving(true);
    try {
      await saveFileMutation.mutateAsync({
        id: selectedFile.id,
        content: editedContent,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileSelect = (file: EditableFile) => {
    if (selectedFile && editedContent !== selectedFile.content) {
      if (confirm('Vous avez des modifications non sauvegardées. Voulez-vous continuer ?')) {
        setSelectedFile(file);
      }
    } else {
      setSelectedFile(file);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'component':
        return <Code className="h-4 w-4" />;
      case 'config':
        return <Settings className="h-4 w-4" />;
      case 'style':
        return <FileText className="h-4 w-4" />;
      case 'static':
        return <Image className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'component':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'config':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'style':
        return 'bg-pink-500/10 text-pink-600 border-pink-500/20';
      case 'content':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'static':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Fichiers</h1>
          <p className="text-muted-foreground">Modifiez tous les fichiers du projet</p>
        </div>
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Fichiers</h1>
          <p className="text-muted-foreground">
            Modifiez et gérez tous les fichiers du projet depuis l'interface admin
          </p>
        </div>
        <Button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['editable-files'] })}
          variant="outline"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualiser
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* File List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Liste des Fichiers</CardTitle>
            <CardDescription>
              {filteredFiles.length} fichier(s) trouvé(s)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and Filters */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un fichier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="component">Composants</SelectItem>
                    <SelectItem value="config">Configuration</SelectItem>
                    <SelectItem value="style">Styles</SelectItem>
                    <SelectItem value="content">Contenu</SelectItem>
                    <SelectItem value="static">Statique</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    <SelectItem value="landing">Landing</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="config">Config</SelectItem>
                    <SelectItem value="styles">Styles</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Files List */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredFiles.length === 0 ? (
                <p className="text-muted-foreground text-center py-8 text-sm">
                  Aucun fichier trouvé
                </p>
              ) : (
                filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => handleFileSelect(file)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedFile?.id === file.id
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getFileIcon(file.file_type)}
                          <span className="font-medium text-sm truncate">
                            {file.file_name}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {file.file_path}
                        </p>
                        {file.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {file.description}
                          </p>
                        )}
                      </div>
                      <Badge className={getFileTypeColor(file.file_type)} variant="outline">
                        {file.file_type}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Editor */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {selectedFile ? `Éditer: ${selectedFile.file_name}` : 'Sélectionnez un fichier'}
                </CardTitle>
                {selectedFile && (
                  <CardDescription className="mt-1">
                    {selectedFile.file_path}
                  </CardDescription>
                )}
              </div>
              {selectedFile && (
                <Button
                  onClick={handleSave}
                  disabled={isSaving || editedContent === selectedFile.content}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Sauvegarder
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedFile ? (
              <div className="space-y-4">
                {selectedFile.description && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {selectedFile.description}
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="content">Contenu du fichier</Label>
                  <Textarea
                    id="content"
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="font-mono text-sm min-h-[500px]"
                    placeholder="Contenu du fichier..."
                  />
                  <p className="text-xs text-muted-foreground">
                    {editedContent.length} caractères
                    {editedContent !== selectedFile.content && ' • Modifications non sauvegardées'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Sélectionnez un fichier dans la liste pour commencer l'édition
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminFiles;

