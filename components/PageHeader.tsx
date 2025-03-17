import React, { useCallback, useMemo, memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Animated, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { MotiView } from 'moti';
import { MotiPressable } from 'moti/interactions';
import { useSettings } from '@/contexts/SettingsContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  scrollY?: Animated.Value;
  animate?: boolean;
  subtitle?: string;
  profileImage?: string;
  showProfileImage?: boolean;
}

const PageHeader = memo(({ 
  title, 
  showBackButton = false, 
  rightComponent, 
  scrollY,
  animate = false,
  subtitle,
  profileImage,
  showProfileImage = false
}: PageHeaderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { theme } = useSettings();
  
  // Back düğmesine basma işlemini optimize et
  const handleBackPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);
  
  // Scroll bazlı animasyon değerlerini useMemo ile hesapla
  const animationValues = useMemo(() => {
    if (!scrollY) return { opacity: 1, scale: 1 };
    
    const opacity = scrollY.interpolate({
      inputRange: [0, 50, 100],
      outputRange: [1, 0.95, 0.9],
      extrapolate: 'clamp'
    });
    
    const scale = scrollY.interpolate({
      inputRange: [0, 50, 100],
      outputRange: [1, 0.98, 0.96],
      extrapolate: 'clamp'
    });
    
    return { opacity, scale };
  }, [scrollY]);
  
  // Stiller için hesaplanan değerler
  const containerStyle = useMemo(() => [
    styles.container,
    { 
      backgroundColor: theme.colors.background,
      paddingTop: insets.top > 0 ? 12 : 16
    }
  ], [theme.colors.background, insets.top]);
  
  // Başlık için Transform stil hesaplama
  const titleStyle = useMemo(() => {
    if (!scrollY) return [styles.title, { color: theme.colors.text }];
    
    return [
      styles.title, 
      { 
        color: theme.colors.text,
        opacity: animationValues.opacity,
        transform: [{ scale: animationValues.scale }]
      }
    ];
  }, [scrollY, theme.colors.text, animationValues]);
  
  const renderProfileImage = () => {
    if (showProfileImage) {
      return (
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 200 }}
          style={styles.profileImageContainer}
        >
          {profileImage ? (
            <Image
              source={{ uri: profileImage }}
              style={styles.profileImage}
            />
          ) : (
            <View 
              style={[
                styles.profileImage,
                { backgroundColor: theme.colors.primary },
              ]} 
            />
          )}
        </MotiView>
      );
    }
    return null;
  };
  
  return (
    <Animated.View style={containerStyle}>
      <View style={styles.content}>
        {showBackButton ? (
          <MotiPressable
            onPress={handleBackPress}
            style={styles.backButton}
            animate={({ pressed }) => {
              return {
                opacity: pressed ? 0.7 : 1,
                scale: pressed ? 0.95 : 1
              }
            }}
            transition={{
              type: "timing" as const,
              duration: 100
            }}
          >
            <Ionicons 
              name="chevron-back" 
              size={24} 
              color={theme.colors.text} 
            />
          </MotiPressable>
        ) : renderProfileImage()}
        
        <View style={styles.titleContainer}>
          {subtitle && (
            <Text style={[styles.subtitle, { color: theme.colors.secondaryText }]}>
              {subtitle}
            </Text>
          )}
          <Animated.Text style={titleStyle} numberOfLines={1}>
            {title}
          </Animated.Text>
        </View>
        
        {rightComponent && (
          <View style={styles.rightComponent}>
            {rightComponent}
          </View>
        )}
      </View>
    </Animated.View>
  );
});

PageHeader.displayName = 'PageHeader';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    zIndex: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 8,
    padding: 4,
    borderRadius: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: -0.5,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
        fontWeight: '700',
      },
      android: {
        fontFamily: 'sans-serif-medium',
      },
    }),
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 4,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
        fontWeight: '500',
      },
      android: {
        fontFamily: 'sans-serif-medium',
      },
    }),
  },
  rightComponent: {
    marginLeft: 16,
  },
  profileImageContainer: {
    marginRight: 12,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
  }
});

export default PageHeader; 