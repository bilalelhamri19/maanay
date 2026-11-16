import React, { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Clipboard from 'expo-clipboard';
import { useStore } from '../lib/store';
import { ALL_QUOTES, CATEGORIES } from '../lib/data';
import Header from '../components/Header';
import { rtlText } from '../lib/theme';

const MODES = [
  { key: 'system', label: 'تلقائي', icon: 'phone-portrait-outline' },
  { key: 'light', label: 'فاتح', icon: 'sunny-outline' },
  { key: 'dark', label: 'داكن', icon: 'moon-outline' },
] as const;

export default function SettingsScreen() {
  const {
    theme,
    themeMode,
    setThemeMode,
    fontScale,
    setFontScale,
    favorites,
    myQuotes,
    notificationsEnabled,
    toggleNotifications,
    exportData,
    importData,
    toast,
  } = useStore();

  const [importJson, setImportJson] = useState('');
  const [showImportBox, setShowImportBox] = useState(false);

  const handlePasteAndImport = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (!text || !text.trim().startsWith('{')) {
        toast('الحافظة لا تحتوي على بيانات صالحة');
        return;
      }
      await importData(text);
      setShowImportBox(false);
      setImportJson('');
    } catch {
      toast('تعذر القراءة من الحافظة');
    }
  };

  const handleManualImport = async () => {
    if (!importJson.trim()) {
      toast('يرجى لصق نص النسخة الاحتياطية');
      return;
    }
    const res = await importData(importJson);
    if (res.success) {
      setShowImportBox(false);
      setImportJson('');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <Header title="الإعدادات" close />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        {/* Stats */}
        <View style={styles.stats}>
          {[
            { n: ALL_QUOTES.length, l: 'عبارة', i: 'chatbubbles' },
            { n: CATEGORIES.length, l: 'تصنيف', i: 'grid' },
            { n: favorites.length, l: 'مفضلة', i: 'heart' },
            { n: myQuotes.length, l: 'من كتابتي', i: 'create' },
          ].map((s) => (
            <View key={s.l} style={[styles.stat, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Ionicons name={s.i as any} size={18} color={theme.primary} />
              <Text style={[styles.statN, { color: theme.text }]}>{s.n}</Text>
              <Text style={{ color: theme.sub, fontSize: 11 }}>{s.l}</Text>
            </View>
          ))}
        </View>

        {/* Theme */}
        <Text style={[styles.section, rtlText, { color: theme.text }]}>المظهر</Text>
        <View style={[styles.box, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.segment}>
            {MODES.map((m) => {
              const on = themeMode === m.key;
              return (
                <Pressable
                  key={m.key}
                  onPress={() => setThemeMode(m.key)}
                  style={[styles.seg, { backgroundColor: on ? theme.primary : theme.soft }]}
                >
                  <Ionicons name={m.icon as any} size={20} color={on ? '#fff' : theme.text} />
                  <Text style={{ color: on ? '#fff' : theme.text, fontWeight: '700', marginTop: 4 }}>{m.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Font Scale */}
        <Text style={[styles.section, rtlText, { color: theme.text }]}>حجم الخط</Text>
        <View style={[styles.box, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.fontRow}>
            <Pressable
              onPress={() => setFontScale(Math.min(1.5, +(fontScale + 0.1).toFixed(1)))}
              style={[styles.fontBtn, { backgroundColor: theme.soft }]}
            >
              <Ionicons name="add" size={22} color={theme.text} />
            </Pressable>
            <Text style={{ color: theme.text, fontWeight: '800', fontSize: 18 }}>{Math.round(fontScale * 100)}%</Text>
            <Pressable
              onPress={() => setFontScale(Math.max(0.8, +(fontScale - 0.1).toFixed(1)))}
              style={[styles.fontBtn, { backgroundColor: theme.soft }]}
            >
              <Ionicons name="remove" size={22} color={theme.text} />
            </Pressable>
          </View>
          <Text style={[rtlText, { color: theme.text, fontSize: 18 * fontScale, lineHeight: 30 * fontScale, marginTop: 14 }]}>
            من جد وجد، ومن زرع حصد.
          </Text>
        </View>

        {/* Daily Notifications */}
        <Text style={[styles.section, rtlText, { color: theme.text }]}>التنبيهات</Text>
        <View style={[styles.box, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1, paddingLeft: 12 }}>
              <Text style={[styles.itemTitle, rtlText, { color: theme.text }]}>إشعار عبارة اليوم ⏰</Text>
              <Text style={[styles.itemSub, rtlText, { color: theme.sub }]}>تلقي عبارة ملهمة يومياً في تمام 9:00 صباحاً</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={() => {
                toggleNotifications();
              }}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Backup & Restore */}
        <Text style={[styles.section, rtlText, { color: theme.text }]}>النسخ الاحتياطي والاستعادة</Text>
        <View style={[styles.box, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Pressable onPress={exportData} style={[styles.actionRow, { borderBottomColor: theme.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
            <View style={[styles.iconCircle, { backgroundColor: theme.soft }]}>
              <Ionicons name="cloud-upload-outline" size={20} color={theme.primary} />
            </View>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={[styles.itemTitle, rtlText, { color: theme.text }]}>تصدير نسخة احتياطية</Text>
              <Text style={[styles.itemSub, rtlText, { color: theme.sub }]}>حفظ المفضلة وعباراتك الخاصة في الحافظة</Text>
            </View>
            <Ionicons name="copy-outline" size={18} color={theme.sub} />
          </Pressable>

          <Pressable onPress={() => setShowImportBox(!showImportBox)} style={styles.actionRow}>
            <View style={[styles.iconCircle, { backgroundColor: theme.soft }]}>
              <Ionicons name="cloud-download-outline" size={20} color={theme.primary} />
            </View>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={[styles.itemTitle, rtlText, { color: theme.text }]}>استيراد البيانات</Text>
              <Text style={[styles.itemSub, rtlText, { color: theme.sub }]}>استعادة العبارات والمفضلات من نسخة سابقة</Text>
            </View>
            <Ionicons name={showImportBox ? 'chevron-up' : 'chevron-down'} size={18} color={theme.sub} />
          </Pressable>

          {showImportBox && (
            <View style={{ marginTop: 14, paddingTop: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border }}>
              <Pressable onPress={handlePasteAndImport} style={[styles.btnFull, { backgroundColor: theme.soft, marginBottom: 10 }]}>
                <Ionicons name="clipboard-outline" size={18} color={theme.text} />
                <Text style={{ color: theme.text, fontWeight: '700', fontSize: 14 }}>لصق واستيراد تلقائي من الحافظة</Text>
              </Pressable>

              <TextInput
                value={importJson}
                onChangeText={setImportJson}
                placeholder="أو الصق كود JSON هنا مباشرة…"
                placeholderTextColor={theme.sub}
                multiline
                numberOfLines={3}
                style={[styles.importInput, { backgroundColor: theme.soft, borderColor: theme.border, color: theme.text }]}
              />

              <Pressable onPress={handleManualImport} style={[styles.btnFull, { backgroundColor: theme.primary, marginTop: 10 }]}>
                <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>تأكيد الاستيراد</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* About */}
        <Text style={[styles.section, rtlText, { color: theme.text }]}>حول التطبيق</Text>
        <View style={[styles.box, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[rtlText, { color: theme.text, fontSize: 15, lineHeight: 24 }]}>
            تطبيق «معناي» يجمع لك آلاف العبارات والحكم والأمثال المغربية مرتبة حسب التصنيف. احفظ ما يعجبك، شارك كصور وبطاقات، وأضف عباراتك الخاصة — كل شيء يعمل بدون إنترنت وبخصوصية تامة.
          </Text>
          <Text style={[rtlText, { color: theme.sub, marginTop: 10, fontSize: 12 }]}>الإصدار 2.0.0 (المطور)</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row-reverse', gap: 8, marginBottom: 8 },
  stat: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 16, borderWidth: 1, gap: 2 },
  statN: { fontSize: 20, fontWeight: '900' },
  section: { fontSize: 16, fontWeight: '900', marginTop: 20, marginBottom: 10 },
  box: { borderRadius: 18, borderWidth: 1, padding: 16 },
  segment: { flexDirection: 'row-reverse', gap: 8 },
  seg: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 14 },
  fontRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  fontBtn: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  rowBetween: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  itemTitle: { fontSize: 15, fontWeight: '800' },
  itemSub: { fontSize: 12, marginTop: 2 },
  actionRow: { flexDirection: 'row-reverse', alignItems: 'center', paddingVertical: 12 },
  iconCircle: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  btnFull: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 8, height: 44, borderRadius: 12 },
  importInput: { minHeight: 70, borderWidth: 1, borderRadius: 12, padding: 10, fontSize: 12, textAlign: 'left' },
});
