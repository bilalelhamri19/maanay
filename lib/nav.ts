import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStack = {
  Main: undefined;
  Category: { id: string };
  Reader: { ids: string[]; index: number; title?: string };
  AddQuote: { quoteId?: string } | undefined;
  Settings: undefined;
};

export type ScreenProps<T extends keyof RootStack> = NativeStackScreenProps<RootStack, T>;
