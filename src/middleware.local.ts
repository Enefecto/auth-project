import type { MiddlewareNext } from "astro";
import { defineMiddleware } from "astro:middleware";

const privateRoutes = ["/protected"];

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, request } = context;

  const authHeaders = request.headers.get("authorization") ?? "";
  if (privateRoutes.includes(url.pathname)) {
    return checkLocalAuth(authHeaders, next);
  }

  return next();
});

const checkLocalAuth = (authHeaders: string, next: MiddlewareNext) => {
  if (!authHeaders) {
    return new Response("auth Necesaria", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic real="Secure Area"',
      },
    });
  }

  const authValue = authHeaders.split(" ").at(-1) ?? "User:pass";
  const decodedValue = atob(authValue).split(":");

  const [user, password] = decodedValue;

  if (user === "admin" && password === "123") {
    return next();
  }

  return new Response("auth Necesaria", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic real="Secure Area"',
    },
  });
};
