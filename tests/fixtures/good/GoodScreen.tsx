import React from 'react';
import { View, Text, TouchableOpacity, Pressable } from 'react-native';

// ✅ All interactive elements have proper accessibility props

export function GoodScreen() {
  return (
    <View>
      {/* ✅ Has accessibilityLabel, accessibilityRole, and accessibilityHint */}
      <TouchableOpacity
        accessibilityLabel="Search"
        accessibilityRole="button"
        accessibilityHint="Opens search screen"
        style={{ width: 48, height: 48 }}
        onPress={() => {}}
      >
        <Text>Search</Text>
      </TouchableOpacity>

      {/* ✅ Has Text child — valid label substitute */}
      <TouchableOpacity
        accessibilityRole="button"
        onPress={() => {}}
      >
        <Text>Sign In</Text>
      </TouchableOpacity>

      {/* ✅ Pressable with full props */}
      <Pressable
        accessibilityLabel="Delete item"
        accessibilityRole="button"
        accessibilityHint="Permanently removes this item"
        style={{ width: 48, height: 48 }}
        onPress={() => {}}
      />

      {/* ✅ Adequate touch target */}
      <TouchableOpacity
        accessibilityLabel="Open menu"
        accessibilityRole="button"
        style={{ width: 44, height: 44 }}
        onPress={() => {}}
      />
    </View>
  );
}
