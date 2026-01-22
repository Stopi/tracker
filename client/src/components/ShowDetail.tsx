import {useState} from "react";
import {useOutletContext, useParams} from "react-router";
import {toast} from "sonner";
import {api} from "@/lib/api.tsx";
import {Hourglass, RefreshCw} from "lucide-react";
import {TMDB_IMAGE_URL_PREFIX} from "@/const";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Checkbox} from "@/components/ui/checkbox";
import {useApi} from "@/lib/swr";

type Episode = {
  id: number;
  tmdb_id: number;
  name?: string;
  air_date?: string;
  season_nb?: number;
  episode_nb: number;
  image?: string;
  overview?: string;
  flag_1?: boolean;
  flag_2?: boolean;
  flag_3?: boolean;
  flag_4?: boolean;
  flag_5?: boolean;
  flag_6?: boolean;
  flag_7?: boolean;
  flag_8?: boolean;
};

type ShowContext = {
  shows: Array<{
    id: number;
    name: string;
  }>;
  userFlags: Record<string, string>;
};

type ShowData = {
  show: {
    id: number;
    name: string;
    image?: string;
    overview?: string;
    nb_seasons?: number;
    nb_episodes?: number;
    origin_country?: string;
    status?: string;
    episodes?: Episode[];
  };
};

/**
 * Show detail view displaying metadata and episode list with flag management.
 * Supports per-episode and per-season flag toggles with optimistic updates.
 */
export default function ShowDetail() {
  const { showId } = useParams();
  const { userFlags } = useOutletContext<ShowContext>();
  const [selectedSeason, setSelectedSeason] = useState<number>(1);

  // Fetch show data; null key skips fetch when no showId is selected
  const { data, isLoading, isValidating, mutate } = useApi<ShowData>(
    showId ? `/show/${showId}` : null,
    showId
      ? // @ts-expect-error - Hono RPC doesn't support dynamic index access at type level
        () => api.show[showId].$get()
      : null
  );

  const show = data?.show ?? null;

  // Render states based on loading and data availability
  if (isLoading && !show) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!showId) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Select a show to view details</p>
        </div>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Show not found</p>
        </div>
      </div>
    );
  }

  /** Refreshes show's details and list of episodes from TMDB */
  async function handleRefresh() {
    if (isValidating) return;
    try {
      await mutate();
      toast.success("Show refreshed");
    } catch {
      toast.error("Failed to refresh show");
    }
  }

  /**
   * Toggles a single episode flag with optimistic update.
   * Reverts on server error.
   */
  async function handleFlagChange(episodeId: number, flag: string, checked: boolean) {
    const flagLabel = userFlags[flag] || flag;
    const episodeName = show?.episodes?.find((ep) => ep.id === episodeId)?.name || "Episode";

    // Apply change immediately to UI
    await mutate(
      (currentData) => {
        if (!currentData) return currentData;
        return {
          ...currentData,
          show: {
            ...currentData.show,
            episodes: currentData.show.episodes?.map((ep) =>
              ep.id === episodeId ? { ...ep, [flag]: checked } : ep
            ),
          },
        };
      },
      false
    );

    // @ts-expect-error - Hono RPC doesn't type dynamic params
    const res = await api.episode[episodeId].flag.$patch({
      json: { flag, value: checked },
    });
    if (!res.ok) {
      // Revert on failure
      await mutate(
        (currentData) => {
          if (!currentData) return currentData;
          return {
            ...currentData,
            show: {
              ...currentData.show,
              episodes: currentData.show.episodes?.map((ep) =>
                ep.id === episodeId ? { ...ep, [flag]: !checked } : ep
              ),
            },
          };
        },
        false
      );
      toast.error(`Failed to update ${flagLabel} for ${episodeName}`);
    }
  }

  /**
   * Toggles flags for all episodes in the current season.
   * Applies change to matching episodes and reverts on error.
   */
  async function handleSeasonFlagChange(flag: string, checked: boolean) {
    const flagLabel = userFlags[flag] || flag;

    // Apply to all episodes in current season
    await mutate(
      (currentData) => {
        if (!currentData) return currentData;
        return {
          ...currentData,
          show: {
            ...currentData.show,
            episodes: currentData.show.episodes?.map((ep) =>
              ep.season_nb === selectedSeason ? { ...ep, [flag]: checked } : ep
            ),
          },
        };
      },
      false
    );

    // @ts-expect-error - Hono RPC doesn't type dynamic params
    const res = await api.show[show.id].season.flag.$patch({
      json: { season_nb: selectedSeason, flag, value: checked },
    });
    if (!res.ok) {
      // Revert on failure
      await mutate(
        (currentData) => {
          if (!currentData) return currentData;
          return {
            ...currentData,
            show: {
              ...currentData.show,
              episodes: currentData.show.episodes?.map((ep) =>
                ep.season_nb === selectedSeason ? { ...ep, [flag]: !checked } : ep
              ),
            },
          };
        },
        false
      );
      toast.error(`Failed to update ${flagLabel} for season ${selectedSeason}`);
    }
  }

  /** Determines season checkbox state based on episode flag coverage */
  function isSeasonFlagChecked(flag: string): boolean | "indeterminate" | undefined {
    const seasonEps = currentSeasonEpisodes.filter((ep) => ep[flag as keyof Episode] !== undefined);
    if (seasonEps.length === 0) return undefined;
    const checked = seasonEps.filter((ep) => ep[flag as keyof Episode] as boolean);
    if (checked.length === seasonEps.length) return true;
    if (checked.length === 0) return false;
    return "indeterminate";
  }

  const episodes = show.episodes as Episode[];
  const seasons: number[] = Array.from({ length: show.nb_seasons || 0 }, (_, i) => i + 1);
  const currentSeasonEpisodes = episodes
    .filter((ep) => ep.season_nb === selectedSeason)
    .sort((a, b) => a.episode_nb - b.episode_nb);

  return (
    <div className="w-full h-full overflow-y-auto xl:overflow-hidden">
      <div className="flex flex-col xl:flex-row px-4 xl:px-6 pr-0 w-full h-fit xl:h-full"> {/* two containers are needed here because cannot cumulate flex+h-fit+overflow */}

        {/* Show metadata and poster */}
        <div className="flex flex-col xl:flex-row items-center w-full xl:w-2/3 h-fit xl:h-full overflow-hidden">
          <div className="xl:grow-0 w-fit xl:w-[34%] h-fit xl:h-full">
            <div className="xl:w-full h-fit xl:h-full text-center">
              {show.image && (
                <a
                  href={TMDB_IMAGE_URL_PREFIX + show.image}
                  target="_blank"
                  className="w-fit md:max-w-[40vw] inline-flex"
                >
                  <img
                    src={TMDB_IMAGE_URL_PREFIX + show.image}
                    alt={show.name}
                    className="rounded-lg"
                  />
                </a>
              )}
            </div>
          </div>
          <div className="flex flex-col xl:flex-2 h-full items-center xl:items-start overflow-y-auto px-8 my-8 xl:my-0">
            <div className='flex gap-4 items-center w-fit'>
              <button
                className="cursor-pointer shrink-0"
                onClick={() => handleRefresh()}
                title="Refresh the list of episodes"
              >
                {isValidating
                  ? (<Hourglass />)
                  : (<RefreshCw />)
                }
              </button>
              <h1 className="text-xl lg:text-3xl font-bold">{show.name}</h1>
            </div>
            <div className="flex flex-wrap gap-2 w-fit lg:gap-4 text-xs lg:text-sm text-muted-foreground mb-4 mt-2">
              <span>
                {show.nb_seasons} season{show.nb_seasons ?? 0 > 1 ? "s" : ""}
              </span>
              <span>
                {show.nb_episodes} episode
                {show.nb_episodes ?? 0 > 1 ? "s" : ""}
              </span>
              <span>{show.origin_country}</span>
              <span>{show.status}</span>
            </div>
            <p className="text-muted-foreground text-sm lg:text-base text-justify">{show.overview}</p>
          </div>
        </div>

        {/* Episode browser with season tabs */}
        <div className="w-full h-fit xl:h-full xl:w-1/3 mt-4 xl:mt-0 border-t xl:border-t-0 xl:border-l">
          <Tabs value={String(selectedSeason)} onValueChange={(v) => setSelectedSeason(Number(v))} className="overflow-hidden h-fit xl:h-full">
            <TabsList className="w-full justify-start overflow-x-auto">
              {seasons.map((season) => (
                <TabsTrigger key={season} value={String(season)}>
                  S{season < 10 ? "0" : ""}{season}
                </TabsTrigger>
              ))}
            </TabsList>
            {seasons.map((season) => (
              <TabsContent key={season} value={String(season)} className="flex flex-col items-center xl:items-start overflow-hidden h-fit xl:h-full">
                {/* Season-level flag toggles */}
                <div className="flex grow-0 flex-wrap gap-2 p-2 border-b mb-2 w-fit text-muted-foreground text-xs lg:text-sm">
                  <span className="self-center">Season flags:</span>
                  {Object.entries(userFlags).map(
                    ([flag, label]) =>
                      label ? (
                        <label
                          key={flag}
                          className="flex items-center gap-1 text-accent-foreground text-xs cursor-pointer"
                        >
                          <Checkbox
                            checked={isSeasonFlagChecked(flag)}
                            onCheckedChange={(
                              checked: boolean | "indeterminate"
                            ) =>
                              handleSeasonFlagChange(
                                flag,
                                checked === true
                              )
                            }
                          />
                          {label}
                        </label>
                      ) : null
                  )}
                </div>
                <div className="flex flex-col grow-1 space-y-2 h-fit xl:h-auto overflow-hidden xl:overflow-y-auto">
                  {currentSeasonEpisodes.map((ep) => (
                    <div
                      key={ep.id}
                      className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 items-center"
                    >
                      {ep.image && (
                        <a href={TMDB_IMAGE_URL_PREFIX + ep.image} target="_blank">
                          <img
                            src={TMDB_IMAGE_URL_PREFIX + ep.image}
                            alt={ep.name}
                            className="w-16 h-10 md:w-24 md:h-14 object-cover rounded shrink-0"
                          />
                        </a>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-medium text-sm truncate">
                            {(ep.episode_nb < 10 ? '0' : '') + ep.episode_nb}. {ep.name}
                          </div>
                          {ep.air_date && (
                            <div className="text-xs text-muted-foreground shrink-0">
                              {(new Date(ep.air_date)).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground text-justify line-clamp-2">
                          {ep.overview}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Object.entries(userFlags).map(
                            ([flag, label]) =>
                              label ? (
                                <label
                                  key={flag}
                                  className="flex items-center gap-1 text-xs cursor-pointer"
                                >
                                  <Checkbox
                                    checked={ep[flag as keyof Episode] as boolean}
                                    onCheckedChange={(
                                      checked: boolean | "indeterminate"
                                    ) =>
                                      handleFlagChange(
                                        ep.id,
                                        flag,
                                        checked === true
                                      )
                                    }
                                  />
                                  {label}
                                </label>
                              ) : null
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
