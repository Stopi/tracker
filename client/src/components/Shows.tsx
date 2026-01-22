import {useState} from "react";
import {Link, useNavigate, useOutlet, useParams} from "react-router";
import {toast} from "sonner";
import {api} from "@/lib/api.tsx";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,} from "@/components/ui/dialog";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger,} from "@/components/ui/accordion";
import {TMDB_IMAGE_URL_PREFIX} from "@/const";
import {Plus} from "lucide-react";
import {ErrorBoundary} from "@/components/ErrorBoundary";
import {useApi} from "@/lib/swr";

type ResponseType = Awaited<ReturnType<typeof api.show.$get>>;
type ShowsResponse = Awaited<ReturnType<ResponseType["json"]>>;
type Show = ShowsResponse["shows"][number];

type SearchResult = {
  id: number;
  tmdb_id: number;
  name: string;
  network?: string;
  nb_seasons?: number;
  image?: string;
  overview?: string;
};

type ShowsData = {
  shows: Show[];
  userFlags: Record<string, string>;
};

export function ShowsLayout() {
  const { data, error, isLoading, mutate } = useApi<ShowsData>("/show", () => api.show.$get());

  const outlet = useOutlet({
    shows: data?.shows || [],
    userFlags: data?.userFlags || {},
  });

  const refreshShows = async () => {
    await mutate();
  };

  if (isLoading) {
    return (
      <div className="flex h-full overflow-hidden">
        <div className="w-80 border-r h-full flex items-center justify-center">
          <p className="text-muted-foreground">Loading shows...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full overflow-hidden">
        <div className="w-80 border-r h-full flex items-center justify-center">
          <p className="text-red-500">Failed to load shows</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-fit md:h-full overflow-hidden">
      <ErrorBoundary fallback={<div className="w-full md:w-80 border-r p-4 text-red-500">Failed to load shows</div>}>
        <ShowList
          shows={data?.shows || []}
          onRefreshShows={refreshShows}
        />
      </ErrorBoundary>
      <ErrorBoundary fallback={<div className="flex-1 p-4 text-red-500">Failed to load content</div>}>
        {outlet}
      </ErrorBoundary>
    </div>
  );
}

type ShowListProps = {
  shows: Show[];
  onRefreshShows: () => Promise<void>;
};

export default function ShowList({ shows, onRefreshShows }: ShowListProps) {
  const navigate = useNavigate();
  const { showId } = useParams();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedShowId, setExpandedShowId] = useState<number | null>(null);
  const [filterQuery, setFilterQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const filteredShows = shows.filter((show) =>
    (show.name || "").toLowerCase().includes(filterQuery.toLowerCase())
  );

  /** Searches TMDB for shows matching the query */
  async function handleSearch() {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // @ts-expect-error - Hono RPC doesn't type dynamic params
      const res = await api.show.search[searchQuery].$get();
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.shows || []);
      }
    } catch (err) {
      toast.error("Search failed");
      console.error("Search failed:", err);
    } finally {
      setIsSearching(false);
    }
  }

  /** Adds a show to the user's library and navigates to its detail page */
  async function handleAddShow(show: SearchResult) {
    try {
      setIsAdding(true);
      const res = await api.show.$post({ json: { tmdb_id: Number(show.tmdb_id) } });
      if (!res.ok) throw new Error("Failed to add show");
      const data = await res.json();
      setIsSearchOpen(false);
      setSearchQuery("");
      setSearchResults([]);
      setExpandedShowId(null);
      await onRefreshShows();
      toast.success(`Added "${show.name}" to your list`);
      if (data.id) {
        navigate(`/show/${data.id}`);
      }
    } catch (err) {
      toast.error(`Failed to add "${show.name}"`);
      console.error("Failed to add show:", err);
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div className="flex flex-col w-full md:w-80 border-r h-80 md:h-full mb-8 md:mb-0">
      {/* Header with Add button */}
      <div className="border-b">
        <div className="flex items-center justify-between mb-2">
          <Input
            type="text"
            className="mr-4"
            placeholder="Filter shows..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
          />
          <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus/></Button>
            </DialogTrigger>
            <DialogContent className="w-[99vw] h-[90vh] !max-w-none">
              <DialogHeader>
                <DialogTitle>Add Show</DialogTitle>
              </DialogHeader>
              <div className="flex gap-2 mt-4">
                <Input
                  placeholder="Search for a show..."
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(e.target.value)
                  }
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleSearch()
                  }
                />
                <Button
                  onClick={handleSearch}
                  disabled={isSearching}
                >
                  {isSearching ? "..." : "Search"}
                </Button>
              </div>
              {searchResults.length > 0 && (
                <Accordion
                  type="single"
                  collapsible
                  value={
                    expandedShowId !== null
                      ? String(expandedShowId)
                      : undefined
                  }
                  onValueChange={(value) =>
                    setExpandedShowId(
                      value ? +value : null
                    )
                  }
                  className="overflow-y-auto"
                >
                  {searchResults.map((show) => (
                    <AccordionItem
                      key={String(show.tmdb_id)}
                      value={String(show.tmdb_id)}
                    >
                      <AccordionTrigger>
                        {show.name}
                      </AccordionTrigger>
                      <AccordionContent className="flex">
                        {show.image && (
                          <a href={TMDB_IMAGE_URL_PREFIX + show.image} target="_blank">
                            <img
                              src={TMDB_IMAGE_URL_PREFIX + show.image}
                              alt={show.name}
                              className="object-cover rounded-md mb-3 w-[185px]"
                            />
                          </a>
                        )}
                        <div className="flex flex-col justify-center content-center items-center">
                          {show.overview && (
                            <p className="text-lg text-muted-foreground mb-3 p-16">
                              {show.overview}
                            </p>
                          )}
                          <Button
                            className="w-[50%]"
                            onClick={() =>
                              handleAddShow(show)
                            }
                            disabled={isAdding}
                          >
                            {isAdding ? "..." : "ADD"}
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
              {searchQuery && searchResults.length === 0 && !isSearching && (
                <p className="mt-4 text-muted-foreground text-center">
                  No results found
                </p>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Shows list */}
      <div className="flex-1 overflow-y-auto">
        {filteredShows.length === 0 ? (
          <div className="p-4 text-muted-foreground text-center">
            {filterQuery ? "No matching shows" : "No shows found"}
          </div>
        ) : (
          <ul className="divide-y">
            {filteredShows.map((show) => (
              <li key={String(show.id)}>
                <Link
                  to={`/show/${show.id}`}
                  className={`block w-full p-4 transition-colors text-center md:text-left ${
                    String(show.id) === showId
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted/50"
                  }`}
                >
                  {show.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
