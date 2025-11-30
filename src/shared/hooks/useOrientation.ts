import { useEffect, useState } from "react";

export const useOrientation = () => {
  const getOrientation = () =>
    window.innerWidth > window.innerHeight ? "landscape" : "portrait";

  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    getOrientation()
  );

  useEffect(() => {
    const update = () => setOrientation(getOrientation());

    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return orientation;
};
