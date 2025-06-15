import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { apiRequest } from "@/lib/queryClient";
import { getAuthHeaders } from "@/lib/auth";
import { 
  Heart, 
  MessageCircle, 
  MapPin, 
  Calendar, 
  Weight, 
  User, 
  Phone, 
  Mail,
  Share2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Flag
} from "lucide-react";

interface AnimalDetailProps {
  id: number;
}

export default function AnimalDetail({ id }: AnimalDetailProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [messageContent, setMessageContent] = useState("");
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);

  const { data: animal, isLoading } = useQuery({
    queryKey: ['/api/animals', id],
    queryFn: async () => {
      const response = await fetch(`/api/animals/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Animal not found');
        }
        throw new Error('Failed to fetch animal details');
      }
      return response.json();
    },
  });

  const { data: favoriteStatus } = useQuery({
    queryKey: ['/api/favorites', id, 'check'],
    queryFn: async () => {
      if (!user) return { isFavorite: false };
      const response = await fetch(`/api/favorites/${id}/check`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) return { isFavorite: false };
      return response.json();
    },
    enabled: !!user,
  });

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (favoriteStatus?.isFavorite) {
        await apiRequest('DELETE', `/api/favorites/${id}`, undefined, getAuthHeaders());
      } else {
        await apiRequest('POST', '/api/favorites', { animalId: id }, getAuthHeaders());
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites', id, 'check'] });
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: favoriteStatus?.isFavorite ? t('animalDetail.removedFromFavorites') : t('animalDetail.addedToFavorites'),
        description: favoriteStatus?.isFavorite ? t('animalDetail.removedFromFavoritesDesc') : t('animalDetail.addedToFavoritesDesc'),
      });
    },
    onError: () => {
      toast({
        title: t('animalDetail.error'),
        description: t('animalDetail.tryAgain'),
        variant: "destructive",
      });
    },
  });

  const messageMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest('POST', '/api/messages', {
        toUserId: animal.user.id,
        animalId: id,
        content,
      }, getAuthHeaders());
    },
    onSuccess: () => {
      setMessageContent("");
      setIsMessageDialogOpen(false);
      toast({
        title: t('animalDetail.messageSent'),
        description: t('animalDetail.messageSentDesc'),
      });
    },
    onError: () => {
      toast({
        title: t('animalDetail.error'),
        description: t('animalDetail.sendMessageError'),
        variant: "destructive",
      });
    },
  });

  const handleFavoriteClick = () => {
    if (!user) {
      toast({
        title: t('animalDetail.loginRequired'),
        description: t('animalDetail.loginToContact'),
        variant: "destructive",
      });
      return;
    }
    favoriteMutation.mutate();
  };

  const handleSendMessage = () => {
    if (!user) {
      toast({
        title: t('animalDetail.loginRequired'),
        description: t('animalDetail.loginToContact'),
        variant: "destructive",
      });
      return;
    }
    if (!messageContent.trim()) {
      toast({
        title: t('animalDetail.messageRequired'),
        description: t('animalDetail.enterMessage'),
        variant: "destructive",
      });
      return;
    }
    messageMutation.mutate(messageContent);
  };

  const getAge = () => {
    if (!animal?.animal.birthYear) return null;
    const currentYear = new Date().getFullYear();
    const age = currentYear - animal.animal.birthYear;
    return `${age} ${t('animalDetail.yearsOld')}`;
  };

  const getTimeAgo = () => {
    if (!animal?.animal.createdAt) return '';
    const date = new Date(animal.animal.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return `1 ${t('animalDetail.dayAgo')}`;
    if (diffDays < 7) return `${diffDays} ${t('animalDetail.daysAgo')}`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} ${t('animalDetail.weeksAgo')}`;
    return `${Math.ceil(diffDays / 30)} ${t('animalDetail.monthsAgo')}`;
  };

  const nextPhoto = () => {
    if (animal?.photos && animal.photos.length > 1) {
      setCurrentPhotoIndex((prev) => (prev + 1) % animal.photos.length);
    }
  };

  const prevPhoto = () => {
    if (animal?.photos && animal.photos.length > 1) {
      setCurrentPhotoIndex((prev) => (prev - 1 + animal.photos.length) % animal.photos.length);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-cream">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="min-h-screen bg-warm-cream">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🐄</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('animalDetail.notFound')}</h3>
            <p className="text-gray-600 mb-4">{t('animalDetail.notFoundDesc')}</p>
            <Button onClick={() => navigate('/')}>
              {t('animalDetail.backToBrowse')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const photos = animal.photos || [];
  const currentPhoto = photos[currentPhotoIndex] || {};
  const hasMultiplePhotos = photos.length > 1;

  return (
    <div className="min-h-screen bg-warm-cream">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <button onClick={() => navigate('/')} className="hover:text-primary">
            {t('animalDetail.browseAnimals')}
          </button>
          <span>/</span>
          <span className="text-gray-900">{animal.animal.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image Gallery */}
          <div className="lg:col-span-2">
            <div className="relative bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="relative aspect-video">
                <img
                  src={currentPhoto.filePath || 'https://images.unsplash.com/photo-1560114928-40f1f1eb26a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600'}
                  alt={animal.animal.title}
                  className="w-full h-full object-cover"
                />
                
                {hasMultiplePhotos && (
                  <>
                    <button
                      onClick={prevPhoto}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextPhoto}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                <div className="absolute bottom-4 left-4">
                  <span className="bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded">
                    {currentPhotoIndex + 1} / {photos.length || 1}
                  </span>
                </div>

                <div className="absolute top-4 left-4">
                  <Badge className="listing-badge verified">
                    {t('animalDetail.verified')}
                  </Badge>
                </div>

                <div className="absolute top-4 right-4 flex space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/90 hover:bg-white"
                    onClick={handleFavoriteClick}
                  >
                    <Heart className={`w-4 h-4 ${favoriteStatus?.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/90 hover:bg-white"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Thumbnail strip */}
              {hasMultiplePhotos && (
                <div className="p-4 border-t">
                  <div className="flex space-x-2 overflow-x-auto">
                    {photos.map((photo: any, index: number) => (
                      <button
                        key={photo.id}
                        onClick={() => setCurrentPhotoIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                          index === currentPhotoIndex ? 'border-primary' : 'border-gray-200'
                        }`}
                      >
                        <img
                          src={photo.filePath}
                          alt={`${animal.animal.title} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>{t('animalDetail.description')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {animal.animal.description || t('animalDetail.noDescription')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Animal Details */}
          <div className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <h1 className="text-2xl font-bold text-gray-900">{animal.animal.title}</h1>
                  <span className="text-2xl font-bold text-primary">
                    {parseInt(animal.animal.price).toLocaleString()} KGS
                  </span>
                </div>

                {animal.animal.isNegotiable && (
                  <Badge className="listing-badge negotiable mb-4">
                    {t('animalDetail.negotiablePrice')}
                  </Badge>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <span className={`mr-2 text-lg ${animal.animal.gender === 'male' ? 'gender-male' : 'gender-female'}`}>
                      {animal.animal.gender === 'male' ? '♂' : '♀'}
                    </span>
                    <span className="capitalize">{animal.animal.gender === 'male' ? t('animalDetail.male') : t('animalDetail.female')}</span>
                  </div>
                  
                  {getAge() && (
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{getAge()}</span>
                    </div>
                  )}

                  {animal.animal.weight && (
                    <div className="flex items-center text-gray-600">
                      <Weight className="w-4 h-4 mr-2" />
                      <span>{animal.animal.weight} kg</span>
                    </div>
                  )}

                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{animal.city?.name}, {animal.region?.name}</span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Eye className="w-4 h-4 mr-2" />
                    <span>{animal.animal.viewCount || 0} {t('animalDetail.views')}</span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{t('animalDetail.posted')} {getTimeAgo()}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-600 space-y-1">
                    <div><strong>{t('animalDetail.type')}:</strong> {animal.animalType?.name}</div>
                    {animal.breed && <div><strong>{t('animalDetail.breed')}:</strong> {animal.breed.name}</div>}
                    {animal.animal.color && <div><strong>{t('animalDetail.color')}:</strong> {animal.animal.color}</div>}
                    {animal.animal.purpose && <div><strong>{t('animalDetail.purpose')}:</strong> {animal.animal.purpose}</div>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  {t('animalDetail.sellerInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {animal.user?.firstName} {animal.user?.lastName}
                    </h4>
                  </div>
                  
                  {animal.user?.phone && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{animal.user.phone}</span>
                    </div>
                  )}
                  
                  {animal.user?.email && (
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      <span>{animal.user.email}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
                <DialogTrigger asChild>
                  <Link href={`/chat/${animal.user.id}`} className="w-full bg-primary text-white hover:bg-green-800">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {t('animalDetail.sendMessage')}
                  </Link>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('animalDetail.sendMessageToSeller')}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        {t('animalDetail.regarding')}: <strong>{animal.animal.title}</strong>
                      </p>
                      <Textarea
                        placeholder={t('animalDetail.writeMessage')}
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <Button variant="outline" onClick={() => setIsMessageDialogOpen(false)}>
                        {t('animalDetail.cancel')}
                      </Button>
                      <Button 
                        onClick={handleSendMessage}
                        disabled={messageMutation.isPending}
                      >
                        {messageMutation.isPending ? t('animalDetail.sending') : t('animalDetail.sendMessage')}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" className="w-full">
                <Flag className="w-4 h-4 mr-2" />
                {t('animalDetail.reportListing')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
