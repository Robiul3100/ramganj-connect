import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Brain, Clock, Trophy, ChevronRight, Check, X, Award,
  RotateCcw, Home, Medal, User, Phone, Sparkles, AlertCircle
} from "lucide-react";
import PageHeader from "@/components/PageHeader";

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  duration_seconds: number;
  pass_percentage: number;
  thumbnail_url: string | null;
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string | null;
  points: number;
}

interface LeaderboardEntry {
  player_name: string;
  score: number;
  percentage: number;
  time_taken_seconds: number;
  created_at: string;
}

type Stage = "intro" | "playing" | "finished";

const QuizPlay = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState<Stage>("intro");
  const [playerName, setPlayerName] = useState("");
  const [playerPhone, setPlayerPhone] = useState("");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const { data: quizData } = await (supabase.from as any)("quizzes").select("*").eq("id", id).maybeSingle();
      if (!quizData) { toast({ title: "কুইজ পাওয়া যায়নি", variant: "destructive" }); navigate("/quiz"); return; }
      const { data: qData } = await (supabase.from as any)("quiz_questions")
        .select("*").eq("quiz_id", id).order("sort_order");
      setQuiz(quizData);
      setQuestions((qData || []).map((q: any) => ({ ...q, options: Array.isArray(q.options) ? q.options : [] })));
      setTimeLeft(quizData.duration_seconds);
      setLoading(false);
    };
    load();
  }, [id, navigate]);

  // Timer
  useEffect(() => {
    if (stage !== "playing") return;
    if (timeLeft <= 0) { finishQuiz(); return; }
    const t = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, stage]);

  const startQuiz = () => {
    if (!playerName.trim()) { toast({ title: "নাম দিন", variant: "destructive" }); return; }
    if (questions.length === 0) { toast({ title: "এই কুইজে কোন প্রশ্ন নেই", variant: "destructive" }); return; }
    setStage("playing");
    setStartTime(Date.now());
    setCurrentIdx(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowFeedback(false);
  };

  const handleSelect = (idx: number) => {
    if (showFeedback) return;
    setSelectedAnswer(idx);
    setShowFeedback(true);
    navigator.vibrate?.(30);
  };

  const handleNext = () => {
    const newAnswers = [...answers, selectedAnswer ?? -1];
    setAnswers(newAnswers);
    if (currentIdx + 1 >= questions.length) {
      finishQuiz(newAnswers);
    } else {
      setCurrentIdx(currentIdx + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
  };

  const finishQuiz = useCallback(async (finalAnswers?: number[]) => {
    const ans = finalAnswers || answers;
    const score = ans.reduce((sum, a, i) => sum + (a === questions[i]?.correct_answer ? (questions[i]?.points || 1) : 0), 0);
    const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);
    const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const passed = quiz ? percentage >= quiz.pass_percentage : false;

    if (quiz) {
      await (supabase.from as any)("quiz_attempts").insert({
        quiz_id: quiz.id, player_name: playerName, player_phone: playerPhone || null,
        score, total_questions: questions.length, percentage: percentage.toFixed(2),
        time_taken_seconds: timeTaken, passed,
      });
      await supabase.rpc("increment_quiz_attempt" as any, { qid: quiz.id });
    }
    setStage("finished");
    fetchLeaderboard();
  }, [answers, questions, startTime, quiz, playerName, playerPhone]);

  const fetchLeaderboard = async () => {
    if (!id) return;
    const { data } = await (supabase.from as any)("quiz_attempts")
      .select("player_name, score, percentage, time_taken_seconds, created_at")
      .eq("quiz_id", id)
      .order("score", { ascending: false })
      .order("time_taken_seconds", { ascending: true })
      .limit(10);
    setLeaderboard((data as LeaderboardEntry[]) || []);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-background max-w-4xl mx-auto">
        <PageHeader title="কুইজ লোড হচ্ছে..." color="var(--gradient-primary)" />
        <div className="p-4 space-y-3">
          <div className="h-32 bg-muted rounded-2xl animate-pulse" />
          <div className="h-12 bg-muted rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  // ============ INTRO STAGE ============
  if (stage === "intro") {
    return (
      <div className="min-h-screen bg-background max-w-4xl mx-auto pb-8">
        <PageHeader title={quiz.title} color="var(--gradient-primary)" />
        <div className="p-4 space-y-4">
          {quiz.thumbnail_url && (
            <div className="aspect-video rounded-2xl overflow-hidden border border-border/60">
              <img src={quiz.thumbnail_url} alt={quiz.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="bg-gradient-to-br from-primary/10 to-transparent rounded-2xl p-5 border border-primary/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="font-extrabold text-lg text-foreground">{quiz.title}</h2>
                {quiz.description && <p className="text-xs text-muted-foreground mt-0.5">{quiz.description}</p>}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="bg-card/70 rounded-xl p-2.5 text-center border border-border/40">
                <Clock className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-sm font-bold text-foreground">{Math.round(quiz.duration_seconds / 60)} মি</p>
                <p className="text-[9px] text-muted-foreground">সময়</p>
              </div>
              <div className="bg-card/70 rounded-xl p-2.5 text-center border border-border/40">
                <Brain className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-sm font-bold text-foreground">{questions.length}</p>
                <p className="text-[9px] text-muted-foreground">প্রশ্ন</p>
              </div>
              <div className="bg-card/70 rounded-xl p-2.5 text-center border border-border/40">
                <Award className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-sm font-bold text-foreground">{quiz.pass_percentage}%</p>
                <p className="text-[9px] text-muted-foreground">পাস</p>
              </div>
            </div>
          </div>

          {/* Player info */}
          <div className="bg-card border border-border/60 rounded-2xl p-4 space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> আপনার তথ্য দিন
            </h3>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">নাম *</label>
              <input
                value={playerName} onChange={e => setPlayerName(e.target.value)}
                placeholder="আপনার নাম"
                className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none focus:border-primary/40 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">ফোন (ঐচ্ছিক)</label>
              <input
                value={playerPhone} onChange={e => setPlayerPhone(e.target.value)}
                placeholder="০১XXXXXXXXX"
                className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none focus:border-primary/40 transition-all"
              />
            </div>
          </div>

          <button
            onClick={startQuiz}
            disabled={questions.length === 0}
            className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-primary/20"
          >
            <Sparkles className="w-5 h-5" /> কুইজ শুরু করুন
          </button>

          {questions.length === 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-300">এই কুইজে এখনো কোন প্রশ্ন যোগ করা হয়নি।</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============ PLAYING STAGE ============
  if (stage === "playing") {
    const q = questions[currentIdx];
    const progress = ((currentIdx + 1) / questions.length) * 100;
    const isCorrect = selectedAnswer === q.correct_answer;
    const timeWarning = timeLeft <= 10;

    return (
      <div className="min-h-screen bg-background max-w-4xl mx-auto pb-8">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-card/85 backdrop-blur-2xl border-b border-border/40">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="text-xs">
              <span className="font-bold text-foreground">{currentIdx + 1}</span>
              <span className="text-muted-foreground"> / {questions.length}</span>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs ${
              timeWarning ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 animate-pulse" : "bg-primary/10 text-primary"
            }`}>
              <Clock className="w-3.5 h-3.5" /> {formatTime(timeLeft)}
            </div>
          </div>
          <div className="h-1 bg-muted/40 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Question */}
          <div className="bg-card border border-border/60 rounded-2xl p-5">
            <div className="flex items-start gap-2 mb-3">
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg shrink-0">
                প্রশ্ন {currentIdx + 1}
              </span>
              <span className="text-[10px] text-muted-foreground bg-muted/40 px-2 py-1 rounded-lg">
                {q.points} পয়েন্ট
              </span>
            </div>
            <h2 className="text-base font-bold text-foreground leading-relaxed">{q.question}</h2>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {q.options.map((opt, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrectAns = idx === q.correct_answer;
              let style = "bg-card border-border/60 hover:border-primary/40";
              if (showFeedback) {
                if (isCorrectAns) style = "bg-emerald-500/10 border-emerald-500/40";
                else if (isSelected) style = "bg-rose-500/10 border-rose-500/40";
                else style = "bg-card border-border/40 opacity-60";
              } else if (isSelected) {
                style = "bg-primary/10 border-primary/50";
              }
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={showFeedback}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${style}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                    showFeedback && isCorrectAns ? "bg-emerald-500 text-white"
                      : showFeedback && isSelected ? "bg-rose-500 text-white"
                      : isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {showFeedback && isCorrectAns ? <Check className="w-4 h-4" /> :
                     showFeedback && isSelected ? <X className="w-4 h-4" /> :
                     String.fromCharCode(0x0995 + idx)}
                  </div>
                  <span className="flex-1 text-sm font-medium text-foreground">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div className={`rounded-xl p-3 border ${
              isCorrect ? "bg-emerald-500/10 border-emerald-500/30" : "bg-rose-500/10 border-rose-500/30"
            }`}>
              <p className={`text-xs font-bold flex items-center gap-1.5 ${
                isCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              }`}>
                {isCorrect ? <><Check className="w-3.5 h-3.5" /> সঠিক উত্তর!</> : <><X className="w-3.5 h-3.5" /> ভুল উত্তর</>}
              </p>
              {q.explanation && <p className="text-xs text-muted-foreground mt-1">{q.explanation}</p>}
            </div>
          )}

          {showFeedback && (
            <button
              onClick={handleNext}
              className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              {currentIdx + 1 >= questions.length ? "ফলাফল দেখুন" : "পরের প্রশ্ন"} <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // ============ FINISHED STAGE ============
  const score = answers.reduce((sum, a, i) => sum + (a === questions[i]?.correct_answer ? (questions[i]?.points || 1) : 0), 0);
  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);
  const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
  const passed = percentage >= quiz.pass_percentage;

  return (
    <div className="min-h-screen bg-background max-w-4xl mx-auto pb-8">
      <PageHeader title="কুইজ সম্পন্ন" color="var(--gradient-primary)" />
      <div className="p-4 space-y-4">
        {/* Result */}
        <div className={`rounded-2xl p-6 text-center border-2 ${
          passed ? "bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 border-emerald-500/30"
                 : "bg-gradient-to-br from-amber-500/15 to-amber-500/5 border-amber-500/30"
        }`}>
          <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
            passed ? "bg-emerald-500/20" : "bg-amber-500/20"
          }`}>
            {passed ? <Trophy className="w-8 h-8 text-emerald-500" /> : <Award className="w-8 h-8 text-amber-500" />}
          </div>
          <h2 className="text-xl font-extrabold text-foreground mt-3">
            {passed ? "অভিনন্দন! 🎉" : "চেষ্টা ভালো ছিল!"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{playerName}</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="bg-card/70 rounded-xl p-3 border border-border/40">
              <p className="text-2xl font-extrabold text-primary">{score}</p>
              <p className="text-[10px] text-muted-foreground font-medium">স্কোর</p>
            </div>
            <div className="bg-card/70 rounded-xl p-3 border border-border/40">
              <p className="text-2xl font-extrabold text-foreground">{percentage.toFixed(0)}%</p>
              <p className="text-[10px] text-muted-foreground font-medium">শতাংশ</p>
            </div>
            <div className="bg-card/70 rounded-xl p-3 border border-border/40">
              <p className="text-2xl font-extrabold text-foreground">{score}/{totalPoints}</p>
              <p className="text-[10px] text-muted-foreground font-medium">পয়েন্ট</p>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-card border border-border/60 rounded-2xl p-4">
          <h3 className="font-bold text-sm flex items-center gap-2 mb-3">
            <Medal className="w-4 h-4 text-amber-500" /> লিডারবোর্ড (টপ ১০)
          </h3>
          <div className="space-y-1.5">
            {leaderboard.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">কোন ফলাফল নেই</p>
            ) : leaderboard.map((entry, i) => (
              <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl ${
                entry.player_name === playerName ? "bg-primary/10 border border-primary/30" : "bg-muted/40"
              }`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                  i === 0 ? "bg-amber-500 text-white" :
                  i === 1 ? "bg-slate-400 text-white" :
                  i === 2 ? "bg-orange-600 text-white" : "bg-muted text-muted-foreground"
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{entry.player_name}</p>
                  <p className="text-[10px] text-muted-foreground">⏱ {formatTime(entry.time_taken_seconds)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-primary">{entry.score}</p>
                  <p className="text-[10px] text-muted-foreground">{Number(entry.percentage).toFixed(0)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => { setStage("intro"); setAnswers([]); setCurrentIdx(0); setSelectedAnswer(null); setShowFeedback(false); setTimeLeft(quiz.duration_seconds); }}
            className="py-3 rounded-xl bg-card border border-border/60 font-bold text-sm flex items-center justify-center gap-2 hover:bg-muted/60 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> আবার দিন
          </button>
          <button
            onClick={() => navigate("/quiz")}
            className="py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Home className="w-4 h-4" /> অন্য কুইজ
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizPlay;
