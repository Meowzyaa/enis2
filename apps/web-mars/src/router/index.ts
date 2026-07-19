import { createRouter, createWebHistory } from "vue-router"
import useAuthStore from "../stores/auth"
import AppShell from "../layouts/AppShell.vue"
import Login from "../views/Login.vue"
import Diary from "../views/Diary.vue"
import Tabel from "../views/Tabel.vue"

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/login", name: "login", component: Login },
    {
      path: "/",
      component: AppShell,
      children: [
        { path: "", redirect: { name: "diary" } },
        { path: "diary", name: "diary", component: Diary },
        { path: "tabel", name: "tabel", component: Tabel },
      ],
    },
    { path: "/:pathMatch(.*)*", redirect: { name: "diary" } },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (!auth.authenticated && to.name !== "login") return { name: "login" }
  if (auth.authenticated && to.name === "login") return { name: "diary" }
})

export default router
