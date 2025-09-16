import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, Filter, X, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FilterCriteria {
  categories: string[];
  priceRange: {
    min: string;
    max: string;
  };
  minRating: number;
  maxDuration: string;
  availability: string;
}

interface ServiceCategory {
  id: string;
  name: string;
  color: string;
}

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterCriteria) => void;
  activeFilters: FilterCriteria;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  onFiltersChange,
  activeFilters,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);

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
    fetchCategories();
  }, []);

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = activeFilters.categories.includes(categoryId)
      ? activeFilters.categories.filter(id => id !== categoryId)
      : [...activeFilters.categories, categoryId];

    onFiltersChange({
      ...activeFilters,
      categories: newCategories,
    });
  };

  const handlePriceRangeChange = (field: 'min' | 'max', value: string) => {
    onFiltersChange({
      ...activeFilters,
      priceRange: {
        ...activeFilters.priceRange,
        [field]: value,
      },
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      categories: [],
      priceRange: { min: '', max: '' },
      minRating: 0,
      maxDuration: '',
      availability: '',
    });
  };

  const hasActiveFilters = 
    activeFilters.categories.length > 0 ||
    activeFilters.priceRange.min ||
    activeFilters.priceRange.max ||
    activeFilters.minRating > 0 ||
    activeFilters.maxDuration ||
    activeFilters.availability;

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive && onRatingChange ? () => onRatingChange(star) : undefined}
          />
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros Avançados
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFilters.categories.length + 
                     (activeFilters.priceRange.min || activeFilters.priceRange.max ? 1 : 0) +
                     (activeFilters.minRating > 0 ? 1 : 0) +
                     (activeFilters.maxDuration ? 1 : 0) +
                     (activeFilters.availability ? 1 : 0)}
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFilters();
                    }}
                  >
                    <X className="h-4 w-4" />
                    Limpar
                  </Button>
                )}
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4">
            <CardContent className="pt-0 space-y-6">
              {/* Categorias */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Categorias</Label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={activeFilters.categories.includes(category.id)}
                        onCheckedChange={() => handleCategoryToggle(category.id)}
                      />
                      <label
                        htmlFor={`category-${category.id}`}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Faixa de Preço */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Faixa de Preço (R$)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Input
                      type="number"
                      placeholder="Mín"
                      value={activeFilters.priceRange.min}
                      onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Máx"
                      value={activeFilters.priceRange.max}
                      onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Avaliação Mínima */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Avaliação Mínima</Label>
                <div className="flex items-center gap-2">
                  {renderStars(activeFilters.minRating, true, (rating) => 
                    onFiltersChange({ ...activeFilters, minRating: rating })
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onFiltersChange({ ...activeFilters, minRating: 0 })}
                  >
                    Limpar
                  </Button>
                </div>
              </div>

              {/* Duração Máxima */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Duração Máxima</Label>
                <Select
                  value={activeFilters.maxDuration}
                  onValueChange={(value) => 
                    onFiltersChange({ ...activeFilters, maxDuration: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Qualquer duração</SelectItem>
                    <SelectItem value="30">Até 30 minutos</SelectItem>
                    <SelectItem value="60">Até 1 hora</SelectItem>
                    <SelectItem value="90">Até 1h30</SelectItem>
                    <SelectItem value="120">Até 2 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Disponibilidade */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Disponibilidade</Label>
                <Select
                  value={activeFilters.availability}
                  onValueChange={(value) => 
                    onFiltersChange({ ...activeFilters, availability: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Qualquer horário</SelectItem>
                    <SelectItem value="today">Disponível hoje</SelectItem>
                    <SelectItem value="week">Disponível esta semana</SelectItem>
                    <SelectItem value="morning">Horário manhã</SelectItem>
                    <SelectItem value="afternoon">Horário tarde</SelectItem>
                    <SelectItem value="evening">Horário noite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </CardHeader>
    </Card>
  );
};