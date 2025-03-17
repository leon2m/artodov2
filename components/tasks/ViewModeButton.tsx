import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Grid2x2, List, LayoutList } from 'lucide-react-native';
import { useSettings } from '@/contexts/SettingsContext';
import { ViewMode } from '@/lib/hooks/useTaskView';
import { MotiPressable } from 'moti/interactions';

interface ViewModeButtonProps {
  viewMode: ViewMode;
  onPress: () => void;
}

export function ViewModeButton({ viewMode, onPress }: ViewModeButtonProps) {
  const { theme } = useSettings();

  // Görünüm modu ikonu
  const viewModeIcon = useMemo(() => {
    switch (viewMode) {
      case 'grid':
        return <Grid2x2 size={22} color={theme.colors.text} />;
      case 'list':
        return <List size={22} color={theme.colors.text} />;
      case 'detail':
        return <LayoutList size={22} color={theme.colors.text} />;
    }
  }, [viewMode, theme.colors.text]);

  return (
    <MotiPressable
      onPress={onPress}
      style={styles.viewModeButton}
      animate={({ pressed }: { pressed: boolean }) => ({
        opacity: pressed ? 0.7 : 1,
        scale: pressed ? 0.95 : 1
      })}
      transition={{ type: "timing", duration: 150 }}
    >
      {viewModeIcon}
    </MotiPressable>
  );
}

const styles = StyleSheet.create({
  viewModeButton: {
    padding: 8,
    borderRadius: 8,
  },
}); 