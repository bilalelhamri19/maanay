export type Theme = {
  dark: boolean;
  bg: string;
  card: string;
  text: string;
  sub: string;
  border: string;
  primary: string;
  soft: string;
};

export const light: Theme = {
  dark: false,
  bg: '#F6F1EA',
  card: '#FFFFFF',
  text: '#1F1B16',
  sub: '#7C7268',
  border: '#EAE1D5',
  primary: '#B5652B',
  soft: '#F1E4D6',
};

export const dark: Theme = {
  dark: true,
  bg: '#14120F',
  card: '#211E1A',
  text: '#F4EEE6',
  sub: '#A39A8F',
  border: '#2F2A24',
  primary: '#E39A5C',
  soft: '#2C251E',
};

export const rtlText = { textAlign: 'right' as const, writingDirection: 'rtl' as const };
