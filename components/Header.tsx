import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../lib/store';

type Props = {
  title: string;
  back?: boolean;
  close?: boolean;
  right?: React.ReactNode;
  color?: string;
  tint?: string;
};

export default function Header({ title, back, close, right, color, tint }: Props) {
  const nav = useNavigation();
  const { theme } = useStore();
  const fg = tint ?? theme.text;
  return (
    <View style={[styles.wrap, { backgroundColor: color ?? 'transparent' }]}>
      <View style={styles.side}>
        {(back || close) && (
          <Pressable onPress={() => nav.goBack()} hitSlop={10} style={styles.btn}>
            <Ionicons name={close ? 'close' : 'chevron-forward'} size={26} color={fg} />
          </Pressable>
        )}
      </View>
      <Text numberOfLines={1} style={[styles.title, { color: fg }]}>
        {title}
      </Text>
      <View style={[styles.side, { alignItems: 'flex-start' }]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 56,
  },
  side: { width: 60, alignItems: 'flex-end' },
  btn: { padding: 6 },
  title: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '800' },
});
