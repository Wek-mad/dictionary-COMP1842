import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Upload from '../views/Upload.vue';
import Profile from '../views/Profile.vue';
import WordDetail from '../components/WordDetail.vue';
import EditWord from '../components/EditWord.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/upload',
    name: 'Upload',
    component: Upload
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile
  },
  {
    path: '/word/:id',
    name: 'WordDetail',
    component: WordDetail,
    props: true
  },
  {
    path: '/word/:id/edit',
    name: 'WordEdit',
    component: EditWord,
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;