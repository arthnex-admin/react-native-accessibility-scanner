import React from 'react';
import { View, TouchableOpacity, Pressable, TouchableHighlight } from 'react-native';

// ❌ This file intentionally has multiple accessibility issues for testing.

export function BadScreen() {
  return (
    <View>
      {/* ❌ Missing accessibilityLabel AND accessibilityRole */}
      <TouchableOpacity onPress={() => {}} />

      {/* ❌ Missing accessibilityRole only */}
      <TouchableOpacity
        accessibilityLabel="Profile"
        onPress={() => {}}
      />

      {/* ❌ Touch target too small (width AND height below 44) */}
      <TouchableOpacity
        accessibilityLabel="Close"
        accessibilityRole="button"
        style={{ width: 20, height: 20 }}
        onPress={() => {}}
      />

      {/* ❌ Duplicate label — same as next */}
      <TouchableOpacity
        accessibilityLabel="Button"
        accessibilityRole="button"
        onPress={() => {}}
      />

      {/* ❌ Duplicate label */}
      <TouchableOpacity
        accessibilityLabel="Button"
        accessibilityRole="button"
        onPress={() => {}}
      />

      {/* ❌ Critical action without accessibilityHint */}
      <TouchableOpacity
        accessibilityLabel="Delete account"
        accessibilityRole="button"
        onPress={() => {}}
      />

      {/* ❌ Pressable with no label and no text child */}
      <Pressable onPress={() => {}} />

      {/* ❌ TouchableHighlight missing everything */}
      <TouchableHighlight onPress={() => {}} />
    </View>
  );
}
