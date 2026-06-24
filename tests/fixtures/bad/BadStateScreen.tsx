import React, { useState } from 'react';
import { View, TouchableOpacity, Pressable } from 'react-native';

// ❌ Elements that use disabled/selected but don't expose via accessibilityState

export function BadStateScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  return (
    <View>
      {/* ❌ disabled prop present but no accessibilityState */}
      <TouchableOpacity
        accessibilityLabel="Submit payment"
        accessibilityRole="button"
        disabled={isLoading}
        onPress={() => {}}
      />

      {/* ❌ selected prop present but no accessibilityState */}
      <TouchableOpacity
        accessibilityLabel="Photos tab"
        accessibilityRole="button"
        selected={isSelected}
        onPress={() => {}}
      />

      {/* ❌ Pressable with disabled but missing accessibilityState */}
      <Pressable
        accessibilityLabel="Checkout"
        accessibilityRole="button"
        disabled={true}
        onPress={() => {}}
      />
    </View>
  );
}
