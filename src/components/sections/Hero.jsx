// src/components/sections/Hero.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

// Composants
import Carousel from '../ui/Carousel';
import Button from '../ui/Button';

// Animations
import { heroAnimation, fadeIn } from '../../utils/animations';

// Assets
import LogoImage from '../../assets/images/logo/logo.png';
import CitadelleImage from '../../assets/images/hero/citadelle.jpg';
import PalaisImage from '../../assets/images/hero/palais-sanssouci.jpeg';
import PlaceArmesImage from '../../assets/images/hero/place-armes.webp';
import CapPanoramaImage from '../../assets/images/hero/cap-haitien.webp';

const Hero = () => {
  // Images pour le carousel
  const heroImages = [
    CitadelleImage,
    PalaisImage,
    PlaceArmesImage,
    CapPanoramaImage
  ];

  // Fonction pour le défilement vers les sections
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Features rapides à mettre en avant
  const quickFeatures = [
    'Transport urbain & interurbain',
    'Paiement sans contact NFC',
    'Écoénergétique & durable'
  ];

  return (
    <section className="relative min-h-screen">
      {/* Carousel en arrière-plan */}
      <div className="absolute inset-0 z-0">
        <Carousel 
          images={heroImages}
          autoPlayInterval={6000}
          className="w-full h-full"
          height="h-full"
          overlay={true}
          showDots={false}
          showArrows={false}
        />
        {/* Overlay gradient supplémentaire pour améliorer la lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/30 z-10" />
      </div>

      {/* Contenu Hero */}
      <div className="relative z-20 container mx-auto px-6 h-screen flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl text-white"
        >
          {/* Logo */}
          <motion.img
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            src={LogoImage}
            alt="LIMAJS MOTORS"
            className="w-48 mb-8"
          />

          {/* Titre principal */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Votre transport en bus Moderne
          </motion.h1>

          {/* Sous-titre */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-xl md:text-2xl mb-4 text-gray-200"
          >
            Voyagez en toute sérénité avec notre service de transport en commun fiable et confortable
          </motion.p>

          {/* Slogan et date */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-8"
          >
            <p className="text-lg text-accent italic mb-1">&quot;L&apos;assurance de voyager !&quot;</p>
            <p className="text-gray-300">Depuis septembre 2021</p>
          </motion.div>

          {/* Boutons d'action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-wrap gap-4"
          >
            <Button 
              variant="primary" 
              size="lg"
              icon={ArrowRight}
              onClick={() => scrollToSection('contact')}
            >
              Contactez-nous
            </Button>

            <Button 
              variant="outline" 
              size="lg"
              onClick={() => scrollToSection('services')}
              className="text-white border-white hover:bg-white hover:text-primary"
            >
              Nos Services
            </Button>
          </motion.div>

          {/* Features rapides */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center"
          >
            {quickFeatures.map((feature, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3"
              >
                <p className="text-sm font-medium">{feature}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Flèche de défilement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          delay: 1.3,
          repeat: Infinity,
          repeatType: "reverse",
          duration: 1.5
        }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <div className="w-6 h-10 border-2 border-white rounded-full p-1">
          <div className="w-1 h-2 bg-white rounded-full mx-auto animate-bounce" />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;