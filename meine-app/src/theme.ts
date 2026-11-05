// Von Claude generiert (KI-Einsatz, siehe Technischer Bericht)
// Farben 1:1 aus Figma (Variablen «Paper Theme»)
import { MD3LightTheme } from 'react-native-paper';

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#A73A04',
    onPrimary: '#FFFFFF',
    primaryContainer: '#FFDBCF',
    onPrimaryContainer: '#3A0B00',
    secondaryContainer: '#FFDBCF',
    onSecondaryContainer: '#2C160D',
    background: '#FFF8F6',
    surface: '#FFF8F6',
    onSurface: '#231917',
    surfaceVariant: '#F5DED7',
    onSurfaceVariant: '#53433F',
    outline: '#85736E',
    outlineVariant: '#D8C2BB',
    error: '#BA1A1A',
    errorContainer: '#FFDAD6',
    onErrorContainer: '#410002',
    inverseSurface: '#392E2B',
    inverseOnSurface: '#FFEDE8',
    inversePrimary: '#FFB59B',
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level1: '#FBEEEA',
      level2: '#F8E9E3',
      level3: '#F5E3DB',
    },
  },
};

export const COVER_COLORS = ['#2F6B4F', '#2B4C7E', '#A23B2A', '#9C6A14', '#5B3F7A', '#1F6F78'];