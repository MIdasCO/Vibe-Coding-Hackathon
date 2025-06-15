import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import AnimalCard from "./animal-card";

interface Animal {
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
  user?: { firstName?: string; lastName?: string };
}

interface ApiResponse<T> {
  data: T;
}

export default function AvailableAnimals() {
  const { t } = useTranslation();

  const { data: animals, isLoading } = useQuery<Animal[]>({
    queryKey: ['recentAnimals'],
    queryFn: () => api.get<ApiResponse<Animal[]>>('/api/animals/recent').then((res) => res.data.data)
  });

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            {t('homePage.availableAnimals.title')}
          </h2>
          <Button asChild variant="outline">
            <Link href="/animals">
              {t('homePage.availableAnimals.viewAll')}
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">{t('homePage.availableAnimals.loading')}</p>
          </div>
        ) : animals && animals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {animals.map((animal) => (
              <AnimalCard key={animal.id} animal={animal} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">{t('homePage.availableAnimals.noAnimals')}</p>
          </div>
        )}
      </div>
    </section>
  );
} 