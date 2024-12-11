import { createRouter, createWebHistory } from 'vue-router';
import Home from '../pages/Home.vue';
import Login from '../pages/Login.vue';
import Register from '../pages/Register.vue';
import Profile from '../pages/Profile.vue';
import Dashboard from '../pages/Dashboard.vue';
import ShareView from '../pages/ShareView.vue';
import ManageShareLinksView from '../pages/ManageShareLinks.vue';

const routes = [
    { path: '/', component: Home },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/user/profile', component: Profile },
    { path: '/user/dashboard', component: Dashboard },
    { path: "/share/:share_code", component: ShareView },
    { path: "/share-links/manage", component: ManageShareLinksView },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;