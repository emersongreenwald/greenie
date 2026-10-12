import { Platform } from 'react-native';

// Browsers have no native animation thread, so web animations must run on the JS driver.
export const USE_NATIVE_DRIVER = Platform.OS !== 'web';
