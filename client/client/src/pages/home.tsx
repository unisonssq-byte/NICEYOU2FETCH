import { useRef } from "react";
import { Link } from "wouter";
import HeroSection from "@/components/hero-section";
import FeaturesSection from "@/components/features-section";
import ContactAccordion from "@/components/contact-accordion";
import { Globe } from "lucide-react";

export default function Home() {
  const featuresRef = useRef<HTMLDivElement>(null);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <div className="min-h-screen text-white overflow-x-hidden">
      <HeroSection onLearnMore={scrollToFeatures} />
      
      <div ref={featuresRef}>
        <FeaturesSection />
      </div>

      {/* Footer */}
      <footer className="py-12 text-center" data-testid="section-footer">
        <div className="max-w-4xl mx-auto px-4">
          <div className="glass-effect rounded-2xl p-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-10 h-10 rounded-full glass-effect flex items-center justify-center mr-3">
                <Globe className="text-blue-300 w-5 h-5" />
              </div>
              <span className="text-2xl font-bold" data-testid="text-footer-logo">You2Fetch</span>
            </div>
            <p className="text-gray-300 mb-4" data-testid="text-footer-copyright">
              © 2024 You2Fetch. Быстрое и качественное конвертирование видео.
            </p>
            <div className="flex justify-center gap-6 text-sm text-gray-400">
              <Link href="/privacy-policy" className="hover:text-white transition-colors" data-testid="link-privacy">
                Политика конфиденциальности
              </Link>
              <Link href="/terms-of-service" className="hover:text-white transition-colors" data-testid="link-terms">
                Условия использования
              </Link>
              <ContactAccordion />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
