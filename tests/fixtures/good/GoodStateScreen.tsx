import React, { useState } from 'react';
import { View, TouchableOpacity, Pressable, Text } from 'react-native';

// ✅ All elements correctly expose their state via accessibilityState

export function GoodStateScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  return (
    <View>
      {/* ✅ disabled prop + matching accessibilityState */}
      <TouchableOpacity
        accessibilityLabel="Submit payment"
        accessibilityRole="button"
        accessibilityState={{ disabled: isLoading }}
        disabled={isLoading}
        onPress={() => {}}
      >
        <Text>Submit</Text>
      </TouchableOpacity>

      {/* ✅ selected prop + matching accessibilityState */}
      <TouchableOpacity
        accessibilityLabel="Photos tab"
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
        selected={isSelected}
        onPress={() => setIsSelected(!isSelected)}
      />

      {/* ✅ Dynamic accessibilityState variable — not flagged */}
      <Pressable
        accessibilityLabel="Options"
        accessibilityRole="button"
        accessibilityState={{ disabled: false }}
        disabled={false}
        onPress={() => {}}
      />
    </View>
  );
}
