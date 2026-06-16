import React, { useState } from 'react';
import { View, TouchableOpacity, Pressable, Text } from 'react-native';

export function GoodStateScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  return (
    <View>
      {/* ✅ disabled + matching accessibilityState */}
      <TouchableOpacity
        accessibilityLabel="Submit payment"
        accessibilityRole="button"
        accessibilityState={{ disabled: isLoading }}
        disabled={isLoading}
        onPress={() => {}}
      >
        <Text>Submit</Text>
      </TouchableOpacity>

      {/* ✅ selected + matching accessibilityState */}
      <TouchableOpacity
        accessibilityLabel="Photos tab"
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
        selected={isSelected}
        onPress={() => setIsSelected(!isSelected)}
      />
    </View>
  );
}