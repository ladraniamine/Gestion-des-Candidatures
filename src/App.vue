<script setup>
import { VueQueryDevtools } from "@tanstack/vue-query-devtools";
import { useThemeStore } from "@/stores/theme";
import { onMounted } from "vue";

// Initialize theme on app start
const themeStore = useThemeStore();
onMounted(() => {
  themeStore.loadTheme();
});
</script>

<template>
  <div id="app" class="min-h-screen bg-background">
    <div class="container mx-auto px-4 py-8">
      <router-view />
      <VueQueryDevtools />
    </div>
  </div>
</template>

<style>
/* Global styles */
#app {
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    "Roboto",
    "Oxygen",
    "Ubuntu",
    "Cantarell",
    "Fira Sans",
    "Droid Sans",
    "Helvetica Neue",
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: hsl(var(--muted));
}

::-webkit-scrollbar-thumb {
  background: hsl(var(--muted-foreground));
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--muted-foreground) / 0.8);
}
</style>
