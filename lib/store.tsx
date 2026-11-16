import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Platform, Share, StyleSheet, Text, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { QUOTE_MAP, Quote } from './data';
import { dark, light, Theme } from './theme';
import { triggerHaptic } from './haptics';
import { exportQuoteImage } from './cardImage';
import { scheduleDailyQuoteNotification } from './notifications';

type ThemeMode = 'system' | 'light' | 'dark';

export type Store = {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (m: ThemeMode) => void;
  fontScale: number;
  setFontScale: (n: number) => void;
  favorites: string[];
  isFav: (id: string) => boolean;
  toggleFav: (id: string) => void;
  myQuotes: Quote[];
  addMyQuote: (text: string, author?: string) => void;
  editMyQuote: (id: string, text: string, author?: string) => void;
  removeMyQuote: (id: string) => void;
  findQuote: (id: string) => Quote | undefined;
  copy: (q: Quote) => void;
  share: (q: Quote) => void;
  shareImage: (q: Quote, bgColor?: string) => Promise<void>;
  toast: (msg: string) => void;
  clearFavorites: () => void;
  notificationsEnabled: boolean;
  toggleNotifications: () => Promise<boolean>;
  exportData: () => Promise<string>;
  importData: (jsonStr: string) => Promise<{ success: boolean; message: string }>;
};

const Ctx = createContext<Store | null>(null);
const KEY = 'kalimat-store-v1';

function format(q: Quote) {
  return q.author ? `${q.text}\n— ${q.author}` : q.text;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [fontScale, setFontScaleState] = useState(1);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [myQuotes, setMyQuotes] = useState<Quote[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const anim = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) {
          const d = JSON.parse(raw);
          setThemeModeState(d.themeMode ?? 'system');
          setFontScaleState(d.fontScale ?? 1);
          setFavorites(d.favorites ?? []);
          setMyQuotes(d.myQuotes ?? []);
          setNotificationsEnabled(d.notificationsEnabled ?? false);
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(
      KEY,
      JSON.stringify({ themeMode, fontScale, favorites, myQuotes, notificationsEnabled })
    ).catch(() => {});
  }, [loaded, themeMode, fontScale, favorites, myQuotes, notificationsEnabled]);

  const toast = useCallback(
    (msg: string) => {
      setToastMsg(msg);
      if (timer.current) clearTimeout(timer.current);
      Animated.timing(anim, { toValue: 1, duration: 200, useNativeDriver: Platform.OS !== 'web' }).start();
      timer.current = setTimeout(() => {
        Animated.timing(anim, { toValue: 0, duration: 250, useNativeDriver: Platform.OS !== 'web' }).start();
      }, 1600);
    },
    [anim]
  );

  const setThemeMode = useCallback((m: ThemeMode) => {
    triggerHaptic('light');
    setThemeModeState(m);
  }, []);

  const setFontScale = useCallback((n: number) => {
    triggerHaptic('light');
    setFontScaleState(n);
  }, []);

  const findQuote = useCallback(
    (id: string) => QUOTE_MAP.get(id) ?? myQuotes.find((q) => q.id === id),
    [myQuotes]
  );

  const toggleNotifications = useCallback(async () => {
    triggerHaptic('medium');
    const nextState = !notificationsEnabled;
    const ok = await scheduleDailyQuoteNotification(nextState);
    if (nextState && !ok) {
      toast('يرجى تفعيل صلاحية الإشعارات');
      return false;
    }
    setNotificationsEnabled(nextState);
    toast(nextState ? 'تم تفعيل إشعار عبارة اليوم ⏰ (9:00 صباحاً)' : 'تم إيقاف الإشعارات');
    return true;
  }, [notificationsEnabled, toast]);

  const exportData = useCallback(async () => {
    triggerHaptic('success');
    const data = {
      version: 1,
      appName: 'Maanay',
      exportedAt: new Date().toISOString(),
      favorites,
      myQuotes,
      themeMode,
      fontScale,
    };
    const jsonStr = JSON.stringify(data, null, 2);
    try {
      await Clipboard.setStringAsync(jsonStr);
      toast('تم نسخ النسخة الاحتياطية إلى الحافظة 📋');
    } catch {}
    return jsonStr;
  }, [favorites, myQuotes, themeMode, fontScale, toast]);

  const importData = useCallback(
    async (jsonStr: string) => {
      try {
        const parsed = JSON.parse(jsonStr.trim());
        if (!parsed || (typeof parsed !== 'object')) {
          triggerHaptic('warning');
          return { success: false, message: 'ملف غير صالح' };
        }

        let addedFavs = 0;
        let addedQuotes = 0;

        if (Array.isArray(parsed.favorites)) {
          setFavorites((prev) => {
            const set = new Set([...prev, ...parsed.favorites]);
            addedFavs = set.size - prev.length;
            return Array.from(set);
          });
        }

        if (Array.isArray(parsed.myQuotes)) {
          setMyQuotes((prev) => {
            const existingIds = new Set(prev.map((q) => q.id));
            const newQuotes = parsed.myQuotes.filter((q: any) => q && q.id && q.text && !existingIds.has(q.id));
            addedQuotes = newQuotes.length;
            return [...newQuotes, ...prev];
          });
        }

        triggerHaptic('success');
        const msg = `تم استيراد ${addedFavs} مفضلة و ${addedQuotes} عبارة بنجاح ✨`;
        toast(msg);
        return { success: true, message: msg };
      } catch {
        triggerHaptic('warning');
        return { success: false, message: 'صيغة JSON غير صحيحة' };
      }
    },
    [toast]
  );

  const value = useMemo<Store>(() => {
    const isDark = themeMode === 'system' ? scheme === 'dark' : themeMode === 'dark';
    return {
      theme: isDark ? dark : light,
      themeMode,
      setThemeMode,
      fontScale,
      setFontScale,
      favorites,
      isFav: (id) => favorites.includes(id),
      toggleFav: (id) => {
        triggerHaptic('medium');
        const has = favorites.includes(id);
        setFavorites((f) => (has ? f.filter((x) => x !== id) : [id, ...f]));
        toast(has ? 'تمت الإزالة من المفضلة' : 'تمت الإضافة إلى المفضلة ❤️');
      },
      myQuotes,
      addMyQuote: (text, author) => {
        triggerHaptic('success');
        const q: Quote = { id: `mine-${Date.now()}`, text, author: author || undefined, categoryId: 'mine' };
        setMyQuotes((m) => [q, ...m]);
        toast('تم حفظ العبارة ✨');
      },
      editMyQuote: (id, text, author) => {
        triggerHaptic('success');
        setMyQuotes((m) =>
          m.map((q) => (q.id === id ? { ...q, text, author: author || undefined } : q))
        );
        toast('تم تعديل العبارة بنجاح ✏️');
      },
      removeMyQuote: (id) => {
        triggerHaptic('warning');
        setMyQuotes((m) => m.filter((q) => q.id !== id));
        setFavorites((f) => f.filter((x) => x !== id));
        toast('تم حذف العبارة');
      },
      findQuote,
      copy: async (q) => {
        triggerHaptic('light');
        try {
          await Clipboard.setStringAsync(format(q));
          toast('تم نسخ العبارة 📋');
        } catch {
          toast('تعذر النسخ');
        }
      },
      share: async (q) => {
        triggerHaptic('light');
        const message = format(q);
        try {
          if (Platform.OS === 'web') {
            const nav: any = typeof navigator !== 'undefined' ? navigator : null;
            if (nav?.share) {
              await nav.share({ text: message });
            } else {
              await Clipboard.setStringAsync(message);
              toast('تم النسخ، الصقها أينما تريد');
            }
          } else {
            await Share.share({ message });
          }
        } catch {
          /* user cancelled */
        }
      },
      shareImage: async (q, bgColor) => {
        const res = await exportQuoteImage(q, bgColor);
        toast(res.message);
      },
      toast,
      clearFavorites: () => {
        triggerHaptic('warning');
        setFavorites([]);
        toast('تم مسح المفضلة');
      },
      notificationsEnabled,
      toggleNotifications,
      exportData,
      importData,
    };
  }, [
    themeMode,
    scheme,
    fontScale,
    favorites,
    myQuotes,
    notificationsEnabled,
    findQuote,
    toast,
    setThemeMode,
    setFontScale,
    toggleNotifications,
    exportData,
    importData,
  ]);

  if (!loaded) return null;

  return (
    <Ctx.Provider value={value}>
      {children}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.toast,
          {
            opacity: anim,
            transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
          },
        ]}
      >
        <Text style={styles.toastText}>{toastMsg}</Text>
      </Animated.View>
    </Ctx.Provider>
  );
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useStore outside provider');
  return c;
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 110,
    alignSelf: 'center',
    backgroundColor: 'rgba(20,18,15,0.92)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    zIndex: 9999,
  },
  toastText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
