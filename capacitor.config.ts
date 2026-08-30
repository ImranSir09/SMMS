import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.schoolmanagement.pro',
  appName: 'School Management Pro V2',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
