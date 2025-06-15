import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { getAuthHeaders } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { CheckCircle, XCircle, Eye } from "lucide-react";

export default function AdminListings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch pending listings
  const { data: pendingListings, isLoading } = useQuery({
    queryKey: ['/api/admin/pending-listings'],
    queryFn: async () => {
      const response = await fetch('/api/admin/pending-listings', {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch pending listings');
      return response.json();
    },
  });

  // Mutation for approving/rejecting listings
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: 'active' | 'rejected' }) => {
      const response = await fetch(`/api/admin/listings/${id}/status`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update listing status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pending-listings'] });
      toast({
        title: "Status updated",
        description: "The listing status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update listing status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (id: number) => {
    updateStatusMutation.mutate({ id, status: 'active' });
  };

  const handleReject = (id: number) => {
    updateStatusMutation.mutate({ id, status: 'rejected' });
  };

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-warm-cream p-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚫</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h3>
              <p className="text-gray-600">You don't have permission to access this page.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-cream p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Pending Listings</h1>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="animate-pulse flex space-x-4">
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : pendingListings?.length > 0 ? (
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingListings.map((listing: any) => (
                    <TableRow key={listing.animal.id}>
                      <TableCell>{listing.animal.title}</TableCell>
                      <TableCell>{listing.animalType?.name}</TableCell>
                      <TableCell>{parseInt(listing.animal.price).toLocaleString()} KGS</TableCell>
                      <TableCell>
                        {listing.user?.firstName} {listing.user?.lastName}
                      </TableCell>
                      <TableCell>
                        {new Date(listing.animal.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                          >
                            <Link href={`/animals/${listing.animal.id}`}>
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprove(listing.animal.id)}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(listing.animal.id)}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">✨</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">All Clear!</h3>
                <p className="text-gray-600">There are no pending listings to review.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 