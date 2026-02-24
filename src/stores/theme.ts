import { defineStore } from "pinia";
import { ref, watch, computed } from "vue";

type Theme = "light" | "dark" | "system";

export const useThemeStore = defineStore("theme", () => {
  const theme = ref<Theme>("system");

  const actualTheme = computed(() => {
    if (theme.value === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return theme.value;
  });

  // Load theme from localStorage on initialization
  const loadTheme = () => {
    const saved = localStorage.getItem("theme") as Theme;
    if (saved && ["light", "dark", "system"].includes(saved)) {
      theme.value = saved;
    }
  };

  // Save theme to localStorage
  const saveTheme = (newTheme: Theme) => {
    theme.value = newTheme;
    localStorage.setItem("theme", newTheme);
  };

  // Toggle between light and dark, ignoring system
  const toggleTheme = () => {
    const current = actualTheme.value;
    saveTheme(current === "light" ? "dark" : "light");
  };

  // Set specific theme
  const setTheme = (newTheme: Theme) => {
    saveTheme(newTheme);
  };

  // Watch for system theme changes when theme is set to system
  watch(
    () => theme.value,
    (newTheme) => {
      if (newTheme === "system") {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const updateTheme = () => {
          document.documentElement.classList.toggle("dark", mediaQuery.matches);
        };
        updateTheme();
        mediaQuery.addEventListener("change", updateTheme);
      }
    },
    { immediate: true }
  );

  // Apply theme to document
  watch(
    actualTheme,
    (newActualTheme) => {
      document.documentElement.classList.toggle("dark", newActualTheme === "dark");
    },
    { immediate: true }
  );

  return {
    theme,
    actualTheme,
    loadTheme,
    saveTheme,
    toggleTheme,
    setTheme,
  };
});
