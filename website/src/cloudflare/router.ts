import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router';
import { routeObjects } from '../web/route';

const { query, dataRoutes } = createStaticHandler(routeObjects);

export async function routeHandler(request: Request) {
  // 1. run actions/loaders to get the routing context with `query`
  let context = await query(request);

  // If `query` returns a Response, send it raw (a route probably a redirected)
  if (context instanceof Response) {
    return context;
  }

  // 2. Create a static router for SSR
  let router = createStaticRouter(dataRoutes, context);

  // 3. Render everything with StaticRouterProvider
  // let html = renderToString(
  //   <StaticRouterProvider
  //     router={router}
  //     context={context}
  //   />,
  // );
  let html = renderToString(createElement(StaticRouterProvider, {
    router,
    context,
  }));

  // Setup headers from action and loaders from deepest match
  let leaf = context.matches[context.matches.length - 1];
  let actionHeaders = context.actionHeaders[leaf.route.id];
  let loaderHeaders = context.loaderHeaders[leaf.route.id];
  let headers = new Headers(actionHeaders);
  if (loaderHeaders) {
    loaderHeaders.forEach((value, key) => {
      headers.append(key, value);
    });
  }

  headers.set('Content-Type', 'text/html; charset=utf-8');

  // 4. send a response
  return new Response(`<!DOCTYPE html>${html}`, {
    status: context.statusCode,
    headers,
  });
}
