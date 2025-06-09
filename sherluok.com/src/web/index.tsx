import { GlobalLayout } from '^/web/pages/global-layout';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouteObject, RouterProvider } from 'react-router';
import './index.css';

const routeObjects: RouteObject[] = [
  {
    element: <GlobalLayout />,
    children: [
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
    ],
  },
];

const containerElement = document.body.appendChild(document.createElement('div'));
const reactRoot = createRoot(containerElement);
const router = createBrowserRouter(routeObjects);
reactRoot.render(<RouterProvider router={router} />);
