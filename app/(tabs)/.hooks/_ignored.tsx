// Bu dosya hooks klasörünün içindeki dosyaların route olarak değerlendirilmesini engeller
// Expo Router'da alt çizgi (_) ile başlayan dosyalar route olarak değerlendirilmez

export default function IgnoreHooks() {
  return null;
} 