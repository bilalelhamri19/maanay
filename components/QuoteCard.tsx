import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Quote, getCategory } from '../lib/data';
import { useStore } from '../lib/store';
import { rtlText } from '../lib/theme';

type Props = {
  quote: Quote;
  onOpen?: () => void;
  showCategory?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function QuoteCard({ quote, onOpen, showCategory, onEdit, onDelete }: Props) {
  const { theme, isFav, toggleFav, copy, share, shareImage, fontScale } = useStore();
  const fav = isFav(quote.id);
  const cat = getCategory(quote.categoryId);
  const scale = useRef(new Animated.Value(1)).current;

  const pulse = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.35, useNativeDriver: false, speed: 50 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: false, speed: 30 }),
    ]).start();
    toggleFav(quote.id);
  };

  return (
    <Pressable
      onPress={onOpen}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.9 : 1 },
      ]}
    >
      <View style={[styles.stripe, { backgroundColor: cat.color }]} />
      {showCategory && (
        <View style={[styles.badge, { backgroundColor: cat.color + '22' }]}>
          <Ionicons name={cat.icon as any} size={12} color={cat.color} />
          <Text style={[styles.badgeText, { color: cat.color }]}>{cat.title}</Text>
        </View>
      )}
      <Ionicons name="chatbox-ellipses-outline" size={18} color={cat.color} style={{ alignSelf: 'flex-end', marginBottom: 6, opacity: 0.6 }} />
      <Text style={[styles.text, rtlText, { color: theme.text, fontSize: 18 * fontScale, lineHeight: 30 * fontScale }]}>
        {quote.text}
      </Text>
      {quote.author ? <Text style={[styles.author, rtlText, { color: theme.sub }]}>— {quote.author}</Text> : null}
      <View style={[styles.actions, { borderTopColor: theme.border }]}>
        <Pressable onPress={pulse} hitSlop={8} style={styles.action}>
          <Animated.View style={{ transform: [{ scale }] }}>
            <Ionicons name={fav ? 'heart' : 'heart-outline'} size={22} color={fav ? '#E2557A' : theme.sub} />
          </Animated.View>
        </Pressable>
        <Pressable onPress={() => copy(quote)} hitSlop={8} style={styles.action}>
          <Ionicons name="copy-outline" size={21} color={theme.sub} />
        </Pressable>
        <Pressable onPress={() => share(quote)} hitSlop={8} style={styles.action}>
          <Ionicons name="share-social-outline" size={21} color={theme.sub} />
        </Pressable>
        <Pressable onPress={() => shareImage(quote, cat.color)} hitSlop={8} style={styles.action}>
          <Ionicons name="image-outline" size={21} color={theme.sub} />
        </Pressable>
        {onEdit && (
          <Pressable onPress={onEdit} hitSlop={8} style={styles.action}>
            <Ionicons name="create-outline" size={21} color={theme.primary} />
          </Pressable>
        )}
        {onDelete && (
          <Pressable onPress={onDelete} hitSlop={8} style={styles.action}>
            <Ionicons name="trash-outline" size={21} color="#D9534F" />
          </Pressable>
        )}
        <View style={{ flex: 1 }} />
        {onOpen && (
          <Pressable onPress={onOpen} hitSlop={8} style={styles.action}>
            <Ionicons name="expand-outline" size={20} color={theme.sub} />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 18,
    paddingTop: 16,
    marginBottom: 14,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  stripe: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 4 },
  badge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  badgeText: { fontSize: 12, fontWeight: '700' },
  text: { fontWeight: '500' },
  author: { marginTop: 8, fontSize: 14, fontStyle: 'italic' },
  actions: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 16,
  },
  action: { padding: 2 },
});
