import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/header";
import AnimalCard from "@/components/animal-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getAuthHeaders } from "@/lib/auth";
import { Heart, Grid, List, Trash2 } from "lucide-react";
import { useState } from "react";

export default function Favorites() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('latest');

  const { data: favorites, isLoading } = useQuery({
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

  const removeFavoriteMutation = useMutation({
    mutationFn: async (animalId: number) => {
      await apiRequest('DELETE', `/api/favorites/${animalId}`, undefined, getAuthHeaders());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: "Удалено из избранного",
        description: "Животное успешно удалено из вашего избранного.",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить из избранного. Попробуйте еще раз.",
        variant: "destructive",
      });
    },
  });

  const clearAllFavoritesMutation = useMutation({
    mutationFn: async () => {
      const promises = favorites.map((favorite: any) =>
        apiRequest('DELETE', `/api/favorites/${favorite.animal.id}`, undefined, getAuthHeaders())
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: "Все избранное очищено",
        description: "Все животные удалены из вашего избранного.",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось очистить избранное. Попробуйте еще раз.",
        variant: "destructive",
      });
    },
  });

  const handleRemoveFavorite = (animalId: number) => {
    removeFavoriteMutation.mutate(animalId);
  };

  const handleClearAll = () => {
    if (favorites && favorites.length > 0) {
      clearAllFavoritesMutation.mutate();
    }
  };

  const sortedFavorites = favorites ? [...favorites].sort((a: any, b: any) => {
    switch (sortBy) {
      case 'price_asc':
        return parseFloat(a.animal.price) - parseFloat(b.animal.price);
      case 'price_desc':
        return parseFloat(b.animal.price) - parseFloat(a.animal.price);
      case 'oldest':
        return new Date(a.favorite.createdAt).getTime() - new Date(b.favorite.createdAt).getTime();
      case 'latest':
      default:
        return new Date(b.favorite.createdAt).getTime() - new Date(a.favorite.createdAt).getTime();
    }
  }) : [];

  if (!user) {
    return (
      <div className="min-h-screen bg-warm-cream">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <Heart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Войдите в систему</h3>
            <p className="text-gray-600 mb-4">Вам необходимо войти в систему, чтобы просматривать избранное.</p>
            <Link href="/login">
              <Button>Войти</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-cream">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Heart className="w-8 h-8 text-red-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Мое избранное</h1>
          </div>
          <p className="text-gray-600">
            Животные, которых вы сохранили для просмотра и сравнения.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <p className="text-sm text-gray-600">
              {isLoading ? 'Загрузка...' : `${favorites?.length || 0} избранных`}
            </p>
            {favorites && favorites.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                disabled={clearAllFavoritesMutation.isPending}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                {clearAllFavoritesMutation.isPending ? 'Очистка...' : 'Очистить все'}
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Недавно добавленные</SelectItem>
                <SelectItem value="oldest">Сначала старые</SelectItem>
                <SelectItem value="price_asc">Цена: по возрастанию</SelectItem>
                <SelectItem value="price_desc">Цена: по убыванию</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border border-gray-300 rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2 w-2/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Favorites Grid/List */}
        {!isLoading && sortedFavorites.length > 0 && (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {sortedFavorites.map((favorite: any) => {
              const animalData = {
                id: favorite.animal.id,
                title: favorite.animal.title,
                description: favorite.animal.description,
                price: favorite.animal.price,
                gender: favorite.animal.gender,
                birthYear: favorite.animal.birthYear,
                createdAt: favorite.animal.createdAt,
                mainPhoto: favorite.mainPhoto,
                animalType: favorite.animalType,
                region: favorite.region,
                city: favorite.city,
                user: favorite.user,
              };

              return (
                <div key={favorite.favorite.id} className="relative">
                  <AnimalCard animal={animalData} isFavorite={true} />
                  
                  {/* Remove from favorites button */}
                  <div className="absolute top-2 left-2 z-10">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="p-2 bg-white/90 hover:bg-white rounded-full shadow-md"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemoveFavorite(favorite.animal.id);
                      }}
                      disabled={removeFavoriteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                  
                  {/* Favorite date */}
                  <div className="mt-2 text-xs text-gray-500 text-center">
                    Добавлено {new Date(favorite.favorite.createdAt).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!favorites || favorites.length === 0) && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Heart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Пока нет избранного</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Просматривайте наш каталог и нажимайте на иконку сердца у животных, которые вас интересуют, чтобы сохранить их здесь.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild className="bg-primary hover:bg-green-800">
                    <Link href="/">
                      Просмотреть животных
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/dashboard">
                      Перейти в панель
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        {favorites && favorites.length > 0 && (
          <Card className="mt-8">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Советы по управлению избранным</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Сравнение животных</h4>
                  <p>Используйте избранное для легкого сравнения разных животных перед принятием решения.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Связь с продавцами</h4>
                  <p>Нажмите на любое избранное животное, чтобы просмотреть детали и связаться с продавцом через нашу систему сообщений.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
