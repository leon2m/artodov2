import React, { useState, useRef, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, Switch, Platform, Modal, TextInput, FlatList, Animated, TouchableOpacity, Image, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import ColorPicker from 'react-native-wheel-color-picker';
import { Moon, Bell, Layout, Database, ChevronRight, Eye, Palette, Smile, Zap, Heart, Cloud, Leaf, Sun } from 'lucide-react-native';
import { customThemePresets } from '@/theme/theme';
import { useSettings } from '@/contexts/SettingsContext';
import { MotiView } from 'moti';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import PageContainer from '@/components/PageContainer';
import PageHeader from '@/components/PageHeader';
import { Ionicons } from '@expo/vector-icons';
import { usePathname } from 'expo-router';

// Emoji seçenekleri
const EMOJI_LIST = ['📝', '🎯', '✅', '🚀', '⭐', '🌟', '🔥', '💫', '🎨', '💡', '🎉', '🎈', '🎁', '💪', '👍', '👏', '😊', '😃', '😄', '😎', '🤩', '🌈', '☀️', '🌙', '⛅', '🌊', '🌲', '🌴', '🌵', '🌸', '🌺', '🌻', '🍀', '🌿', '🍁', '🍂', '🌱'];

// Emoji tema renkleri
const EMOJI_COLORS: Record<string, string> = {
  '📝': '#3B82F6', // Mavi
  '🎯': '#F43F5E', // Kırmızı
  '✅': '#10B981', // Yeşil
  '🚀': '#8B5CF6', // Mor
  '⭐': '#F59E0B', // Turuncu
  '🌟': '#FBBF24', // Sarı
  '🔥': '#EF4444', // Kırmızı
  '💫': '#6366F1', // İndigo
  '🎨': '#EC4899', // Pembe
  '💡': '#F97316', // Turuncu
  '🎉': '#D946EF', // Fuşya
  '🎈': '#F87171', // Kırmızımsı
  '🎁': '#A855F7', // Morumsu
  '💪': '#84CC16', // Lime
  '👍': '#14B8A6', // Teal
  '👏': '#F59E0B', // Amber
  '😊': '#FBBF24', // Sarı
  '😃': '#FBBF24', // Sarı
  '😄': '#FBBF24', // Sarı
  '😎': '#3B82F6', // Mavi
  '🤩': '#D946EF', // Fuşya
  '🌈': '#6366F1', // İndigo
  '☀️': '#F59E0B', // Amber
  '🌙': '#8B5CF6', // Mor
  '⛅': '#60A5FA', // Mavi
  '🌊': '#0EA5E9', // Açık mavi
  '🌲': '#22C55E', // Yeşil
  '🌴': '#15803D', // Koyu yeşil
  '🌵': '#84CC16', // Açık yeşil
  '🌸': '#EC4899', // Pembe
  '🌺': '#F472B6', // Açık pembe
  '🌻': '#FBBF24', // Sarı
  '🍀': '#22C55E', // Yeşil
  '🌿': '#15803D', // Koyu yeşil
  '🍁': '#F97316', // Turuncu
  '🍂': '#B45309', // Kahverengi
  '🌱': '#22C55E', // Yeşil
};

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  onPress?: () => void;
  rightComponent?: React.ReactNode;
  isLast?: boolean;
  disabled?: boolean;
}

const SettingItem = ({ 
  icon, 
  title, 
  description, 
  onPress, 
  rightComponent, 
  isLast = false,
  disabled = false
}: SettingItemProps) => {
  const { theme } = useSettings();
  
  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingItem,
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border },
        pressed && onPress && !disabled ? { backgroundColor: 'rgba(0,0,0,0.05)' } : {},
        disabled ? { opacity: 0.6 } : {}
      ]}
      onPress={disabled ? undefined : onPress}
      disabled={disabled || !onPress}
    >
      <View style={[styles.settingItemIcon, { backgroundColor: theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
        {icon}
      </View>
      <View style={styles.settingItemContent}>
        <Text style={[styles.settingItemTitle, { color: theme.colors.text }]}>
          {title}
        </Text>
        {description && (
          <Text style={[styles.settingItemDescription, { color: theme.colors.secondaryText }]}>
            {description}
          </Text>
        )}
      </View>
      <View style={styles.settingItemRight}>
        {rightComponent || (onPress && <ChevronRight size={20} color={theme.colors.secondaryText} />)}
      </View>
    </Pressable>
  );
};

export default function SettingsScreen() {
  const { 
    theme, 
    toggleTheme, 
    notificationsEnabled, 
    setNotificationsEnabled,
    hapticFeedbackEnabled,
    setHapticFeedbackEnabled,
    language,
    setLanguage,
    privacyMode,
    setPrivacyMode,
    settings,
    setAccentColor,
    setThemeEmoji,
    toggleSystemTheme,
    updateSettings,
    toggleShowEmojiBg
  } = useSettings();
  
  const insets = useSafeAreaInsets();
  
  const [showAppInfo, setShowAppInfo] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorPickerColor, setColorPickerColor] = useState(theme.colors.primary);
  const [selectedEmoji, setSelectedEmoji] = useState<string | undefined>(settings.themeEmoji);
  const [isEmojiThemeEnabled, setIsEmojiThemeEnabled] = useState(settings.themeEmoji !== undefined && settings.themeEmoji !== '');
  
  const [uniqueKey, setUniqueKey] = useState(Date.now());
  const pathname = usePathname();
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Path değişimini izle ve her sayfa değişiminde benzersiz key oluştur
  useEffect(() => {
    setUniqueKey(Date.now());
  }, [pathname]);
  
  // Emoji değişikliğini izlemek için useEffect
  useEffect(() => {
    setSelectedEmoji(settings.themeEmoji);
    setIsEmojiThemeEnabled(settings.themeEmoji !== undefined && settings.themeEmoji !== '');
  }, [settings.themeEmoji]);
  
  const getThemePresetIcon = () => {
    const emoji = settings.themeEmoji;
    if (emoji) {
      return <Text style={{ fontSize: 22 }}>{emoji}</Text>;
    }
    
    switch (settings.themePreset) {
      case 'light':
        return <Sun size={22} color="#F59E0B" />;
      case 'dark':
        return <Moon size={22} color="#8B5CF6" />;
      case 'ocean':
        return <Cloud size={22} color="#0EA5E9" />;
      case 'forest':
        return <Leaf size={22} color="#22C55E" />;
      case 'sunset':
        return <Sun size={22} color="#F97316" />;
      case 'hearts':
        return <Heart size={22} color="#EC4899" />;
      default:
        return <Palette size={22} color="#6366F1" />;
    }
  };
  
  const handleEmojiPreview = (emoji: string) => {
    try {
      if (settings.hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      // Sadece yerel state'i güncelle - henüz ayarları değiştirmez
      setSelectedEmoji(emoji);
    } catch (error) {
      console.error("Emoji önizlemede hata:", error);
    }
  };
  
  const handleEmojiConfirm = async () => {
    try {
      if (settings.hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      if (selectedEmoji) {
        // Emoji teması aktifse ve bir emoji seçildiyse ayarları güncelle
        await updateSettings({ themeEmoji: selectedEmoji });
      }
      
      // Modalı kapat
      setShowEmojiPicker(false);
    } catch (error) {
      console.error("Emoji onayında hata:", error);
    }
  };
  
  const toggleEmojiTheme = async () => {
    try {
      const newState = !isEmojiThemeEnabled;
      setIsEmojiThemeEnabled(newState);
      
      if (newState) {
        // Eğer tema etkinleştiriliyorsa ve önceden seçilmiş bir emoji varsa onu kullan, yoksa varsayılan emoji
        const emojiToUse = selectedEmoji || '📝';
        await updateSettings({ themeEmoji: emojiToUse });
      } else {
        // Eğer tema devre dışı bırakılıyorsa, emoji temayı temizle
        await updateSettings({ themeEmoji: '' });
      }
    } catch (error) {
      console.error("Emoji teması toggle hata:", error);
    }
  };
  
  const handleColorChangeComplete = (color: string) => {
    setColorPickerColor(color);
  };
  
  const handleSaveColor = () => {
    if (hapticFeedbackEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setAccentColor(colorPickerColor);
    setShowColorPicker(false);
  };

  const renderEmojiButton = (emoji: string, index: number) => {
    const isSelected = emoji === selectedEmoji;
    return (
      <MotiView
        key={index}
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 15, type: 'spring' }}
        style={styles.emojiButtonContainer}
      >
        <Pressable
          style={({ pressed }) => [
            styles.emojiButton,
            {
              backgroundColor: isSelected
                ? `${theme.colors.primary}20`
                : theme.dark
                ? '#ffffff10'
                : '#00000010',
              borderColor: isSelected ? theme.colors.primary : 'transparent',
              borderWidth: isSelected ? 2 : 0,
              opacity: pressed ? 0.7 : 1,
              transform: [{ scale: pressed ? 0.9 : 1 }]
            }
          ]}
          onPress={() => handleEmojiPreview(emoji)}
          android_ripple={{ color: 'rgba(0,0,0,0.1)', radius: 30 }}
        >
          <Text style={styles.emoji}>{emoji}</Text>
          {isSelected && (
            <MotiView
              from={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={[
                styles.selectedIndicator,
                { backgroundColor: theme.colors.primary }
              ]}
            />
          )}
        </Pressable>
      </MotiView>
    );
  };
  
  // Scroll olayını fonksiyon olarak tanımlayalım - hata çözümü için
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    // Animated.event fonksiyonunu burada çağırıyoruz
    const animatedEvent = Animated.event(
      [{ nativeEvent: { contentOffset: { y: scrollY } } }],
      { useNativeDriver: false }
    );
    // Fonksiyon olarak çalıştırıyoruz
    animatedEvent(event);
  }, [scrollY]);

  return (
    <PageContainer key={uniqueKey}>
      <PageHeader 
        title="Ayarlar" 
        animate={true}
        scrollY={scrollY}
      />
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <SettingsSection title="Görünüm ve Tema">
          <SettingItem
            icon={theme.dark ? <Moon size={22} color="#A78BFA" /> : <Sun size={22} color="#FCD34D" />}
            title="Karanlık Mod"
            description={theme.dark ? "Karanlık tema etkin" : "Aydınlık tema etkin"}
            rightComponent={
              <Switch
                value={theme.dark}
                onValueChange={toggleTheme}
                trackColor={{ false: theme.colors.switchTrackFalse, true: theme.colors.switchTrackTrue }}
                thumbColor={theme.dark ? theme.colors.switchThumbTrue : theme.colors.switchThumbFalse}
                ios_backgroundColor={theme.colors.switchTrackFalse}
              />
            }
          />
          
          <SettingItem
            icon={<Palette size={24} color={theme.colors.text} />}
            title="Tema Rengi" 
            description="Uygulamanın ana rengini seçin"
            onPress={() => setShowColorPicker(true)}
            rightComponent={
              <View style={[styles.colorCircle, { backgroundColor: theme.colors.primary }]} />
            }
          />
          
          <SettingItem
            icon={<Smile size={24} color={theme.colors.text} />}
            title="Emoji Teması" 
            description="Temada emoji kullanılmasını aktifleştirir"
            rightComponent={
              <Switch
                value={isEmojiThemeEnabled}
                onValueChange={toggleEmojiTheme}
                trackColor={{ 
                  false: theme.colors.switchTrackFalse, 
                  true: theme.colors.switchTrackTrue 
                }}
                thumbColor={
                  isEmojiThemeEnabled 
                    ? theme.colors.switchThumbTrue 
                    : theme.colors.switchThumbFalse
                }
              />
            }
          />
          
          <SettingItem
            icon={<Palette size={24} color={theme.colors.text} />}
            title="Emoji Seç"
            description="Arkaplanda görünecek emoji"
            onPress={() => setShowEmojiPicker(true)}
            rightComponent={
              <Text style={{ color: theme.colors.secondaryText, fontSize: 22 }}>
                {settings.themeEmoji || '-'}
              </Text>
            }
            disabled={!isEmojiThemeEnabled}
          />
          
          <SettingItem 
            icon={<Eye size={24} color={theme.colors.text} />}
            title="Emoji Arkaplanı" 
            description="Sayfalarda seçilen emojileri arkaplanda görüntülemek için bu ayarı aktif edin ve bir tema emojisi seçin"
            rightComponent={
              <Switch
                value={settings.showEmojiBg}
                onValueChange={toggleShowEmojiBg}
                trackColor={{ 
                  false: theme.colors.switchTrackFalse, 
                  true: theme.colors.switchTrackTrue 
                }}
                thumbColor={
                  settings.showEmojiBg 
                    ? theme.colors.switchThumbTrue 
                    : theme.colors.switchThumbFalse
                }
              />
            }
          />
        </SettingsSection>
        
        <SettingsSection title="Bildirimler">
          <SettingItem
            icon={<Bell size={22} color="#F43F5E" />}
            title="Bildirimler"
            description={notificationsEnabled ? "Bildirimler açık" : "Bildirimler kapalı"}
            rightComponent={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: "#E5E7EB", true: "#8B5CF6" }}
                thumbColor={Platform.OS === 'ios' ? "#FFFFFF" : notificationsEnabled ? "#D1D5DB" : "#F3F4F6"}
                ios_backgroundColor="#E5E7EB"
              />
            }
          />
          <SettingItem
            icon={<Zap size={22} color="#8B5CF6" />}
            title="Titreşim"
            description={hapticFeedbackEnabled ? "Dokunmatik geri bildirim açık" : "Dokunmatik geri bildirim kapalı"}
            rightComponent={
              <Switch
                value={hapticFeedbackEnabled}
                onValueChange={setHapticFeedbackEnabled}
                trackColor={{ false: "#E5E7EB", true: "#8B5CF6" }}
                thumbColor={Platform.OS === 'ios' ? "#FFFFFF" : hapticFeedbackEnabled ? "#D1D5DB" : "#F3F4F6"}
                ios_backgroundColor="#E5E7EB"
              />
            }
            isLast
          />
        </SettingsSection>
        

        
        <SettingsSection title="Destek">
          <SettingItem
            icon={<Database size={22} color="#6366F1" />}
            title="Uygulama Hakkında"
            description="Sürüm 1.0.0"
            onPress={() => setShowAppInfo(!showAppInfo)}
            isLast
          />
        </SettingsSection>
        
        {showAppInfo && (
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring' }}
            style={[styles.appInfoCard, { backgroundColor: theme.colors.card }]}
          >
            <Text style={[styles.appInfoTitle, { color: theme.colors.text }]}>
              AR To Do
            </Text>
            <Text style={[styles.appInfoVersion, { color: theme.colors.secondaryText }]}>
              Sürüm 1.0.0 (Build 22)
            </Text>
            <Text style={[styles.appInfoDescription, { color: theme.colors.secondaryText }]}>
              Bu uygulama Ramazan Çakıcı tarafından geliştirilmiştir.
            </Text>
            <Text style={[styles.appInfoCopyright, { color: theme.colors.secondaryText }]}>
              © 2025 Tüm hakları saklıdır.
            </Text>
          </MotiView>
        )}
        
        <View style={{ height: insets.bottom + 20 }} />
      </ScrollView>
      
      {/* Emoji Picker Modal */}
      <Modal
        visible={showEmojiPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEmojiPicker(false)}
      >
        <SafeAreaView edges={['bottom']} style={styles.modalOverlay}>
          <MotiView
            from={{ translateY: 200, opacity: 1 }}
            animate={{ translateY: 0, opacity: 1 }}
            exit={{ translateY: 200, opacity: 1 }}
            transition={{ 
              type: 'timing', 
              duration: 250,
              delay: 0,
            }}
            style={[styles.modalContainer, { backgroundColor: theme.colors.card }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Emoji Seç</Text>
              <Pressable 
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && { opacity: 0.7 }
                ]}
                onPress={() => setShowEmojiPicker(false)}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              >
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </Pressable>
            </View>
            
            <Text style={[styles.modalSubtitle, { color: theme.colors.secondaryText }]}>
              Temada kullanılacak emojiyi seçin
            </Text>
            
            <FlatList
              data={EMOJI_LIST}
              renderItem={({ item, index }) => renderEmojiButton(item, index)}
              keyExtractor={(item, index) => `emoji-${index}`}
              numColumns={4}
              contentContainerStyle={styles.emojiGrid}
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 220 }}
              initialNumToRender={20}
            />
            
            {/* Seçilen Emoji Önizleme Bölümü */}
            {selectedEmoji && (
              <View style={styles.previewContainer}>
                <Text style={[styles.previewTitle, { color: theme.colors.secondaryText }]}>
                  Seçilen Emoji
                </Text>
                <View style={[
                  styles.previewEmoji, 
                  { 
                    backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    borderColor: theme.colors.primary,
                    borderWidth: 2
                  }
                ]}>
                  <Text style={styles.previewEmojiText}>{selectedEmoji}</Text>
                </View>
                
                <TouchableOpacity 
                  style={[styles.applyButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => {
                    handleEmojiConfirm();
                  }}
                >
                  <Text style={styles.applyButtonText}>Uygula</Text>
                </TouchableOpacity>
              </View>
            )}
          </MotiView>
        </SafeAreaView>
      </Modal>
      
      {/* Color Picker Modal */}
      <Modal
        visible={showColorPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowColorPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <MotiView
            from={{ translateY: 200, opacity: 0 }}
            animate={{ translateY: 0, opacity: 1 }}
            transition={{ type: 'timing', duration: 300 }}
            style={[styles.modalContainer, { backgroundColor: theme.colors.card }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Tema Rengi Seç</Text>
              <Pressable onPress={() => setShowColorPicker(false)} style={styles.closeButton}>
                <Text style={{ color: theme.colors.secondaryText }}>İptal</Text>
              </Pressable>
            </View>
            
            <View style={styles.colorPickerContainer}>
              <ColorPicker
                color={colorPickerColor}
                onColorChangeComplete={handleColorChangeComplete}
                thumbSize={30}
                sliderSize={30}
                noSnap={true}
                row={false}
              />
            </View>
            
            <View style={styles.colorPreview}>
              <View style={[styles.colorSwatch, { backgroundColor: colorPickerColor }]} />
              <Text style={[styles.colorValue, { color: theme.colors.text }]}>{colorPickerColor.toUpperCase()}</Text>
            </View>
            
            <Pressable 
              style={[styles.saveButton, { backgroundColor: colorPickerColor }]}
              onPress={handleSaveColor}
            >
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </Pressable>
          </MotiView>
        </View>
      </Modal>
    </PageContainer>
  );
}

const SettingsSection = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const { theme } = useSettings();
  const [uniqueKey] = useState(Date.now());
  
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20, scale: 0.97 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ 
        type: 'spring', 
        damping: 15, 
        stiffness: 120, 
        delay: 150 
      }}
      style={styles.settingsSection}
      key={`section-${uniqueKey}`} // Her ziyarette yeniden animasyon için
    >
      <Text style={[styles.sectionTitle, { color: theme.colors.secondaryText }]}>
        {title}
      </Text>
      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ 
          type: 'spring', 
          damping: 15, 
          delay: 250 
        }}
        style={[styles.sectionContent, { backgroundColor: theme.colors.card }]}
      >
        {children}
      </MotiView>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  settingsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  sectionContent: {
    borderRadius: 16,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    marginRight: 12,
  },
  settingItemContent: {
    flex: 1,
  },
  settingItemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingItemDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  settingItemRight: {
    marginLeft: 8,
  },
  appInfoCard: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  appInfoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  appInfoVersion: {
    fontSize: 16,
    marginBottom: 16,
  },
  appInfoDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  appInfoCopyright: {
    fontSize: 12,
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  closeButton: {
    padding: 8,
  },
  emojiGrid: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  emojiButtonContainer: {
    padding: 5,
    margin: 4,
  },
  emojiButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 28,
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emojiIcon: {
    fontSize: 22,
  },
  previewContainer: {
    marginTop: 10,
    alignItems: 'center',
    paddingTop: 10, 
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  previewTitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  previewEmoji: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewEmojiText: {
    fontSize: 40,
  },
  applyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  applyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  colorPickerContainer: {
    height: 220,
    marginVertical: 20,
  },
  colorPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 16,
  },
  colorValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  colorCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
    marginRight: 10,
  },
}); 