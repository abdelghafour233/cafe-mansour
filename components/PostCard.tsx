
import React from 'react';
import { BlogPost } from '../types';

interface PostCardProps {
  post: BlogPost;
  onClick: (post: BlogPost) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onClick }) => {
  return (
    <div 
      onClick={() => onClick(post)}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer border border-slate-100 dark:border-slate-700"
    >
      <img 
        src={post.imageUrl} 
        alt={post.title} 
        className="w-full h-48 object-cover"
      />
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">
            {post.category}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {post.date}
          </span>
        </div>
        <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-white leading-tight">
          {post.title}
        </h3>
        <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-3">
          {post.summary}
        </p>
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-slate-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">
            {post.author[0]}
          </div>
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
            {post.author}
          </span>
        </div>
      </div>
    </div>
  );
};
