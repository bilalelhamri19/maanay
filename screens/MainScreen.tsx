import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useStore } from '../lib/store';
import HomeTab from './HomeTab';
import SearchTab from './SearchTab';
import FavoritesTab from './FavoritesTab';
import MyQuotesTab from './MyQuotesTab';

const TABS = [
  { key: 'home', label: 'الرئيسية', icon: 'home' },
  { key: 'search', label: 'بحث', icon: 'search' },
  { key: 'fav', label: 'المفضلة', icon: 'heart' },
  { key: 'mine', label: 'عباراتي', icon: 'create' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export default function MainScreen() {
  const { theme, favorites } = useStore();
  const [tab, setTab] = useState<TabKey>('home');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <View style={{ flex: 1 }}>
        {tab === 'home' && <HomeTab goSearch={() => setTab('search')} />}
        {tab === 'search' && <SearchTab />}
        {tab === 'fav' && <FavoritesTab goHome={() => setTab('home')} />}
        {tab === 'mine' && <MyQuotesTab />}
      </View>
      <SafeAreaView edges={['bottom']} style={[styles.bar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <View style={styles.row}>
          {TABS.map((t) => {
            const active = t.key === tab;
            return (
              <Pressable key={t.key} onPress={() => setTab(t.key)} style={styles.tab}>
                <View style={[styles.pill, active && { backgroundColor: theme.soft }]}>
                  <Ionicons
                    name={(active ? t.icon : `${t.icon}-outline`) as any}
                    size={22}
                    color={active ? theme.primary : theme.sub}
                  />
                  {t.key === 'fav' && favorites.length > 0 && (
                    <View style={styles.dot}>
                      <Text style={styles.dotText}>{favorites.length > 99 ? '99+' : favorites.length}</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.label, { color: active ? theme.primary : theme.sub, fontWeight: active ? '800' : '500' }]}>
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bar: { borderTopWidth: StyleSheet.hairlineWidth },
  row: { flexDirection: 'row-reverse', paddingTop: 8, paddingBottom: 6 },
  tab: { flex: 1, alignItems: 'center' },
  pill: { paddingHorizontal: 18, paddingVertical: 4, borderRadius: 16 },
  label: { fontSize: 11, marginTop: 3 },
  dot: {
    position: 'absolute',
    top: -2,
    right: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E2557A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  dotText: { color: '#fff', fontSize: 10, fontWeight: '800' },
});
