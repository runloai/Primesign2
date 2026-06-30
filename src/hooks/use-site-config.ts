import { useQuery } from "@tanstack/react-query";
import { loadSiteConfig, shouldUseLocalDraftPreview } from "@/lib/site-config";

export function useSiteConfig() {
  const includeLocalDraft = shouldUseLocalDraftPreview();

  return useQuery({
    queryKey: ["site-config", includeLocalDraft],
    queryFn: () => loadSiteConfig({ includeLocalDraft }),
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    retry: 1,
  });
}
