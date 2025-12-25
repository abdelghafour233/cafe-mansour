
import React, { useState, useEffect, useCallback } from 'react';
import { BlogPost, Theme, BlogStats } from './types';
import { INITIAL_POSTS, CATEGORIES } from './constants';
import { PostCard } from './components/PostCard';
import { generateBlogPost } from './services/geminiService';

const App: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>(() => {
    const saved = localStorage.getItem('blog_posts');
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'light';
  });
  const [view, setView] = useState<'home' | 'post' | 'admin'>('home');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Admin Form State
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    category: CATEGORIES[0],
    imageUrl: 'https://picsum.photos/seed/new/800/450'
  });

  useEffect(() => {
    localStorage.setItem('blog_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    const newPost: BlogPost = {
      id: Date.now().toString(),
      ...formData,
      author: 'المدير',
      date: new Date().toISOString().split('T')[0],
      isDraft: false
    };
    setPosts([newPost, ...posts]);
    setFormData({ title: '', summary: '', content: '', category: CATEGORIES[0], imageUrl: '' });
    setView('home');
  };

  const handleAiMagic = async () => {
    if (!formData.title) return alert("يرجى كتابة عنوان أو فكرة للمقال أولاً");
    setIsAiGenerating(true);
    try {
      const result = await generateBlogPost(formData.title);
      setFormData(prev => ({
        ...prev,
        title: result.title || prev.title,
        summary: result.summary || '',
        content: result.content || ''
      }));
    } catch (err) {
      alert("فشل توليد المحتوى بالذكاء الاصطناعي");
    } finally {
      setIsAiGenerating(false);
    }
  };

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats: BlogStats = {
    totalPosts: posts.length,
    totalViews: posts.length * 125, // Mocked
    categoriesCount: new Set(posts.map(p => p.category)).size,
    draftsCount: posts.filter(p => p.isDraft).length
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent cursor-pointer" onClick={() => setView('home')}>
              مدونتي
            </h1>
            <div className="hidden md:flex gap-4">
              <button onClick={() => setView('home')} className={`text-sm font-bold ${view === 'home' ? 'text-indigo-600' : 'text-slate-600 dark:text-slate-300'}`}>الرئيسية</button>
              <button onClick={() => setView('admin')} className={`text-sm font-bold ${view === 'admin' ? 'text-indigo-600' : 'text-slate-600 dark:text-slate-300'}`}>لوحة التحكم</button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button 
              onClick={() => setView('admin')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-indigo-600/20"
            >
              كتابة مقال
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {view === 'home' && (
          <div className="animate-fade-in">
            {/* Hero Section */}
            <div className="mb-12 text-center">
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">اكتشف أحدث المقالات</h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">مدونة تقنية متخصصة تقدم لك كل ما هو جديد في عالم البرمجة، التصميم، والذكاء الاصطناعي بأسلوب مبسط ومحترف.</p>
              
              <div className="mt-8 relative max-w-xl mx-auto">
                <input 
                  type="text"
                  placeholder="ابحث عن مقال أو تصنيف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 rounded-2xl border-2 border-transparent bg-white dark:bg-slate-800 focus:border-indigo-500 shadow-xl dark:shadow-none dark:border-slate-700 outline-none transition-all dark:text-white"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
              </div>
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map(post => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  onClick={(p) => {
                    setSelectedPost(p);
                    setView('post');
                  }} 
                />
              ))}
              {filteredPosts.length === 0 && (
                <div className="col-span-full text-center py-20">
                  <div className="text-6xl mb-4">📭</div>
                  <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">لا توجد نتائج لمطابقة بحثك</h3>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'post' && selectedPost && (
          <div className="max-w-3xl mx-auto animate-slide-up">
            <button 
              onClick={() => setView('home')}
              className="mb-6 flex items-center gap-2 text-indigo-600 font-bold hover:underline"
            >
              ← العودة للرئيسية
            </button>
            <img 
              src={selectedPost.imageUrl} 
              alt={selectedPost.title} 
              className="w-full h-80 object-cover rounded-3xl shadow-2xl mb-8"
            />
            <div className="flex items-center gap-4 mb-4">
              <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-sm font-bold">
                {selectedPost.category}
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-sm">
                تم النشر في {selectedPost.date}
              </span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
              {selectedPost.title}
            </h1>
            <div className="prose prose-lg dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed space-y-4">
              {selectedPost.content.split('\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
            
            <div className="mt-12 p-8 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-3xl font-bold">
                {selectedPost.author[0]}
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">{selectedPost.author}</h4>
                <p className="text-slate-600 dark:text-slate-400">كاتب ومؤلف محتوى متخصص في التقنيات الحديثة وتحليل البيانات.</p>
              </div>
            </div>
          </div>
        )}

        {view === 'admin' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Stats */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <h3 className="text-slate-500 dark:text-slate-400 text-sm mb-4">إحصائيات المدونة</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="dark:text-white">المقالات</span>
                    <span className="font-bold text-indigo-600">{stats.totalPosts}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="dark:text-white">المشاهدات</span>
                    <span className="font-bold text-green-600">{stats.totalViews}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="dark:text-white">التصنيفات</span>
                    <span className="font-bold text-purple-600">{stats.categoriesCount}</span>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-600/30">
                <p className="text-xs opacity-80 mb-2">نصيحة ذكية</p>
                <p className="text-sm font-medium">استخدم زر "سحر الذكاء الاصطناعي" لتوليد محتوى احترافي بضغطة واحدة!</p>
              </div>
            </div>

            {/* Main Form */}
            <div className="lg:col-span-3 bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">إنشاء مقال جديد</h2>
                <button 
                  onClick={handleAiMagic}
                  disabled={isAiGenerating}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    isAiGenerating 
                      ? 'bg-slate-100 text-slate-400' 
                      : 'bg-gradient-to-l from-indigo-600 to-purple-600 text-white hover:scale-105 shadow-lg shadow-purple-600/20'
                  }`}
                >
                  {isAiGenerating ? '⏳ جاري التوليد...' : '✨ سحر الذكاء الاصطناعي'}
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">عنوان المقال</label>
                    <input 
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="ماذا تريد أن تكتب اليوم؟"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">التصنيف</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">الملخص</label>
                  <textarea 
                    required
                    rows={2}
                    value={formData.summary}
                    onChange={(e) => setFormData({...formData, summary: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="اكتب ملخصاً جذاباً للمقال..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">محتوى المقال</label>
                  <textarea 
                    required
                    rows={8}
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-serif"
                    placeholder="ابدأ بكتابة إبداعك هنا..."
                  />
                </div>

                <div className="pt-4 flex items-center gap-4">
                  <button 
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-xl shadow-indigo-600/20 transition-all"
                  >
                    نشر المقال الآن
                  </button>
                  <button 
                    type="button"
                    onClick={() => setView('home')}
                    className="px-8 py-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-200 dark:border-slate-700 py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-slate-500 dark:text-slate-400">
          <div className="text-center md:text-right">
            <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2">مدونتي</h4>
            <p className="text-sm">جميع الحقوق محفوظة © 2024</p>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-indigo-600">تويتر</a>
            <a href="#" className="hover:text-indigo-600">لينكد إن</a>
            <a href="#" className="hover:text-indigo-600">فيسبوك</a>
          </div>
        </div>
      </footer>
      
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default App;
