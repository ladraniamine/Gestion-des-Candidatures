<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCandidature, useStatuts, useUpdateCandidature } from "../lib/api";
import type { Commentaire } from "../types";

import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

import {
  Edit,
  Save,
  MessageSquare,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Euro,
  Clock,
  ArrowLeft,
} from "lucide-vue-next";

const route = useRoute();
const router = useRouter();
const isEditing = ref(false);
const newComment = ref("");
const selectedStatut = ref("");

const {
  data: candidature,
  isPending,
  isFetching,
} = useCandidature(Number(route.params.id));
const { data: statuts } = useStatuts();
const updateMutation = useUpdateCandidature();

watch(candidature, (c) => {
  if (c) selectedStatut.value = c.statut;
});

const statutColorMap = computed<Record<string, string>>(() => {
  if (!statuts.value) return {};
  return Object.fromEntries(
    statuts.value.map((s: any) => [s.nom, s.couleur ?? "gray"]),
  );
});

const getStatutColor = (statutNom: string) =>
  statutColorMap.value[statutNom] ?? "gray";

const goBack = () => {
  console.log("goBack was called!");
  router.back();
};

const startEditing = () => {
  if (!candidature.value) return;
  isEditing.value = true;
  selectedStatut.value = candidature.value.statut;
};

const cancelEditing = () => {
  isEditing.value = false;
  selectedStatut.value = candidature.value?.statut || "";
  newComment.value = "";
};

const saveChanges = async () => {
  if (!candidature.value || updateMutation.isPending.value) return;

  const updates: any = {};

  if (
    selectedStatut.value &&
    selectedStatut.value !== candidature.value.statut
  ) {
    updates.statut = selectedStatut.value;
  }

  if (newComment.value.trim()) {
    const comment: Commentaire = {
      id: Date.now(),
      auteur: "Recruteur",
      date: new Date().toISOString(),
      contenu: newComment.value.trim(),
    };
    updates.commentaires = [...(candidature.value.commentaires || []), comment];
  }

  if (!Object.keys(updates).length) {
    isEditing.value = false;
    return;
  }

  try {
    await updateMutation.mutateAsync({
      id: candidature.value.id,
      data: updates,
    });
    isEditing.value = false;
    newComment.value = "";
  } catch (err) {
    console.error(err);
  }
};

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
</script>

<template>
  <div class="max-w-5xl mx-auto py-8 space-y-6">
    <div class="flex justify-between items-center">
      <Button type="button" variant="outline" @click="goBack">
        <ArrowLeft class="mr-2 h-4 w-4" />
        Retour
      </Button>

      <Button
        v-if="!isEditing"
        type="button"
        variant="outline"
        @click="startEditing"
      >
        <Edit class="mr-2 h-4 w-4" />
        Modifier
      </Button>
    </div>
    <div v-if="isPending" class="flex justify-center py-8">
      <div
        class="animate-spin h-8 w-8 border-b-2 border-primary rounded-full"
      ></div>
    </div>
    <div
      v-else-if="isFetching"
      class="flex justify-end text-sm text-muted-foreground"
    >
      <span class="animate-pulse">Mise à jour...</span>
    </div>
    <div v-if="candidature" class="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle class="flex justify-between items-center">
            <span>{{ candidature.nom }}</span>
            <span
              class="px-3 py-1 rounded-full text-white text-sm"
              :style="{ backgroundColor: getStatutColor(candidature.statut) }"
            >
              {{ candidature.statut }}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid md:grid-cols-2 gap-4">
            <div class="flex gap-2 items-center">
              <Mail class="h-4 w-4" />
              {{ candidature.email }}
            </div>
            <div class="flex gap-2 items-center">
              <Phone class="h-4 w-4" />
              {{ candidature.telephone }}
            </div>
            <div class="flex gap-2 items-center">
              <MapPin class="h-4 w-4" />
              {{ candidature.localisation }}
            </div>
            <div class="flex gap-2 items-center">
              <Euro class="h-4 w-4" />
              {{ candidature.salaireSouhaite.toLocaleString("fr-FR") }}€
            </div>
            <div class="flex gap-2 items-center">
              <Clock class="h-4 w-4" />
              {{ candidature.disponibilite }}
            </div>
            <div class="flex gap-2 items-center">
              <Calendar class="h-4 w-4" />
              {{ formatDate(candidature.dateCandidature) }}
            </div>
          </div>
        </CardContent>
      </Card>
      <Card v-if="isEditing">
        <form @submit.prevent="saveChanges">
          <CardContent class="space-y-4">
            <Select v-model="selectedStatut">
              <SelectTrigger type="button">
                <SelectValue placeholder="Changer le statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="statut in statuts"
                  :key="statut.id"
                  :value="statut.nom"
                >
                  {{ statut.nom }}
                </SelectItem>
              </SelectContent>
            </Select>

            <textarea
              v-model="newComment"
              class="w-full p-3 border rounded-md"
              rows="3"
              placeholder="Votre commentaire..."
            />

            <div class="flex gap-2">
              <Button type="submit" :disabled="updateMutation.isPending.value">
                <Save class="mr-2 h-4 w-4" />
                {{
                  updateMutation.isPending.value
                    ? "Enregistrement..."
                    : "Enregistrer"
                }}
              </Button>
              <Button type="button" variant="outline" @click="cancelEditing"
                >Annuler</Button
              >
            </div>
          </CardContent>
        </form>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            <MessageSquare class="inline mr-2 h-4 w-4" />
            Commentaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            v-for="comment in candidature.commentaires"
            :key="comment.id"
            class="border-l-4 border-primary pl-4 py-2"
          >
            <div class="flex justify-between text-sm">
              <span>{{ comment.auteur }}</span>
              <span>{{ formatDate(comment.date) }}</span>
            </div>
            <p>{{ comment.contenu }}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
