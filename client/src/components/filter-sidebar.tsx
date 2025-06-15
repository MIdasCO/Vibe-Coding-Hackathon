import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/use-translation";

interface FilterSidebarProps {
  onFiltersChange: (filters: any) => void;
  category?: 'livestock' | 'pets';
}

export default function FilterSidebar({ onFiltersChange, category = 'livestock' }: FilterSidebarProps) {
  const { t, language } = useTranslation();
  const [filters, setFilters] = useState({
    animalTypeIds: [] as string[],
    breedIds: [] as string[],
    regionId: 'all',
    cityId: 'all',
    minPrice: '',
    maxPrice: '',
    gender: 'any',
    ageRange: 'all',
    features: [] as string[],
    // Дополнительные услуги
    homeDelivery: false,
    pickup: false,
    butchered: false,
    vaccinated: false,
    certified: false,
    organicFeed: false,
  });

  const { data: animalTypes } = useQuery({
    queryKey: ['/api/animal-types', category],
    queryFn: async () => {
      const response = await fetch(`/api/animal-types?category=${category}`);
      if (!response.ok) throw new Error('Failed to fetch animal types');
      const data = await response.json();
      
      // Дополнительная дедупликация на клиентской стороне
      const uniqueTypes = data.filter((type: any, index: number, self: any[]) => 
        index === self.findIndex((t: any) => t.id === type.id || (t.name === type.name && t.category === type.category))
      );
      
      return uniqueTypes;
    },
  });

  const { data: regions } = useQuery({
    queryKey: ['/api/regions'],
  });

  const { data: cities } = useQuery({
    queryKey: ['/api/cities', filters.regionId],
    queryFn: async () => {
      if (!filters.regionId || filters.regionId === 'all') return [];
      const response = await fetch(`/api/cities?regionId=${filters.regionId}`);
      if (!response.ok) throw new Error('Failed to fetch cities');
      return response.json();
    },
    enabled: !!filters.regionId && filters.regionId !== 'all',
  });

  const { data: breeds } = useQuery({
    queryKey: ['/api/breeds', filters.animalTypeIds],
    queryFn: async () => {
      if (!filters.animalTypeIds || filters.animalTypeIds.length === 0) return [];
      // Получаем породы для всех выбранных типов животных
      const breedPromises = filters.animalTypeIds.map(async (typeId) => {
        const response = await fetch(`/api/breeds?animalTypeId=${typeId}`);
        if (!response.ok) throw new Error('Failed to fetch breeds');
        return response.json();
      });
      const breedArrays = await Promise.all(breedPromises);
      // Объединяем все породы и убираем дубликаты по ID и имени
      const allBreeds = breedArrays.flat();
      const uniqueBreeds = allBreeds.filter((breed: any, index: number, self: any[]) => 
        index === self.findIndex((b: any) => b.id === breed.id || (b.name === breed.name && b.animalTypeId === breed.animalTypeId))
      );
      return uniqueBreeds;
    },
    enabled: !!filters.animalTypeIds && filters.animalTypeIds.length > 0,
  });

  const handleAnimalTypeChange = (typeId: string, checked: boolean) => {
    const newTypes = checked 
      ? [...filters.animalTypeIds, typeId]
      : filters.animalTypeIds.filter(id => id !== typeId);
    
    // При изменении типов животных сбрасываем породы
    const newFilters = { ...filters, animalTypeIds: newTypes, breedIds: [] };
    setFilters(newFilters);
    
    // Преобразуем для сервера
    const serverFilters = {
      ...newFilters,
      regionId: newFilters.regionId === 'all' ? '' : newFilters.regionId,
      cityId: newFilters.cityId === 'all' ? '' : newFilters.cityId,
      gender: newFilters.gender === 'any' ? '' : newFilters.gender,
      ageRange: newFilters.ageRange === 'all' ? '' : newFilters.ageRange,
    };
    onFiltersChange(serverFilters);
  };

  const handleBreedChange = (breedId: string, checked: boolean) => {
    const newBreeds = checked 
      ? [...filters.breedIds, breedId]
      : filters.breedIds.filter(id => id !== breedId);
    
    const newFilters = { ...filters, breedIds: newBreeds };
    setFilters(newFilters);
    
    // Преобразуем для сервера
    const serverFilters = {
      ...newFilters,
      regionId: newFilters.regionId === 'all' ? '' : newFilters.regionId,
      cityId: newFilters.cityId === 'all' ? '' : newFilters.cityId,
      gender: newFilters.gender === 'any' ? '' : newFilters.gender,
      ageRange: newFilters.ageRange === 'all' ? '' : newFilters.ageRange,
    };
    onFiltersChange(serverFilters);
  };

  const handleFeatureChange = (feature: string, checked: boolean) => {
    const newFeatures = checked
      ? [...filters.features, feature]
      : filters.features.filter(f => f !== feature);
    
    const newFilters = { ...filters, features: newFeatures };
    setFilters(newFilters);
    
    // Преобразуем для сервера
    const serverFilters = {
      ...newFilters,
      regionId: newFilters.regionId === 'all' ? '' : newFilters.regionId,
      cityId: newFilters.cityId === 'all' ? '' : newFilters.cityId,
      gender: newFilters.gender === 'any' ? '' : newFilters.gender,
      ageRange: newFilters.ageRange === 'all' ? '' : newFilters.ageRange,
    };
    onFiltersChange(serverFilters);
  };

  const handleServiceChange = (service: string, checked: boolean) => {
    const newFilters = { ...filters, [service]: checked };
    setFilters(newFilters);
    
    // Преобразуем для сервера
    const serverFilters = {
      ...newFilters,
      regionId: newFilters.regionId === 'all' ? '' : newFilters.regionId,
      cityId: newFilters.cityId === 'all' ? '' : newFilters.cityId,
      gender: newFilters.gender === 'any' ? '' : newFilters.gender,
      ageRange: newFilters.ageRange === 'all' ? '' : newFilters.ageRange,
    };
    onFiltersChange(serverFilters);
  };

  const handleFilterChange = (key: string, value: string) => {
    let newFilters = { ...filters, [key]: value };
    
    // Если изменился регион, сбрасываем город
    if (key === 'regionId') {
      newFilters = { ...newFilters, cityId: 'all' };
    }
    
    setFilters(newFilters);
    
    // Преобразуем значения для отправки на сервер
    const serverFilters = {
      ...newFilters,
      regionId: newFilters.regionId === 'all' ? '' : newFilters.regionId,
      cityId: newFilters.cityId === 'all' ? '' : newFilters.cityId,
      gender: newFilters.gender === 'any' ? '' : newFilters.gender,
      ageRange: newFilters.ageRange === 'all' ? '' : newFilters.ageRange,
    };
    
    onFiltersChange(serverFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      animalTypeIds: [] as string[],
      breedIds: [] as string[],
      regionId: 'all',
      cityId: 'all',
      minPrice: '',
      maxPrice: '',
      gender: 'any',
      ageRange: 'all',
      features: [] as string[],
      homeDelivery: false,
      pickup: false,
      butchered: false,
      vaccinated: false,
      certified: false,
      organicFeed: false,
    };
    setFilters(clearedFilters);
    
    // Преобразуем значения для отправки на сервер
    const serverFilters = {
      animalTypeIds: [] as string[],
      breedIds: [] as string[],
      regionId: '',
      cityId: '',
      minPrice: '',
      maxPrice: '',
      gender: '',
      ageRange: '',
      features: [] as string[],
      homeDelivery: false,
      pickup: false,
      butchered: false,
      vaccinated: false,
      certified: false,
      organicFeed: false,
    };
    onFiltersChange(serverFilters);
  };

  const applyFilters = () => {
    // Преобразуем значения для отправки на сервер
    const serverFilters = {
      ...filters,
      regionId: filters.regionId === 'all' ? '' : filters.regionId,
      cityId: filters.cityId === 'all' ? '' : filters.cityId,
      gender: filters.gender === 'any' ? '' : filters.gender,
      ageRange: filters.ageRange === 'all' ? '' : filters.ageRange,
    };
    onFiltersChange(serverFilters);
  };

  return (
    <aside className="lg:w-1/4">
      <div className="filter-sidebar rounded-lg shadow-sm p-6 sticky top-24">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">{t('filterSidebar.title')}</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            Очистить
          </Button>
        </div>
        
        {/* Location Filter */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">{t('filterSidebar.region')}</h4>
          <div className="space-y-3">
            <div>
              <Label className="text-sm text-gray-600 mb-1 block">{t('filterSidebar.region')}</Label>
              <Select value={filters.regionId} onValueChange={(value: string) => handleFilterChange('regionId', value)}>
                <SelectTrigger className="w-full text-sm">
                  <SelectValue placeholder={t('filterSidebar.region')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('searchHero.allRegions')}</SelectItem>
                  {Array.isArray(regions) && regions.map((region: any) => (
                    <SelectItem key={region.id} value={region.id.toString()}>
                      {language === 'ky' ? region.nameKy : (language === 'ru' ? region.nameRu : region.name) || region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm text-gray-600 mb-1 block">{t('filterSidebar.city')}</Label>
              <Select 
                value={filters.cityId} 
                onValueChange={(value: string) => handleFilterChange('cityId', value)}
                disabled={!filters.regionId || filters.regionId === 'all'}
              >
                <SelectTrigger className="w-full text-sm">
                  <SelectValue placeholder={filters.regionId && filters.regionId !== 'all' ? t('filterSidebar.city') : t('filterSidebar.region')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filterSidebar.city')}</SelectItem>
                  {Array.isArray(cities) && cities.map((city: any) => (
                    <SelectItem key={city.id} value={city.id.toString()}>
                      {language === 'ky' ? city.nameKy : (language === 'ru' ? city.nameRu : city.name) || city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Animal Category Filter */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">{t('filterSidebar.category')}</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {Array.isArray(animalTypes) && animalTypes.map((type: any) => (
              <div key={type.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type.id}`}
                  checked={filters.animalTypeIds.includes(type.id.toString())}
                  onCheckedChange={(checked: boolean) => 
                    handleAnimalTypeChange(type.id.toString(), checked)
                  }
                />
                <Label htmlFor={`type-${type.id}`} className="text-sm text-gray-700 flex items-center">
                  <span className="mr-2">{type.icon}</span>
                  {language === 'ky' ? type.nameKy : (language === 'ru' ? type.nameRu : type.name) || type.name}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Breed Filter */}
        {filters.animalTypeIds.length > 0 && breeds && breeds.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">{t('filterSidebar.breed')}</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {Array.isArray(breeds) && breeds.map((breed: any) => (
                <div key={breed.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`breed-${breed.id}`}
                    checked={filters.breedIds.includes(breed.id.toString())}
                    onCheckedChange={(checked: boolean) => 
                      handleBreedChange(breed.id.toString(), checked)
                    }
                  />
                  <Label htmlFor={`breed-${breed.id}`} className="text-sm text-gray-700">
                    {language === 'ky' ? breed.nameKy : (language === 'ru' ? breed.nameRu : breed.name) || breed.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Price Range Filter */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">{t('filterSidebar.priceRange')}</h4>
          <div className="flex space-x-2">
            <Input
              type="number"
              placeholder={t('filterSidebar.minPrice')}
              value={filters.minPrice}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('minPrice', e.target.value)}
              className="text-sm"
            />
            <Input
              type="number"
              placeholder={t('filterSidebar.maxPrice')}
              value={filters.maxPrice}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('maxPrice', e.target.value)}
              className="text-sm"
            />
          </div>
        </div>

        {/* Gender Filter */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">{t('filterSidebar.gender')}</h4>
          <RadioGroup value={filters.gender} onValueChange={(value: string) => handleFilterChange('gender', value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="any" id="any-gender" />
              <Label htmlFor="any-gender" className="text-sm text-gray-700">Любой</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" />
              <Label htmlFor="male" className="text-sm text-gray-700">{t('filterSidebar.male')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" />
              <Label htmlFor="female" className="text-sm text-gray-700">{t('filterSidebar.female')}</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Age Range Filter */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">{t('filterSidebar.ageRange')}</h4>
          <Select value={filters.ageRange} onValueChange={(value: string) => handleFilterChange('ageRange', value)}>
            <SelectTrigger className="w-full text-sm">
              <SelectValue placeholder={t('filterSidebar.anyAge')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filterSidebar.anyAge')}</SelectItem>
              <SelectItem value="young">{t('filterSidebar.young')}</SelectItem>
              <SelectItem value="adult">{t('filterSidebar.adult')}</SelectItem>
              <SelectItem value="mature">{t('filterSidebar.mature')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Special Features */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">{t('filterSidebar.features')}</h4>
          <div className="space-y-2">
            {[
              { id: 'documents', label: t('filterSidebar.withDocuments') },
              { id: 'vaccinated', label: t('filterSidebar.vaccinated') },
              { id: 'pedigree', label: t('filterSidebar.pedigree') }
            ].map((feature) => (
              <div key={feature.id} className="flex items-center space-x-2">
                <Checkbox
                  id={feature.id}
                  checked={filters.features.includes(feature.id)}
                  onCheckedChange={(checked: boolean) => 
                    handleFeatureChange(feature.id, checked)
                  }
                />
                <Label htmlFor={feature.id} className="text-sm text-gray-700">
                  {feature.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Services */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">{t('filterSidebar.services')}</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="homeDelivery"
                checked={filters.homeDelivery}
                onCheckedChange={(checked: boolean) => 
                  handleServiceChange('homeDelivery', checked)
                }
              />
              <Label htmlFor="homeDelivery" className="text-sm text-gray-700">
                🚚 {t('filterSidebar.homeDelivery')}
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="pickup"
                checked={filters.pickup}
                onCheckedChange={(checked: boolean) => 
                  handleServiceChange('pickup', checked)
                }
              />
              <Label htmlFor="pickup" className="text-sm text-gray-700">
                📦 {t('filterSidebar.pickup')}
              </Label>
            </div>

            {category === 'livestock' && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="butchered"
                  checked={filters.butchered}
                  onCheckedChange={(checked: boolean) => 
                    handleServiceChange('butchered', checked)
                  }
                />
                <Label htmlFor="butchered" className="text-sm text-gray-700">
                  🔪 {t('filterSidebar.butchered')}
                </Label>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="vaccinated-service"
                checked={filters.vaccinated}
                onCheckedChange={(checked: boolean) => 
                  handleServiceChange('vaccinated', checked)
                }
              />
              <Label htmlFor="vaccinated-service" className="text-sm text-gray-700">
                💉 {t('filterSidebar.vaccinated')}
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="certified"
                checked={filters.certified}
                onCheckedChange={(checked: boolean) => 
                  handleServiceChange('certified', checked)
                }
              />
              <Label htmlFor="certified" className="text-sm text-gray-700">
                📋 {t('filterSidebar.certified')}
              </Label>
            </div>

            {category === 'livestock' && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="organicFeed"
                  checked={filters.organicFeed}
                  onCheckedChange={(checked: boolean) => 
                    handleServiceChange('organicFeed', checked)
                  }
                />
                <Label htmlFor="organicFeed" className="text-sm text-gray-700">
                  🌱 {t('filterSidebar.organicFeed')}
                </Label>
              </div>
            )}
          </div>
        </div>

        <Button 
          onClick={applyFilters}
          className="w-full bg-primary text-white hover:bg-green-800"
        >
          {t('filterSidebar.applyFilters')}
        </Button>
      </div>
    </aside>
  );
}