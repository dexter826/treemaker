'use client';

import Lottie from 'lottie-react';
import splashAnimation from '@/public/animations/splash.json';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  isVisible: boolean;
}

export function SplashScreen({ isVisible }: SplashScreenProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="bg-background fixed inset-0 z-[9999] flex items-center justify-center"
        >
          <div className="w-full max-w-[240px] md:max-w-[300px]">
            <Lottie
              animationData={splashAnimation}
              loop={true}
              className="h-full w-full"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
