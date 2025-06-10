import { RouteObject } from 'react-router';
import { GlobalLayout } from './pages/global-layout';

export const routeObjects: RouteObject[] = [
  {
    element: <GlobalLayout />,
    children: [
      {
        path: '*',
        lazy: () => import('./pages/404/page'),
      },
      {
        path: '/',
        lazy: () => import('./pages/page'),
      },
      {
        path: '/posts',
        lazy: () => import('./pages/posts/page'),
      },
      {
        path: '/posts/:id',
        lazy: () => import('./pages/posts/[id]/page'),
      },
      {
        path: '/photography',
        lazy: () => import('./pages/photography/page'),
      },
      {
        path: '/open-source',
        lazy: () => import('./pages/open-source/page'),
      },
      {
        path: '/tools',
        lazy: () => import('./pages/tools/page'),
      },
      {
        path: '/tools/oklch',
        lazy: () => import('./pages/tools/oklch/page'),
      },
    ],
  },
];
