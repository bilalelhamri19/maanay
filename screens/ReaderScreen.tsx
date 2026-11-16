import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, useWindowDimensions, ViewToken } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { CARD_BACKGROUNDS, Quote, getCategory } from '../lib/data';
import { useStore } from '../lib/store';
import { ScreenProps } from '../lib/nav';
import { rtlText } from '../lib/theme';

export default function ReaderScreen({ route, navigation }: ScreenProps<'Reader'>) {
  const { ids, index: start, title } = route.params;
  const { width } = useWindowDimensions();
  const { findQuote, isFav, toggleFav, copy, share, shareImage, fontScale, setFontScale } = useStore();
  const quotes = useMemo(() => ids.map(findQuote).filter(Boolean) as Quote[], [ids, findQuote]);
  const [index, setIndex] = useState(Math.min(start, Math.max(0, quotes.length - 1)));
  const [bgShift, setBgShift] = useState(0);
  const listRef = useRef<FlatList<Quote>>(null);

  const colorFor = (i: number) => {
    const q = quotes[i];
    if (!q) return CARD_BACKGROUNDS[0];
    if (bgShift === 0) return getCategory(q.categoryId).color;
    return CARD_BACKGROUNDS[(i + bgShift) % CARD_BACKGROUNDS.length];
  };

  const onViewable = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]?.index != null) setIndex(viewableItems[0].index);
  }).current;

  const go = useCallback(
    (d: number) => {
      const n = index + d;
      if (n < 0 || n >= quotes.length) return;
      listRef.current?.scrollToIndex({ index: n, animated: true });
      setIndex(n);
    },
    [index, quotes.length]
  );

  const current = quotes[index];
  const bg = colorFor(index);

  if (!current) {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: '#1F2A44', alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: '#fff', fontSize: 18, marginBottom: 16 }}>العبارة غير موجودة</Text>
        <Pressable onPress={() => navigation.goBack()} style={styles.pillBtn}>
          <Text style={{ color: '#fff', fontWeight: '800' }}>رجوع</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: bg }]}>
      <SafeAreaView style={styles.flex}>
        <View style={styles.top}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.circle}>
            <Ionicons name="close" size={24} color="#fff" />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={styles.topTitle} numberOfLines={1}>{title ?? getCategory(current.categoryId).title}</Text>
            <Text style={styles.counter}>
              {index + 1} / {quotes.length}
            </Text>
          </View>
          <Pressable onPress={() => setBgShift((s) => (s + 1) % CARD_BACKGROUNDS.length)} hitSlop={10} style={styles.circle}>
            <Ionicons name="color-palette-outline" size={22} color="#fff" />
          </Pressable>
        </View>

        <FlatList
          ref={listRef}
          data={quotes}
          horizontal
          inverted
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(q) => q.id}
          initialScrollIndex={index}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          onViewableItemsChanged={onViewable}
          viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
          style={styles.flex}
          renderItem={({ item }) => (
            <View style={[styles.page, { width }]}>
              <Text style={styles.quoteMark}>”</Text>
              <Text style={[styles.quote, rtlText, { textAlign: 'center', fontSize: 26 * fontScale, lineHeight: 44 * fontScale }]}>
                {item.text}
              </Text>
              {item.author ? <Text style={styles.author}>— {item.author}</Text> : null}
              <Text style={styles.brand}>معناي</Text>
            </View>
          )}
        />

        <View style={styles.nav}>
          <Pressable onPress={() => go(-1)} disabled={index === 0} style={[styles.circle, index === 0 && styles.disabled]}>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </Pressable>
          <View style={styles.fontCtl}>
            <Pressable onPress={() => setFontScale(Math.min(1.5, +(fontScale + 0.1).toFixed(1)))} hitSlop={6}>
              <Text style={styles.fontBtn}>أ+</Text>
            </Pressable>
            <View style={styles.sep} />
            <Pressable onPress={() => setFontScale(Math.max(0.8, +(fontScale - 0.1).toFixed(1)))} hitSlop={6}>
              <Text style={styles.fontBtn}>أ-</Text>
            </Pressable>
          </View>
          <Pressable onPress={() => go(1)} disabled={index === quotes.length - 1} style={[styles.circle, index === quotes.length - 1 && styles.disabled]}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </Pressable>
        </View>

        <View style={styles.actions}>
          <ActionBtn icon={isFav(current.id) ? 'heart' : 'heart-outline'} label="مفضلة" onPress={() => toggleFav(current.id)} />
          <ActionBtn icon="copy-outline" label="نسخ" onPress={() => copy(current)} />
          <ActionBtn icon="share-social-outline" label="مشاركة" onPress={() => share(current)} />
          <ActionBtn icon="image-outline" label="صورة" onPress={() => shareImage(current, bg)} />
          <ActionBtn
            icon="shuffle"
            label="عشوائي"
            onPress={() => {
              if (quotes.length < 2) return;
              let n = index;
              while (n === index) n = Math.floor(Math.random() * quotes.length);
              listRef.current?.scrollToIndex({ index: n, animated: false });
              setIndex(n);
            }}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

function ActionBtn({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.action, { opacity: pressed ? 0.6 : 1 }]}>
      <View style={styles.actionIcon}>
        <Ionicons name={icon as any} size={22} color="#fff" />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  top: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8 },
  topTitle: { color: '#fff', fontWeight: '800', fontSize: 16 },
  counter: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
  circle: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.35 },
  page: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  quoteMark: { color: 'rgba(255,255,255,0.25)', fontSize: 110, lineHeight: 110, fontWeight: '900', marginBottom: -20 },
  quote: { color: '#fff', fontWeight: '700' },
  author: { color: 'rgba(255,255,255,0.85)', fontSize: 16, marginTop: 18, fontStyle: 'italic' },
  brand: { position: 'absolute', bottom: 20, color: 'rgba(255,255,255,0.35)', fontWeight: '900', letterSpacing: 1 },
  nav: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, marginBottom: 14 },
  fontCtl: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 22, paddingHorizontal: 18, height: 44, gap: 14 },
  fontBtn: { color: '#fff', fontWeight: '900', fontSize: 16 },
  sep: { width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.4)' },
  actions: { flexDirection: 'row-reverse', justifyContent: 'space-around', paddingHorizontal: 12, paddingBottom: 16, paddingTop: 6 },
  action: { alignItems: 'center', gap: 6 },
  actionIcon: { width: 54, height: 54, borderRadius: 27, backgroundColor: 'rgba(0,0,0,0.18)', alignItems: 'center', justifyContent: 'center' },
  actionLabel: { color: '#fff', fontSize: 12, fontWeight: '700' },
  pillBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
});
