import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useStore } from '../lib/store';
import { ScreenProps } from '../lib/nav';
import Header from '../components/Header';
import { rtlText } from '../lib/theme';

const MAX = 300;

export default function AddQuoteScreen({ route, navigation }: ScreenProps<'AddQuote'>) {
  const quoteId = route.params?.quoteId;
  const isEditing = Boolean(quoteId);
  const { theme, addMyQuote, editMyQuote, findQuote } = useStore();

  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');

  useEffect(() => {
    if (quoteId) {
      const existing = findQuote(quoteId);
      if (existing) {
        setText(existing.text);
        setAuthor(existing.author ?? '');
      }
    }
  }, [quoteId, findQuote]);

  const valid = text.trim().length >= 3;

  const save = () => {
    if (!valid) return;
    if (isEditing && quoteId) {
      editMyQuote(quoteId, text.trim(), author.trim());
    } else {
      addMyQuote(text.trim(), author.trim());
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <Header title={isEditing ? 'تعديل العبارة' : 'عبارة جديدة'} close />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
          <Text style={[styles.label, rtlText, { color: theme.text }]}>العبارة</Text>
          <TextInput
            value={text}
            onChangeText={(t) => setText(t.slice(0, MAX))}
            placeholder="اكتب عبارتك هنا…"
            placeholderTextColor={theme.sub}
            multiline
            autoFocus
            style={[styles.area, rtlText, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
          />
          <Text style={[{ color: theme.sub, fontSize: 12, marginTop: 6 }]}>
            {text.length}/{MAX}
          </Text>

          <Text style={[styles.label, rtlText, { color: theme.text, marginTop: 18 }]}>القائل (اختياري)</Text>
          <TextInput
            value={author}
            onChangeText={setAuthor}
            placeholder="مثلاً: أنا"
            placeholderTextColor={theme.sub}
            returnKeyType="done"
            onSubmitEditing={save}
            style={[styles.input, rtlText, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
          />

          {text.trim().length > 0 && (
            <View style={[styles.preview, { backgroundColor: theme.primary }]}>
              <Text style={styles.previewLabel}>معاينة</Text>
              <Text style={[styles.previewText, rtlText]}>“{text.trim()}”</Text>
              {author.trim() ? <Text style={[styles.previewAuthor, rtlText]}>— {author.trim()}</Text> : null}
            </View>
          )}

          <Pressable onPress={save} disabled={!valid} style={[styles.save, { backgroundColor: theme.primary, opacity: valid ? 1 : 0.45 }]}>
            <Ionicons name="checkmark" size={20} color="#fff" />
            <Text style={styles.saveText}>{isEditing ? 'حفظ التعديلات' : 'حفظ العبارة'}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 15, fontWeight: '800', marginBottom: 8 },
  area: { minHeight: 140, borderWidth: 1, borderRadius: 16, padding: 14, fontSize: 17, textAlignVertical: 'top' },
  input: { height: 50, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, fontSize: 16 },
  preview: { borderRadius: 20, padding: 18, marginTop: 22 },
  previewLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '700', textAlign: 'right', marginBottom: 6 },
  previewText: { color: '#fff', fontSize: 19, lineHeight: 30, fontWeight: '700' },
  previewAuthor: { color: 'rgba(255,255,255,0.85)', marginTop: 6 },
  save: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 8, height: 54, borderRadius: 16, marginTop: 24 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
