import { computed } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

export enum PathId {
  Request = 'request',
  Cookies = 'cookies',
  Collection = 'collection',
  Schema = 'schema',
  Environment = 'environment',
  Servers = 'servers',
}

const routes = [
  { path: '/', redirect: '/request/default' },
  {
    path: '/collection',
    redirect: '/collection/default',
  },
  {
    name: PathId.Collection,
    path: `/collection/:${PathId.Collection}`,
    component: () => import('@/views/Collection/Collection.vue'),
    children: [
      // Nested collection request
      {
        path: `request/${PathId.Request}`,
        component: () => import('@/views/Request/Request.vue'),
      },
    ],
  },
  {
    path: '/request',
    redirect: '/request/default',
  },
  {
    path: `/request/:${PathId.Request}`,
    component: () => import('@/views/Request/Request.vue'),
  },
  /** Components will map to each section of the spec components object */
  {
    path: '/components',
    redirect: '/components/schemas/default',
    children: [
      {
        path: `schemas/:${PathId.Schema}`,
        component: () => import('@/views/Components/Schemas/Schemas.vue'),
      },
    ],
  },
  {
    path: '/environment',
    redirect: '/environment/default',
  },
  {
    path: `/environment/:${PathId.Environment}`,
    component: () => import('@/views/Environment/Environment.vue'),
  },
  {
    path: '/cookies',
    redirect: '/cookies/default',
  },
  {
    path: `/cookies/:${PathId.Cookies}`,
    component: () => import('@/views/Cookies/Cookies.vue'),
  },
  {
    path: '/servers',
    redirect: '/servers/default',
  },
  {
    path: `/servers/:${PathId.Servers}`,
    component: () => import('@/views/Servers/Servers.vue'),
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

export const activeRouterParams = computed(() => {
  const pathParams = {
    [PathId.Collection]: 'default',
    [PathId.Environment]: 'default',
    [PathId.Request]: 'default',
    [PathId.Schema]: 'default',
    [PathId.Cookies]: 'default',
    [PathId.Servers]: 'default',
  }

  if (router.currentRoute.value) {
    Object.values(PathId).forEach((k) => {
      if (router.currentRoute.value.params[k]) {
        pathParams[k] = router.currentRoute.value.params[k] as string
      }
    })
  }

  return pathParams
})

/** If we try to navigate to a entity UID that does not exist then we fallback to the default */
export function fallbackMissingParams(
  key: PathId,
  item: Record<string, any> | undefined,
) {
  // If the item is missing and we are a route that uses that item we fallback to the default
  if (
    router.currentRoute.value &&
    // If the item is missing then we know the UID is no longer in use and redirect to the default
    !item &&
    router.currentRoute.value?.params[key] &&
    router.currentRoute.value?.params[key] !== 'default' &&
    // We only redirect if the key is missing for the matching route
    router.currentRoute.value.path.includes(key)
  ) {
    router.push({
      params: {
        ...router.currentRoute.value.params,
        [key]: 'default',
      },
    })
  }
}
