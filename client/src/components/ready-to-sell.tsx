import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";

export default function ReadyToSell() {
  const { t } = useTranslation();

  return (
    <section className="bg-green-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('homePage.readyToSell.title')}
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            {t('homePage.readyToSell.description')}
          </p>
          <Button asChild className="bg-primary text-white hover:bg-green-800">
            <Link href="/create-listing">
              {t('homePage.readyToSell.button')}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
} 