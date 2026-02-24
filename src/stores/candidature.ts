import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { CandidatureFilters } from "../types";

const DEFAULT_FILTERS: CandidatureFilters = {
  _sort: "",
  _order: "desc",
  _page: 1,
  _limit: 10,
  statut: "all",
  poste: "all",
};

export const useCandidatureStore = defineStore("candidature", () => {
  const filters = ref<CandidatureFilters>({ ...DEFAULT_FILTERS });
  const searchQuery = ref("");
  const activeFilters = computed<CandidatureFilters>(() => ({
    ...filters.value,
    statut: filters.value.statut === "all" ? "" : filters.value.statut,
    poste: filters.value.poste === "all" ? "" : filters.value.poste,
    q: searchQuery.value || undefined,
  }));

  const setFilters = (newFilters: Partial<CandidatureFilters>) => {
    filters.value = { ...filters.value, ...newFilters };
    if (newFilters.statut !== undefined || newFilters.poste !== undefined || newFilters.q !== undefined) {
      filters.value._page = 1;
    }
  };

  const setSearchQuery = (query: string) => {
    searchQuery.value = query;
    filters.value._page = 1;
  };

  const setPage = (page: number) => {
    filters.value._page = page;
  };

  const resetFilters = () => {
    filters.value = { ...DEFAULT_FILTERS };
    searchQuery.value = "";
  };

  return {
    filters,
    searchQuery,
    activeFilters,
    setFilters,
    setSearchQuery,
    setPage,
    resetFilters,
  };
});