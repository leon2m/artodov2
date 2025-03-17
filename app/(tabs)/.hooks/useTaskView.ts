import { useState, useRef, useCallback, useMemo } from 'react';
import { Animated } from 'react-native';
import { State } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { useSettings } from '@/contexts/SettingsContext';

export type ViewMode = 'grid' | 'list' | 'detail';

const PINCH_THRESHOLD = 0.2; // Pinch hassasiyeti
const ANIMATION_DURATION = 250; // Animasyon süresi

export function useTaskView() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const scale = useRef(new Animated.Value(1)).current;
  const lastScale = useRef(1);
  const contentScale = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const { settings } = useSettings();

  // Görünüm modunu değiştirme animasyonu
  const animateViewModeChange = useCallback((newMode: ViewMode) => {
    // Animasyon konfigürasyonları
    const animConfig = {
      duration: ANIMATION_DURATION / 2,
      useNativeDriver: true
    };
    
    // Önce içeriği küçült ve saydamlaştır
    Animated.parallel([
      Animated.timing(contentScale, {
        toValue: 0.97,
        ...animConfig
      }),
      Animated.timing(contentOpacity, {
        toValue: 0.5,
        ...animConfig
      }),
    ]).start(() => {
      // Görünüm modunu değiştir
      setViewMode(newMode);

      // İçeriği tekrar göster ve boyutunu normalize et
      Animated.parallel([
        Animated.timing(contentScale, {
          toValue: 1,
          ...animConfig
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          ...animConfig
        }),
      ]).start();
    });
  }, [contentScale, contentOpacity]);

  // Görünüm modu değiştirme
  const toggleViewMode = useCallback(() => {
    // Haptic feedback
    if (settings.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        .catch(err => console.log('Haptic error', err));
    }
    
    const nextMode = viewMode === 'grid' ? 'list' : viewMode === 'list' ? 'detail' : 'grid';
    animateViewModeChange(nextMode);
  }, [viewMode, animateViewModeChange, settings.hapticFeedback]);

  // Pinch olayı yönetimi
  const onPinchGestureEvent = useMemo(() => 
    Animated.event(
      [{ nativeEvent: { scale: scale } }],
      { useNativeDriver: true }
    ),
  [scale]);

  // Pinch durum değişikliği
  const onPinchHandlerStateChange = useCallback((event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const currentScale = event.nativeEvent.scale;
      const scaleDiff = currentScale - lastScale.current;

      // Pinch değişimini kontrol et
      if (Math.abs(scaleDiff) > PINCH_THRESHOLD) {
        if (scaleDiff < 0 && viewMode !== 'list') {
          animateViewModeChange('list');
        } else if (scaleDiff > 0 && viewMode !== 'detail') {
          animateViewModeChange('detail');
        }
      }

      lastScale.current = currentScale;

      // Scale'i resetle
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 40,
        friction: 7
      }).start();
    }
  }, [viewMode, animateViewModeChange, scale]);

  return {
    viewMode,
    scale,
    contentScale,
    contentOpacity,
    animateViewModeChange,
    toggleViewMode,
    onPinchGestureEvent,
    onPinchHandlerStateChange
  };
} 