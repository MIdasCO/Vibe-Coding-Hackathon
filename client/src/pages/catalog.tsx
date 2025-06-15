import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import Header from "@/components/header";
import SearchHero from "@/components/search-hero";
import FilterSidebar from "@/components/filter-sidebar";
import AnimalCard from "@/components/animal-card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Grid, List, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { useAuth } from "@/hooks/use-auth";
import { getAuthHeaders } from "@/lib/auth";

export default function Catalog() {
  const [location, navigate] = useLocation();
  const [category, setCategory] = useState<'livestock' | 'pets'>('livestock');
  const [filters, setFilters] = useState<any>({});
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('latest');
  const [viewMode, setViewMode] = useState('grid');
  const limit = 12;
  const { t } = useTranslation();
  const { user } = useAuth();

  // Определяем категорию из URL
  useEffect(() => {
    if (location === '/pets') {
      setCategory('pets');
    } else {
      setCategory('livestock');
    }
  }, [location]);

  const { data, isLoading } = useQuery({
    queryKey: ['/api/animals', { ...filters, sortBy, page, limit, category }],
    queryFn: async () => {
      const params = new URLSearchParams({
        sortBy,
        limit: limit.toString(),
        offset: ((page - 1) * limit).toString(),
        category,
      });
      
      if (filters.regionId) params.append('regionId', filters.regionId);
      if (filters.cityId) params.append('cityId', filters.cityId);
      if (filters.gender) params.append('gender', filters.gender);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.ageRange) params.append('ageRange', filters.ageRange);
      
      if (filters.animalTypeIds && filters.animalTypeIds.length > 0) {
        params.append('animalTypeIds', filters.animalTypeIds.join(','));
      }

      if (filters.breedIds && filters.breedIds.length > 0) {
        params.append('breedIds', filters.breedIds.join(','));
      }

      // Service filters based on category
      if (filters.homeDelivery) params.append('homeDelivery', 'true');
      if (filters.pickup) params.append('pickup', 'true');
      if (filters.vaccinated) params.append('vaccinated', 'true');
      if (filters.certified) params.append('certified', 'true');
      
      // Livestock specific filters
      if (category === 'livestock') {
        if (filters.butchered) params.append('butchered', 'true');
        if (filters.organicFeed) params.append('organicFeed', 'true');
      }

      const response = await fetch(`/api/animals?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch animals');
      return response.json();
    },
  });

  // Загружаем избранное для авторизованных пользователей
  const { data: favorites } = useQuery({
    queryKey: ['/api/favorites'],
    queryFn: async () => {
      const response = await fetch('/api/favorites', {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch favorites');
      return response.json();
    },
    enabled: !!user,
  });

  const handleSearch = (searchFilters: any) => {
    setFilters({ ...searchFilters, category });
    setPage(1);
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters((prev: any) => ({ ...prev, ...newFilters, category }));
    setPage(1);
  };

  const handleCategoryChange = (newCategory: 'livestock' | 'pets') => {
    setCategory(newCategory);
    setFilters({});
    setPage(1);
    
    // Update URL
    if (newCategory === 'pets') {
      navigate('/pets');
    } else {
      navigate('/');
    }
  };

  // Создаем Set с ID избранных животных для быстрого поиска
  const favoriteIds = new Set(favorites?.map((fav: any) => fav.animal?.id || fav.animalId) || []);

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  return (
    <div className="min-h-screen bg-warm-cream">
      <Header />
      
      {/* Category Switcher */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center py-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleCategoryChange('livestock')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  category === 'livestock'
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                🐄 {t('categories.livestock')}
              </button>
              <button
                onClick={() => handleCategoryChange('pets')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  category === 'pets'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                🐾 {t('categories.pets')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <SearchHero onSearch={handleSearch} category={category} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <FilterSidebar onFiltersChange={handleFiltersChange} category={category} />
          
          <div className="lg:w-3/4">
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {category === 'livestock' ? t('homePage.availableAnimals.title') : t('pets.title')}
                </h2>
                <p className="text-gray-600 mt-1">
                  {data ? t('homePage.availableAnimals.showing')
                    .replace('{{from}}', ((page - 1) * limit + 1).toString())
                    .replace('{{to}}', Math.min(page * limit, data.total).toString())
                    .replace('{{total}}', data.total.toString())
                    : t('homePage.availableAnimals.loading')}
                </p>
              </div>

              <div className="flex items-center space-x-4">
                {/* Sort Dropdown */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">{t('homePage.sort.latest')}</SelectItem>
                    <SelectItem value="price_asc">{t('homePage.sort.priceAsc')}</SelectItem>
                    <SelectItem value="price_desc">{t('homePage.sort.priceDesc')}</SelectItem>
                    <SelectItem value="popular">{t('homePage.sort.popular')}</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode Toggle */}
                <div className="flex border border-gray-300 rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                    title={t('homePage.viewMode.grid')}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                    title={t('homePage.viewMode.list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-warm-cream-light rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="animate-pulse">
                      <div className="w-full h-48 bg-gray-200"></div>
                      <div className="p-4">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded mb-2 w-2/3"></div>
                        <div className="h-3 bg-gray-200 rounded mb-3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Animals Grid */}
            {data && data.animals && (
              <>
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {data.animals.map((animal: any) => (
                    <AnimalCard
                      key={animal.animal.id}
                      animal={{
                        id: animal.animal.id,
                        title: animal.animal.title,
                        description: animal.animal.description,
                        price: animal.animal.price,
                        gender: animal.animal.gender,
                        birthYear: animal.animal.birthYear,
                        createdAt: animal.animal.createdAt,
                        mainPhoto: animal.mainPhoto,
                        animalType: animal.animalType,
                        region: animal.region,
                        city: animal.city,
                        address: animal.animal.address,
                        user: animal.user,
                      }}
                      isFavorite={favoriteIds.has(animal.animal.id)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      {t('homePage.pagination.previous')}
                    </Button>
                    
                    <div className="flex items-center space-x-1">
                      {/* First page */}
                      {page > 3 && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(1)}
                            className="w-10"
                          >
                            1
                          </Button>
                          {page > 4 && <span className="px-2 text-gray-500">...</span>}
                        </>
                      )}
                      
                      {/* Pages around current page */}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }
                        
                        if (pageNum < 1 || pageNum > totalPages) return null;
                        if (totalPages > 5 && page > 3 && pageNum === 1) return null;
                        if (totalPages > 5 && page < totalPages - 2 && pageNum === totalPages) return null;
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={page === pageNum ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPage(pageNum)}
                            className="w-10"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                      
                      {/* Last page */}
                      {page < totalPages - 2 && totalPages > 5 && (
                        <>
                          {page < totalPages - 3 && <span className="px-2 text-gray-500">...</span>}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(totalPages)}
                            className="w-10"
                          >
                            {totalPages}
                          </Button>
                        </>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                    >
                      {t('homePage.pagination.next')}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* No Results */}
            {data && data.animals && data.animals.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">
                  {category === 'livestock' ? '🐄' : '🐾'}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {category === 'livestock' 
                    ? t('homePage.availableAnimals.noResults.title')
                    : 'Питомцы не найдены'
                  }
                </h3>
                <p className="text-gray-600 mb-4">
                  {category === 'livestock' 
                    ? t('homePage.availableAnimals.noResults.description')
                    : 'Попробуйте изменить фильтры поиска'
                  }
                </p>
                <Button onClick={() => {
                  setFilters({});
                  setPage(1);
                }}>
                  {category === 'livestock' 
                    ? t('homePage.availableAnimals.noResults.clearFilters')
                    : 'Очистить фильтры'
                  }
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {category === 'livestock' 
              ? t('homePage.cta.title')
              : 'Хотите продать своего питомца?'
            }
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            {category === 'livestock' 
              ? t('homePage.cta.description')
              : 'Разместите объявление бесплатно и найдите любящую семью для вашего питомца'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary text-white hover:bg-green-800">
              <Link href="/create-listing">
                {category === 'livestock' 
                  ? t('homePage.cta.createListing')
                  : 'Разместить объявление'
                }
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-gray-900"
              onClick={() => window.location.href = '/support'}
            >
              {category === 'livestock' 
                ? t('homePage.cta.getSupport')
                : 'Получить поддержку'
              }
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}