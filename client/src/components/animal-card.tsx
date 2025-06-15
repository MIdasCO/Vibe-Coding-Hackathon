import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, MapPin, Clock, User as UserIcon } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { getAuthHeaders } from "@/lib/auth";

interface AnimalCardProps {
  animal: {
    id: number;
    title: string;
    description?: string;
    price: string;
    gender: string;
    birthYear?: number;
    createdAt: string;
    mainPhoto?: string;
    animalType?: { name: string };
    region?: { name: string };
    city?: { name: string };
    address?: string;
    user?: { id?: number; firstName?: string; lastName?: string };
  };
  isFavorite?: boolean;
}

export default function AnimalCard({ animal, isFavorite = false }: AnimalCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [, navigate] = useLocation();

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorite) {
        const response = await fetch(`/api/favorites/${animal.id}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to remove from favorites');
      } else {
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify({ animalId: animal.id }),
        });
        if (!response.ok) throw new Error('Failed to add to favorites');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      queryClient.invalidateQueries({ queryKey: ['/api/animals'] });
      toast({
        title: isFavorite ? t('animalCard.removedFromFavorites') : t('animalCard.addedToFavorites'),
        description: isFavorite 
          ? 'Животное удалено из избранного' 
          : 'Животное добавлено в избранное',
      });
    },
    onError: (error) => {
      console.error('Favorite error:', error);
      toast({
        title: 'Ошибка',
        description: 'Попробуйте еще раз',
        variant: "destructive",
      });
    },
  });

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите в систему, чтобы добавить в избранное',
        variant: "destructive",
      });
      return;
    }
    
    favoriteMutation.mutate();
  };

  const getAge = () => {
    if (!animal.birthYear) return null;
    const currentYear = new Date().getFullYear();
    const age = currentYear - animal.birthYear;
    return `${age} ${t('animalCard.yearsOld')}`;
  };

  const getTimeAgo = () => {
    const date = new Date(animal.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return t('animalCard.dayAgo');
    if (diffDays < 7) return `${diffDays} ${t('animalCard.daysAgo')}`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} ${t('animalCard.weeksAgo')}`;
    return `${Math.ceil(diffDays / 30)} ${t('animalCard.monthsAgo')}`;
  };

  const sellerName = animal.user?.firstName && animal.user?.lastName 
    ? `${animal.user.firstName} ${animal.user.lastName}`
    : animal.user?.firstName || t('animalCard.anonymousSeller');

  return (
    <Link href={`/animals/${animal.id}`}>
      <div className="animal-card bg-warm-cream-light rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
        <div className="relative">
          <img
            src={animal.mainPhoto || 'https://images.unsplash.com/photo-1560114928-40f1f1eb26a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'}
            alt={animal.title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-3 left-3">
            <Badge className="listing-badge verified bg-green-600 text-white">
              Проверено
            </Badge>
          </div>
          <div className="absolute top-3 right-3">
            <Button
              variant="secondary"
              size="sm"
              className="p-2 bg-white/90 hover:bg-white rounded-full shadow-md"
              onClick={handleFavoriteClick}
              disabled={favoriteMutation.isPending}
            >
              <Heart 
                className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
              />
            </Button>
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-gray-900 text-lg truncate">{animal.title}</h3>
            <span className="text-lg font-bold text-primary whitespace-nowrap ml-2">
              {parseInt(animal.price).toLocaleString()} KGS
            </span>
          </div>
          
          <div className="text-sm text-gray-600 mb-2 flex items-center gap-4">
            <span className={`inline-flex items-center ${animal.gender === 'male' ? 'text-blue-600' : 'text-pink-600'}`}>
              {animal.gender === 'male' ? '♂' : '♀'} {animal.gender === 'male' ? 'Самец' : 'Самка'}
            </span>
            {getAge() && (
              <span className="inline-flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {getAge()}
              </span>
            )}
          </div>
          
          <p className="text-gray-700 text-sm mb-3 line-clamp-2">
            {animal.description || 'Описание отсутствует'}
          </p>
          
          <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
            <span className="flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              {animal.city?.name}, {animal.region?.name}
            </span>
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {getTimeAgo()}
            </span>
          </div>
          
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                  <UserIcon className="w-3 h-3 text-gray-600" />
                </div>
                <span className="text-sm text-gray-700 font-medium truncate">
                  {sellerName}
                </span>
              </div>
              <Button
                size="sm"
                className="bg-primary text-white hover:bg-green-800 text-xs px-3 py-1"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!user) {
                    toast({
                      title: 'Требуется авторизация',
                      description: 'Войдите в систему, чтобы связаться с продавцом',
                      variant: "destructive",
                    });
                    return;
                  }
                  if (animal.user?.id) {
                    navigate(`/chat/${animal.user.id}`);
                  }
                }}
              >
                <MessageCircle className="w-3 h-3 mr-1" />
                Связаться
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
