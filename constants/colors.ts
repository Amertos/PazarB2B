const PRIMARY_GREEN = "#1A6B3C";
const ACCENT_GREEN = "#2E9B5B";
const LIGHT_GREEN = "#EEF4F0";
const MID_GREEN = "#C8E6D4";

export const Colors = {
  primary: PRIMARY_GREEN,
  primaryDark: "#124D2C",
  accent: ACCENT_GREEN,
  accentLight: "#4DB87A",
  background: "#F5F8F5",
  lightGreen: LIGHT_GREEN,
  midGreen: MID_GREEN,
  white: "#FFFFFF",
  card: "#FFFFFF",
  border: "#E0EDE6",
  borderLight: "#EEF4F0",
  text: "#1A1A1A",
  textSecondary: "#5A6B62",
  textMuted: "#9EB0A4",
  textOnGreen: "#FFFFFF",
  error: "#D94F4F",
  warning: "#E6A020",
  success: "#1A6B3C",
  tabBar: "#FFFFFF",
  tabBarActive: PRIMARY_GREEN,
  tabBarInactive: "#9EB0A4",
  inputBackground: "#F5F8F5",
  inputBorder: "#DCE8E0",
  separator: "#ECF3EE",
  shadow: "rgba(26, 107, 60, 0.08)",
  overlay: "rgba(0, 0, 0, 0.45)",
};

export default {
  light: {
    text: Colors.text,
    background: Colors.background,
    tint: Colors.primary,
    tabIconDefault: Colors.tabBarInactive,
    tabIconSelected: Colors.primary,
  },
};
