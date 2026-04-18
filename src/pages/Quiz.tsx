import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Clock, Trophy, Search, Sparkles, Play, Users, Filter } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: string;
  thumbnail_url: string | null;
  duration_seconds: number;
  pass_percentage: number;
  is_featured: boolean;
  attempt_count: number;
  question_count?: number;
}

const difficultyConfig: Record<string, { label: string; color: string; bg: string }> = {
  easy: { label: "সহজ", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
  medium: { label: "মাঝারি", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
  hard: { label: "কঠিন", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/10" },
};

const QuizCardSkeleton = () => (
  <div className="bg-card border border-border/60 rounded-2xl p-4 animate-pulse">
    <div className="flex gap-3">
      <div className="w-16 h-16 rounded-xl bg-muted shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-muted rounded w-2/3" />
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="h-3 bg-muted rounded w-1/3" />
      </div>
    </div>
  </div>
);

const QuizCard = ({ quiz, onPlay }: { quiz: Quiz; onPlay: () => void }) => {
  const diff = difficultyConfig[quiz.difficulty] || difficultyConfig.easy;
  return (
    <button
      onClick={onPlay}
      className="w-full text-left bg-card border-l-[3px] border-l-primary border-y border-r border-border/60 rounded-2xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all group"
    >
      <div className="flex gap-3">
        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-border/40">
          {quiz.thumbnail_url ? (
            <img src={quiz.thumbnail_url} alt={quiz.title} className="w-full h-full object-cover" />
          ) : (
            <Brain className="w-7 h-7 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 justify-between">
            <h3 className="font-bold text-sm text-foreground line-clamp-2 leading-snug">{quiz.title}</h3>
            {quiz.is_featured && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold shrink-0 flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" /> ফিচার্ড
              </span>
            )}
          </div>
          {quiz.description && (
            <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">{quiz.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${diff.bg} ${diff.color}`}>
              {diff.label}
            </span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" /> {Math.round(quiz.duration_seconds / 60)} মিনিট
            </span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Brain className="w-2.5 h-2.5" /> {quiz.question_count || 0} প্রশ্ন
            </span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Users className="w-2.5 h-2.5" /> {quiz.attempt_count}
            </span>
          </div>
        </div>
        <div className="self-center w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
          <Play className="w-4 h-4 fill-current" />
        </div>
      </div>
    </button>
  );
};

const Quiz = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");

  const fetchQuizzes = async () => {
    setLoading(true);
    const { data: quizList } = await (supabase.from as any)("quizzes")
      .select("*")
      .eq("is_active", true)
      .order("is_featured", { ascending: false })
      .order("sort_order");

    if (quizList && quizList.length > 0) {
      const ids = quizList.map((q: Quiz) => q.id);
      const { data: questions } = await (supabase.from as any)("quiz_questions")
        .select("quiz_id")
        .in("quiz_id", ids);

      const counts: Record<string, number> = {};
      (questions || []).forEach((q: any) => {
        counts[q.quiz_id] = (counts[q.quiz_id] || 0) + 1;
      });

      setQuizzes(quizList.map((q: Quiz) => ({ ...q, question_count: counts[q.id] || 0 })));
    } else {
      setQuizzes([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuizzes();
    const ch = supabase
      .channel("quizzes_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "quizzes" }, fetchQuizzes)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const filtered = quizzes.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(search.toLowerCase()) ||
      (q.description || "").toLowerCase().includes(search.toLowerCase());
    const matchesDiff = filterDifficulty === "all" || q.difficulty === filterDifficulty;
    return matchesSearch && matchesDiff;
  });

  const totalAttempts = quizzes.reduce((sum, q) => sum + q.attempt_count, 0);

  return (
    <div className="min-h-screen bg-background max-w-4xl mx-auto pb-24">
      <PageHeader title="কুইজ ও প্রশ্নোত্তর" color="var(--gradient-primary)" />

      {/* Hero Stats */}
      <div className="px-4 pt-4">
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl p-4 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-foreground">আপনার জ্ঞান যাচাই করুন</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                বিভিন্ন বিষয়ে কুইজ দিয়ে নিজেকে চ্যালেঞ্জ করুন
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="bg-card/60 backdrop-blur rounded-xl p-2.5 text-center border border-border/40">
              <p className="text-base font-extrabold text-primary">{quizzes.length}</p>
              <p className="text-[9px] text-muted-foreground font-medium">কুইজ</p>
            </div>
            <div className="bg-card/60 backdrop-blur rounded-xl p-2.5 text-center border border-border/40">
              <p className="text-base font-extrabold text-emerald-500">{totalAttempts}</p>
              <p className="text-[9px] text-muted-foreground font-medium">অংশগ্রহণ</p>
            </div>
            <div className="bg-card/60 backdrop-blur rounded-xl p-2.5 text-center border border-border/40">
              <p className="text-base font-extrabold text-amber-500">{quizzes.filter(q => q.is_featured).length}</p>
              <p className="text-[9px] text-muted-foreground font-medium">ফিচার্ড</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="px-4 pt-4 space-y-2">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="কুইজ খুঁজুন..."
            className="w-full bg-card rounded-2xl pl-10 pr-4 py-3 text-sm outline-none border border-border/60 focus:border-primary/50 transition-all"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { id: "all", label: "সব", icon: Filter },
            { id: "easy", label: "সহজ" },
            { id: "medium", label: "মাঝারি" },
            { id: "hard", label: "কঠিন" },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterDifficulty(f.id)}
              className={`text-xs font-bold px-3.5 py-2 rounded-xl whitespace-nowrap transition-all shrink-0 ${
                filterDifficulty === f.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card border border-border/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quiz List */}
      <div className="px-4 pt-4 space-y-2.5">
        {loading ? (
          [1, 2, 3, 4].map(i => <QuizCardSkeleton key={i} />)
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="w-14 h-14 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground font-medium">এখনো কোন কুইজ নেই</p>
            <p className="text-[11px] text-muted-foreground mt-1">নতুন কুইজ শীঘ্রই যোগ করা হবে</p>
          </div>
        ) : (
          filtered.map(quiz => (
            <QuizCard key={quiz.id} quiz={quiz} onPlay={() => navigate(`/quiz/${quiz.id}`)} />
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Quiz;
