import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { getCategory, quotesOf, Quote } from '../lib/data';
import { useStore } from '../lib/store';
import { ScreenProps } from '../lib/nav';
import Header from '../components/Header';
import QuoteCard from '../components/QuoteCard';
import EmptyState from '../components/EmptyState';
import { rtlText } from '../lib/theme';

function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

export default function CategoryScreen({ route, navigation }: ScreenProps<'Category'>) {
  const { id } = route.params;
  const cat = getCategory(id);
  const { theme, myQuotes, removeMyQuote } = useStore();
  const base: Quote[] = useMemo(() => (id === 'mine' ? myQuotes : quotesOf(id)), [id, myQuotes]);
  const [order, setOrder] = useState<'default' | 'shuffle'>('default');
  const [seed, setSeed] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const list = useMemo(() => (order === 'shuffle' ? shuffle(base) : base), [base, order, seed]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setOrder('shuffle');
      setSeed((s) => s + 1);
      setRefreshing(false);
    }, 450);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: cat.color }}>
        <Header
          title={cat.title}
          back
          color={cat.color}
          tint="#fff"
          right={
            <Pressable
              onPress={() => {
                setOrder((o) => (o === 'shuffle' ? 'default' : 'shuffle'));
                setSeed((s) => s + 1);
              }}
              hitSlop={10}
              style={{ padding: 6 }}
            >
              <Ionicons name={order === 'shuffle' ? 'list' : 'shuffle'} size={24} color="#fff" />
            </Pressable>
          }
        />
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name={cat.icon as any} size={30} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.heroSub, rtlText]}>{cat.subtitle}</Text>
            <Text style={[styles.heroCount, rtlText]}>{list.length} عبارة</Text>
          </View>
          {list.length > 0 && (
            <Pressable
              onPress={() => navigation.navigate('Reader', { ids: list.map((q) => q.id), index: 0, title: cat.title })}
              style={styles.readBtn}
            >
              <Ionicons name="play" size={14} color={cat.color} />
              <Text style={{ color: cat.color, fontWeight: '800' }}>وضع القراءة</Text>
            </Pressable>
          )}
        </View>
      </SafeAreaView>
      <FlatList
        data={list}
        keyExtractor={(q) => q.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={cat.color} colors={[cat.color]} />}
        ListEmptyComponent={
          <EmptyState icon="create-outline" title="لا توجد عبارات بعد" sub="أضف عبارتك الأولى الآن">
            {id === 'mine' && (
              <Pressable onPress={() => navigation.navigate('AddQuote')} style={[styles.cta, { backgroundColor: cat.color }]}>
                <Text style={{ color: '#fff', fontWeight: '800' }}>إضافة عبارة</Text>
              </Pressable>
            )}
          </EmptyState>
        }
        renderItem={({ item, index }) => (
          <QuoteCard
            quote={item}
            onEdit={id === 'mine' ? () => navigation.navigate('AddQuote', { quoteId: item.id }) : undefined}
            onDelete={id === 'mine' ? () => removeMyQuote(item.id) : undefined}
            onOpen={() => navigation.navigate('Reader', { ids: list.map((q) => q.id), index, title: cat.title })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row-reverse', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingBottom: 22, paddingTop: 4 },
  heroIcon: { width: 58, height: 58, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  heroSub: { color: 'rgba(255,255,255,0.9)', fontSize: 14 },
  heroCount: { color: '#fff', fontSize: 20, fontWeight: '900', marginTop: 2 },
  readBtn: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 14 },
  cta: { marginTop: 20, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
});
