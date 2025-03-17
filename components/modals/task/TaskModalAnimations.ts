import { useRef, useState, useEffect } from 'react';
import { Animated, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { TaskModalAnimationsProps } from './types';

// Ekran boyutlarını al
const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

// Modal boyutları - daha kompakt ve içeriği rahat gösterecek şekilde
const MODAL_WIDTH = Math.min(screenWidth * 0.9, 440); // Ekranın %90'ı veya max 440px
const MODAL_HEIGHT = Math.min(screenHeight * 0.8, 650); // Ekranın %80'i veya max 650px

export function useTaskModalAnimations(
  visible: boolean, 
  onClose: () => void, 
  settings: any
) {
  // Animasyon değerleri
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  
  // Modal kapatma fonksiyonu
  const closeModal = () => {
    if (settings.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true
      })
    ]).start(() => {
      onClose();
    });
  };
  
  // Modal açıldığında animasyonu başlat
  useEffect(() => {
    if (visible) {
      // Başlangıç değerlerini ayarla
      scaleAnim.setValue(0.8);
      
      // Animasyonları başlat
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 50,
          useNativeDriver: true
        })
      ]).start();
    }
  }, [visible]);
  
  return {
    fadeAnim,
    scaleAnim,
    closeModal,
    MODAL_WIDTH,
    MODAL_HEIGHT
  };
} 