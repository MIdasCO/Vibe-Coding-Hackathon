import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, Search } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center px-4 max-w-2xl mx-auto">
        {/* Animated 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl md:text-[12rem] font-bold text-gray-200 select-none animate-pulse">
            404
          </h1>
          <div className="relative -mt-16 md:-mt-20">
            <div className="text-6xl mb-4 animate-bounce">🐄</div>
          </div>
        </div>

        {/* Error Message Card */}
        <Card className="shadow-xl border-0 bg-warm-cream-light/90 backdrop-blur-sm">
          <CardContent className="pt-8 pb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('notFound.title', 'Страница не найдена')}
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              {t('notFound.description', 'К сожалению, страница которую вы ищете не существует. Возможно она была перемещена или удалена.')}
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="bg-primary hover:bg-green-800 text-white min-w-[160px]">
                <Link href="/">
                  <Home className="w-5 h-5 mr-2" />
                  {t('notFound.goHome', 'На главную')}
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="min-w-[160px]">
                <Link href="/animals">
                  <Search className="w-5 h-5 mr-2" />
                  {t('notFound.browseAnimals', 'Смотреть животных')}
                </Link>
              </Button>
              
              <Button 
                variant="ghost" 
                size="lg" 
                onClick={() => window.history.back()}
                className="min-w-[160px]"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                {t('notFound.goBack', 'Назад')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="mt-8 text-sm text-gray-500">
          <p>{t('notFound.helpText', 'Если вы считаете что это ошибка, свяжитесь с нами:')} 
                          <a href="mailto:support@janybar.com" className="text-primary hover:underline ml-1">
                support@janybar.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
