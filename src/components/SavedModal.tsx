'use client';

import React from 'react';
import { Creator } from '../types';
import { X, Bookmark, ArrowRight, ShieldCheck, Star } from 'lucide-react';

interface SavedModalProps {
  savedCreators: Creator[];
  onClose: () => void;
  onSelectCreator: (creator: Creator) => void;
  onRemoveSaved: (creatorId: string) => void;
  onClearAll: () => void;
}

export const SavedModal: React.FC<SavedModalProps> = ({
  savedCreators,
  onClose,
  onSelectCreator,
  onRemoveSaved,
  onClearAll,
}) => {
  const handleModalMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div 
        onMouseMove={handleModalMouseMove}
        className="bg-zinc-900 rounded-2xl max-w-lg w-full border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] section-glow"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 flex items-center justify-center">
              <Bookmark className="w-4 h-4 fill-zinc-200" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">
                Shortlisted Creators ({savedCreators.length})
              </h3>
              <p className="text-xs text-zinc-400">Curated talent for upcoming commercial briefs</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-2.5 flex-1">
          {savedCreators.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 space-y-2">
              <Bookmark className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-sm font-medium text-white">No creators saved</p>
              <p className="text-xs text-zinc-500">
                Bookmark creators from the discovery feed to save them here.
              </p>
            </div>
          ) : (
            savedCreators.map((creator) => (
              <div
                key={creator.id}
                className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950 flex items-center justify-between gap-3"
              >
                <div 
                  className="flex items-center gap-3 cursor-pointer flex-1"
                  onClick={() => {
                    onSelectCreator(creator);
                    onClose();
                  }}
                >
                  <img
                    src={creator.avatar}
                    alt={creator.name}
                    className="w-10 h-10 rounded-xl object-cover border border-zinc-700"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-semibold text-xs text-white hover:underline">
                        {creator.name}
                      </h4>
                      {creator.isVerified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400 line-clamp-1">{creator.specialization}</p>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                      <span className="font-semibold text-white">${creator.hourlyRate}/hr</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 text-zinc-300">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {creator.rating}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onRemoveSaved(creator.id)}
                    className="text-xs text-zinc-500 hover:text-rose-400 p-1.5"
                    title="Remove"
                  >
                    Remove
                  </button>

                  <button
                    onClick={() => {
                      onSelectCreator(creator);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 flex items-center gap-1"
                  >
                    <span>View</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {savedCreators.length > 0 && (
          <div className="p-3.5 bg-zinc-950 border-t border-zinc-850 flex items-center justify-between text-xs">
            <button
              onClick={onClearAll}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Clear Shortlist
            </button>
            <span className="text-zinc-500">{savedCreators.length} saved</span>
          </div>
        )}
      </div>
    </div>
  );
};
