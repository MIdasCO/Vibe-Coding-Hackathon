import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getAuthHeaders } from "@/lib/auth";
import {
  Plus,
  Eye,
  Heart,
  MessageCircle,
  DollarSign,
  TrendingUp,
  Edit,
  Trash2,
  MoreHorizontal,
  Calendar,
  MapPin,
  User,
  Activity,
  ListIcon,
  CheckCircle
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [animalToDelete, setAnimalToDelete] = useState<any>(null);

  const { data: myAnimals, isLoading: animalsLoading } = useQuery({
    queryKey: ['/api/my-animals'],
    queryFn: async () => {
      const response = await fetch('/api/my-animals', {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch animals');
      return response.json();
    },
    enabled: !!user,
  });

  const { data: favorites, isLoading: favoritesLoading } = useQuery({
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

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/transactions'],
    queryFn: async () => {
      const response = await fetch('/api/transactions', {
        headers: getAuthHeaders(),
      });
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!user,
  });

  const deleteAnimalMutation = useMutation({
    mutationFn: async (animalId: number) => {
      await apiRequest('DELETE', `/api/animals/${animalId}`, undefined, getAuthHeaders());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/my-animals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/animals'] });
      setDeleteDialogOpen(false);
      setAnimalToDelete(null);
      toast({
        title: "Animal deleted",
        description: "Your animal listing has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete animal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateAnimalStatusMutation = useMutation({
    mutationFn: async ({ animalId, status }: { animalId: number; status: string }) => {
      await apiRequest('PUT', `/api/animals/${animalId}`, { status }, getAuthHeaders());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/my-animals'] });
      toast({
        title: "Status updated",
        description: "Animal status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
      case 'sold':
        return <Badge className="bg-blue-100 text-blue-800">Sold</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const handleDeleteAnimal = (animal: any) => {
    setAnimalToDelete(animal);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (animalToDelete) {
      deleteAnimalMutation.mutate(animalToDelete.id);
    }
  };

  const handleStatusChange = (animalId: number, newStatus: string) => {
    updateAnimalStatusMutation.mutate({ animalId, status: newStatus });
  };

  const stats = {
    totalListings: myAnimals?.length || 0,
    activeListings: myAnimals?.filter((a: any) => a.status === 'active').length || 0,
    totalViews: myAnimals?.reduce((sum: number, animal: any) => sum + (animal.viewCount || 0), 0) || 0,
    totalFavorites: favorites?.length || 0,
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-warm-cream">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Please log in</h3>
            <p className="text-gray-600 mb-4">You need to be logged in to view your dashboard.</p>
            <Link href="/login">
              <Button>Log In</Button>
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.firstName || 'Seller'}!
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your livestock listings and track your performance.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Listings</p>
                  <h3 className="text-2xl font-bold text-gray-900">{stats.totalListings}</h3>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <ListIcon className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Active Listings</p>
                  <h3 className="text-2xl font-bold text-gray-900">{stats.activeListings}</h3>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <h3 className="text-2xl font-bold text-gray-900">{stats.totalViews}</h3>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Eye className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Избранное</p>
                  <h3 className="text-2xl font-bold text-gray-900">{stats.totalFavorites}</h3>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <Heart className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {user?.isAdmin && (
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Admin Panel</h3>
                  <p className="text-sm text-gray-600">Manage listings and moderate content</p>
                </div>
                <Button asChild>
                  <Link href="/admin/listings">
                    Go to Admin Panel
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            <TabsTrigger value="favorites">Избранное</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* My Listings Tab */}
          <TabsContent value="listings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">My Listings</h2>
              <Button asChild className="bg-primary hover:bg-green-800">
                <Link href="/create-listing">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Listing
                </Link>
              </Button>
            </div>

            {animalsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="pt-6">
                      <div className="animate-pulse flex space-x-4">
                        <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : myAnimals && myAnimals.length > 0 ? (
              <div className="space-y-4">
                {myAnimals.map((animal: any) => (
                  <Card key={animal.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={`https://images.unsplash.com/photo-1560114928-40f1f1eb26a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80`}
                            alt={animal.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <Link href={`/animals/${animal.id}`} className="hover:text-primary">
                              <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {animal.title}
                              </h3>
                            </Link>
                            <div className="flex items-center space-x-2">
                              {getStatusBadge(animal.status)}
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                            <span className="font-semibold text-primary">
                              {parseInt(animal.price).toLocaleString()} KGS
                            </span>
                            <span className="flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              {animal.viewCount || 0} views
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {getTimeAgo(animal.createdAt)}
                            </span>
                          </div>
                          
                          <div className="mt-3 flex items-center space-x-2">
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/animals/${animal.id}/edit`}>
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Link>
                            </Button>
                            
                            {animal.status === 'active' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(animal.id, 'inactive')}
                              >
                                Deactivate
                              </Button>
                            ) : animal.status === 'inactive' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(animal.id, 'active')}
                              >
                                Activate
                              </Button>
                            ) : null}
                            
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteAnimal(animal)}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🐄</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings yet</h3>
                    <p className="text-gray-600 mb-4">Create your first animal listing to get started.</p>
                    <Button asChild className="bg-primary hover:bg-green-800">
                      <Link href="/create-listing">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Listing
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites">
            <Card>
              <CardHeader>
                <CardTitle>Избранные животные</CardTitle>
                <CardDescription>
                  Животные, которых вы отметили как избранные
                </CardDescription>
              </CardHeader>
              <CardContent>
                {favoritesLoading ? (
                  <div className="text-center py-4">Загрузка избранного...</div>
                ) : favorites && favorites.length > 0 ? (
                  <div className="space-y-4">
                    {favorites.map((favorite: any) => (
                      <div key={favorite.favorite.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={favorite.mainPhoto || 'https://images.unsplash.com/photo-1560114928-40f1f1eb26a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64'}
                            alt={favorite.animal?.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <Link href={`/animals/${favorite.animal?.id}`} className="hover:text-primary">
                            <h4 className="font-semibold">{favorite.animal?.title}</h4>
                          </Link>
                          <p className="text-sm text-gray-600">
                            {parseInt(favorite.animal?.price || '0').toLocaleString()} KGS
                          </p>
                          <p className="text-sm text-gray-500">
                            {favorite.city?.name}, {favorite.region?.name}
                          </p>
                        </div>
                        <Button size="sm" asChild>
                          <Link href={`/animals/${favorite.animal?.id}`}>
                            Подробнее
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Пока нет избранного</h3>
                    <p className="text-gray-600 mb-4">Начните просматривать и сохраняйте животных, которые вас интересуют.</p>
                    <Button asChild>
                      <Link href="/">Просмотреть животных</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>
                  Your conversations with other users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
                  <p className="text-gray-600">When someone contacts you about your listings, you'll see messages here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Profile Information</h4>
                    <div className="mt-2 space-y-2 text-sm text-gray-600">
                      <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                      <p><strong>Email:</strong> {user.email}</p>
                      <p><strong>Verification Status:</strong> {user.isVerified ? 'Verified' : 'Not Verified'}</p>
                      {user.balance && <p><strong>Balance:</strong> {user.balance} KGS</p>}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <Button variant="outline">
                      Edit Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Animal Listing</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{animalToDelete?.title}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteAnimalMutation.isPending}
              >
                {deleteAnimalMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
