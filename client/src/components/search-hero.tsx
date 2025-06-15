import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useTranslation } from '../hooks/use-translation';

interface SearchFilters {
  animalTypeIds?: string[];
  regionId?: string;
  priceRange?: string;
  minPrice?: string;
  maxPrice?: string;
  category?: 'livestock' | 'pets';
}

interface SearchHeroProps {
  onSearch: (filters: SearchFilters) => void;
  category?: 'livestock' | 'pets';
}

export default function SearchHero({ onSearch, category = 'livestock' }: SearchHeroProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    animalTypeIds: [],
    regionId: 'all',
    priceRange: 'all',
    category
  });
  const { t, language } = useTranslation();
  const [, navigate] = useLocation();

  const { data: animalTypes } = useQuery({
    queryKey: ['/api/animal-types', category],
    queryFn: async () => {
      const response = await fetch(`/api/animal-types?category=${category}`);
      if (!response.ok) throw new Error('Failed to fetch animal types');
      return response.json();
    },
  });

  const { data: regions } = useQuery({
    queryKey: ['/api/regions'],
    queryFn: async () => {
      const response = await fetch('/api/regions');
      if (!response.ok) throw new Error('Failed to fetch regions');
      return response.json();
    },
  });

  const handleAnimalTypeClick = (animalTypeId: string) => {
    const currentIds = filters.animalTypeIds || [];
    let newIds: string[];
    
    if (currentIds.includes(animalTypeId)) {
      // Убираем тип из фильтра если он уже выбран
      newIds = currentIds.filter(id => id !== animalTypeId);
    } else {
      // Добавляем тип к фильтру
      newIds = [...currentIds, animalTypeId];
    }
    
    const newFilters = { ...filters, animalTypeIds: newIds, category };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const handleSearch = () => {
    const searchFilters = { ...filters, category };
    onSearch(searchFilters);
  };

  const handleCategorySwitch = (newCategory: 'livestock' | 'pets') => {
    if (newCategory === 'livestock') {
      navigate('/');
    } else {
      navigate('/pets');
    }
  };

  const getAnimalIcon = (name: string) => {
    switch (name?.toLowerCase()) {
      case 'cattle': return '🐄';
      case 'horse': return '🐎';
      case 'horses': return '🐎';
      case 'sheep': return '🐑';
      case 'goat': return '🐐';
      case 'goats': return '🐐';
      case 'pig': return '🐷';
      case 'pigs': return '🐷';
      case 'chicken': return '🐔';
      case 'poultry': return '🐔';
      case 'dog': return '🐕';
      case 'cat': return '🐱';
      case 'bird': return '🐦';
      case 'rabbit': return '🐰';
      case 'rabbits': return '🐰';
      case 'hamster': return '🐹';
      case 'fish': return '🐠';
      default: return '🐾';
    }
  };

  const getAnimalName = (type: any) => {
    if (language === 'ky') return type.nameKy || type.name;
    if (language === 'ru') return type.nameRu || type.name;
    return type.name; // По умолчанию английский
  };

  const isAnimalTypeSelected = (animalTypeId: string) => {
    return filters.animalTypeIds?.includes(animalTypeId) || false;
  };

  return (
    <section className="relative bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%23ffffff%22%20fill-opacity=%220.05%22%3E%3Ccircle%20cx=%2230%22%20cy=%2230%22%20r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2">


        <div className="text-center mb-2">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {category === 'pets' ? t('searchHero.pets.title') : t('searchHero.title')}
          </h1>
          <p className="text-lg text-white/90 max-w-3xl mx-auto mb-3">
            {category === 'pets' ? t('searchHero.pets.subtitle') : t('searchHero.subtitle')}
          </p>
          
        </div>

        {/* Animal Type Cards */}
        <div className="space-y-3 mb-2">
          {/* Show All Button */}
          <div className="flex justify-center mb-3">
            <button
              onClick={() => {
                const newFilters = { ...filters, animalTypeIds: [], category };
                setFilters(newFilters);
                onSearch(newFilters);
              }}
              className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                !filters.animalTypeIds || filters.animalTypeIds.length === 0
                  ? 'bg-white text-green-700 shadow-lg'
                  : 'bg-warm-cream/15 backdrop-blur-sm hover:bg-warm-cream/25 border border-white/20 hover:border-white/40 text-white hover:scale-105'
              }`}
            >
              {t('searchHero.showAll') || 'Показать все'}
            </button>
          </div>
          
          {/* First row - 4 animals */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
            {animalTypes?.slice(0, 4).map((type: any) => (
              <button
                key={type.id}
                onClick={() => handleAnimalTypeClick(type.id.toString())}
                className={`group relative bg-warm-cream/15 backdrop-blur-sm hover:bg-warm-cream/25 border border-white/20 hover:border-white/40 rounded-lg p-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                  isAnimalTypeSelected(type.id.toString()) ? 'bg-warm-cream/30 border-white/50 shadow-lg scale-105' : ''
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">
                    {getAnimalIcon(type.name)}
                  </div>
                  <div className="text-white font-semibold text-sm leading-tight">
                    {getAnimalName(type)}
                  </div>
                </div>
                {isAnimalTypeSelected(type.id.toString()) && (
                  <div className="absolute inset-0 bg-warm-cream/10 rounded-lg border-2 border-white/50"></div>
                )}
              </button>
            ))}
          </div>
          
          {/* Second row - 3 animals */}
          <div className="grid grid-cols-3 gap-3 max-w-3xl mx-auto">
            {animalTypes?.slice(4, 7).map((type: any) => (
              <button
                key={type.id}
                onClick={() => handleAnimalTypeClick(type.id.toString())}
                className={`group relative bg-warm-cream/15 backdrop-blur-sm hover:bg-warm-cream/25 border border-white/20 hover:border-white/40 rounded-lg p-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                  isAnimalTypeSelected(type.id.toString()) ? 'bg-warm-cream/30 border-white/50 shadow-lg scale-105' : ''
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">
                    {getAnimalIcon(type.name)}
                  </div>
                  <div className="text-white font-semibold text-sm leading-tight">
                    {getAnimalName(type)}
                  </div>
                </div>
                {isAnimalTypeSelected(type.id.toString()) && (
                  <div className="absolute inset-0 bg-warm-cream/10 rounded-lg border-2 border-white/50"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Search Form */}
        <div className="bg-warm-cream/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                {t('searchHero.region')}
              </label>
              <Select value={filters.regionId} onValueChange={(value: string) => setFilters(prev => ({ ...prev, regionId: value }))}>
                <SelectTrigger className="h-12 border-gray-200 focus:border-green-500 focus:ring-green-500">
                  <SelectValue placeholder={t('searchHero.allRegions')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('searchHero.allRegions')}</SelectItem>
                  {regions?.map((region: any) => (
                    <SelectItem key={region.id} value={region.id.toString()}>
                      {language === 'ky' ? region.nameKy : region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                {t('searchHero.priceRange')}
              </label>
              <Select value={filters.priceRange} onValueChange={(value: string) => setFilters(prev => ({ ...prev, priceRange: value }))}>
                <SelectTrigger className="h-12 border-gray-200 focus:border-green-500 focus:ring-green-500">
                  <SelectValue placeholder={t('searchHero.anyPrice')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('searchHero.anyPrice')}</SelectItem>
                  <SelectItem value="under50k">{t('searchHero.under50k')}</SelectItem>
                  <SelectItem value="50k-100k">{t('searchHero.between50k100k')}</SelectItem>
                  <SelectItem value="100k-200k">{t('searchHero.between100k200k')}</SelectItem>
                  <SelectItem value="above200k">{t('searchHero.above200k')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={handleSearch}
                className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Search className="w-5 h-5 mr-2" />
                {t('searchHero.search')}
              </Button>
            </div>
          </div>

          {/* Popular Searches */}
          <div className="border-t border-gray-200 pt-3">
            <p className="text-sm font-semibold text-gray-600 mb-1">
              {t('searchHero.popularSearches')}
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(t('searchHero.popularSearchesItems')).map(([key, value]) => (
                <button
                  key={key}
                  className="px-4 py-2 bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-700 rounded-full text-sm font-medium transition-colors duration-200 border border-gray-200 hover:border-green-300"
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
