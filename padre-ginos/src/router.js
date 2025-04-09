import { createRouter as createTanstackRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen"; 

export function createRouter() {
    return createTanstackRouter({
        routeTree,
        basepath: "/padre-ginos-project", // Base path for routing
    });
}
