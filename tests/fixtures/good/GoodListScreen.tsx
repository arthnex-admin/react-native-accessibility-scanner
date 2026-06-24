import React from 'react';
import { FlatList, SectionList, ScrollView, Text, View } from 'react-native';

// ✅ All list components have proper accessibility props

export function GoodListScreen() {
  const items = [{ id: '1', name: 'Item 1' }];
  const sections = [{ title: 'Section 1', data: items }];

  return (
    <View>
      {/* ✅ FlatList with accessibilityLabel and accessible */}
      <FlatList
        data={items}
        accessible={true}
        accessibilityLabel="Products list"
        renderItem={({ item }) => <Text>{item.name}</Text>}
        keyExtractor={(item) => item.id}
      />

      {/* ✅ SectionList with accessibility */}
      <SectionList
        sections={sections}
        accessible={true}
        accessibilityLabel="Grouped results"
        renderItem={({ item }) => <Text>{item.name}</Text>}
        renderSectionHeader={({ section }) => <Text>{section.title}</Text>}
        keyExtractor={(item) => item.id}
      />

      {/* ✅ ScrollView with accessibility */}
      <ScrollView
        accessible={true}
        accessibilityLabel="Scrollable content area"
      >
        <Text>Content here</Text>
      </ScrollView>
    </View>
  );
}
