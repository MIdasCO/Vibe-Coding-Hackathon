import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import { Github, Instagram, MapPin } from "lucide-react";

// Import team photos
import sarmatPhoto from "@/assets/images/sarmat_shabdanov.jpg";
import eldarPhoto from "@/assets/images/eldar_tashbolotov.jpg";
import abdelPhoto from "@/assets/images/abdel_rysbekov.jpg";

export default function Contact() {
  const { t } = useTranslation();

  const teamMembers = [
    {
      name: "Sarmat Shabdanov",
      photo: sarmatPhoto,
      github: "https://github.com/sarmat-shabdanov"
    },
    {
      name: "Eldar Tashbolotov", 
      photo: eldarPhoto,
      github: "https://github.com/E1dar821"
    },
    {
      name: "Abdel Rysbekov",
      photo: abdelPhoto,
      github: "https://github.com/MIdasCO"
    }
  ];

  return (
    <div className="min-h-screen bg-warm-cream">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('contactPage.title')}</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('contactPage.subtitle')}
          </p>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t('contactPage.contactUs')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Instagram className="w-5 h-5 text-primary" />
                <span className="text-gray-700">@janybar_com</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="text-gray-700">Бишкек, Кыргызстан</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">{t('contactPage.workingHours')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-center">
                <span className="text-gray-900 text-xl font-semibold">24/7</span>
              </div>
              <div className="text-center">
                <span className="text-gray-600">{t('contactPage.available247')}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Development Team */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">{t('contactPage.teamTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-primary">
                    <img 
                      src={member.photo} 
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardTitle className="text-xl">{member.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => window.open(member.github, '_blank')}
                  >
                    <Github className="w-4 h-4 mr-2" />
                    {t('contactPage.viewGithub')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Project Information */}
        <Card className="bg-primary text-white">
          <CardHeader>
            <CardTitle className="text-3xl text-center">{t('contactPage.projectTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-center leading-relaxed mb-6">
              {t('contactPage.projectDesc')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <h3 className="font-semibold text-lg mb-2">{t('contactPage.frontend')}</h3>
                <p className="text-sm opacity-90">React, TypeScript, Tailwind CSS</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">{t('contactPage.backend')}</h3>
                <p className="text-sm opacity-90">Node.js, Express, PostgreSQL</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">{t('contactPage.tools')}</h3>
                <p className="text-sm opacity-90">Vite, Drizzle ORM, Wouter</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 