import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';

interface EmojiBackgroundProps {
  emoji: string;
  opacity?: number;
  size?: number;
  spacing?: number;
  count?: number;
}

// Tüm bileşeni memo ile saralım - gereksiz yeniden render'ları önler
const EmojiBackground = memo(({
  emoji,
  opacity = 0.1,
  size = 32,
  spacing = 80,
  count = 25,
}: EmojiBackgroundProps) => {
  // Debug için emoji parametrelerini logla - performans için kapatıldı
  /*
  useEffect(() => {
    console.log('EmojiBackground render edildi:', { emoji, opacity, size, count });
  }, [emoji, opacity, size, count]);
  */
  
  // Emoji konumlarını useMemo ile hesaplayalım - sadece bağımlılıklar değiştiğinde yeniden hesaplanır
  // ve performans için daha az emoji gösterelim
  const emojis = useMemo(() => {
    const emojisArray = [];
    
    // Emoji sayısı sınırlı olsun - performans için azaltıldı
    const maxCount = Math.min(count, 12);
    
    for (let i = 0; i < maxCount; i++) {
      // Emoji konumlarını kodu her çalıştığında rastgele oluşturmak yerine, 
      // emoji ve i'ye bağlı hale getirdik - böylece daha stabil konumlar oluşur
      const seed = (emoji.charCodeAt(0) + i * 17) % 100;
      const left = (seed * 1.7) % 100;
      const top = (seed * 2.3 + i * 7) % 100;
      
      // Rastgele gecikme değeri yerine daha öngörülebilir değerler
      const delay = i * 50; // Daha stabil ve daha kısa gecikmeler
      
      // Çok daha basit animasyon ayarları
      const animationProps = {
        from: { opacity: 0 },
        animate: { opacity },
        transition: { 
          type: 'timing' as const, 
          duration: 300,
          delay, 
        }
      };
      
      emojisArray.push({
        id: i,
        left,
        top,
        animationProps,
      });
    }
    
    return emojisArray;
  }, [emoji, opacity, count]);
  
  // Stil değişiklikleri için useMemo
  const containerStyle = useMemo(() => 
    [styles.container],
  []);
  
  // Emoji arkaplanını sadece bir kez oluşturup memoize et
  const emojiElements = useMemo(() => 
    emojis.map(({ id, left, top, animationProps }) => (
      <MotiView
        key={`${emoji}-${id}`}
        style={[
          styles.emojiContainer,
          {
            left: `${left}%`,
            top: `${top}%`,
            width: size,
            height: size,
          }
        ]}
        {...animationProps}
      >
        <Text style={[styles.emoji, { fontSize: size }]}>{emoji}</Text>
      </MotiView>
    )),
  [emojis, emoji, size]);
  
  return (
    <View style={containerStyle} pointerEvents="none">
      {emojiElements}
    </View>
  );
});

// React DevTools için görüntü adı ekle
EmojiBackground.displayName = 'EmojiBackground';

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
    overflow: 'hidden',
  },
  emojiContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    opacity: 0.3,
  },
});

export default EmojiBackground; 