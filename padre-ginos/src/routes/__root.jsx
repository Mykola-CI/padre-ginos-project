import { useState } from "react";
import { createRootRoute, createRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import PizzaOfTheDay from "../PizzaOfTheDay";
import Header from "../Header";
import { CartContext } from "../contexts";
import { Route as IndexLazyRoute } from "./index.lazy"; 

export const Route = createRootRoute({
  path: "/*", // Allow nested routes
  component: () => {
    const cartHook = useState([]);
    return (
      <>
        <CartContext.Provider value={cartHook}>
          <div>
            <Header />
            <Outlet />
            <PizzaOfTheDay />
          </div>
        </CartContext.Provider>
        <TanStackRouterDevtools />
        <ReactQueryDevtools />
      </>
    );
  },
});

// Explicitly create index route with parent relationship
const IndexRoute = createRoute({
  getParentRoute: () => Route, // Direct parent reference
  path: "/",
}).lazy(() => IndexLazyRoute);

// Add to root children
Route.addChildren([IndexRoute]);