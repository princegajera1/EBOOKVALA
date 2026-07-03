import { useApp } from "../store/AppContext";

export const useTheme = () => {
  const { theme, toggleTheme, updateTheme } = useApp();
  
  // Dynamically compute isDark, accounting for system preferences
  const isDark = theme === "dark" || (
    theme === "system" && 
    typeof window !== "undefined" && 
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  
  return {
    theme,
    toggleTheme,
    updateTheme,
    isDark
  };
};

export default useTheme;
