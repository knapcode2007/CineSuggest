import React from "react";
import { X, Film } from "lucide-react";

interface TrailerModalProps {
  trailerKey?: string;
  movieTitle: string;
  onClose: () => void;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({
  trailerKey,
  movieTitle,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl shadow-black">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Film className="h-4 w-4 text-[#F27D26]" />
            <h3 className="truncate font-['Outfit'] text-base font-semibold text-white">
              Official Trailer: {movieTitle}
            </h3>
          </div>
          <button
            id="close-trailer-btn"
            onClick={onClose}
            className="rounded-full p-1 text-zinc-400 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative aspect-video w-full bg-black">
          {trailerKey ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`}
              title={`Trailer for ${movieTitle}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full border-0"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
              <Film className="h-12 w-12 text-zinc-500" />
              <p className="mt-2 text-sm font-medium text-white">Trailer is not currently available for this film.</p>
              <p className="text-xs text-zinc-400">Try searching YouTube or checking the official distributor page.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
