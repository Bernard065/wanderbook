import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';
import { Link } from 'react-router';
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Heart,
  HeartOff,
  Image,
  ImagePlus,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Upload,
  Video,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogClose,
  DialogContent,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorMessage } from '@/components/ui/error-message';
import { Input } from '@/components/ui/input';

import {
  type Photo,
  useDeletePhoto,
  usePhotos,
  useUploadPhoto,
} from '@/hooks/use-photos';
import { usePlaces } from '@/hooks/use-places';

type MediaTab = 'all' | 'photos' | 'videos';
type SortOption = 'newest' | 'oldest' | 'location' | 'favorites';
type FilterOption = 'all' | 'favorites' | `place:${string}`;

interface MediaItem extends Photo {
  type: 'photo' | 'video';
}

const FAVORITES_STORAGE_KEY = 'wanderbook-gallery-favorites';

export function GalleryPage() {
  const { data: photos, isLoading, error } = usePhotos();
  const { data: places } = usePlaces();
  const { mutate: uploadPhoto, isPending: isUploading } = useUploadPhoto();
  const { mutate: deletePhoto, isPending: isDeleting } = useDeletePhoto();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState<MediaTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') {
      return new Set<string>();
    }

    try {
      const stored = window.localStorage.getItem(FAVORITES_STORAGE_KEY);

      return stored
        ? new Set<string>(JSON.parse(stored) as string[])
        : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify(Array.from(favoriteIds)),
    );
  }, [favoriteIds]);

  const placeNameById = useMemo(
    () => new Map((places ?? []).map((place) => [place.id, place.name])),
    [places],
  );

  const mediaItems = useMemo<MediaItem[]>(
    () =>
      (photos ?? []).map((photo) => ({
        ...photo,
        type: 'photo',
      })),
    [photos],
  );

  const filteredMedia = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filterPlaceId = filterBy.startsWith('place:')
      ? filterBy.slice('place:'.length)
      : undefined;

    return mediaItems
      .filter((item) => {
        if (activeTab === 'photos' && item.type !== 'photo') return false;
        if (activeTab === 'videos' && item.type !== 'video') return false;
        if (filterBy === 'favorites' && !favoriteIds.has(item.id)) {
          return false;
        }
        if (filterPlaceId && item.placeId !== filterPlaceId) return false;

        if (!query) return true;

        const caption = item.caption?.toLowerCase() ?? '';
        const location =
          placeNameById.get(item.placeId ?? '')?.toLowerCase() ?? '';

        return caption.includes(query) || location.includes(query);
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return (
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
          );
        }

        if (sortBy === 'oldest') {
          return (
            new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime()
          );
        }

        if (sortBy === 'location') {
          const aLocation = placeNameById.get(a.placeId ?? '') ?? '';
          const bLocation = placeNameById.get(b.placeId ?? '') ?? '';
          return aLocation.localeCompare(bLocation);
        }

        if (sortBy === 'favorites') {
          const aFavorite = favoriteIds.has(a.id) ? 0 : 1;
          const bFavorite = favoriteIds.has(b.id) ? 0 : 1;

          if (aFavorite !== bFavorite) {
            return aFavorite - bFavorite;
          }

          return (
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
          );
        }

        return 0;
      });
  }, [
    activeTab,
    favoriteIds,
    filterBy,
    mediaItems,
    placeNameById,
    searchQuery,
    sortBy,
  ]);

  const placeFilterOptions = useMemo(
    () => [
      {
        value: 'all' as FilterOption,
        label: 'All locations',
      },
      {
        value: 'favorites' as FilterOption,
        label: 'Favorites only',
      },
      ...(places ?? []).map((place) => ({
        value: `place:${place.id}` as FilterOption,
        label: place.name,
      })),
    ],
    [places],
  );

  const selectedMediaIndex = selectedMediaId
    ? filteredMedia.findIndex((item) => item.id === selectedMediaId)
    : -1;

  const selectedMedia =
    selectedMediaIndex >= 0 ? filteredMedia[selectedMediaIndex] : null;

  const hasPrevious = selectedMediaIndex > 0;

  const hasNext =
    selectedMediaIndex >= 0 &&
    selectedMediaIndex < filteredMedia.length - 1;

  const goPrevious = useCallback(() => {
    if (!hasPrevious || selectedMediaIndex < 1) return;

    setSelectedMediaId(filteredMedia[selectedMediaIndex - 1].id);
  }, [filteredMedia, hasPrevious, selectedMediaIndex]);

  const goNext = useCallback(() => {
    if (!hasNext) return;

    setSelectedMediaId(filteredMedia[selectedMediaIndex + 1].id);
  }, [filteredMedia, hasNext, selectedMediaIndex]);

  useEffect(() => {
    if (!selectedMedia) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goPrevious();
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [goNext, goPrevious, selectedMedia]);

  const handleDeleteSelected = useCallback(() => {
    if (!selectedMedia) return;

    const nextId = hasNext
      ? filteredMedia[selectedMediaIndex + 1]?.id ?? null
      : hasPrevious
        ? filteredMedia[selectedMediaIndex - 1]?.id ?? null
        : null;

    deletePhoto(selectedMedia.id, {
      onSuccess: () => {
        setFavoriteIds((current) => {
          const next = new Set(current);
          next.delete(selectedMedia.id);
          return next;
        });

        setSelectedMediaId(nextId);
      },
    });
  }, [
    deletePhoto,
    filteredMedia,
    hasNext,
    hasPrevious,
    selectedMedia,
    selectedMediaIndex,
  ]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    setUploadError(null);

    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError(
        'Only photo uploads are supported in this gallery view.',
      );
      event.target.value = '';
      return;
    }

    uploadPhoto(
      { file },
      {
        onError: (uploadErrorValue: unknown) => {
          setUploadError(
            uploadErrorValue instanceof Error
              ? uploadErrorValue.message
              : 'Upload failed. Please try again.',
          );
        },
      },
    );

    event.target.value = '';
  };

  const toggleFavorite = (id: string) => {
    setFavoriteIds((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const isEmptyState =
    !isLoading && !error && filteredMedia.length === 0;

  const hasAnyItems = mediaItems.length > 0;

  const sortOptions: Array<{
    value: SortOption;
    label: string;
  }> = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'location', label: 'Location' },
    { value: 'favorites', label: 'Favorites first' },
  ];

  const tabs: Array<{
    key: MediaTab;
    label: string;
    icon: typeof Camera;
  }> = [
    { key: 'all', label: 'All media', icon: Image },
    { key: 'photos', label: 'Photos', icon: Camera },
    { key: 'videos', label: 'Videos', icon: Video },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
          Gallery
        </h1>

        <p className="max-w-2xl text-sm leading-6 text-slate-600">
          Browse your travel photos and videos in one polished, responsive
          gallery.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 rounded-full bg-slate-100 p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <Button
          variant="default"
          className="gap-2"
          onClick={handleUploadClick}
          disabled={isUploading}
        >
          <Upload className="h-4 w-4" />
          {isUploading ? 'Uploading...' : 'Upload media'}
        </Button>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.2fr_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search captions and locations"
            className="pl-10"
          />
        </div>

        <Select
          value={sortBy}
          onValueChange={(value) => setSortBy(value as SortOption)}
        >
          <SelectTrigger className="lg:w-44">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>

          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filterBy}
          onValueChange={(value) => setFilterBy(value as FilterOption)}
        >
          <SelectTrigger className="lg:w-52">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              <SelectValue placeholder="Filter" />
            </div>
          </SelectTrigger>

          <SelectContent>
            {placeFilterOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {uploadError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {uploadError}
        </div>
      ) : null}

      {error ? <ErrorMessage error={error} /> : null}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="aspect-video animate-pulse bg-slate-100" />

              <div className="space-y-2 p-4">
                <div className="h-3 w-3/4 animate-pulse rounded-full bg-slate-200" />
                <div className="h-3 w-1/2 animate-pulse rounded-full bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      ) : isEmptyState ? (
        <EmptyState
          icon={activeTab === 'videos' ? Video : Camera}
          title={
            activeTab === 'videos'
              ? 'No videos yet'
              : hasAnyItems
                ? 'No media matches your filters'
                : 'Your gallery is waiting'
          }
          description={
            activeTab === 'videos'
              ? 'You do not have any videos in the gallery yet.'
              : hasAnyItems
                ? 'Try another search term, or clear the filters.'
                : 'Upload your next photo to begin filling this gallery.'
          }
          action={
            activeTab !== 'videos' ? (
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleUploadClick}
              >
                <ImagePlus className="h-4 w-4" />
                Upload media
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {filteredMedia.map((item) => {
            const isFavorite = favoriteIds.has(item.id);

            const location =
              placeNameById.get(item.placeId ?? '') ??
              'Unknown location';

            const dateLabel = new Intl.DateTimeFormat(undefined, {
              dateStyle: 'medium',
            }).format(new Date(item.createdAt));

            return (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <button
                  type="button"
                  className="block w-full"
                  onClick={() => setSelectedMediaId(item.id)}
                >
                  <img
                    src={item.url}
                    alt={item.caption ?? 'Gallery item'}
                    loading="lazy"
                    className="h-72 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                  />
                </button>

                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="rounded-3xl bg-slate-950/90 px-3 py-3 text-sm text-slate-100 backdrop-blur-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-300">
                        <Camera className="h-3.5 w-3.5" />
                        Photo
                      </span>
                    </div>

                    <p className="mt-3 line-clamp-2 text-sm font-semibold text-white">
                      {item.caption ?? 'Travel memory'}
                    </p>

                    <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-300">
                      <span className="inline-flex min-w-0 items-center gap-1 truncate">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {location}
                      </span>

                      <span className="inline-flex shrink-0 items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5" />
                        {dateLabel}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  aria-label={
                    isFavorite
                      ? 'Remove from favorites'
                      : 'Add to favorites'
                  }
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleFavorite(item.id);
                  }}
                  className="absolute right-3 top-3 z-10 rounded-full border border-white/20 bg-slate-950/70 p-2 text-white"
                >
                  {isFavorite ? (
                    <Heart className="h-4 w-4 fill-rose-400 text-rose-400" />
                  ) : (
                    <HeartOff className="h-4 w-4 text-slate-200" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <Dialog
        open={selectedMedia !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedMediaId(null);
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="max-h-[90vh] w-full max-w-[90vw] overflow-hidden rounded-3xl p-0 sm:max-w-[80vw]"
        >
          {selectedMedia ? (
            <div className="relative flex h-[80vh] flex-col overflow-hidden bg-slate-950 text-white lg:h-[75vh]">
              <div className="absolute right-4 top-4 z-20">
                <DialogClose asChild>
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/80"
                    aria-label="Close viewer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </DialogClose>
              </div>

              <button
                type="button"
                onClick={goPrevious}
                disabled={!hasPrevious}
                className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-slate-900/70 p-3 disabled:opacity-40"
                aria-label="Previous media"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={goNext}
                disabled={!hasNext}
                className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-slate-900/70 p-3 disabled:opacity-40"
                aria-label="Next media"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <div className="grid h-full grid-cols-1 overflow-hidden lg:grid-cols-[1.6fr_0.9fr]">
                <div className="flex min-h-0 items-center justify-center bg-black">
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.caption ?? 'Gallery preview'}
                    className="h-full w-full object-contain"
                  />
                </div>

                <div className="flex min-h-0 flex-col gap-4 overflow-y-auto p-5 sm:p-8">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
                          Photo preview
                        </p>

                        <h2 className="mt-2 text-2xl font-semibold">
                          {selectedMedia.caption ?? 'Travel memory'}
                        </h2>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleFavorite(selectedMedia.id)}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm"
                      >
                        {favoriteIds.has(selectedMedia.id) ? (
                          <Heart className="h-4 w-4 fill-rose-400 text-rose-400" />
                        ) : (
                          <HeartOff className="h-4 w-4" />
                        )}

                        {favoriteIds.has(selectedMedia.id)
                          ? 'Favorited'
                          : 'Favorite'}
                      </button>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4">
                      <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-500">
                        <Sparkles className="h-4 w-4" />
                        Media details
                      </div>

                      <dl className="grid gap-4 text-sm">
                        <div>
                          <dt className="text-slate-400">Location</dt>
                          <dd className="mt-1 text-white">
                            {selectedMedia.placeId
                              ? placeNameById.get(
                                  selectedMedia.placeId,
                                ) ?? 'Unknown place'
                              : 'No related place'}
                          </dd>
                        </div>

                        <div>
                          <dt className="text-slate-400">Date</dt>
                          <dd className="mt-1 text-white">
                            {new Intl.DateTimeFormat(undefined, {
                              dateStyle: 'medium',
                            }).format(new Date(selectedMedia.createdAt))}
                          </dd>
                        </div>

                        {selectedMedia.placeId ? (
                          <div>
                            <dt className="text-slate-400">
                              Related place
                            </dt>
                            <dd className="mt-1">
                              <Link
                                to={`/places/${selectedMedia.placeId}`}
                                className="font-medium text-blue-300 hover:underline"
                              >
                                {placeNameById.get(
                                  selectedMedia.placeId,
                                ) ?? 'Open place'}
                              </Link>
                            </dd>
                          </div>
                        ) : null}
                      </dl>
                    </div>
                  </div>

                  <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeleteSelected}
                      disabled={isDeleting}
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goPrevious}
                        disabled={!hasPrevious}
                        className="gap-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>

                      <Button
                        size="sm"
                        onClick={goNext}
                        disabled={!hasNext}
                        className="gap-2"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
