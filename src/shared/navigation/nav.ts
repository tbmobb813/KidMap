import { router } from "expo-router";

// Centralized navigation helpers to keep call sites clean.
// Accepts either a path string (e.g., "/search") or an object with pathname + optional params.
export type RouteMap = {
    "/": void;
    "/search": { category?: string } | void;
    "/map": void;
    "/transit": void;
    "/achievements": void;
    "/settings": void;
    "/onboarding": void;
    "/(tabs)": void;
    // Dynamic route example
    "/route/:id": { id: string };
};

type PathFrom<K extends keyof RouteMap> = K;
type ExtractParams<T> = Extract<T, object>;
type ParamsFor<K extends keyof RouteMap> = [ExtractParams<RouteMap[K]>] extends [never]
    ? undefined
    : ExtractParams<RouteMap[K]> | undefined;

export type NavTarget = string | { pathname: string; params?: Record<string, string | number | boolean | undefined> };

export const nav = {
    // Typed overloads
    push<K extends keyof RouteMap>(path: PathFrom<K>, params?: ParamsFor<K>) {
        if (params && path === "/route/:id") {
            const p = params as { id: string };
            return router.push(`/route/${p.id}` as any);
        }
        if (params) return router.push({ pathname: path as string, params } as any);
        return router.push(path as any);
    },
    replace<K extends keyof RouteMap>(path: PathFrom<K>, params?: ParamsFor<K>) {
        if (params && path === "/route/:id") {
            const p = params as { id: string };
            return router.replace(`/route/${p.id}` as any);
        }
        if (params) return router.replace({ pathname: path as string, params } as any);
        return router.replace(path as any);
    },
    replaceTabs() {
        return router.replace("/(tabs)" as any);
    },
    toTab(tab: "index" | "map" | "transit" | "achievements" | "settings") {
        // In Expo Router, group segments (e.g., (tabs)) are omitted from the URL.
        // Navigating to "/map" etc. takes you to that tab route.
        return router.push((`/${tab}` as unknown) as any);
    },
    back() {
        return router.back();
    },
    href<K extends keyof RouteMap>(path: PathFrom<K>, params?: ParamsFor<K>) {
        if (params && path === "/route/:id") {
            const p = params as { id: string };
            return (`/route/${p.id}` as unknown) as any;
        }
        if (params) return ({ pathname: path as string, params } as unknown) as any;
        return (path as unknown) as any;
    },
};
