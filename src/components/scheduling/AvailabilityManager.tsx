import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import { Plus, Clock, Edit, Trash2, CalendarX } from 'lucide-react';
import { useAvailability } from '@/hooks/useAvailability';
import { useToast } from '@/components/ui/use-toast';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
];

export const AvailabilityManager: React.FC = () => {
  const { toast } = useToast();
  const {
    availability,
    loading,
    addAvailability,
    updateAvailability,
    deleteAvailability,
    blockTimeSlot,
  } = useAvailability();

  const [isAddingAvailability, setIsAddingAvailability] = useState(false);
  const [isBlockingTime, setIsBlockingTime] = useState(false);
  const [newAvailability, setNewAvailability] = useState({
    day_of_week: '',
    start_time: '',
    end_time: '',
  });
  const [blockTime, setBlockTime] = useState({
    date: '',
    start_time: '',
    end_time: '',
    reason: '',
  });

  const handleAddAvailability = async () => {
    if (!newAvailability.day_of_week || !newAvailability.start_time || !newAvailability.end_time) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    if (newAvailability.start_time >= newAvailability.end_time) {
      toast({
        title: 'Erro',
        description: 'Horário de início deve ser anterior ao horário de fim',
        variant: 'destructive',
      });
      return;
    }

    try {
      await addAvailability(
        parseInt(newAvailability.day_of_week),
        newAvailability.start_time,
        newAvailability.end_time
      );

      setNewAvailability({ day_of_week: '', start_time: '', end_time: '' });
      setIsAddingAvailability(false);
      toast({
        title: 'Sucesso',
        description: 'Disponibilidade adicionada com sucesso',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar disponibilidade',
        variant: 'destructive',
      });
    }
  };

  const handleBlockTime = async () => {
    if (!blockTime.date || !blockTime.start_time || !blockTime.end_time) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    try {
      await blockTimeSlot(
        new Date(blockTime.date),
        blockTime.start_time,
        blockTime.end_time,
        blockTime.reason
      );

      setBlockTime({ date: '', start_time: '', end_time: '', reason: '' });
      setIsBlockingTime(false);
      toast({
        title: 'Sucesso',
        description: 'Horário bloqueado com sucesso',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao bloquear horário',
        variant: 'destructive',
      });
    }
  };

  const handleToggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      await updateAvailability(id, { is_available: !currentStatus });
      toast({
        title: 'Sucesso',
        description: `Disponibilidade ${!currentStatus ? 'ativada' : 'desativada'}`,
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar disponibilidade',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAvailability = async (id: string) => {
    if (confirm('Tem certeza que deseja deletar esta disponibilidade?')) {
      try {
        await deleteAvailability(id);
        toast({
          title: 'Sucesso',
          description: 'Disponibilidade removida com sucesso',
        });
      } catch (error) {
        toast({
          title: 'Erro',
          description: 'Erro ao remover disponibilidade',
          variant: 'destructive',
        });
      }
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Gerenciar Disponibilidade
            </CardTitle>
            <div className="flex gap-2">
              <Dialog open={isBlockingTime} onOpenChange={setIsBlockingTime}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <CalendarX className="h-4 w-4 mr-2" />
                    Bloquear Horário
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Bloquear Horário Específico</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="block-date">Data</Label>
                      <Input
                        id="block-date"
                        type="date"
                        value={blockTime.date}
                        onChange={(e) =>
                          setBlockTime({ ...blockTime, date: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="block-start">Horário Início</Label>
                        <Input
                          id="block-start"
                          type="time"
                          value={blockTime.start_time}
                          onChange={(e) =>
                            setBlockTime({ ...blockTime, start_time: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="block-end">Horário Fim</Label>
                        <Input
                          id="block-end"
                          type="time"
                          value={blockTime.end_time}
                          onChange={(e) =>
                            setBlockTime({ ...blockTime, end_time: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="block-reason">Motivo (opcional)</Label>
                      <Input
                        id="block-reason"
                        placeholder="Ex: Reunião, Compromisso pessoal..."
                        value={blockTime.reason}
                        onChange={(e) =>
                          setBlockTime({ ...blockTime, reason: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsBlockingTime(false)}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleBlockTime}>Bloquear</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isAddingAvailability} onOpenChange={setIsAddingAvailability}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Horário
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Disponibilidade</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="day-select">Dia da Semana</Label>
                      <Select
                        value={newAvailability.day_of_week}
                        onValueChange={(value) =>
                          setNewAvailability({ ...newAvailability, day_of_week: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o dia" />
                        </SelectTrigger>
                        <SelectContent>
                          {DAYS_OF_WEEK.map((day) => (
                            <SelectItem key={day.value} value={day.value.toString()}>
                              {day.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start-time">Horário Início</Label>
                        <Input
                          id="start-time"
                          type="time"
                          value={newAvailability.start_time}
                          onChange={(e) =>
                            setNewAvailability({
                              ...newAvailability,
                              start_time: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="end-time">Horário Fim</Label>
                        <Input
                          id="end-time"
                          type="time"
                          value={newAvailability.end_time}
                          onChange={(e) =>
                            setNewAvailability({
                              ...newAvailability,
                              end_time: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsAddingAvailability(false)}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleAddAvailability}>Adicionar</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {availability.length > 0 ? (
            <div className="space-y-4">
              {availability.map((item) => {
                const dayName = DAYS_OF_WEEK.find(d => d.value === item.day_of_week)?.label;
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{dayName}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.start_time} - {item.end_time}
                        </p>
                      </div>
                      <Badge variant={item.is_available ? "default" : "secondary"}>
                        {item.is_available ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={item.is_available}
                        onCheckedChange={() =>
                          handleToggleAvailability(item.id, item.is_available)
                        }
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAvailability(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhuma disponibilidade configurada</p>
              <p className="text-sm">Configure seus horários de atendimento</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};