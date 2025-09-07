export const STORAGE_KEY = "appSettings";

export interface SettingsState {
  darkMode: boolean;
  sonido: boolean;
  volumen: number;
  vibracion: boolean;
  notificaciones: boolean;
}

export const defaultSettings: SettingsState = {
  darkMode: false,
  sonido: true,
  volumen: 50,
  vibracion: true,
  notificaciones: true,
};
