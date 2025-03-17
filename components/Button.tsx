import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  ViewStyle, 
  TextStyle,
  Platform,
  View
} from 'react-native';
import { useSettings } from '@/contexts/SettingsContext';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'glass';
  size?: 'small' | 'medium' | 'large' | 'icon';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right' | 'only';
  fullWidth?: boolean;
  animate?: boolean;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  animate = true
}: ButtonProps) {
  const { theme, settings } = useSettings();
  
  const handlePress = () => {
    if (disabled || loading) return;
    
    if (settings.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    onPress();
  };
  
  // Variant stilleri
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.colors.primary,
          borderColor: 'transparent',
          textColor: '#FFFFFF'
        };
      case 'secondary':
        return {
          backgroundColor: theme.colors.card,
          borderColor: 'transparent',
          textColor: theme.colors.text
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: theme.colors.primary,
          textColor: theme.colors.primary
        };
      case 'danger':
        return {
          backgroundColor: theme.colors.error,
          borderColor: 'transparent',
          textColor: '#FFFFFF'
        };
      case 'glass':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          borderColor: 'rgba(255, 255, 255, 0.5)',
          textColor: theme.colors.text
        };
      default:
        return {
          backgroundColor: theme.colors.primary,
          borderColor: theme.colors.primary,
          textColor: '#FFFFFF'
        };
    }
  };
  
  // Boyut stilleri
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 8,
          paddingHorizontal: 14,
          fontSize: 14,
          borderRadius: 18
        };
      case 'medium':
        return {
          paddingVertical: 12,
          paddingHorizontal: 18,
          fontSize: 16,
          borderRadius: 22
        };
      case 'large':
        return {
          paddingVertical: 16,
          paddingHorizontal: 24,
          fontSize: 18,
          borderRadius: 28
        };
      case 'icon':
        return {
          paddingVertical: 12,
          paddingHorizontal: 12,
          fontSize: 16,
          borderRadius: 24
        };
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 18,
          fontSize: 16,
          borderRadius: 22
        };
    }
  };
  
  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();
  
  const textStyles = [
    styles.text,
    {
      color: variantStyles.textColor,
      fontSize: sizeStyles.fontSize,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
      fontWeight: '600' as const,
      letterSpacing: -0.4
    },
    textStyle
  ];
  
  const buttonStyles = [
    styles.button,
    {
      backgroundColor: variantStyles.backgroundColor,
      borderColor: variantStyles.borderColor,
      borderWidth: variant === 'outline' || variant === 'glass' ? 1 : 0,
      paddingVertical: sizeStyles.paddingVertical,
      paddingHorizontal: iconPosition === 'only' ? sizeStyles.paddingVertical : sizeStyles.paddingHorizontal,
      borderRadius: iconPosition === 'only' ? sizeStyles.paddingVertical * 2 + (icon ? 24 : 0) : sizeStyles.borderRadius,
      opacity: disabled ? 0.6 : 1,
      width: fullWidth ? '100%' as const : undefined,
      shadowColor: variant === 'primary' ? theme.colors.primary : 'rgba(0,0,0,0.1)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: variant === 'primary' ? 0.3 : 0.15,
      shadowRadius: 8,
      elevation: variant === 'primary' ? 4 : 2,
    },
    style
  ];
  
  const ButtonContent = () => (
    <>
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variantStyles.textColor} 
        />
      ) : (
        <>
          {icon && (iconPosition === 'left' || iconPosition === 'only') && (
            <View style={[
              styles.iconContainer, 
              iconPosition === 'only' ? styles.iconOnly : styles.iconLeft,
            ]}>
              {icon}
            </View>
          )}
          {iconPosition !== 'only' && <Text style={textStyles}>{title}</Text>}
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </>
      )}
    </>
  );
  
  if (animate) {
    return (
      <MotiView
        from={{ opacity: 0.8, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 18, stiffness: 120 }}
      >
        <TouchableOpacity
          style={buttonStyles}
          onPress={handlePress}
          activeOpacity={0.75}
          disabled={disabled || loading}
          // iOS haptik geri bildirim için
          onPressIn={() => {
            if (Platform.OS === 'ios' && settings.hapticFeedback) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }}
        >
          <ButtonContent />
        </TouchableOpacity>
      </MotiView>
    );
  }
  
  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={handlePress}
      activeOpacity={0.75}
      disabled={disabled || loading}
      // iOS haptik geri bildirim için
      onPressIn={() => {
        if (Platform.OS === 'ios' && settings.hapticFeedback) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }}
    >
      <ButtonContent />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    overflow: 'hidden',
  },
  text: {
    textAlign: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconLeft: {
    marginRight: 10,
  },
  iconRight: {
    marginLeft: 10,
  },
  iconOnly: {
    margin: 0,
  }
}); 