import React from 'react';
import { Alert, FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore } from '../lib/store';
import { RootStack } from '../lib/nav';
import QuoteCard from '../components/QuoteCard';
import EmptyState from '../components/EmptyState';
import { rtlText } from '../lib/theme';

export default function MyQuotesTab() {
  const nav = useNavigation<NativeStackNavigationProp<RootStack>>();
  const { theme, myQuotes, removeMyQuote } = useStore();

  const del = (id: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm('حذف هذه العبارة؟')) removeMyQuote(id);
      return;
    }
    Alert.alert('حذف', 'حذف هذه العبارة؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: () => removeMyQuote(id) },
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={myQuotes}
        keyExtractor={(x) => x.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100, flexGrow: 1 }}
        ListHeaderComponent={
          <View style={{ marginBottom: 16, marginTop: 4 }}>
            <Text style={[styles.title, rtlText, { color: theme.text }]}>عباراتي</Text>
            <Text style={[rtlText, { color: theme.sub }]}>اكتب عباراتك الخاصة واحتفظ بها</Text>
          </View>
        }
        ListEmptyComponent={<EmptyState icon="create-outline" title="ابدأ الكتابة" sub="ما زالت لا توجد عبارات، اضغط على + لإضافة أول عبارة" />}
        renderItem={({ item, index }) => (
          <QuoteCard
            quote={item}
            onEdit={() => nav.navigate('AddQuote', { quoteId: item.id })}
            onDelete={() => del(item.id)}
            onOpen={() => nav.navigate('Reader', { ids: myQuotes.map((x) => x.id), index, title: 'عباراتي' })}
          />
        )}
      />
      <Pressable onPress={() => nav.navigate('AddQuote')} style={[styles.fab, { backgroundColor: theme.primary }]}>
        <Ionicons name="add" size={30} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '900' },
  fab: {
    position: 'absolute',
    left: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
});
