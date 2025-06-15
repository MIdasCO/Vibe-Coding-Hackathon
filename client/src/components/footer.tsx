import { Link } from "wouter";
import { useTranslation } from "@/hooks/use-translation";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.about.title')}</h3>
            <p className="text-gray-400">{t('footer.about.description')}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.quickLinks.title')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  {t('footer.quickLinks.home')}
                </Link>
              </li>
              <li>
                <Link href="/animals" className="text-gray-400 hover:text-white transition-colors">
                  {t('footer.quickLinks.animals')}
                </Link>
              </li>
              <li>
                <Link href="/create-listing" className="text-gray-400 hover:text-white transition-colors">
                  {t('footer.quickLinks.createListing')}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                  {t('footer.quickLinks.dashboard')}
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="text-gray-400 hover:text-white transition-colors">
                  {t('footer.quickLinks.favorites')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.legal.title')}</h3>
            <ul className="space-y-2">
              <li>
                <a href="/terms" className="text-gray-400 hover:text-white transition-colors">
                  {t('footer.legal.terms')}
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  {t('footer.legal.privacy')}
                </a>
              </li>
              <li>
                <a href="/cookies" className="text-gray-400 hover:text-white transition-colors">
                  {t('footer.legal.cookies')}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.contact.title')}</h3>
            <ul className="space-y-2 text-gray-400">
              <li>{t('footer.contact.email')}: info@janybar.com</li>
              <li>{t('footer.contact.phone')}: +996 (312) 123-456</li>
              <li>{t('footer.contact.address')}: {t('footer.contact.location')}</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>{t('footer.copyright').replace('{{year}}', new Date().getFullYear().toString())}</p>
        </div>
      </div>
    </footer>
  );
} 