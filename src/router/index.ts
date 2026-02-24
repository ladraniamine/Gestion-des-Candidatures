import { createRouter, createWebHistory } from 'vue-router'
import CandidatureList from '@/components/CandidatureList.vue'
import CandidatureDetail from '@/components/CandidatureDetail.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: CandidatureList,
  },
  {
    path: '/candidatures/:id',
    name: 'candidature-details',
    component: CandidatureDetail,
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})