import './index.css';

import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { routeObjects } from './route';

const containerElement = document.body.appendChild(document.createElement('div'));
const reactRoot = createRoot(containerElement);
const router = createBrowserRouter(routeObjects);
reactRoot.render(<RouterProvider router={router} />);
