import { Slot } from 'expo-router';
import { Platform } from 'react-native';

// Bu dosya hooks klasörünün route olarak işlenmesini engeller
// ve bu klasördeki dosyaların normal hooks olarak kullanılmasını sağlar

// Expo Router'ın klasöre erişimini engelle
export const unstable_settings = {
  initialRouteName: '_ignored',
};

// Expo Router'ın hooks dizinini taramasını engellemek için bu dosyayı null olarak export et
export default function IgnoreHooksLayout() {
  // Router'ı hooks klasörünü atlamaya zorla
  if (Platform.OS !== 'web') {
    return <Slot />;
  }
  
  return null;
} 