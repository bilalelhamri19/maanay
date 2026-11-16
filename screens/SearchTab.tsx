import React, { useMemo, useState } from 'react';
import { FlatList, Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ALL_QUOTES, CATEGORIES, normalizeArabic } from '../lib/data';
import { useStore } from '../lib/store';
import { RootStack } from '../lib/nav';
import QuoteCard from '../components/QuoteCard';
import EmptyState from '../components/EmptyState';
import { rtlText } from '../lib/theme';

const SUGGESTIONS = ['الحب', 'أمي', 'الصبر', 'صديق', 'الحياة', 'الله', 'النجاح', 'صباح'];

export default function SearchTab() {
  const nav = useNavigation<NativeStackNavigationProp<RootStack>>();
  const { theme, myQuotes } = useStore();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<string | null>(null);

  const indexed = useMemo(
    () => [...myQuotes, ...ALL_QUOTES].map((x) => ({ x, n: normalizeArabic(x.text + ' ' + (x.author ?? '')) })),
    [myQuotes]
  );

  const results = useMemo(() => {
    const nq = normalizeArabic(q.trim());
    return indexed.filter(({ x, n }) => (!cat || x.categoryId === cat) && (!nq || n.includes(nq))).map(({ x }) => x);
  }, [q, cat, indexed]);

  const active = q.trim().length > 0 || cat;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
        <Text style={[styles.title, rtlText, { color: theme.text }]}>البحث</Text>
        <View style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="search" size={18} color={theme.sub} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="اكتب كلمة…"
            placeholderTextColor={theme.sub}
            returnKeyType="search"
            onSubmitEditing={() => Keyboard.dismiss()}
            autoFocus
            style={[styles.field, rtlText, { color: theme.text }]}
          />
          {q.length > 0 && (
            <Pressable onPress={() => setQ('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={theme.sub} />
            </Pressable>
          )}
        </View>
      </View>
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={{ transform: [{ scaleX: -1 }] }}>
          {[{ id: null as string | null, title: 'الكل', color: theme.primary }, ...CATEGORIES].map((c) => {
            const on = cat === c.id;
            return (
              <Pressable
                key={c.id ?? 'all'}
                onPress={() => setCat(c.id)}
                style={[
                  styles.chip,
                  { transform: [{ scaleX: -1 }], backgroundColor: on ? c.color : theme.card, borderColor: on ? c.color : theme.border },
                ]}
              >
                <Text style={{ color: on ? '#fff' : theme.text, fontWeight: '700', fontSize: 13 }}>{c.title}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
      <FlatList
        data={active ? results : []}
        keyExtractor={(x) => x.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, paddingTop: 4 }}
        ListHeaderComponent={
          active ? (
            <Text style={[rtlText, { color: theme.sub, marginBottom: 10 }]}>{results.length} نتيجة</Text>
          ) : (
            <View>
              <Text style={[rtlText, styles.sugTitle, { color: theme.text }]}>اقتراحات</Text>
              <View style={styles.sugWrap}>
                {SUGGESTIONS.map((s) => (
                  <Pressable key={s} onPress={() => setQ(s)} style={[styles.sug, { backgroundColor: theme.soft }]}>
                    <Ionicons name="trending-up" size={14} color={theme.primary} />
                    <Text style={{ color: theme.text, fontWeight: '600' }}>{s}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )
        }
        ListEmptyComponent={
          active ? <EmptyState icon="search-outline" title="لا توجد نتائج" sub="جرب كلمة أخرى أو غيّر التصنيف" /> : null
        }
        renderItem={({ item, index }) => (
          <QuoteCard
            quote={item}
            showCategory
            onOpen={() => nav.navigate('Reader', { ids: results.map((r) => r.id), index, title: 'نتائج البحث' })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '900', marginBottom: 12 },
  input: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, borderRadius: 16, borderWidth: 1, paddingHorizontal: 14, height: 50 },
  field: { flex: 1, fontSize: 16, height: '100%', outlineStyle: 'none' } as any,
  chips: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  sugTitle: { fontSize: 16, fontWeight: '800', marginBottom: 10 },
  sugWrap: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  sug: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 14 },
});
