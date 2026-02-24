export interface Commentaire {
  id: number;
  auteur: string;
  date: string; // ISO 8601
  contenu: string;
}

export interface Candidature {
  id: number;
  nom: string;
  poste: string;
  statut: string;
  competences: string[];
  experience: string;
  dateCandidature: string; // ISO 8601
  email: string;
  telephone: string;
  cv: string; // URL
  lettreMotivation: string;
  salaireSouhaite: number;
  disponibilite: string;
  localisation: string;
  commentaires: Commentaire[];
}

export interface Statut {
  id: number;
  nom: string;
  couleur: string;
  ordre: number;
}

export interface Poste {
  id: number;
  titre: string;
  description: string;
  competencesRequises: string[];
}

export interface Competence {
  id: number;
  nom: string;
  categorie: string;
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Filter types
export interface CandidatureFilters {
  statut?: string;
  poste?: string;
  q?: string;
  _sort?: string;
  _order?: 'asc' | 'desc';
  _page?: number;
  _limit?: number;
}
