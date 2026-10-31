import { getResources, InformationResource } from "@/lib/informationArchive";
import { useCallback, useEffect, useState } from "react";

/** Shared archive loader for Learn-style surfaces (tab + sheets). */
export function useLearnResources() {
  const [resources, setResources] = useState<InformationResource[]>([]);
  const [loading, setLoading] = useState(true);

  const loadResources = useCallback(async () => {
    try {
      setResources(await getResources());
    } catch (error) {
      console.error("Error loading Learn content:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  return { resources, loading };
}
