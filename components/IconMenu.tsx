import React from 'react';
import { View, Text, StyleSheet, Pressable, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { useSettings } from '@/contexts/SettingsContext';
import { MotiView } from 'moti';

interface IconMenuItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  onPress: () => void;
  color?: string;
}

interface IconMenuProps {
  items: IconMenuItem[];
  columns?: number;
  containerStyle?: StyleProp<ViewStyle>;
  iconStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const IconMenu: React.FC<IconMenuProps> = ({
  items,
  columns = 3,
  containerStyle,
  iconStyle,
  textStyle
}) => {
  const { theme, settings } = useSettings();
  const isDarkMode = settings.isDarkMode;

  // Karanlık mod için tema uyumlu renkler
  const bgColors = {
    itemBg: isDarkMode 
      ? theme.colors.card + 'D9'  // D9 = %85 opaklık
      : 'rgba(255, 255, 255, 0.8)',
      
    itemBorder: isDarkMode 
      ? theme.colors.border + 'BF'  // BF = %75 opaklık
      : 'rgba(255, 255, 255, 0.9)',
  };

  const renderItem = (item: IconMenuItem, index: number) => {
    const itemColor = item.color || theme.colors.primary;
    
    return (
      <MotiView
        key={item.id}
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ 
          type: 'timing', 
          duration: 350,
          delay: index * 50 
        }}
        style={[styles.itemContainer, { 
          width: `${100 / columns}%`,
        }]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.iconContainer,
            {
              backgroundColor: bgColors.itemBg,
              borderColor: bgColors.itemBorder,
              transform: [{ scale: pressed ? 0.95 : 1 }]
            },
            pressed && {
              borderColor: itemColor + '50'
            },
            iconStyle
          ]}
          onPress={item.onPress}
        >
          <View style={[styles.iconInner, { backgroundColor: itemColor + '15' }]}>
            {item.icon}
          </View>
        </Pressable>
        <Text 
          style={[
            styles.title, 
            { color: theme.colors.text },
            textStyle
          ]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
      </MotiView>
    );
  };

  const itemsChunks = [];
  const itemsPerRow = columns;

  // İtemleriu eşit boyutlu satırlara böl
  for (let i = 0; i < items.length; i += itemsPerRow) {
    itemsChunks.push(items.slice(i, i + itemsPerRow));
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.grid}>
        {items.map((item, index) => renderItem(item, index))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  itemContainer: {
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 6
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 1,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  iconInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginHorizontal: 4,
  }
});

export default IconMenu; 