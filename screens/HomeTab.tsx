import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ALL_QUOTES, CATEGORIES, Category, MY_CATEGORY, getCategory, quoteOfTheDay, randomQuote } from '../lib/data';
import { useStore } from '../lib/store';
import { RootStack } from '../lib/nav';
import { rtlText } from '../lib/theme';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'صباح الخير ☀️';
  if (h < 18) return 'نهارك سعيد 🌤️';
  return 'مساء الخير 🌙';
}

export default function HomeTab({ goSearch }: { goSearch: () => void }) {
  const nav = useNavigation<NativeStackNavigationProp<RootStack>>();
  const { theme, isFav, toggleFav, copy, share, shareImage, myQuotes } = useStore();
  const { width } = useWindowDimensions();
  const daily = useMemo(() => quoteOfTheDay(), []);
  const [featured, setFeatured] = useState(daily);
  const [refreshing, setRefreshing] = useState(false);
  const cat = getCategory(featured.categoryId);
  const cols = width > 700 ? 3 : 2;

  const data: Category[] = useMemo(() => [...CATEGORIES, { ...MY_CATEGORY }], []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setFeatured(randomQuote());
      setRefreshing(false);
    }, 500);
  };

  const header = (
    <View>
      <View style={styles.top}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.hello, rtlText, { color: theme.sub }]}>{greeting()}</Text>
          <Text style={[styles.brand, rtlText, { color: theme.text }]}>معناي</Text>
        </View>
        <Pressable onPress={() => nav.navigate('Settings')} style={[styles.iconBtn, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="settings-outline" size={20} color={theme.text} />
        </Pressable>
      </View>

      <Pressable onPress={goSearch} style={[styles.search, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Ionicons name="search" size={18} color={theme.sub} />
        <Text style={[{ color: theme.sub, flex: 1, fontSize: 15 }, rtlText]}>ابحث في {ALL_QUOTES.length}+ عبارة…</Text>
      </Pressable>

      <Pressable
        onPress={() => nav.navigate('Reader', { ids: [featured.id], index: 0, title: featured.id === daily.id ? 'عبارة اليوم' : 'عبارة مميزة' })}
        style={[styles.daily, { backgroundColor: cat.color }]}
      >
        <View style={styles.bubble1} />
        <View style={styles.bubble2} />
        <View style={styles.dailyHead}>
          <Ionicons name="sparkles" size={16} color="#fff" />
          <Text style={styles.dailyLabel}>{featured.id === daily.id ? 'عبارة اليوم' : 'عبارة عشوائية'}</Text>
          <View style={{ flex: 1 }} />
          <Text style={styles.dailyCat}>{cat.title}</Text>
        </View>
        <Text style={[styles.dailyText, rtlText]}>“{featured.text}”</Text>
        {featured.author ? <Text style={[styles.dailyAuthor, rtlText]}>— {featured.author}</Text> : null}
        <View style={styles.dailyActions}>
          <Pressable onPress={() => toggleFav(featured.id)} style={styles.roundBtn}>
            <Ionicons name={isFav(featured.id) ? 'heart' : 'heart-outline'} size={20} color="#fff" />
          </Pressable>
          <Pressable onPress={() => copy(featured)} style={styles.roundBtn}>
            <Ionicons name="copy-outline" size={19} color="#fff" />
          </Pressable>
          <Pressable onPress={() => share(featured)} style={styles.roundBtn}>
            <Ionicons name="share-social-outline" size={19} color="#fff" />
          </Pressable>
          <Pressable onPress={() => shareImage(featured, cat.color)} style={styles.roundBtn}>
            <Ionicons name="image-outline" size={19} color="#fff" />
          </Pressable>
          <View style={{ flex: 1 }} />
          <Pressable onPress={() => setFeatured(randomQuote())} style={[styles.roundBtn, styles.shuffle]}>
            <Ionicons name="shuffle" size={18} color="#fff" />
            <Text style={styles.shuffleText}>عبارة أخرى</Text>
          </Pressable>
        </View>
      </Pressable>

      <View style={styles.sectionHead}>
        <Text style={[styles.section, { color: theme.text }]}>التصنيفات</Text>
        <Text style={{ color: theme.sub, fontSize: 13 }}>{CATEGORIES.length + 1} تصنيف</Text>
      </View>
    </View>
  );

  return (
    <FlatList
      key={cols}
      data={data}
      numColumns={cols}
      keyExtractor={(c) => c.id}
      ListHeaderComponent={header}
      contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
      columnWrapperStyle={{ flexDirection: 'row-reverse', gap: 12 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} colors={[theme.primary]} />}
      renderItem={({ item }) => {
        const count = item.id === 'mine' ? myQuotes.length : item.quotes.length;
        return (
          <Pressable
            onPress={() => nav.navigate('Category', { id: item.id })}
            style={({ pressed }) => [
              styles.cat,
              { backgroundColor: theme.card, borderColor: theme.border, transform: [{ scale: pressed ? 0.97 : 1 }] },
            ]}
          >
            <View style={[styles.catIcon, { backgroundColor: item.color + '1F' }]}>
              <Ionicons name={item.icon as any} size={24} color={item.color} />
            </View>
            <Text style={[styles.catTitle, rtlText, { color: theme.text }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={[styles.catSub, rtlText, { color: theme.sub }]} numberOfLines={1}>
              {item.subtitle}
            </Text>
            <View style={[styles.count, { backgroundColor: item.color }]}>
              <Text style={styles.countText}>{count}</Text>
            </View>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 14 },
  hello: { fontSize: 14 },
  brand: { fontSize: 32, fontWeight: '900' },
  iconBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  search: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 16,
  },
  daily: {
    borderRadius: 24,
    padding: 20,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  bubble1: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.10)', top: -60, left: -50 },
  bubble2: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.08)', bottom: -40, right: -30 },
  dailyHead: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, marginBottom: 14 },
  dailyLabel: { color: '#fff', fontWeight: '800', fontSize: 14 },
  dailyCat: { color: 'rgba(255,255,255,0.85)', fontSize: 12, backgroundColor: 'rgba(0,0,0,0.15)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, overflow: 'hidden' },
  dailyText: { color: '#fff', fontSize: 22, lineHeight: 36, fontWeight: '700' },
  dailyAuthor: { color: 'rgba(255,255,255,0.85)', marginTop: 8, fontSize: 14 },
  dailyActions: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginTop: 18 },
  roundBtn: {
    height: 40,
    minWidth: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shuffle: { flexDirection: 'row-reverse', paddingHorizontal: 14, gap: 6 },
  shuffleText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  sectionHead: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  section: { fontSize: 20, fontWeight: '900' },
  cat: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    minHeight: 140,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  catIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end', marginBottom: 14 },
  catTitle: { fontSize: 16, fontWeight: '800' },
  catSub: { fontSize: 12, marginTop: 3 },
  count: { position: 'absolute', top: 14, left: 14, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  countText: { color: '#fff', fontWeight: '800', fontSize: 12 },
});
