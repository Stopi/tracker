import {useEffect, useState} from "react";
import {useOutletContext, useParams} from "react-router";
import {useNavigate} from "react-router";
import {toast} from "sonner";
import {api} from "@/lib/api.tsx";
import {Hourglass, RefreshCw, Trash} from "lucide-react";
import {TMDB_IMAGE_URL_PREFIX} from "@/const";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Checkbox} from "@/components/ui/checkbox";

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
  refreshShows: () => Promise<void>;
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

export default function ShowDetail() {
  const { showId } = useParams();
  const { userFlags, refreshShows } = useOutletContext<ShowContext>();
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [show, setShow] = useState<ShowData["show"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const navigate = useNavigate();

  async function fetchShow() {
    if (!showId) return;
    setIsLoading(true);
    try {
      // @ts-expect-error - Hono RPC doesn't support dynamic index access at type level
      const res = await api.show[showId].$get();
      if (res.ok) {
        const data: ShowData = await res.json();
        setShow(data.show);
      } else {
        setShow(null);
      }
    } catch {
      setShow(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchShow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showId]);

  if (!showId) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Select a show to view details</p>
        </div>
      </div>
    );
  }

  if (isLoading && !show) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Loading...</p>
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

  async function handleRefresh() {
    if (isValidating) return;
    setIsValidating(true);
    try {
      // @ts-expect-error - Hono RPC doesn't type dynamic params
      const res = await api.show[showId].$put();
      if (!res.ok) {
        toast.error("Failed to refresh show");
        return;
      }
      await fetchShow();
      toast.success("Show refreshed");
    } catch {
      toast.error("Failed to refresh show");
    } finally {
      setIsValidating(false);
    }
  }

  async function handleFlagChange(episodeId: number, flag: string, checked: boolean) {
    const flagLabel = userFlags[flag] || flag;
    const episodeName = show?.episodes?.find((ep) => ep.id === episodeId)?.name || "Episode";

    try {
      // @ts-expect-error - Hono RPC doesn't type dynamic params
      const res = await api.episode[episodeId].flag.$patch({
        json: { flag, value: checked },
      });
      if (!res.ok) {
        toast.error(`Failed to update ${flagLabel} for ${episodeName}`);
        return;
      }
      await fetchShow();
    } catch {
      toast.error(`Failed to update ${flagLabel} for ${episodeName}`);
    }
  }

  async function handleSeasonFlagChange(flag: string, checked: boolean) {
    const flagLabel = userFlags[flag] || flag;

    try {
      // @ts-expect-error - Hono RPC doesn't type dynamic params
      const res = await api.show[showId].season.flag.$patch({
        json: { season_nb: selectedSeason, flag, value: checked },
      });
      if (!res.ok) {
        toast.error(`Failed to update ${flagLabel} for season ${selectedSeason}`);
        return;
      }
      await fetchShow();
    } catch {
      toast.error(`Failed to update ${flagLabel} for season ${selectedSeason}`);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Are you sure you want to delete "${show?.name}"?`)) {
      return;
    }

    try {
      // @ts-expect-error - Hono RPC doesn't type dynamic params
      const res = await api.show[showId].$delete();
      if (res.ok) {
        toast.success("Show deleted");
        setShow(null);
        await refreshShows();
        navigate("/");
      } else {
        toast.error("Failed to delete the show");
      }
    } catch (e) {
      toast.error("An error occurred while deleting the show");
      console.error(e);
    }
  }

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
      <div className="flex flex-col xl:flex-row px-4 xl:px-6 pr-0 w-full h-fit xl:h-full">

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
            <h1 className="text-xl lg:text-3xl font-bold">{show.name}</h1>
            <div className='flex gap-4 items-center w-fit mb-4 mt-2'>
              <div className="flex flex-wrap gap-2 w-fit lg:gap-4 text-xs lg:text-sm text-muted-foreground">
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
              <button
                className="cursor-pointer shrink-0"
                onClick={() => handleDelete()}
                title="Delete this show"
              >
                <Trash />
              </button>
            </div>
            <p className="text-muted-foreground text-sm lg:text-base text-justify">{show.overview}</p>
          </div>
        </div>

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
