
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.d78bac2f334945d5936ca727a61b8e3c',
  appName: 'tixel-event-verse-mobile',
  webDir: 'dist',
  server: {
    url: 'https://d78bac2f-3349-45d5-936c-a727a61b8e3c.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#9b87f5",
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;
