<script setup lang="ts">
import { Moon, Sun } from "lucide-vue-next";
import { Button } from "./ui/button";
import { useThemeStore } from "../stores/theme";

const themeStore = useThemeStore();
</script>

<template>
  <Button
    variant="outline"
    size="lg"
    @click="themeStore.toggleTheme()"
    :title="themeStore.actualTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
  >
    <Sun
      v-if="themeStore.actualTheme === 'light'"
      class="h-[1.2rem] w-[1.2rem]"
    />
    <Moon
      v-else
      class="h-[1.2rem] w-[1.2rem]"
    />
    <span class="sr-only">Toggle theme</span>
  </Button>
</template>
