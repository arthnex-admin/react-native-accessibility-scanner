import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

// Edge cases — dynamic values, template literals, etc.

// ✅ Dynamic label — should NOT be flagged (we treat expressions as non-empty)
const dynamicLabel = "Dynamic Button";
export function DynamicLabelButton() {
  return (
    <TouchableOpacity
      accessibilityLabel={dynamicLabel}
      accessibilityRole="button"
      onPress={() => {}}
    />
  );
}

// ✅ Template literal label — should NOT be flagged
export function TemplateLiteralButton({ name }: { name: string }) {
  return (
    <TouchableOpacity
      accessibilityLabel={`Open ${name}`}
      accessibilityRole="button"
      onPress={() => {}}
    />
  );
}

// ✅ Empty string label — technically present, treated as populated by static analysis
export function EmptyLabelButton() {
  return (
    <TouchableOpacity
      accessibilityLabel=""
      accessibilityRole="button"
      onPress={() => {}}
    />
  );
}

// ✅ Touch target at exactly the threshold — should NOT be flagged
export function ExactSizeButton() {
  return (
    <TouchableOpacity
      accessibilityLabel="Exact size"
      accessibilityRole="button"
      style={{ width: 44, height: 44 }}
      onPress={() => {}}
    />
  );
}

// ❌ Touch target one below threshold — SHOULD be flagged
export function JustBelowButton() {
  return (
    <TouchableOpacity
      accessibilityLabel="One below"
      accessibilityRole="button"
      style={{ width: 43, height: 43 }}
      onPress={() => {}}
    />
  );
}

// ✅ Text child without explicit label — valid
export function TextChildButton() {
  return (
    <TouchableOpacity accessibilityRole="button" onPress={() => {}}>
      <Text>Tap me</Text>
    </TouchableOpacity>
  );
}
