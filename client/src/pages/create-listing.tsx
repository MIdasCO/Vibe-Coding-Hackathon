import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { getAuthHeaders } from "@/lib/auth";
import { Upload, X, ImageIcon } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

const createListingSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.enum(["livestock", "pets"], { required_error: "Category is required" }),
  animalTypeId: z.string().min(1, "Animal type is required"),
  breedId: z.string().optional(),
  gender: z.enum(["male", "female"], { required_error: "Gender is required" }),
  birthYear: z.string().optional(),
  color: z.string().optional(),
  weight: z.string().optional(),
  purpose: z.string().optional(),
  price: z.string().min(1, "Price is required"),
  isNegotiable: z.boolean().default(false),
  regionId: z.string().min(1, "Region is required"),
  cityId: z.string().min(1, "City is required"),
  address: z.string().min(1, "Address is required").max(200, "Address must be less than 200 characters"),
  // Дополнительные услуги
  homeDelivery: z.boolean().default(false),
  pickup: z.boolean().default(false),
  butchered: z.boolean().default(false),
  vaccinated: z.boolean().default(false),
  certified: z.boolean().default(false),
  organicFeed: z.boolean().default(false),
});

type CreateListingForm = z.infer<typeof createListingSchema>;

export default function CreateListing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, language } = useTranslation();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateListingForm>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      category: "livestock",
      isNegotiable: false,
      homeDelivery: false,
      pickup: false,
      butchered: false,
      vaccinated: false,
      certified: false,
      organicFeed: false,
    },
  });

  const watchedCategory = watch("category");
  const watchedAnimalTypeId = watch("animalTypeId");
  const watchedRegionId = watch("regionId");

  type AnimalType = { id: number; name: string; nameRu?: string; nameKy?: string; icon?: string; category?: string };
  type Breed = { id: number; name: string; nameRu?: string; nameKy?: string };
  type Region = { id: number; name: string; nameRu?: string; nameKy?: string };
  type City = { id: number; name: string; nameRu?: string; nameKy?: string };

  const { data: animalTypes } = useQuery<AnimalType[]>({
    queryKey: ['/api/animal-types', watchedCategory],
    queryFn: async () => {
      const url = watchedCategory ? `/api/animal-types?category=${watchedCategory}` : '/api/animal-types';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch animal types');
      return response.json();
    },
  });

  const { data: breeds } = useQuery<Breed[]>({
    queryKey: ['/api/breeds', watchedAnimalTypeId],
    queryFn: async () => {
      if (!watchedAnimalTypeId) return [];
      const response = await fetch(`/api/breeds?animalTypeId=${watchedAnimalTypeId}`);
      if (!response.ok) throw new Error('Failed to fetch breeds');
      return response.json();
    },
    enabled: !!watchedAnimalTypeId,
  });

  const { data: regions } = useQuery<Region[]>({
    queryKey: ['/api/regions'],
  });

  const { data: cities } = useQuery<City[]>({
    queryKey: ['/api/cities', watchedRegionId],
    queryFn: async () => {
      if (!watchedRegionId) return [];
      const response = await fetch(`/api/cities?regionId=${watchedRegionId}`);
      if (!response.ok) throw new Error('Failed to fetch cities');
      return response.json();
    },
    enabled: !!watchedRegionId,
  });

  const createListingMutation = useMutation({
    mutationFn: async (data: CreateListingForm) => {
      const formData = new FormData();
      
      // Append form data
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          formData.append(key, value.toString());
        }
      });

      // Append photos
      selectedFiles.forEach((file) => {
        formData.append('photos', file);
      });

      const response = await fetch('/api/animals', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create listing');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/animals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/my-animals'] });
      toast({
        title: "Listing submitted for review",
        description: "Your listing will be visible in the marketplace after our team reviews and approves it. This usually takes 1-2 business days.",
      });
      navigate(`/animals/${data.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error creating listing",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (selectedFiles.length + files.length > 10) {
      toast({
        title: "Too many photos",
        description: "You can upload a maximum of 10 photos.",
        variant: "destructive",
      });
      return;
    }

    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024; // 10MB
      if (!isValid) {
        toast({
          title: "Invalid file",
          description: `${file.name} is not a valid image or is too large (max 10MB).`,
          variant: "destructive",
        });
      }
      return isValid;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
    
    // Create preview URLs
    validFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      setPreviewUrls(prev => [...prev, url]);
    });
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: CreateListingForm) => {
    if (selectedFiles.length === 0) {
      toast({
        title: "Photos required",
        description: "Please add at least one photo of your animal.",
        variant: "destructive",
      });
      return;
    }
    createListingMutation.mutate(data);
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  const currentYear = new Date().getFullYear();
  const birthYearOptions = Array.from({ length: 20 }, (_, i) => currentYear - i);

  return (
    <div className="min-h-screen bg-warm-cream">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('createListingPage.title')}
          </h1>
          <p className="mt-2 text-gray-600">
            {t('createListingPage.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t('createListingPage.basicInformation.title')}</CardTitle>
              <CardDescription>
                {t('createListingPage.basicInformation.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title">{t('createListingPage.basicInformation.titleLabel')}</Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder={t('createListingPage.basicInformation.titlePlaceholder')}
                  className="mt-1"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">{t('createListingPage.basicInformation.descriptionLabel')}</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder={t('createListingPage.basicInformation.descriptionPlaceholder')}
                  className="mt-1 min-h-[120px]"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              {/* Category Selection */}
              <div className="mb-6">
                <Label htmlFor="category">Категория *</Label>
                <Select onValueChange={(value) => setValue("category", value as "livestock" | "pets")} defaultValue="livestock">
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={t('createListingPage.basicInformation.categoryPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="livestock">🐄 {t('categories.livestock')}</SelectItem>
                    <SelectItem value="pets">🐕 {t('categories.pets')}</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="animalType">{t('createListingPage.basicInformation.animalTypeLabel')}</Label>
                  <Select onValueChange={(value) => setValue("animalTypeId", value)} disabled={!watchedCategory}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={t('createListingPage.basicInformation.animalTypePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {animalTypes?.map((type) => {
                        const displayName = language === 'ky' ? (type.nameKy || type.name) : 
                                          language === 'ru' ? (type.nameRu || type.name) : 
                                          type.name;
                        return (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.icon} {displayName}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {errors.animalTypeId && (
                    <p className="mt-1 text-sm text-red-600">{errors.animalTypeId.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="breed">{t('createListingPage.basicInformation.breedLabel')}</Label>
                  <Select onValueChange={(value) => setValue("breedId", value)} disabled={!watchedAnimalTypeId}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={t('createListingPage.basicInformation.breedPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {breeds?.map((breed) => {
                        const displayName = language === 'ky' ? (breed.nameKy || breed.name) : 
                                          language === 'ru' ? (breed.nameRu || breed.name) : 
                                          breed.name;
                        return (
                          <SelectItem key={breed.id} value={breed.id.toString()}>
                            {displayName}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="gender">{t('createListingPage.basicInformation.genderLabel')}</Label>
                  <Select onValueChange={(value) => setValue("gender", value as "male" | "female")}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={t('createListingPage.basicInformation.genderPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{t('createListingPage.basicInformation.genderMale')}</SelectItem>
                      <SelectItem value="female">{t('createListingPage.basicInformation.genderFemale')}</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="birthYear">{t('createListingPage.basicInformation.birthYearLabel')}</Label>
                  <Select onValueChange={(value) => setValue("birthYear", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={t('createListingPage.basicInformation.birthYearPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {birthYearOptions.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="color">{t('createListingPage.basicInformation.colorLabel')}</Label>
                  <Input
                    id="color"
                    {...register("color")}
                    placeholder={t('createListingPage.basicInformation.colorPlaceholder')}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="weight">{t('createListingPage.basicInformation.weightLabel')}</Label>
                  <Input
                    id="weight"
                    type="number"
                    {...register("weight")}
                    placeholder={t('createListingPage.basicInformation.weightPlaceholder')}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="purpose">{t('createListingPage.basicInformation.purposeLabel')}</Label>
                  <Select onValueChange={(value) => setValue("purpose", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={t('createListingPage.basicInformation.purposePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breeding">{t('createListingPage.basicInformation.purposeOptions.breeding')}</SelectItem>
                      <SelectItem value="dairy">{t('createListingPage.basicInformation.purposeOptions.dairy')}</SelectItem>
                      <SelectItem value="meat">{t('createListingPage.basicInformation.purposeOptions.meat')}</SelectItem>
                      <SelectItem value="reproduction">{t('createListingPage.basicInformation.purposeOptions.reproduction')}</SelectItem>
                      <SelectItem value="draft">{t('createListingPage.basicInformation.purposeOptions.draft')}</SelectItem>
                      <SelectItem value="other">{t('createListingPage.basicInformation.purposeOptions.other')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Photos */}
          <Card>
            <CardHeader>
              <CardTitle>{t('createListingPage.photos.title')}</CardTitle>
              <CardDescription>
                {t('createListingPage.photos.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="photo-upload"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-primary">{t('createListingPage.photos.uploadLabel')}</span> {t('createListingPage.photos.uploadDescription')}
                      </p>
                      <p className="text-xs text-gray-500">{t('createListingPage.photos.uploadHint')}</p>
                    </div>
                  </label>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-1 left-1 bg-primary text-white text-xs px-1 rounded">
                            {t('createListingPage.photos.mainPhotoLabel')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Additional Services */}
          <Card>
            <CardHeader>
              <CardTitle>{t('filterSidebar.services')}</CardTitle>
              <CardDescription>
                Отметьте доступные услуги для вашего объявления
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="homeDelivery"
                    onCheckedChange={(checked) => setValue("homeDelivery", checked as boolean)}
                  />
                  <Label htmlFor="homeDelivery" className="text-sm">
                    🚚 {t('filterSidebar.homeDelivery')}
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pickup"
                    onCheckedChange={(checked) => setValue("pickup", checked as boolean)}
                  />
                  <Label htmlFor="pickup" className="text-sm">
                    📦 {t('filterSidebar.pickup')}
                  </Label>
                </div>

                {/* Показываем "разделанное мясо" только для скота */}
                {watchedCategory === "livestock" && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="butchered"
                      onCheckedChange={(checked) => setValue("butchered", checked as boolean)}
                    />
                    <Label htmlFor="butchered" className="text-sm">
                      🥩 {t('filterSidebar.butchered')}
                    </Label>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="vaccinated"
                    onCheckedChange={(checked) => setValue("vaccinated", checked as boolean)}
                  />
                  <Label htmlFor="vaccinated" className="text-sm">
                    💉 {t('filterSidebar.vaccinated')}
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="certified"
                    onCheckedChange={(checked) => setValue("certified", checked as boolean)}
                  />
                  <Label htmlFor="certified" className="text-sm">
                    📋 {t('filterSidebar.certified')}
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="organicFeed"
                    onCheckedChange={(checked) => setValue("organicFeed", checked as boolean)}
                  />
                  <Label htmlFor="organicFeed" className="text-sm">
                    🌱 {t('filterSidebar.organicFeed')}
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Price and Location */}
          <Card>
            <CardHeader>
              <CardTitle>{t('createListingPage.priceAndLocation.title')}</CardTitle>
              <CardDescription>
                {t('createListingPage.priceAndLocation.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="price">{t('createListingPage.priceAndLocation.priceLabel')}</Label>
                  <Input
                    id="price"
                    type="number"
                    {...register("price")}
                    placeholder={t('createListingPage.priceAndLocation.pricePlaceholder')}
                    className="mt-1"
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2 mt-6">
                  <Checkbox
                    id="negotiable"
                    onCheckedChange={(checked) => setValue("isNegotiable", checked as boolean)}
                  />
                  <Label htmlFor="negotiable" className="text-sm">
                    {t('createListingPage.priceAndLocation.negotiableLabel')}
                  </Label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="region">{t('common.region')} *</Label>
                  <Select onValueChange={(value: string) => setValue("regionId", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={t('createListingPage.priceAndLocation.regionPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {regions?.map((region) => {
                        const displayName = language === 'ky' ? (region.nameKy || region.name) : 
                                          language === 'ru' ? (region.nameRu || region.name) : 
                                          region.name;
                        return (
                          <SelectItem key={region.id} value={region.id.toString()}>
                            {displayName}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {errors.regionId && (
                    <p className="mt-1 text-sm text-red-600">{errors.regionId.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="city">{t('common.city')} *</Label>
                  <Select onValueChange={(value: string) => setValue("cityId", value)} disabled={!watchedRegionId}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={t('createListingPage.priceAndLocation.cityPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {cities?.map((city) => {
                        const displayName = language === 'ky' ? (city.nameKy || city.name) : 
                                          language === 'ru' ? (city.nameRu || city.name) : 
                                          city.name;
                        return (
                          <SelectItem key={city.id} value={city.id.toString()}>
                            {displayName}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {errors.cityId && (
                    <p className="mt-1 text-sm text-red-600">{errors.cityId.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="address">{t('createListingPage.priceAndLocation.addressLabel')}</Label>
                <Input
                  id="address"
                  {...register("address")}
                  placeholder={t('createListingPage.priceAndLocation.addressPlaceholder')}
                  className="mt-1"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {t('createListingPage.priceAndLocation.addressHint')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
            >
              {t('createListingPage.submit.cancel')}
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-green-800"
              disabled={createListingMutation.isPending}
            >
              {createListingMutation.isPending 
                ? t('createListingPage.submit.creating') 
                : t('createListingPage.submit.create')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
