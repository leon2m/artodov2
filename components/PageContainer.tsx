import React, { ReactNode, useState, useEffect, memo, useCallback, useMemo } from 'react';
import { StyleSheet, View, ScrollView, Animated, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '@/contexts/SettingsContext';
import { StatusBar } from 'expo-status-bar';
import EmojiBackground from '@/components/EmojiBackground';
import { MotiView } from 'moti';
import { usePathname, useFocusEffect } from 'expo-router';

interface PageContainerProps {
  children: ReactNode;
  showEmojiBg?: boolean;
  scrollable?: boolean;
  paddingHorizontal?: number;
  headerComponent?: ReactNode;
  footerComponent?: ReactNode;
  onScroll?: (event: any) => void;
}

const PageContainer = memo(({
  children,
  showEmojiBg = true,
  scrollable = true,
  paddingHorizontal = 16,
  headerComponent,
  footerComponent,
  onScroll
}: PageContainerProps) => {
  const { theme, settings } = useSettings();
  const pathname = usePathname();
  const [containerKey, setContainerKey] = useState(Date.now().toString());
  const scrollY = useMemo(() => new Animated.Value(0), []);
  
  // Theme ve emoji ayarlarını logla - hata ayıklama için
  // Performans için kaldırıldı - gerektiğinde yorum işaretini kaldırın
  /*
  useEffect(() => {
    console.log('Settings showEmojiBg:', settings.showEmojiBg);
    console.log('Theme emoji:', theme.emoji);
    console.log('Theme emojiBackground:', theme.emojiBackground);
  }, [settings.showEmojiBg, theme.emoji, theme.emojiBackground]);
  */
  
  // Sayfa odağı değiştiğinde animasyonu kontrol et
  // Performans için sadece ilk yükleme ve path değişiminde animasyon yap
  useFocusEffect(
    useCallback(() => {
      // Sadece pathname değiştiğinde key'i güncelle
      const routeKey = pathname || Math.random().toString();
      if (!containerKey.includes(routeKey)) {
        setContainerKey(`${Date.now()}-${routeKey}`);
      }
    }, [pathname, containerKey])
  );
  
  // Sadece bir kez oluştur
  const ContentWrapper = useMemo(() => 
    scrollable ? Animated.ScrollView : View, 
  [scrollable]);
  
  // Gereksiz hesaplamayı önle
  const shouldShowEmojiBg = useMemo(() => 
    showEmojiBg && settings.showEmojiBg && theme.emoji,
  [showEmojiBg, settings.showEmojiBg, theme.emoji]);
  
  // Scroll olayını optimize et
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    // Animated event'i direkt olarak kullanmak yerine bu şekilde yönetiyoruz
    scrollY.setValue(event.nativeEvent.contentOffset.y);
    
    // Eğer dışarıdan gelen bir onScroll handler varsa onu da çağır
    if (onScroll) {
      onScroll(event);
    }
  }, [scrollY, onScroll]);
  
  // Header bileşenine scrollY değerini ilet - gereksiz clone'ları önle
  const headerWithScrollY = useMemo(() => {
    if (!headerComponent) return null;
    return React.cloneElement(headerComponent as React.ReactElement, { scrollY });
  }, [headerComponent, scrollY]);
  
  // Animasyon ayarlarını optimize et
  const animationConfig = useMemo(() => ({
    from: { opacity: 0, scale: 0.98, translateY: 10 },
    animate: { opacity: 1, scale: 1, translateY: 0 },
    transition: { 
      type: "timing" as const,
      duration: 200, // Daha kısa süre
      delay: 50, // Daha az gecikme
    }
  }), []);
  
  // Footer animasyon ayarlarını optimize et
  const footerAnimationConfig = useMemo(() => ({
    from: { opacity: 0, translateY: 10 },
    animate: { opacity: 1, translateY: 0 },
    transition: { 
      type: "timing" as const,
      duration: 150,
      delay: 100
    }
  }), []);

  // EmojiBackground için limitli render - performans iyileştirmesi
  const renderEmojiBackground = useMemo(() => {
    if (!shouldShowEmojiBg) return null;
    
    return (
      <EmojiBackground 
        emoji={theme.emoji || ''}
        opacity={0.15}
        size={32}
        spacing={80} // Azaltılmış emoji sayısı için spacing arttırıldı
        count={15} // Daha az emoji göster
      />
    );
  }, [shouldShowEmojiBg, theme.emoji]);
  
  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
      key={pathname} // sadece path değiştiğinde yenile
    >
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      
      {/* Emoji arkaplanı - sadece lazım olduğunda render et */}
      {renderEmojiBackground}
      
      {headerWithScrollY && (
        <View>
          {headerWithScrollY}
        </View>
      )}
      
      <ContentWrapper 
        style={[
          styles.content, 
          { paddingHorizontal: paddingHorizontal }
        ]}
        contentContainerStyle={scrollable ? styles.scrollContent : undefined}
        showsVerticalScrollIndicator={false}
        onScroll={scrollable ? handleScroll : undefined}
        scrollEventThrottle={32} // 16'dan 32'ye çıkarıldı - daha az event
        removeClippedSubviews={true} // Ekran dışı bileşenleri belleğe al
      >
        <MotiView
          key={`content-${pathname}`} // Sadece pathname ile eşle - gereksiz animasyonları önle
          from={animationConfig.from}
          animate={animationConfig.animate}
          transition={animationConfig.transition}
          style={styles.childrenContainer}
          exitTransition={{
            type: 'timing',
            duration: 0 // Çıkış animasyonu olmasın
          }}
        >
          {children}
        </MotiView>
      </ContentWrapper>
      
      {footerComponent && (
        <MotiView
          key={`footer-${pathname}`} // Sadece pathname ile eşle
          from={footerAnimationConfig.from}
          animate={footerAnimationConfig.animate}
          transition={footerAnimationConfig.transition}
          style={styles.footer}
          exitTransition={{
            type: 'timing',
            duration: 0 // Çıkış animasyonu olmasın
          }}
        >
          {footerComponent}
        </MotiView>
      )}
    </SafeAreaView>
  );
});

PageContainer.displayName = 'PageContainer';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  childrenContainer: {
    flex: 1,
  },
  footer: {
    paddingBottom: 16,
  },
});

export default PageContainer; 