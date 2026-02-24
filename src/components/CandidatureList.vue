<script setup lang="ts">
import { computed, watch } from "vue";
import { storeToRefs } from "pinia";
import { useCandidatures, useStatuts, usePostes } from "../lib/api";
import { useCandidatureStore } from "../stores/candidature";
import { useDebounce } from "../utils/helpers";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import ThemeToggle from "./ThemeToggle.vue";
import { Search, Filter, User } from "lucide-vue-next";
import { useRouter } from "vue-router";

const store = useCandidatureStore();
const router = useRouter();
const { activeFilters, filters, searchQuery } = storeToRefs(store);

const { input: searchInput, debounced: debouncedSearch } = useDebounce(
  searchQuery.value,
);

watch(debouncedSearch, (v) => store.setSearchQuery(v));
watch(searchQuery, (v) => {
  searchInput.value = v;
});

const selectedStatut = computed({
  get: () => filters.value.statut || "all",
  set: (v) => store.setFilters({ statut: v }),
});

const selectedPoste = computed({
  get: () => filters.value.poste || "all",
  set: (v) => store.setFilters({ poste: v }),
});

const { data: statuts, isLoading: isStatutsLoading } = useStatuts();
const { data: postes, isLoading: isPostesLoading } = usePostes();

const statutColorMap = computed<Record<string, string>>(() => {
  if (!statuts.value) return {};
  return Object.fromEntries(
    statuts.value.map((s: any) => [s.nom, s.couleur ?? "gray"]),
  );
});

const getStatutColor = (statutNom: string) =>
  statutColorMap.value[statutNom] ?? "gray";

const {
  data: candidaturesData,
  isPending: isCandidaturesPending,
  isFetching: isCandidaturesFetching,
  error,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  refetch,
} = useCandidatures(activeFilters);

const candidatures = computed(
  () => candidaturesData.value?.pages.flatMap((page) => page.data) ?? [],
);
const total = computed(() => candidaturesData.value?.pages[0]?.total ?? 0);

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const handleReset = () => store.resetFilters();

const goToDetail = (id: number) => router.push(`/candidatures/${id}`);
</script>

<template>
  <div class="space-y-4 px-4 py-4 sm:px-6 sm:py-6">
    <!-- Header -->
    <div
      class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <h1 class="text-2xl font-bold sm:text-3xl">Gestion des Candidatures</h1>
      <div class="flex items-center gap-2 self-end sm:self-auto">
        <ThemeToggle />
        <Button @click="handleReset()" variant="outline" size="lg">
          <Filter class="mr-2 h-4 w-4" />
          Réinitialiser
        </Button>
      </div>
    </div>

    <!-- Filters -->
    <Card>
      <CardHeader class="pb-3">
        <CardTitle class="flex items-center text-base sm:text-lg">
          <Filter class="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          Filtres et recherche
        </CardTitle>
      </CardHeader>
      <CardContent class="flex gap-4 flex-wrap">
        <div class="relative w-full md:max-w-92">
          <Search class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            v-model="searchInput"
            placeholder="Rechercher par nom, poste, compétences..."
            class="pl-9"
          />
        </div>
        <!-- Selects: stack on mobile, side by side on sm+ -->
          <Select v-model="selectedStatut" :disabled="isStatutsLoading">
            <SelectTrigger>
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="#" v-if="isStatutsLoading" disabled>
                Chargement des statuts...
              </SelectItem>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem
                v-for="statut in statuts"
                :key="statut.id"
                :value="statut.nom"
              >
                {{ statut.nom }}
              </SelectItem>
            </SelectContent>
          </Select>
          <Select v-model="selectedPoste" :disabled="isPostesLoading">
            <SelectTrigger>
              <SelectValue placeholder="Tous les postes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="#" v-if="isPostesLoading" disabled>
                Chargement des postes...
              </SelectItem>
              <SelectItem value="all">Tous les postes</SelectItem>
              <SelectItem
                v-for="poste in postes"
                :key="poste.id"
                :value="poste.titre"
              >
                {{ poste.titre }}
              </SelectItem>
            </SelectContent>
          </Select>
      </CardContent>
    </Card>

    <!-- Loading -->
    <div v-if="isCandidaturesPending" class="flex justify-center py-8">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
      ></div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-8">
      <p class="text-destructive">Erreur lors du chargement des candidatures</p>
      <Button @click="refetch()" variant="outline" class="mt-2"
        >Réessayer</Button
      >
    </div>

    <!-- Content -->
    <div v-else class="space-y-4">
      <div
        v-if="isCandidaturesFetching"
        class="flex justify-end text-sm text-muted-foreground"
      >
        <span class="animate-pulse">Mise à jour...</span>
      </div>

      <template v-if="candidatures.length > 0">
        <!-- Table: hidden on mobile, visible on md+ -->
        <Card class="hidden md:block">
          <CardContent class="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Poste</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date de candidature</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow
                  v-for="candidature in candidatures"
                  :key="candidature.id"
                  class="cursor-pointer hover:bg-muted/50"
                  @click="goToDetail(candidature.id)"
                >
                  <TableCell class="font-medium">{{
                    candidature.nom
                  }}</TableCell>
                  <TableCell>{{ candidature.poste }}</TableCell>
                  <TableCell>
                    <span
                      class="px-2 py-1 rounded-full text-xs font-medium text-white"
                      :style="{
                        backgroundColor: getStatutColor(candidature.statut),
                      }"
                    >
                      {{ candidature.statut }}
                    </span>
                  </TableCell>
                  <TableCell>{{
                    formatDate(candidature.dateCandidature)
                  }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <!-- Card list: visible on mobile, hidden on md+ -->
        <div class="flex flex-col gap-3 md:hidden">
          <Card
            v-for="candidature in candidatures"
            :key="candidature.id"
            class="cursor-pointer hover:bg-muted/50 transition-colors"
            @click="goToDetail(candidature.id)"
          >
            <CardContent class="flex items-start justify-between gap-3 p-4">
              <div class="min-w-0 space-y-1">
                <p class="font-semibold truncate">{{ candidature.nom }}</p>
                <p class="text-sm text-muted-foreground truncate">
                  {{ candidature.poste }}
                </p>
                <p class="text-xs text-muted-foreground">
                  {{ formatDate(candidature.dateCandidature) }}
                </p>
              </div>
              <span
                class="shrink-0 px-2 py-1 rounded-full text-xs font-medium text-white"
                :style="{ backgroundColor: getStatutColor(candidature.statut) }"
              >
                {{ candidature.statut }}
              </span>
            </CardContent>
          </Card>
        </div>

        <!-- Load More -->
        <div v-if="hasNextPage" class="flex justify-center mt-4">
          <Button
            @click="fetchNextPage"
            :disabled="isFetchingNextPage"
            variant="outline"
          >
            {{ isFetchingNextPage ? "Chargement..." : "Charger plus" }}
          </Button>
        </div>
        <div v-else class="text-center mt-4 text-sm text-muted-foreground">
          Toutes les candidatures ont été chargées ({{ total }})
        </div>
      </template>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <User class="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 class="mt-4 text-lg font-semibold">Aucune candidature trouvée</h3>
        <p class="text-muted-foreground text-sm">
          Essayez de modifier vos critères de recherche ou de filtrage.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
