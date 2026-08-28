import React from 'react';
import { motion } from 'motion/react';
import { Heart, Bookmark, Edit2, Trash2, BookOpen, Calendar } from 'lucide-react';
import { Column } from '../types';
import { getAuthorDisplayGroup } from '../constants';

interface ColumnCardProps {
  column: Column;
  isLiked: boolean;
  isBookmarked: boolean;
  onLike: (e: React.MouseEvent) => void;
  onBookmark: (e: React.MouseEvent) => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onClick: () => void;
}

export default function ColumnCard({
  column,
  isLiked,
  isBookmarked,
  onLike,
  onBookmark,
  onEdit,
  onDelete,
  onClick
}: ColumnCardProps) {
  const formattedDate = column.date || '2026.07.01';

  return (
    <motion.div
      id={`column-card-${column.id}`}
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col h-full cursor-pointer p-6"
    >
      {/* Card Body */}
      <div className="flex-grow flex flex-col justify-between">
        <div>
          {/* Metadata Row */}
          <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
            <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md tracking-wider">
              {column.category}
            </span>
            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              <Calendar className="w-3 h-3 mr-0.5" />
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-base md:text-lg font-bold text-gray-950 line-clamp-2 tracking-tight mb-2.5 group-hover:text-emerald-600 transition-colors duration-200">
            {column.title}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed mb-6 font-medium">
            {column.excerpt}
          </p>
        </div>

        {/* Author details & Social Interactions Row */}
        <div>
          <div className="flex items-center gap-3 pt-4 border-t border-gray-50 mb-4">
            <img
              src={column.author?.image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
              alt={column.author?.name}
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-100 pointer-events-none select-none"
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
            />
            <div className="min-w-0 flex-grow">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-gray-800 truncate">{column.author?.name}</span>
                <span className="px-1.5 py-0.5 text-[8px] font-extrabold bg-slate-100 text-slate-700 rounded-md truncate max-w-[120px]" title={getAuthorDisplayGroup(column.author?.name)}>
                  {getAuthorDisplayGroup(column.author?.name)}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 truncate">
                {column.author?.role || '연구원'} • {column.author?.affiliation || 'HIVE'}
              </p>
            </div>
          </div>

          {/* Buttons Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Like Button */}
              <button
                id={`like-btn-${column.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onLike(e);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isLiked
                    ? 'bg-rose-50 text-rose-600 font-bold'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-rose-500'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 transition-transform duration-200 ${isLiked ? 'fill-rose-600 scale-110' : ''}`} />
                <span>{column.likes || 0}</span>
              </button>

              {/* Bookmark Button */}
              <button
                id={`bookmark-btn-${column.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onBookmark(e);
                }}
                className={`p-1.5 rounded-lg transition-all duration-200 ${
                  isBookmarked
                    ? 'bg-amber-50 text-amber-600'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-amber-500'
                }`}
                title={isBookmarked ? '북마크 취소' : '북마크 저장'}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500' : ''}`} />
              </button>
            </div>

            {/* Management Actions */}
            <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
              <button
                id={`edit-btn-${column.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(e);
                }}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors duration-150"
                title="수정하기"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                id={`delete-btn-${column.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(e);
                }}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
                title="삭제하기"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
