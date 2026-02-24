import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/vue-query";
import type { Candidature, CandidatureFilters } from "../types";
import { computed, type ComputedRef } from "vue";

const API_BASE_URL = "https://gestion-des-candidatures-be.onrender.com";

async function getCandidatures(
  filters: CandidatureFilters = {},
  pageParam?: number,
) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });

  const page = pageParam || filters._page || 1;
  params.set("_page", String(page));

  const limit = filters._limit || 10;
  params.set("_limit", String(limit));

  const response = await fetch(
    `${API_BASE_URL}/candidatures?${params.toString()}`,
  );
  if (!response.ok)
    throw new Error(`Failed to fetch candidatures: ${response.statusText}`);

  const data = await response.json();
  const total = parseInt(response.headers.get("X-Total-Count") || "0");
  return { data, total, page, limit };
}

async function getCandidature(id: number) {
  const response = await fetch(`${API_BASE_URL}/candidatures/${id}`);
  if (!response.ok)
    throw new Error(`Failed to fetch candidature: ${response.statusText}`);
  return response.json();
}

async function getStatuts() {
  const response = await fetch(`${API_BASE_URL}/statuts`);
  if (!response.ok)
    throw new Error(`Failed to fetch statuts: ${response.statusText}`);
  return response.json();
}

async function getPostes() {
  const response = await fetch(`${API_BASE_URL}/postes`);
  if (!response.ok)
    throw new Error(`Failed to fetch postes: ${response.statusText}`);
  return response.json();
}

async function getCompetences() {
  const response = await fetch(`${API_BASE_URL}/competences`);
  if (!response.ok)
    throw new Error(`Failed to fetch competences: ${response.statusText}`);
  return response.json();
}

async function updateCandidature(id: number, data: Partial<Candidature>) {
  const response = await fetch(`${API_BASE_URL}/candidatures/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok)
    throw new Error(`Failed to update candidature: ${response.statusText}`);
  return response.json();
}

export const useCandidatures = (
  filtersRef: ComputedRef<CandidatureFilters>,
) => {
  return useInfiniteQuery({
    queryKey: computed(() => ["candidatures", { ...filtersRef.value }]),
    queryFn: ({ pageParam = 1 }) =>
      getCandidatures(filtersRef.value, pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { data, page, limit, total } = lastPage;
      return data.length === limit && page * limit < total
        ? page + 1
        : undefined;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCandidature = (id: number) => {
  return useQuery({
    queryKey: ["candidature", id],
    queryFn: () => getCandidature(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useStatuts = () => {
  return useQuery({
    queryKey: ["statuts"],
    queryFn: getStatuts,
    staleTime: 10 * 60 * 1000,
  });
};

export const usePostes = () => {
  return useQuery({
    queryKey: ["postes"],
    queryFn: getPostes,
    staleTime: 10 * 60 * 1000,
  });
};

export const useCompetences = () => {
  return useQuery({
    queryKey: ["competences"],
    queryFn: getCompetences,
    staleTime: 10 * 60 * 1000,
  });
};

export const useUpdateCandidature = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Candidature> }) =>
      updateCandidature(id, data),
    onSuccess: (updatedCandidature) => {
      queryClient.setQueryData(
        ["candidature", updatedCandidature.id],
        updatedCandidature
      );
      queryClient.invalidateQueries({ 
        queryKey: ["candidatures"],
        refetchType: 'none'
      });
    },
  });
};
