import { useEffect, useState } from "react";

export type Route =
  | { name: "library" }
  | { name: "view"; id: string }
  | { name: "edit"; id: string }
  | { name: "new" };

const parse = (hash: string): Route => {
  const path = hash.replace(/^#\/?/, "").split("?")[0];
  const parts = path.split("/").filter(Boolean);

  if (parts[0] === "new") return { name: "new" };
  if (parts[0] === "p" && parts[1]) {
    return parts[2] === "edit"
      ? { name: "edit", id: parts[1] }
      : { name: "view", id: parts[1] };
  }
  return { name: "library" };
};

export const navigate = (to: string) => {
  window.location.hash = to;
};

export const useHashRoute = (): Route => {
  const [route, setRoute] = useState<Route>(() => parse(window.location.hash));

  useEffect(() => {
    const onChange = () => {
      setRoute(parse(window.location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return route;
};
