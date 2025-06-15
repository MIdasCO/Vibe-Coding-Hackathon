import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Instagram } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export default function Support() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-warm-cream">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🤝</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('supportPage.title') || 'Поддержка'}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('supportPage.subtitle') || 'Свяжитесь с нами через Instagram для получения поддержки и ответов на ваши вопросы.'}
          </p>
        </div>

        {/* Instagram Contact Card */}
        <Card className="hover:shadow-lg transition-shadow mb-12">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <Instagram className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">
                  {t('supportPage.instagram.title') || 'Instagram'}
                </CardTitle>
                <CardDescription className="text-lg">
                  {t('supportPage.instagram.description') || 'Напишите нам в Direct Messages'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-2xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {t('supportPage.instagram.username') || '@janybar_com'}
              </p>
              <p className="text-gray-600">
                {t('supportPage.instagram.responseTime') || 'Отвечаем быстро в рабочее время'}
              </p>
              <Button 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                onClick={() => window.open('https://www.instagram.com/janybar_com?igsh=MTVhZ3Rzc254aGwycg==', '_blank')}
              >
                <Instagram className="w-5 h-5 mr-2" />
                {t('supportPage.instagram.button') || 'Открыть Instagram'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Simple CTA */}
        <div className="text-center bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">
            {t('supportPage.cta.title') || 'Нужна помощь?'}
          </h2>
          <p className="text-purple-100 mb-6">
            {t('supportPage.cta.description') || 'Подпишитесь на наш Instagram и напишите нам в Direct Messages!'}
          </p>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-white text-white hover:bg-white hover:text-purple-600"
            onClick={() => window.open('https://www.instagram.com/janybar_com?igsh=MTVhZ3Rzc254aGwycg==', '_blank')}
          >
            <Instagram className="w-5 h-5 mr-2" />
            {t('supportPage.cta.follow') || 'Подписаться'}
          </Button>
        </div>
      </main>
    </div>
  );
} 