import React from 'react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Calendar, BookOpen, Heart, Bookmark, Edit2, Trash2, ShieldAlert, X } from 'lucide-react';
import { Column } from '../types';
import { getAuthorDisplayGroup } from '../constants';

interface ColumnDetailProps {
  column: Column;
  isLiked: boolean;
  isBookmarked: boolean;
  onLike: () => void;
  onBookmark: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
}

export default function ColumnDetail({
  column,
  isLiked,
  isBookmarked,
  onLike,
  onBookmark,
  onEdit,
  onDelete,
  onBack
}: ColumnDetailProps) {
  const formattedDate = column.date || '2026.07.01';

  return (
    <motion.div
      id="column-detail-container"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs p-6 md:p-10 my-6 animate-fade-in"
    >
      {/* Header bar with back and close button */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
        <button
          id="btn-back-to-list"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-slate-950 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>목록으로 돌아가기</span>
        </button>
        <button
          id="btn-close-column"
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 hover:text-gray-800 hover:bg-gray-50 shadow-xs transition-colors"
          title="닫기"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Header Info with Pill tags and timestamp */}
      <div className="mb-6">
        <div className="flex items-center flex-wrap gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">
          <span className="px-2.5 py-1 text-[10px] font-extrabold bg-[#1e40af] text-white rounded-md">
            {column.category || '1차수'}
          </span>
          <span className="px-2.5 py-1 text-[10px] font-extrabold bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0] rounded-md">
            {column.tags && column.tags.length > 0 ? column.tags[0].toUpperCase() : 'SERVICE INNOVATION'}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-950 tracking-tight leading-snug mb-6">
          {column.title}
        </h1>

        {/* Author Card right below the title */}
        <div className="border border-gray-100 rounded-2xl p-4 bg-white shadow-xs flex items-center gap-4 mb-8">
          <img
            src={column.author?.image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'}
            alt={column.author?.name}
            referrerPolicy="no-referrer"
            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs shrink-0 pointer-events-none select-none"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
          />
          <div className="flex-grow min-w-0">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <h4 className="font-extrabold text-slate-900 text-sm">{column.author?.name || '익명 기고가'}</h4>
              <span className="text-[11px] text-slate-400 font-bold">
                ({column.author?.affiliation || getAuthorDisplayGroup(column.author?.name)})
              </span>
            </div>
            <p className="text-[11px] font-extrabold text-[#1d4ed8] mt-0.5">
              {column.author?.role || 'Service Innovation Lead'}
            </p>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
              {getAuthorDisplayGroup(column.author?.name)}
            </p>
          </div>
        </div>
      </div>

      {/* Executive Summary Box */}
      {column.excerpt && (
        <div className="border-l-4 border-[#10b981] bg-[#ecfdf5]/30 rounded-r-2xl p-4 mb-8">
          <p className="text-[10px] font-extrabold text-[#059669] tracking-wider mb-1">
            EXECUTIVE SUMMARY
          </p>
          <p className="text-xs text-gray-700 leading-relaxed font-semibold">
            {column.excerpt}
          </p>
        </div>
      )}

      {/* Content Area - Markdown Body */}
      <div className="markdown-body prose prose-lg prose-emerald max-w-none mb-12 text-slate-800 leading-relaxed text-sm md:text-base">
        <ReactMarkdown>
          {column.content}
        </ReactMarkdown>
      </div>

      {/* Micro Interaction Actions: Like & Bookmark */}
      <div className="flex items-center gap-3 pb-6 border-b border-gray-100">
        <button
          id="detail-like-large-btn"
          onClick={onLike}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-bold transition-all duration-300 ${
            isLiked
              ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-xs'
              : 'border-gray-200 text-gray-600 hover:bg-rose-50/50 hover:text-rose-600 bg-white'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 transition-transform duration-200 ${isLiked ? 'fill-rose-600 scale-125' : ''}`} />
          <span>공감 {column.likes || 0}</span>
        </button>

        <button
          id="detail-bookmark-large-btn"
          onClick={onBookmark}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-bold transition-all duration-300 ${
            isBookmarked
              ? 'bg-amber-50 border-amber-200 text-amber-600 shadow-xs'
              : 'border-gray-200 text-gray-600 hover:bg-amber-50/50 hover:text-amber-600 bg-white'
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 transition-transform duration-200 ${isBookmarked ? 'fill-amber-600 scale-125' : ''}`} />
          <span>북마크 저장</span>
        </button>
      </div>

      {/* Bottom Section: Tags and Post Management Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-6 border-b border-gray-100 mb-8">
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {column.tags && column.tags.length > 0 ? (
            column.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 text-xs font-bold text-slate-500 bg-slate-100/70 border border-slate-200 rounded-md"
              >
                #{tag}
              </span>
            ))
          ) : (
            <span className="px-3 py-1 text-xs font-bold text-slate-500 bg-slate-100/70 border border-slate-200 rounded-md">
              #HIVE
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:self-center self-end">
          <button
            id="detail-edit-btn"
            onClick={onEdit}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-blue-600 bg-blue-50/50 border border-blue-200 hover:bg-blue-100/70 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>게시글 수정</span>
          </button>
          <button
            id="detail-delete-btn"
            onClick={onDelete}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-rose-600 bg-rose-50/50 border border-rose-200 hover:bg-rose-100/70 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>게시글 삭제</span>
          </button>
        </div>
      </div>

      {/* Footer warning card */}
      <div className="border border-gray-200 rounded-md py-3 text-center text-[10px] text-gray-400 font-extrabold uppercase tracking-widest bg-slate-50/50">
        © GST Expert Column. Unauthorized redistribution prohibited.
      </div>
    </motion.div>
  );
}
