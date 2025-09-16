import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit, Trash2, DollarSign, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/formatters';

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  is_active: boolean;
  category_id?: string;
  category?: {
    name: string;
    color: string;
  };
}

interface ServiceCategory {
  id: string;
  name: string;
  color: string;
}

export const ServiceManager: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingService, setIsAddingService] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category_id: '',
  });

  const fetchServices = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          category:service_categories(name, color)
        `)
        .eq('professional_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar serviços',
        variant: 'destructive',
      });
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('service_categories')
        .select('id, name, color')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchServices(), fetchCategories()]);
      setLoading(false);
    };

    if (profile?.id) {
      loadData();
    }
  }, [profile?.id]);

  const resetForm = () => {
    setServiceForm({
      name: '',
      description: '',
      price: '',
      duration: '',
      category_id: '',
    });
    setEditingService(null);
  };

  const handleSubmit = async () => {
    if (!profile?.id || !serviceForm.name || !serviceForm.price || !serviceForm.duration) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    try {
      const serviceData = {
        professional_id: profile.id,
        name: serviceForm.name,
        description: serviceForm.description || null,
        price: parseFloat(serviceForm.price),
        duration: parseInt(serviceForm.duration),
        category_id: serviceForm.category_id || null,
        is_active: true,
      };

      if (editingService) {
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingService.id);

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Serviço atualizado com sucesso',
        });
      } else {
        const { error } = await supabase
          .from('services')
          .insert(serviceData);

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Serviço criado com sucesso',
        });
      }

      resetForm();
      setIsAddingService(false);
      await fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar serviço',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (service: Service) => {
    setServiceForm({
      name: service.name,
      description: service.description || '',
      price: service.price.toString(),
      duration: service.duration.toString(),
      category_id: service.category_id || '',
    });
    setEditingService(service);
    setIsAddingService(true);
  };

  const handleToggleActive = async (service: Service) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: !service.is_active })
        .eq('id', service.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: `Serviço ${!service.is_active ? 'ativado' : 'desativado'}`,
      });

      await fetchServices();
    } catch (error) {
      console.error('Error toggling service:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar serviço',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return;

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Serviço excluído com sucesso',
      });

      await fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir serviço',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Gerenciar Serviços</CardTitle>
          <Dialog open={isAddingService} onOpenChange={(open) => {
            setIsAddingService(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Serviço
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingService ? 'Editar Serviço' : 'Novo Serviço'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="service-name">Nome do Serviço *</Label>
                  <Input
                    id="service-name"
                    value={serviceForm.name}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, name: e.target.value })
                    }
                    placeholder="Ex: Consulta médica"
                  />
                </div>

                <div>
                  <Label htmlFor="service-category">Categoria</Label>
                  <Select
                    value={serviceForm.category_id}
                    onValueChange={(value) =>
                      setServiceForm({ ...serviceForm, category_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="service-description">Descrição</Label>
                  <Textarea
                    id="service-description"
                    value={serviceForm.description}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, description: e.target.value })
                    }
                    placeholder="Descreva o serviço..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="service-price">Preço (R$) *</Label>
                    <Input
                      id="service-price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={serviceForm.price}
                      onChange={(e) =>
                        setServiceForm({ ...serviceForm, price: e.target.value })
                      }
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="service-duration">Duração (min) *</Label>
                    <Input
                      id="service-duration"
                      type="number"
                      min="15"
                      step="15"
                      value={serviceForm.duration}
                      onChange={(e) =>
                        setServiceForm({ ...serviceForm, duration: e.target.value })
                      }
                      placeholder="30"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      resetForm();
                      setIsAddingService(false);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleSubmit}>
                    {editingService ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {services.length > 0 ? (
          <div className="space-y-4">
            {services.map((service) => (
              <div
                key={service.id}
                className={`p-4 border rounded-lg ${
                  !service.is_active ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{service.name}</h3>
                      {service.category && (
                        <Badge 
                          variant="secondary"
                          style={{ backgroundColor: `${service.category.color}20`, color: service.category.color }}
                        >
                          {service.category.name}
                        </Badge>
                      )}
                      <Badge variant={service.is_active ? "default" : "secondary"}>
                        {service.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>

                    {service.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {service.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-sm">
                        <DollarSign className="h-4 w-4" />
                        {formatCurrency(service.price)}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-4 w-4" />
                        {service.duration} min
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(service)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(service)}
                    >
                      {service.is_active ? 'Desativar' : 'Ativar'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(service.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Plus className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhum serviço cadastrado</p>
            <p className="text-sm">Crie seu primeiro serviço para começar</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};