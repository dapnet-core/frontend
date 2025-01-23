import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/IndexPage.vue') }]
  },
  {
    path: '/calls',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/CallPage.vue') }]
  },
  {
    path: '/subscribers',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/SubscriberPage.vue') },
      { path: 'new', component: () => import('pages/SubscriberForm.vue') },
      { path: 'edit/:id', component: () => import('pages/SubscriberForm.vue'), props: (route) => ({ editId: route.params.id }) }
    ]
  },
  {
    path: '/transmitters',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/TransmitterPage.vue') }]
  },
  {
    path: '/login',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/LoginPage.vue') }]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
