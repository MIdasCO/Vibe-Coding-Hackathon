import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-translation";
import { Heart, MessageCircle, Plus, User, LogOut, Settings, BarChart3, Globe } from "lucide-react";
import janybarLogo from "@/assets/logos/janybar.jpg";

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [location, navigate] = useLocation();
  const { t, language, setLanguage } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const languageNames = {
    ru: 'Русский',
    ky: 'Кыргызча',
    en: 'English'
  };

  return (
    <header className="bg-warm-cream-light shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
                             <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary mr-3 shadow-sm">
                 <img src={janybarLogo} alt="Janybar" className="w-full h-full object-cover object-center" />
              </div>
              <span className="text-xl font-bold text-primary">Janybar</span>
            </div>
          </Link>

          {/* Main Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              location === '/' ? 'text-primary' : 'text-gray-700 hover:text-primary'
            }`}>
              {t('header.browseAnimals')}
            </Link>
            <Link href="/about" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              location === '/about' ? 'text-primary' : 'text-gray-700 hover:text-primary'
            }`}>
              {t('header.about')}
            </Link>
            <Link href="/contact" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              location === '/contact' ? 'text-primary' : 'text-gray-700 hover:text-primary'
            }`}>
              {t('header.contact')}
            </Link>
           
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <div className="hidden md:flex items-center">
              <Globe className="h-4 w-4 mr-2 text-gray-500" />
              <Select value={language} onValueChange={(value: 'ru' | 'ky' | 'en') => setLanguage(value)}>
                <SelectTrigger className="w-32 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ru">Русский</SelectItem>
                  <SelectItem value="ky">Кыргызча</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isAuthenticated ? (
              <>
                <div className="hidden md:flex items-center space-x-4">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href="/favorites">
                      <Heart className="h-5 w-5" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href="/chat">
                      <MessageCircle className="h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild className="bg-primary text-white hover:bg-green-800">
                    <Link href="/create-listing">
                      <Plus className="h-5 w-5 mr-2" />
                      {t('header.createListing')}
                    </Link>
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="flex items-center">
                          <BarChart3 className="mr-2 h-4 w-4" />
                          {t('header.dashboard')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/profile/settings" className="flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          {t('header.profileSettings')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        {t('header.logout')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Button variant="outline" asChild>
                  <Link href="/login">{t('header.login')}</Link>
                </Button>
                <Button asChild className="bg-primary text-white hover:bg-green-800">
                  <Link href="/register">{t('header.register')}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
