import React, { useState } from 'react';
import { Alert, FlatList, Platform, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Quote } from '../lib/data';
import { useStore } from '../lib/store';
import { RootStack } from '../lib/nav';
import QuoteCard from '../components/QuoteCard';
import EmptyState from '../components/EmptyState';
import { rtlText } from '../lib/theme';

export default function FavoritesTab({ goHome }: { goHome: () => void }) {
  const nav = useNavigation<NativeStackNavigationProp<RootStack>>();
  const { theme, favorites, findQuote, clearFavorites } = useStore();
  const [refreshing, setRefreshing] = useState(false);
  const list = favorites.map(findQuote).filter(Boolean) as Quote[];

  const confirmClear = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('هل تريد مسح كل المفضلة؟')) clearFavorites();
      return;
    }
    Alert.alert('مسح المفضلة', 'هل تريد مسح كل المفضلة؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'مسح', style: 'destructive', onPress: clearFavorites },
    ]);
  };

  return (
    <FlatList
      data={list}
      keyExtractor={(x) => x.id}
      contentContainerStyle={{ padding: 16, flexGrow: 1 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 400); }} tintColor={theme.primary} />
      }
      ListHeaderComponent={
        <View style={styles.head}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, rtlText, { color: theme.text }]}>المفضلة</Text>
            <Text style={[rtlText, { color: theme.sub }]}>{list.length} عبارة محفوظة</Text>
          </View>
          {list.length > 0 && (
            <Pressable onPress={confirmClear} style={[styles.clear, { borderColor: theme.border }]}>
              <Ionicons name="trash-outline" size={16} color="#D9534F" />
              <Text style={{ color: '#D9534F', fontWeight: '700', fontSize: 13 }}>مسح الكل</Text>
            </Pressable>
          )}
        </View>
      }
      ListEmptyComponent={
        <EmptyState icon="heart-outline" title="لا توجد مفضلات بعد" sub="اضغط على القلب في أي عبارة لتحفظها هنا">
          <Pressable onPress={goHome} style={[styles.cta, { backgroundColor: theme.primary }]}>
            <Text style={{ color: '#fff', fontWeight: '800' }}>تصفح العبارات</Text>
          </Pressable>
        </EmptyState>
      }
      renderItem={({ item, index }) => (
        <QuoteCard
          quote={item}
          showCategory
          onOpen={() => nav.navigate('Reader', { ids: list.map((x) => x.id), index, title: 'المفضلة' })}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 16, marginTop: 4 },
  title: { fontSize: 28, fontWeight: '900' },
  clear: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8 },
  cta: { marginTop: 20, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
});
