import Header from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";
import { Search, Shield, MessageCircle, Star, Truck, Heart } from "lucide-react";

export default function About() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Search,
      title: t('aboutPage.features.search.title'),
      description: t('aboutPage.features.search.desc')
    },
    {
      icon: Shield,
      title: t('aboutPage.features.verified.title'),
      description: t('aboutPage.features.verified.desc')
    },
    {
      icon: MessageCircle,
      title: t('aboutPage.features.messaging.title'),
      description: t('aboutPage.features.messaging.desc')
    },
    {
      icon: Star,
      title: t('aboutPage.features.ratings.title'),
      description: t('aboutPage.features.ratings.desc')
    },
    {
      icon: Truck,
      title: t('aboutPage.features.services.title'),
      description: t('aboutPage.features.services.desc')
    },
    {
      icon: Heart,
      title: t('aboutPage.features.favorites.title'),
      description: t('aboutPage.features.favorites.desc')
    }
  ];

  return (
    <div className="min-h-screen bg-warm-cream">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <span className="text-6xl mr-4">🐄</span>
            <h1 className="text-4xl font-bold text-gray-900">{t('aboutPage.title')}</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('aboutPage.subtitle')}
          </p>
        </div>

        {/* Problem & Solution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-red-600">{t('aboutPage.problemTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                {t('aboutPage.problemDesc')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-green-600">{t('aboutPage.solutionTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                {t('aboutPage.solutionDesc')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Key Features */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">{t('aboutPage.featuresTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <feature.icon className="w-8 h-8 text-primary" />
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Use Cases */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">{t('aboutPage.audienceTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <div className="text-4xl mb-2">🚜</div>
                <CardTitle>{t('aboutPage.audience.farmers.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{t('aboutPage.audience.farmers.desc')}</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="text-4xl mb-2">🏠</div>
                <CardTitle>{t('aboutPage.audience.families.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{t('aboutPage.audience.families.desc')}</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="text-4xl mb-2">🧬</div>
                <CardTitle>{t('aboutPage.audience.breeders.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{t('aboutPage.audience.breeders.desc')}</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="text-4xl mb-2">🏢</div>
                <CardTitle>{t('aboutPage.audience.business.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{t('aboutPage.audience.business.desc')}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mission Statement */}
        <Card className="bg-primary text-white">
          <CardHeader>
            <CardTitle className="text-3xl text-center">{t('aboutPage.missionTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl text-center leading-relaxed">
              {t('aboutPage.missionDesc')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 