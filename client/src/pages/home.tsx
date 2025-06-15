import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
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

export default function Home() {
  const [filters, setFilters] = useState<any>({});
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('latest');
  const [viewMode, setViewMode] = useState('grid');
  const limit = 12;
  const { t } = useTranslation();
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['/api/animals', { ...filters, sortBy, page, limit, category: 'livestock' }],
    queryFn: async () => {
      const params = new URLSearchParams({
        sortBy,
        limit: limit.toString(),
        offset: ((page - 1) * limit).toString(),
        category: 'livestock',
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

      // Дополнительные услуги
      if (filters.homeDelivery) params.append('homeDelivery', 'true');
      if (filters.pickup) params.append('pickup', 'true');
      if (filters.butchered) params.append('butchered', 'true');
      if (filters.vaccinated) params.append('vaccinated', 'true');
      if (filters.certified) params.append('certified', 'true');
      if (filters.organicFeed) params.append('organicFeed', 'true');

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
    setFilters({ ...searchFilters, category: 'livestock' });
    setPage(1);
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters((prev: any) => ({ ...prev, ...newFilters, category: 'livestock' }));
    setPage(1);
  };

  // Создаем Set с ID избранных животных для быстрого поиска
  const favoriteIds = new Set(favorites?.map((fav: any) => fav.animal?.id || fav.animalId) || []);

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  return (
    <div className="min-h-screen bg-warm-cream">
      <Header />
      <SearchHero onSearch={handleSearch} category="livestock" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <FilterSidebar onFiltersChange={handleFiltersChange} category="livestock" />
          
          <div className="lg:w-3/4">
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{t('homePage.availableAnimals.title')}</h2>
                <p className="text-gray-600 mt-1">
                  {data ? t('homePage.availableAnimals.showing')
                    .replace('{{from}}', ((page - 1) * limit + 1).toString())
                    .replace('{{to}}', Math.min(page * limit, data.total).toString())
                    .replace('{{total}}', data.total.toString())
                    : t('homePage.availableAnimals.loading')}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder={t('homePage.sort.title')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">{t('homePage.sort.latest')}</SelectItem>
                    <SelectItem value="price_asc">{t('homePage.sort.priceAsc')}</SelectItem>
                    <SelectItem value="price_desc">{t('homePage.sort.priceDesc')}</SelectItem>
                    <SelectItem value="popular">{t('homePage.sort.popular')}</SelectItem>
                  </SelectContent>
                </Select>
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
                  <div className="mt-12 flex justify-center">
                    <nav className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum = i + 1;
                        if (totalPages > 5 && page > 3) {
                          pageNum = Math.min(totalPages - 4 + i, totalPages);
                          if (page <= totalPages - 2) {
                            pageNum = page - 2 + i;
                          }
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={page === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </nav>
                  </div>
                )}
              </>
            )}

            {/* Empty State */}
            {data && data.animals && data.animals.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🐄</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('homePage.availableAnimals.noResults.title')}</h3>
                <p className="text-gray-600 mb-4">{t('homePage.availableAnimals.noResults.description')}</p>
                <Button onClick={() => {
                  setFilters({});
                  setPage(1);
                }}>
                  {t('homePage.availableAnimals.noResults.clearFilters')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">{t('homePage.cta.title')}</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            {t('homePage.cta.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary text-white hover:bg-green-800">
              <Link href="/create-listing">{t('homePage.cta.createListing')}</Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className=" bg-primary text-white hover:bg-green-800 "
              onClick={() => window.location.href = '/support'}
            >
              {t('homePage.cta.getSupport')}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-warm-cream-light border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-2">🐄</span>
                <span className="text-xl font-bold text-primary">Janybar</span>
              </div>
              <p className="text-gray-600 mb-4 max-w-md">
                {t('homePage.footer.description')}
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">{t('homePage.footer.forBuyers.title')}</h3>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-primary transition-colors">{t('homePage.footer.forBuyers.browseAnimals')}</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">{t('homePage.footer.forBuyers.advancedSearch')}</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">{t('homePage.footer.forBuyers.buyingGuide')}</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">{t('homePage.footer.forSellers.title')}</h3>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-primary transition-colors">{t('homePage.footer.forSellers.createListing')}</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">{t('homePage.footer.forSellers.sellingGuide')}</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">{t('homePage.footer.forSellers.successStories')}</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              {t('homePage.footer.legal.copyright').replace('{{year}}', new Date().getFullYear().toString())}
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-500 hover:text-primary text-sm transition-colors">{t('homePage.footer.legal.privacyPolicy')}</a>
              <a href="#" className="text-gray-500 hover:text-primary text-sm transition-colors">{t('homePage.footer.legal.termsOfService')}</a>
              <a href="#" className="text-gray-500 hover:text-primary text-sm transition-colors">{t('homePage.footer.legal.contactUs')}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
