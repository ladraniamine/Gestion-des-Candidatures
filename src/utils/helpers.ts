import { ref, watch } from "vue";

export function useDebounce<T>(initialValue: T, delay = 1000) {
  const input = ref<T>(initialValue);
  const debounced = ref<T>(initialValue);
  let timer: ReturnType<typeof setTimeout> | null = null;

  watch(input, (v) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      debounced.value = v as typeof debounced.value;
    }, delay);
  });

  return { input, debounced };
}
