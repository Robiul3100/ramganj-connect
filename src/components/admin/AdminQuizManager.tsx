import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Plus, Trash2, Save, Edit3, Eye, EyeOff, RefreshCw, Search,
  Brain, Clock, Award, Sparkles, ChevronRight, Star, Upload, X, Check
} from "lucide-react";
import SwipeUpEditor from "./SwipeUpEditor";

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: string;
  thumbnail_url: string | null;
  duration_seconds: number;
  pass_percentage: number;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  attempt_count: number;
}

interface Question {
  id: string;
  quiz_id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string | null;
  points: number;
  sort_order: number;
}

interface Props {
  logActivity?: (action: string, tableName?: string, recordId?: string, details?: string) => Promise<void>;
}

const emptyQuiz = {
  title: "", description: "", category: "সাধারণ জ্ঞান", difficulty: "easy",
  thumbnail_url: "", duration_seconds: 60, pass_percentage: 50, sort_order: 0,
};

const emptyQuestion = {
  question: "", options: ["", "", "", ""], correct_answer: 0,
  explanation: "", points: 1, sort_order: 0,
};

const AdminQuizManager = ({ logActivity }: Props) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [quizForm, setQuizForm] = useState(emptyQuiz);
  const [questionForm, setQuestionForm] = useState(emptyQuestion);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchQuizzes = async () => {
    setLoading(true);
    const { data } = await (supabase.from as any)("quizzes").select("*").order("sort_order");
    setQuizzes(data || []);
    setLoading(false);
  };

  const fetchQuestions = async (quizId: string) => {
    const { data } = await (supabase.from as any)("quiz_questions")
      .select("*").eq("quiz_id", quizId).order("sort_order");
    setQuestions((data || []).map((q: any) => ({ ...q, options: Array.isArray(q.options) ? q.options : [] })));
  };

  useEffect(() => { fetchQuizzes(); }, []);
  useEffect(() => { if (selectedQuiz) fetchQuestions(selectedQuiz.id); }, [selectedQuiz]);

  const openAddQuiz = () => { setEditingQuiz(null); setQuizForm(emptyQuiz); setShowQuizForm(true); };
  const openEditQuiz = (q: Quiz) => {
    setEditingQuiz(q);
    setQuizForm({
      title: q.title, description: q.description || "", category: q.category,
      difficulty: q.difficulty, thumbnail_url: q.thumbnail_url || "",
      duration_seconds: q.duration_seconds, pass_percentage: q.pass_percentage, sort_order: q.sort_order,
    });
    setShowQuizForm(true);
  };

  const handleUploadThumb = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `quiz-thumbnails/${Date.now()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    if (error) { toast({ title: "আপলোড ব্যর্থ", variant: "destructive" }); setUploading(false); return; }
    const { data } = supabase.storage.from("media").getPublicUrl(path);
    setQuizForm(p => ({ ...p, thumbnail_url: data.publicUrl }));
    setUploading(false);
  };

  const saveQuiz = async () => {
    if (!quizForm.title.trim()) { toast({ title: "শিরোনাম দিন", variant: "destructive" }); return; }
    setSaving(true);
    const payload = { ...quizForm, thumbnail_url: quizForm.thumbnail_url || null };
    if (editingQuiz) {
      const { error } = await (supabase.from as any)("quizzes").update(payload).eq("id", editingQuiz.id);
      if (error) toast({ title: "আপডেট ব্যর্থ", variant: "destructive" });
      else { toast({ title: "✅ আপডেট হয়েছে" }); logActivity?.("updated", "quizzes", editingQuiz.id, quizForm.title); }
    } else {
      const { error } = await (supabase.from as any)("quizzes").insert({ ...payload, is_active: true });
      if (error) toast({ title: "এড ব্যর্থ", variant: "destructive" });
      else { toast({ title: "✅ কুইজ এড হয়েছে" }); logActivity?.("created", "quizzes", undefined, quizForm.title); }
    }
    setSaving(false); setShowQuizForm(false); fetchQuizzes();
  };

  const deleteQuiz = async (id: string, title: string) => {
    if (!confirm(`"${title}" মুছবেন? সব প্রশ্ন ও ফলাফল হারাবে।`)) return;
    const { error } = await (supabase.from as any)("quizzes").delete().eq("id", id);
    if (!error) { toast({ title: "🗑 মুছে ফেলা হয়েছে" }); fetchQuizzes(); if (selectedQuiz?.id === id) setSelectedQuiz(null); }
  };

  const toggleQuizField = async (id: string, field: "is_active" | "is_featured", current: boolean) => {
    await (supabase.from as any)("quizzes").update({ [field]: !current }).eq("id", id);
    setQuizzes(prev => prev.map(q => q.id === id ? { ...q, [field]: !current } : q));
    toast({ title: !current ? "✅ চালু" : "⏸ বন্ধ" });
  };

  const openAddQuestion = () => {
    setEditingQuestion(null);
    setQuestionForm({ ...emptyQuestion, sort_order: questions.length });
    setShowQuestionForm(true);
  };
  const openEditQuestion = (q: Question) => {
    setEditingQuestion(q);
    const opts = [...q.options];
    while (opts.length < 4) opts.push("");
    setQuestionForm({
      question: q.question, options: opts.slice(0, 4), correct_answer: q.correct_answer,
      explanation: q.explanation || "", points: q.points, sort_order: q.sort_order,
    });
    setShowQuestionForm(true);
  };

  const saveQuestion = async () => {
    if (!selectedQuiz) return;
    if (!questionForm.question.trim()) { toast({ title: "প্রশ্ন দিন", variant: "destructive" }); return; }
    const validOpts = questionForm.options.filter(o => o.trim());
    if (validOpts.length < 2) { toast({ title: "ন্যূনতম ২টি অপশন দিন", variant: "destructive" }); return; }
    if (questionForm.correct_answer >= validOpts.length) { toast({ title: "সঠিক উত্তর সিলেক্ট করুন", variant: "destructive" }); return; }

    setSaving(true);
    const payload = {
      quiz_id: selectedQuiz.id, question: questionForm.question,
      options: validOpts, correct_answer: questionForm.correct_answer,
      explanation: questionForm.explanation || null, points: questionForm.points, sort_order: questionForm.sort_order,
    };
    if (editingQuestion) {
      const { error } = await (supabase.from as any)("quiz_questions").update(payload).eq("id", editingQuestion.id);
      if (error) toast({ title: "আপডেট ব্যর্থ", variant: "destructive" });
      else toast({ title: "✅ প্রশ্ন আপডেট" });
    } else {
      const { error } = await (supabase.from as any)("quiz_questions").insert(payload);
      if (error) toast({ title: "এড ব্যর্থ", variant: "destructive" });
      else toast({ title: "✅ প্রশ্ন এড" });
    }
    setSaving(false); setShowQuestionForm(false); fetchQuestions(selectedQuiz.id);
  };

  const deleteQuestion = async (id: string) => {
    if (!confirm("প্রশ্নটি মুছবেন?")) return;
    await (supabase.from as any)("quiz_questions").delete().eq("id", id);
    toast({ title: "🗑 মুছে ফেলা হয়েছে" });
    if (selectedQuiz) fetchQuestions(selectedQuiz.id);
  };

  const filtered = quizzes.filter(q => q.title.toLowerCase().includes(search.toLowerCase()));

  // ============ QUIZ DETAIL VIEW ============
  if (selectedQuiz) {
    return (
      <div className="space-y-4">
        <button onClick={() => setSelectedQuiz(null)} className="text-xs text-primary font-semibold flex items-center gap-1">
          ← কুইজ লিস্টে ফিরুন
        </button>
        <div className="bg-gradient-to-br from-primary/10 to-transparent rounded-2xl p-4 border border-primary/20">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="font-extrabold text-foreground flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" /> {selectedQuiz.title}
              </h2>
              {selectedQuiz.description && <p className="text-xs text-muted-foreground mt-1">{selectedQuiz.description}</p>}
              <div className="flex gap-2 mt-2 text-[10px] text-muted-foreground">
                <span>⏱ {Math.round(selectedQuiz.duration_seconds / 60)} মিনিট</span>
                <span>🎯 {selectedQuiz.pass_percentage}% পাস</span>
                <span>📊 {selectedQuiz.attempt_count} অংশগ্রহণ</span>
              </div>
            </div>
            <button onClick={() => openEditQuiz(selectedQuiz)} className="w-8 h-8 rounded-lg bg-primary/10 hover:bg-primary/15 flex items-center justify-center shrink-0">
              <Edit3 className="w-3.5 h-3.5 text-primary" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm">প্রশ্ন তালিকা ({questions.length})</h3>
          <button onClick={openAddQuestion} className="h-9 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> প্রশ্ন এড
          </button>
        </div>

        <div className="space-y-2">
          {questions.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border/60 rounded-2xl">
              <Brain className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">কোন প্রশ্ন নেই</p>
            </div>
          ) : questions.map((q, idx) => (
            <div key={q.id} className="bg-card border border-border/60 rounded-2xl p-3.5">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground leading-snug">{q.question}</p>
                  <div className="mt-2 space-y-1">
                    {q.options.map((opt, i) => (
                      <div key={i} className={`text-[11px] px-2 py-1 rounded-lg flex items-center gap-1.5 ${
                        i === q.correct_answer ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold" : "text-muted-foreground"
                      }`}>
                        {i === q.correct_answer && <Check className="w-3 h-3" />}
                        {opt}
                      </div>
                    ))}
                  </div>
                  {q.explanation && <p className="text-[10px] text-muted-foreground mt-2 italic">💡 {q.explanation}</p>}
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <button onClick={() => openEditQuestion(q)} className="w-7 h-7 rounded-lg bg-primary/10 hover:bg-primary/15 flex items-center justify-center">
                    <Edit3 className="w-3 h-3 text-primary" />
                  </button>
                  <button onClick={() => deleteQuestion(q.id)} className="w-7 h-7 rounded-lg bg-destructive/10 hover:bg-destructive/15 flex items-center justify-center">
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Question Form */}
        <SwipeUpEditor
          open={showQuestionForm}
          onClose={() => setShowQuestionForm(false)}
          title={editingQuestion ? "প্রশ্ন এডিট" : "নতুন প্রশ্ন"}
          icon={<Brain className="w-4 h-4 text-white" />}
          headerGradient="from-primary to-primary/80"
        >
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">প্রশ্ন *</label>
            <textarea
              className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none min-h-[80px] focus:border-primary/40 resize-none"
              value={questionForm.question}
              onChange={e => setQuestionForm(p => ({ ...p, question: e.target.value }))}
              placeholder="আপনার প্রশ্ন লিখুন"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">অপশন (সঠিক উত্তরে ক্লিক করুন)</label>
            <div className="space-y-2">
              {questionForm.options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <button
                    onClick={() => setQuestionForm(p => ({ ...p, correct_answer: idx }))}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                      questionForm.correct_answer === idx ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {questionForm.correct_answer === idx ? <Check className="w-4 h-4" /> : String.fromCharCode(0x0995 + idx)}
                  </button>
                  <input
                    className="flex-1 bg-muted/50 rounded-xl px-4 py-2.5 text-sm border border-border outline-none focus:border-primary/40"
                    value={opt}
                    onChange={e => setQuestionForm(p => ({ ...p, options: p.options.map((o, i) => i === idx ? e.target.value : o) }))}
                    placeholder={`অপশন ${idx + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">ব্যাখ্যা (ঐচ্ছিক)</label>
            <input
              className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none focus:border-primary/40"
              value={questionForm.explanation}
              onChange={e => setQuestionForm(p => ({ ...p, explanation: e.target.value }))}
              placeholder="সঠিক উত্তরের ব্যাখ্যা"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">পয়েন্ট</label>
              <input
                type="number" min={1}
                className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none focus:border-primary/40"
                value={questionForm.points}
                onChange={e => setQuestionForm(p => ({ ...p, points: parseInt(e.target.value) || 1 }))}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">ক্রম</label>
              <input
                type="number"
                className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none focus:border-primary/40"
                value={questionForm.sort_order}
                onChange={e => setQuestionForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <button
            onClick={saveQuestion} disabled={saving}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? "সেভ হচ্ছে..." : editingQuestion ? "আপডেট" : "এড করুন"}
          </button>
        </SwipeUpEditor>
      </div>
    );
  }

  // ============ QUIZ LIST VIEW ============
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-card border border-border/60 rounded-2xl p-3.5 text-center">
          <p className="text-lg font-extrabold text-foreground">{quizzes.length}</p>
          <p className="text-[10px] text-muted-foreground font-medium">মোট কুইজ</p>
        </div>
        <div className="bg-card border border-border/60 rounded-2xl p-3.5 text-center">
          <p className="text-lg font-extrabold text-emerald-500">{quizzes.filter(q => q.is_active).length}</p>
          <p className="text-[10px] text-muted-foreground font-medium">সক্রিয়</p>
        </div>
        <div className="bg-card border border-border/60 rounded-2xl p-3.5 text-center">
          <p className="text-lg font-extrabold text-amber-500">{quizzes.reduce((s, q) => s + q.attempt_count, 0)}</p>
          <p className="text-[10px] text-muted-foreground font-medium">অংশগ্রহণ</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text" placeholder="কুইজ খুঁজুন..."
            className="w-full bg-card rounded-2xl pl-10 pr-4 py-3 text-sm outline-none border border-border/60 focus:border-primary/50"
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button onClick={fetchQuizzes} className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center shrink-0">
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
        <button onClick={openAddQuiz} className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center gap-1.5 shrink-0">
          <Plus className="w-4 h-4" /> যোগ
        </button>
      </div>

      <div className="space-y-2">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="bg-card border border-border/60 rounded-2xl p-4 h-20 animate-pulse" />)
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Brain className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">কোন কুইজ নেই</p>
          </div>
        ) : filtered.map(q => (
          <div key={q.id} className={`bg-card border rounded-2xl p-3.5 ${q.is_active ? "border-border/60" : "border-border/30 opacity-60"}`}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-border/40 overflow-hidden shrink-0">
                {q.thumbnail_url ? <img src={q.thumbnail_url} alt="" className="w-full h-full object-cover" /> : <Brain className="w-5 h-5 text-primary" />}
              </div>
              <button onClick={() => setSelectedQuiz(q)} className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-foreground truncate">{q.title}</h3>
                  {q.is_featured && <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />}
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                  <span>{q.category}</span>
                  <span>•</span>
                  <span>⏱ {Math.round(q.duration_seconds / 60)} মি</span>
                  <span>•</span>
                  <span>📊 {q.attempt_count}</span>
                </div>
              </button>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => toggleQuizField(q.id, "is_featured", q.is_featured)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${q.is_featured ? "bg-amber-500/15" : "bg-muted/60"}`}>
                  <Star className={`w-3.5 h-3.5 ${q.is_featured ? "text-amber-500 fill-amber-500" : "text-muted-foreground"}`} />
                </button>
                <button onClick={() => toggleQuizField(q.id, "is_active", q.is_active)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${q.is_active ? "bg-emerald-500/10" : "bg-muted/60"}`}>
                  {q.is_active ? <Eye className="w-3.5 h-3.5 text-emerald-500" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
                <button onClick={() => openEditQuiz(q)} className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Edit3 className="w-3.5 h-3.5 text-primary" />
                </button>
                <button onClick={() => deleteQuiz(q.id, q.title)} className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quiz Form */}
      <SwipeUpEditor
        open={showQuizForm}
        onClose={() => setShowQuizForm(false)}
        title={editingQuiz ? "কুইজ এডিট" : "নতুন কুইজ"}
        icon={<Brain className="w-4 h-4 text-white" />}
        headerGradient="from-primary to-primary/80"
      >
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">শিরোনাম *</label>
          <input
            className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none focus:border-primary/40"
            value={quizForm.title}
            onChange={e => setQuizForm(p => ({ ...p, title: e.target.value }))}
            placeholder="যেমনঃ বাংলাদেশের ইতিহাস"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">বিবরণ</label>
          <input
            className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none focus:border-primary/40"
            value={quizForm.description}
            onChange={e => setQuizForm(p => ({ ...p, description: e.target.value }))}
            placeholder="সংক্ষিপ্ত বিবরণ"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">ক্যাটাগরি</label>
            <input
              className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none focus:border-primary/40"
              value={quizForm.category}
              onChange={e => setQuizForm(p => ({ ...p, category: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">কঠিনতা</label>
            <select
              className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm border border-border outline-none focus:border-primary/40"
              value={quizForm.difficulty}
              onChange={e => setQuizForm(p => ({ ...p, difficulty: e.target.value }))}
            >
              <option value="easy">সহজ</option>
              <option value="medium">মাঝারি</option>
              <option value="hard">কঠিন</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">সময় (সেকেন্ড)</label>
            <input type="number"
              className="w-full bg-muted/50 rounded-xl px-3 py-3 text-sm border border-border outline-none"
              value={quizForm.duration_seconds}
              onChange={e => setQuizForm(p => ({ ...p, duration_seconds: parseInt(e.target.value) || 60 }))}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">পাস %</label>
            <input type="number"
              className="w-full bg-muted/50 rounded-xl px-3 py-3 text-sm border border-border outline-none"
              value={quizForm.pass_percentage}
              onChange={e => setQuizForm(p => ({ ...p, pass_percentage: parseInt(e.target.value) || 50 }))}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">ক্রম</label>
            <input type="number"
              className="w-full bg-muted/50 rounded-xl px-3 py-3 text-sm border border-border outline-none"
              value={quizForm.sort_order}
              onChange={e => setQuizForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">থাম্বনেইল</label>
          <div className="flex items-center gap-2">
            <label className="flex-1 inline-flex items-center justify-center gap-2 text-xs text-primary font-semibold cursor-pointer bg-primary/10 px-4 py-2.5 rounded-xl hover:bg-primary/15">
              <Upload className="w-4 h-4" /> {uploading ? "আপলোড..." : "আপলোড"}
              <input type="file" accept="image/*" className="hidden" onChange={handleUploadThumb} disabled={uploading} />
            </label>
            {quizForm.thumbnail_url && (
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-border shrink-0">
                <img src={quizForm.thumbnail_url} alt="" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        <button
          onClick={saveQuiz} disabled={saving}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {saving ? "সেভ হচ্ছে..." : editingQuiz ? "আপডেট" : "কুইজ এড"}
        </button>
      </SwipeUpEditor>
    </div>
  );
};

export default AdminQuizManager;
