import React from 'react';
import { FlatList, SectionList, ScrollView, Text, View } from 'react-native';

// ❌ All list components missing accessibility props

export function BadListScreen() {
  const items = [{ id: '1', name: 'Item 1' }];
  const sections = [{ title: 'Section 1', data: items }];

  return (
    <View>
      {/* ❌ FlatList with no accessibility at all */}
      <FlatList
        data={items}
        renderItem={({ item }) => <Text>{item.name}</Text>}
        keyExtractor={(item) => item.id}
      />

      {/* ❌ SectionList missing both props */}
      <SectionList
        sections={sections}
        renderItem={({ item }) => <Text>{item.name}</Text>}
        renderSectionHeader={({ section }) => <Text>{section.title}</Text>}
        keyExtractor={(item) => item.id}
      />

      {/* ❌ ScrollView missing accessibility */}
      <ScrollView>
        <Text>Content here</Text>
      </ScrollView>
    </View>
  );
}
