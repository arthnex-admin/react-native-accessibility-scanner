import React, { useState } from 'react';
import { View, TouchableOpacity, Pressable } from 'react-native';

export function BadStateScreen() {
  const [isLoading] = useState(false);
  const [isSelected] = useState(false);

  return (
    <View>
      {/* ❌ disabled but no accessibilityState */}
      <TouchableOpacity
        accessibilityLabel="Submit payment"
        accessibilityRole="button"
        disabled={isLoading}
        onPress={() => {}}
      />

      {/* ❌ selected but no accessibilityState */}
      <TouchableOpacity
        accessibilityLabel="Photos tab"
        accessibilityRole="button"
        selected={isSelected}
        onPress={() => {}}
      />

      {/* ❌ Pressable with disabled, missing accessibilityState */}
      <Pressable
        accessibilityLabel="Checkout"
        accessibilityRole="button"
        disabled={true}
        onPress={() => {}}
      />
    </View>
  );
}