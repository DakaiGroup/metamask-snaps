import { useEffect, useState } from "react";
import snapCfg from "../../snap/snap.config";
import snapManifest from "../../snap/snap.manifest.json";

export const useSnapId = () => {
  const [snapId, setSnapId] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const id =
      window.location.hostname === "localhost"
        ? `local:${window.location.protocol}//${window.location.hostname}:${snapCfg.cliOptions.port}`
        : `npm:${snapManifest.source.location.npm.packageName}`;
    setSnapId(id);
  }, []);

  return snapId;
};
