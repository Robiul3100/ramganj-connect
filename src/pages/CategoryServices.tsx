import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Search, Phone, MapPin, Share2, MessageCircle, Star, GraduationCap, Building2, Briefcase, Clock, User, Award, Stethoscope, BadgeCheck, CalendarClock, Banknote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import SubmitFormDialog from "@/components/SubmitFormDialog";
import BottomNav from "@/components/BottomNav";

interface Service {
  id: string;
  title: string;
  description: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  area: string | null;
  image_url: string | null;
  is_featured: boolean;
  metadata: Record<string, any>;
  created_at: string;
  category_id: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

const categoryColors: Record<string, { gradient: string; accent: string; bg: string }> = {
  doctors: { gradient: "linear-gradient(135deg, hsl(185,60%,42%), hsl(195,65%,50%))", accent: "hsl(185,60%,42%)", bg: "hsl(185,60%,92%)" },
  hospitals: { gradient: "linear-gradient(135deg, hsl(150,60%,40%), hsl(160,55%,48%))", accent: "hsl(150,60%,40%)", bg: "hsl(150,60%,92%)" },
  pharmacy: { gradient: "linear-gradient(135deg, hsl(160,50%,45%), hsl(170,55%,50%))", accent: "hsl(160,50%,45%)", bg: "hsl(160,50%,92%)" },
  education: { gradient: "linear-gradient(135deg, hsl(120,45%,40%), hsl(140,50%,48%))", accent: "hsl(120,45%,40%)", bg: "hsl(120,45%,92%)" },
  shops: { gradient: "linear-gradient(135deg, hsl(330,55%,55%), hsl(340,60%,60%))", accent: "hsl(330,55%,55%)", bg: "hsl(330,55%,92%)" },
  marketplace: { gradient: "linear-gradient(135deg, hsl(160,50%,40%), hsl(180,60%,45%))", accent: "hsl(160,50%,40%)", bg: "hsl(160,50%,92%)" },
  jobs: { gradient: "linear-gradient(135deg, hsl(250,40%,50%), hsl(260,45%,55%))", accent: "hsl(250,40%,50%)", bg: "hsl(250,40%,92%)" },
  "lost-found": { gradient: "linear-gradient(135deg, hsl(0,60%,50%), hsl(15,65%,55%))", accent: "hsl(0,60%,50%)", bg: "hsl(0,60%,92%)" },
  events: { gradient: "linear-gradient(135deg, hsl(270,60%,55%), hsl(280,65%,60%))", accent: "hsl(270,60%,55%)", bg: "hsl(270,60%,92%)" },
  expatriate: { gradient: "linear-gradient(135deg, hsl(195,70%,50%), hsl(205,75%,55%))", accent: "hsl(195,70%,50%)", bg: "hsl(195,70%,92%)" },
  ambulance: { gradient: "linear-gradient(135deg, hsl(150,55%,45%), hsl(160,60%,50%))", accent: "hsl(150,55%,45%)", bg: "hsl(150,55%,92%)" },
  police: { gradient: "linear-gradient(135deg, hsl(265,50%,55%), hsl(275,55%,60%))", accent: "hsl(265,50%,55%)", bg: "hsl(265,50%,92%)" },
  fire: { gradient: "linear-gradient(135deg, hsl(15,80%,50%), hsl(25,85%,55%))", accent: "hsl(15,80%,50%)", bg: "hsl(15,80%,92%)" },
  transport: { gradient: "linear-gradient(135deg, hsl(220,20%,40%), hsl(230,25%,48%))", accent: "hsl(220,20%,40%)", bg: "hsl(220,20%,92%)" },
  electricity: { gradient: "linear-gradient(135deg, hsl(50,80%,45%), hsl(60,85%,50%))", accent: "hsl(50,80%,45%)", bg: "hsl(50,80%,92%)" },
  legal: { gradient: "linear-gradient(135deg, hsl(220,30%,45%), hsl(230,35%,50%))", accent: "hsl(220,30%,45%)", bg: "hsl(220,30%,92%)" },
  bank: { gradient: "linear-gradient(135deg, hsl(170,55%,40%), hsl(180,60%,48%))", accent: "hsl(170,55%,40%)", bg: "hsl(170,55%,92%)" },
  organizations: { gradient: "linear-gradient(135deg, hsl(210,50%,50%), hsl(220,55%,55%))", accent: "hsl(210,50%,50%)", bg: "hsl(210,50%,92%)" },
  tourism: { gradient: "linear-gradient(135deg, hsl(200,60%,50%), hsl(210,65%,55%))", accent: "hsl(200,60%,50%)", bg: "hsl(200,60%,92%)" },
  courier: { gradient: "linear-gradient(135deg, hsl(30,60%,50%), hsl(40,65%,55%))", accent: "hsl(30,60%,50%)", bg: "hsl(30,60%,92%)" },
  agriculture: { gradient: "linear-gradient(135deg, hsl(100,50%,42%), hsl(110,55%,48%))", accent: "hsl(100,50%,42%)", bg: "hsl(100,50%,92%)" },
  rent: { gradient: "linear-gradient(135deg, hsl(25,80%,50%), hsl(35,85%,55%))", accent: "hsl(25,80%,50%)", bg: "hsl(25,80%,92%)" },
  tuition: { gradient: "linear-gradient(135deg, hsl(170,50%,42%), hsl(180,55%,48%))", accent: "hsl(170,50%,42%)", bg: "hsl(170,50%,92%)" },
  food: { gradient: "linear-gradient(135deg, hsl(30,75%,50%), hsl(40,80%,55%))", accent: "hsl(30,75%,50%)", bg: "hsl(30,75%,92%)" },
  repair: { gradient: "linear-gradient(135deg, hsl(220,30%,45%), hsl(230,35%,50%))", accent: "hsl(220,30%,45%)", bg: "hsl(220,30%,92%)" },
  "deed-writer": { gradient: "linear-gradient(135deg, hsl(250,40%,50%), hsl(260,45%,55%))", accent: "hsl(250,40%,50%)", bg: "hsl(250,40%,92%)" },
  marriage: { gradient: "linear-gradient(135deg, hsl(340,70%,55%), hsl(350,75%,60%))", accent: "hsl(340,70%,55%)", bg: "hsl(340,70%,92%)" },
  diagnostic: { gradient: "linear-gradient(135deg, hsl(190,60%,45%), hsl(200,65%,50%))", accent: "hsl(190,60%,45%)", bg: "hsl(190,60%,92%)" },
  "car-rental": { gradient: "linear-gradient(135deg, hsl(160,55%,40%), hsl(170,60%,48%))", accent: "hsl(160,55%,40%)", bg: "hsl(160,55%,92%)" },
  municipal: { gradient: "linear-gradient(135deg, hsl(210,40%,50%), hsl(220,45%,55%))", accent: "hsl(210,40%,50%)", bg: "hsl(210,40%,92%)" },
  entrepreneur: { gradient: "linear-gradient(135deg, hsl(140,50%,42%), hsl(150,55%,48%))", accent: "hsl(140,50%,42%)", bg: "hsl(140,50%,92%)" },
  hotel: { gradient: "linear-gradient(135deg, hsl(35,70%,50%), hsl(45,75%,55%))", accent: "hsl(35,70%,50%)", bg: "hsl(35,70%,92%)" },
  restaurant: { gradient: "linear-gradient(135deg, hsl(15,70%,50%), hsl(25,75%,55%))", accent: "hsl(15,70%,50%)", bg: "hsl(15,70%,92%)" },
  video: { gradient: "linear-gradient(135deg, hsl(240,50%,55%), hsl(250,55%,60%))", accent: "hsl(240,50%,55%)", bg: "hsl(240,50%,92%)" },
  nursery: { gradient: "linear-gradient(135deg, hsl(130,50%,40%), hsl(140,55%,48%))", accent: "hsl(130,50%,40%)", bg: "hsl(130,50%,92%)" },
};

const defaultColor = { gradient: "var(--gradient-primary)", accent: "hsl(210,85%,55%)", bg: "hsl(210,85%,93%)" };

// Tag color palette for metadata badges
const tagColors = [
  { bg: "hsl(185,50%,92%)", text: "hsl(185,60%,30%)" },
  { bg: "hsl(340,50%,92%)", text: "hsl(340,60%,35%)" },
  { bg: "hsl(45,60%,90%)", text: "hsl(45,70%,30%)" },
  { bg: "hsl(270,45%,92%)", text: "hsl(270,50%,35%)" },
  { bg: "hsl(140,45%,90%)", text: "hsl(140,55%,30%)" },
  { bg: "hsl(210,50%,92%)", text: "hsl(210,60%,30%)" },
];

// ──── Category-specific form fields ────
const getCategoryFormFields = (slug: string) => {
  const baseFields = [
    { name: "title", label: "শিরোনাম / নাম", required: true },
    { name: "description", label: "বিবরণ", type: "textarea" as const },
    { name: "phone", label: "ফোন নাম্বার", type: "tel" as const },
    { name: "whatsapp", label: "WhatsApp নাম্বার", type: "tel" as const },
    { name: "address", label: "ঠিকানা" },
    { name: "area", label: "এলাকা" },
    { name: "image_url", label: "ছবির লিংক (URL)", placeholder: "https://example.com/image.jpg" },
  ];

  switch (slug) {
    case "doctors":
      return [
        { name: "title", label: "ডাক্তারের নাম", required: true, placeholder: "যেমন: ডা. রবিউল ইসলাম" },
        { name: "degrees", label: "ডিগ্রি / যোগ্যতা (কমা দিয়ে আলাদা করুন)", placeholder: "এম,বি,বি,এস, এফ,সি,পি,এস" },
        { name: "specialty", label: "বিশেষত্ব", placeholder: "যেমন: নাক, কান, গলা বিশেষজ্ঞ" },
        { name: "hospital_name", label: "হাসপাতাল / চেম্বার", placeholder: "যেমন: রামগঞ্জ ফেমাস হাসপাতাল" },
        { name: "registration_no", label: "BMDC রেজিস্ট্রেশন নং", placeholder: "যেমন: A-12345" },
        { name: "experience", label: "অভিজ্ঞতা", placeholder: "যেমন: ১৫+ বছর" },
        { name: "chamber_time", label: "চেম্বার সময়", placeholder: "যেমন: বিকাল ৫টা - রাত ৯টা" },
        { name: "consultation_fee", label: "ভিজিট ফি", placeholder: "যেমন: ৫০০ টাকা" },
        { name: "description", label: "অতিরিক্ত তথ্য", type: "textarea" as const },
        { name: "phone", label: "ফোন নাম্বার", type: "tel" as const, required: true },
        { name: "whatsapp", label: "WhatsApp নাম্বার", type: "tel" as const },
        { name: "address", label: "ঠিকানা" },
        { name: "area", label: "এলাকা" },
        { name: "image_url", label: "ডাক্তারের ছবি (URL)", placeholder: "https://example.com/photo.jpg" },
      ];
    case "education":
      return [
        { name: "title", label: "প্রতিষ্ঠানের নাম", required: true },
        { name: "edu_type", label: "ধরন", type: "select" as const, options: ["স্কুল", "কলেজ", "মাদ্রাসা", "বিশ্ববিদ্যালয়", "কোচিং", "অন্যান্য"] },
        { name: "established_year", label: "প্রতিষ্ঠার সাল", placeholder: "যেমন: ১৯৯০" },
        { name: "principal_name", label: "প্রধান শিক্ষক / অধ্যক্ষের নাম" },
        { name: "description", label: "বিবরণ", type: "textarea" as const },
        { name: "phone", label: "ফোন নাম্বার", type: "tel" as const },
        { name: "whatsapp", label: "WhatsApp নাম্বার", type: "tel" as const },
        { name: "address", label: "ঠিকানা" },
        { name: "area", label: "এলাকা" },
        { name: "image_url", label: "ছবি (URL)", placeholder: "https://example.com/photo.jpg" },
      ];
    case "shops":
      return [
        { name: "title", label: "দোকানের নাম", required: true },
        { name: "shop_category", label: "দোকানের ধরন", placeholder: "যেমন: কাপড়, ইলেকট্রনিক্স" },
        { name: "owner_name", label: "মালিকের নাম" },
        { name: "description", label: "বিবরণ", type: "textarea" as const },
        { name: "phone", label: "ফোন নাম্বার", type: "tel" as const },
        { name: "whatsapp", label: "WhatsApp নাম্বার", type: "tel" as const },
        { name: "address", label: "ঠিকানা" },
        { name: "area", label: "এলাকা" },
        { name: "image_url", label: "ছবি (URL)", placeholder: "https://example.com/photo.jpg" },
      ];
    case "jobs":
      return [
        { name: "title", label: "পদের নাম", required: true },
        { name: "company", label: "প্রতিষ্ঠান / কোম্পানি", required: true },
        { name: "job_category", label: "চাকরির ধরন", type: "select" as const, options: ["সরকারি", "বেসরকারি", "পার্ট-টাইম", "ফ্রিল্যান্স"] },
        { name: "salary_range", label: "বেতন সীমা", placeholder: "যেমন: ১৫,০০০ - ২৫,০০০" },
        { name: "deadline", label: "আবেদনের শেষ তারিখ", type: "date" as const },
        { name: "description", label: "বিবরণ ও যোগ্যতা", type: "textarea" as const },
        { name: "phone", label: "যোগাযোগ নাম্বার", type: "tel" as const },
        { name: "whatsapp", label: "WhatsApp নাম্বার", type: "tel" as const },
        { name: "address", label: "কর্মস্থল" },
        { name: "area", label: "এলাকা" },
      ];
    default:
      return baseFields;
  }
};

// Build metadata from form data based on slug
const buildMetadata = (slug: string, data: Record<string, string>) => {
  const meta: Record<string, any> = {};
  switch (slug) {
    case "doctors":
      if (data.degrees) meta.degrees = data.degrees.split(",").map(d => d.trim()).filter(Boolean);
      if (data.specialty) meta.specialty = data.specialty;
      if (data.hospital_name) meta.hospital_name = data.hospital_name;
      if (data.registration_no) meta.registration_no = data.registration_no;
      if (data.experience) meta.experience = data.experience;
      if (data.chamber_time) meta.chamber_time = data.chamber_time;
      if (data.consultation_fee) meta.consultation_fee = data.consultation_fee;
      break;
    case "education":
      if (data.edu_type) meta.edu_category = data.edu_type;
      if (data.established_year) meta.established_year = data.established_year;
      if (data.principal_name) meta.principal_name = data.principal_name;
      break;
    case "shops":
      if (data.shop_category) meta.shop_category = data.shop_category;
      if (data.owner_name) meta.owner_name = data.owner_name;
      break;
    case "jobs":
      if (data.company) meta.company = data.company;
      if (data.job_category) meta.job_category = data.job_category;
      if (data.salary_range) meta.salary_range = data.salary_range;
      if (data.deadline) meta.deadline = data.deadline;
      break;
  }
  return meta;
};

// ──── Doctor Card (Modern Minimal Card) ────
const DoctorCard = ({ s, colors, onShare }: { s: Service; colors: { accent: string; bg: string; gradient: string }; onShare: () => void }) => {
  const m = s.metadata || {};
  const degrees: string[] = m.degrees || [];
  const specialty = m.specialty || "";
  const hospital = m.hospital_name || "";
  const regNo = m.registration_no || "";
  const experience = m.experience || "";
  const chamberTime = m.chamber_time || "";
  const fee = m.consultation_fee || "";

  const infoItems = [
    experience && { icon: Award, label: "অভিজ্ঞতা", value: experience },
    chamberTime && { icon: CalendarClock, label: "চেম্বার", value: chamberTime },
    fee && { icon: Banknote, label: "ভিজিট", value: fee },
    regNo && { icon: BadgeCheck, label: "BMDC", value: regNo },
  ].filter(Boolean) as { icon: any; label: string; value: string }[];

  return (
    <div className="relative rounded-2xl bg-card overflow-hidden border border-border/40 transition-all duration-300 hover:shadow-lg">
      {/* Accent top bar */}
      <div className="h-1.5 w-full" style={{ background: colors.gradient }} />

      {/* Featured ribbon */}
      {s.is_featured && (
        <div className="absolute top-3 right-0 flex items-center gap-1 px-2.5 py-1 rounded-l-full shadow-sm"
          style={{ background: "hsl(45,90%,55%)" }}>
          <Star className="w-3 h-3 text-white fill-white" />
          <span className="text-[9px] font-extrabold text-white tracking-wide">ফিচার্ড</span>
        </div>
      )}

      {/* Main content */}
      <div className="p-4 sm:p-5">
        {/* Profile row */}
        <div className="flex gap-3.5">
          {/* Circular avatar */}
          <div className="relative shrink-0">
            {s.image_url ? (
              <img
                src={s.image_url}
                alt={s.title}
                className="w-16 h-16 sm:w-[76px] sm:h-[76px] rounded-full object-cover ring-2 ring-offset-2 ring-offset-card"
                style={{ ringColor: `${colors.accent}40` } as any}
              />
            ) : (
              <div
                className="w-16 h-16 sm:w-[76px] sm:h-[76px] rounded-full flex items-center justify-center ring-2 ring-offset-2 ring-offset-card"
                style={{ background: colors.bg, color: colors.accent }}
              >
                <Stethoscope className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-card" />
          </div>

          {/* Name block */}
          <div className="flex-1 min-w-0 py-0.5">
            <h3 className="font-extrabold text-foreground text-base sm:text-[17px] leading-snug line-clamp-2">{s.title}</h3>
            {specialty && (
              <p className="text-xs sm:text-[13px] font-medium mt-0.5" style={{ color: colors.accent }}>{specialty}</p>
            )}
            {regNo && (
              <div className="flex items-center gap-1 mt-1.5">
                <BadgeCheck className="w-3.5 h-3.5" style={{ color: colors.accent }} />
                <span className="text-[10px] font-semibold" style={{ color: colors.accent }}>যাচাইকৃত চিকিৎসক</span>
              </div>
            )}
          </div>
        </div>

        {/* Degree tags */}
        {degrees.length > 0 && (
          <div className="flex gap-1.5 mt-3 flex-wrap">
            {degrees.map((deg, i) => (
              <span
                key={i}
                className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                style={{
                  background: tagColors[i % tagColors.length].bg,
                  color: tagColors[i % tagColors.length].text,
                }}
              >
                {deg}
              </span>
            ))}
          </div>
        )}

        {/* Info grid */}
        {infoItems.length > 0 && (
          <div className={`grid gap-2 mt-3.5 ${infoItems.length <= 2 ? 'grid-cols-2' : infoItems.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
            {infoItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-center gap-2 rounded-xl px-3 py-2.5 bg-muted/50">
                  <Icon className="w-4 h-4 shrink-0" style={{ color: colors.accent }} />
                  <div className="min-w-0">
                    <p className="text-[9px] text-muted-foreground leading-none">{item.label}</p>
                    <p className="text-[11px] font-bold text-foreground leading-tight mt-0.5 truncate">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Hospital & Address */}
        {(hospital || s.address) && (
          <div className="mt-3 space-y-2 border-t border-border/30 pt-3">
            {hospital && (
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 shrink-0" style={{ color: colors.accent }} />
                <p className="text-xs font-semibold text-foreground line-clamp-1">{hospital}</p>
              </div>
            )}
            {s.address && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0 text-muted-foreground" />
                <p className="text-[11px] text-muted-foreground line-clamp-1">{s.address}{s.area ? `, ${s.area}` : ""}</p>
              </div>
            )}
          </div>
        )}

        {s.description && (
          <p className="text-[11px] text-muted-foreground line-clamp-2 mt-2.5 leading-relaxed">{s.description}</p>
        )}
      </div>

      {/* CTA area */}
      <div className="px-4 sm:px-5 pb-4 sm:pb-5 flex gap-2">
        {s.phone && (
          <a
            href={`tel:${s.phone}`}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 text-white active:scale-[0.97] transition-transform"
            style={{ background: colors.gradient }}
          >
            <Phone className="w-4 h-4" /> কল করুন
          </a>
        )}
        {s.whatsapp && (
          <a
            href={`https://wa.me/88${s.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 text-white active:scale-[0.97] transition-transform"
            style={{ background: "linear-gradient(135deg, hsl(142,70%,38%), hsl(152,65%,45%))" }}
          >
            <MessageCircle className="w-4 h-4" /> হোয়াটসঅ্যাপ
          </a>
        )}
      </div>
    </div>
  );
};

// ──── Education Card ────
const EducationCard = ({ s, colors, onShare }: { s: Service; colors: { accent: string; bg: string; gradient: string }; onShare: () => void }) => {
  const m = s.metadata || {};
  return (
    <div className={`rounded-2xl overflow-hidden border transition-shadow hover:shadow-lg ${s.is_featured ? "ring-2 ring-amber-400/40" : ""}`} style={{ borderColor: colors.accent + "55" }}>
      {s.is_featured && (
        <div className="flex items-center gap-1 px-4 pt-3 pb-1">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span className="text-xs font-bold text-amber-600">ফিচার্ড</span>
        </div>
      )}
      <div className="p-4 flex items-start gap-3.5" style={{ background: `linear-gradient(135deg, ${colors.bg}, hsl(0,0%,100%))` }}>
        {s.image_url ? (
          <img src={s.image_url} alt={s.title} className="w-16 h-16 rounded-xl object-cover shrink-0 border shadow-sm" style={{ borderColor: colors.accent + "40" }} />
        ) : (
          <div className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0 shadow-sm" style={{ background: colors.bg, color: colors.accent }}>
            <GraduationCap className="w-7 h-7" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-foreground text-[15px] leading-tight">{s.title}</h3>
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {m.edu_category && <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ background: tagColors[0].bg, color: tagColors[0].text }}>{m.edu_category}</span>}
            {m.established_year && <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ background: tagColors[1].bg, color: tagColors[1].text }}>প্রতিষ্ঠা: {m.established_year}</span>}
          </div>
        </div>
      </div>
      <div className="px-4 py-3 border-t border-border/50 bg-card">
        {m.principal_name && (
          <p className="text-xs text-foreground font-semibold flex items-center gap-1.5 mb-1">
            <User className="w-3 h-3 shrink-0" style={{ color: colors.accent }} /> {m.principal_name}
          </p>
        )}
        {s.address && (
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <MapPin className="w-3 h-3 shrink-0" /> {s.address}{s.area ? `, ${s.area}` : ""}
          </p>
        )}
        {s.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{s.description}</p>}
      </div>
      <div className="flex gap-0 border-t border-border/30">
        {s.phone && (
          <a href={`tel:${s.phone}`} className="flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 text-white" style={{ background: colors.gradient }}>
            <Phone className="w-4 h-4" /> কল করুন
          </a>
        )}
        {s.whatsapp && (
          <a href={`https://wa.me/88${s.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 text-white" style={{ background: "linear-gradient(135deg, hsl(140,70%,35%), hsl(160,75%,40%))" }}>
            <MessageCircle className="w-4 h-4" /> হোয়াটসঅ্যাপ
          </a>
        )}
        <button onClick={onShare} className="px-4 py-3 bg-muted text-muted-foreground flex items-center justify-center">
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ──── Job Card ────
const JobCard = ({ s, colors, onShare }: { s: Service; colors: { accent: string; bg: string; gradient: string }; onShare: () => void }) => {
  const m = s.metadata || {};
  return (
    <div className={`rounded-2xl overflow-hidden border transition-shadow hover:shadow-lg ${s.is_featured ? "ring-2 ring-amber-400/40" : ""}`} style={{ borderColor: colors.accent + "55" }}>
      {s.is_featured && (
        <div className="flex items-center gap-1 px-4 pt-3 pb-1">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span className="text-xs font-bold text-amber-600">ফিচার্ড</span>
        </div>
      )}
      <div className="p-4" style={{ background: `linear-gradient(135deg, ${colors.bg}, hsl(0,0%,100%))` }}>
        <h3 className="font-extrabold text-foreground text-[15px] leading-tight">{s.title}</h3>
        {m.company && (
          <p className="text-sm text-foreground font-semibold flex items-center gap-1.5 mt-1">
            <Briefcase className="w-3.5 h-3.5 shrink-0" style={{ color: colors.accent }} /> {m.company}
          </p>
        )}
        <div className="flex gap-1.5 mt-2 flex-wrap">
          {m.job_category && <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ background: tagColors[3].bg, color: tagColors[3].text }}>{m.job_category}</span>}
          {m.salary_range && <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ background: tagColors[4].bg, color: tagColors[4].text }}>💵 {m.salary_range}</span>}
          {m.deadline && <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ background: tagColors[1].bg, color: tagColors[1].text }}>⏰ {new Date(m.deadline).toLocaleDateString("bn-BD")}</span>}
        </div>
      </div>
      <div className="px-4 py-3 border-t border-border/50 bg-card">
        {s.address && (
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <MapPin className="w-3 h-3 shrink-0" /> {s.address}
          </p>
        )}
        {s.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-3">{s.description}</p>}
      </div>
      <div className="flex gap-0 border-t border-border/30">
        {s.phone && (
          <a href={`tel:${s.phone}`} className="flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 text-white" style={{ background: colors.gradient }}>
            <Phone className="w-4 h-4" /> যোগাযোগ
          </a>
        )}
        {s.whatsapp && (
          <a href={`https://wa.me/88${s.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 text-white" style={{ background: "linear-gradient(135deg, hsl(140,70%,35%), hsl(160,75%,40%))" }}>
            <MessageCircle className="w-4 h-4" /> হোয়াটসঅ্যাপ
          </a>
        )}
        <button onClick={onShare} className="px-4 py-3 bg-muted text-muted-foreground flex items-center justify-center">
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ──── Shop Card ────
const ShopCard = ({ s, colors, onShare }: { s: Service; colors: { accent: string; bg: string; gradient: string }; onShare: () => void }) => {
  const m = s.metadata || {};
  return (
    <div className={`rounded-2xl overflow-hidden border transition-shadow hover:shadow-lg ${s.is_featured ? "ring-2 ring-amber-400/40" : ""}`} style={{ borderColor: colors.accent + "55" }}>
      {s.is_featured && (
        <div className="flex items-center gap-1 px-4 pt-3 pb-1">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span className="text-xs font-bold text-amber-600">ফিচার্ড</span>
        </div>
      )}
      <div className="p-4 flex items-start gap-3.5" style={{ background: `linear-gradient(135deg, ${colors.bg}, hsl(0,0%,100%))` }}>
        {s.image_url ? (
          <img src={s.image_url} alt={s.title} className="w-16 h-16 rounded-xl object-cover shrink-0 border shadow-sm" style={{ borderColor: colors.accent + "40" }} />
        ) : (
          <div className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0 shadow-sm text-xl font-bold" style={{ background: colors.bg, color: colors.accent }}>
            {s.title.charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-foreground text-[15px] leading-tight">{s.title}</h3>
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {m.shop_category && <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ background: tagColors[0].bg, color: tagColors[0].text }}>{m.shop_category}</span>}
            {m.owner_name && <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ background: tagColors[2].bg, color: tagColors[2].text }}>👤 {m.owner_name}</span>}
          </div>
        </div>
      </div>
      <div className="px-4 py-3 border-t border-border/50 bg-card">
        {s.address && (
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <MapPin className="w-3 h-3 shrink-0" /> {s.address}{s.area ? `, ${s.area}` : ""}
          </p>
        )}
        {s.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{s.description}</p>}
      </div>
      <div className="flex gap-0 border-t border-border/30">
        {s.phone && (
          <a href={`tel:${s.phone}`} className="flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 text-white" style={{ background: colors.gradient }}>
            <Phone className="w-4 h-4" /> কল করুন
          </a>
        )}
        {s.whatsapp && (
          <a href={`https://wa.me/88${s.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 text-white" style={{ background: "linear-gradient(135deg, hsl(140,70%,35%), hsl(160,75%,40%))" }}>
            <MessageCircle className="w-4 h-4" /> হোয়াটসঅ্যাপ
          </a>
        )}
        <button onClick={onShare} className="px-4 py-3 bg-muted text-muted-foreground flex items-center justify-center">
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ──── Default Card (for other categories) ────
const DefaultCard = ({ s, colors, onShare }: { s: Service; colors: { accent: string; bg: string; gradient: string }; onShare: () => void }) => {
  const m = s.metadata || {};
  const metaParts: string[] = [];
  if (m.specialty) metaParts.push(m.specialty);
  if (m.shop_category) metaParts.push(m.shop_category);
  if (m.edu_category) metaParts.push(m.edu_category);
  if (m.price) metaParts.push(`💰 ${m.price}`);
  if (m.company) metaParts.push(`🏢 ${m.company}`);
  if (m.salary_range) metaParts.push(`💵 ${m.salary_range}`);
  if (m.country) metaParts.push(`🌍 ${m.country}`);
  if (m.type) metaParts.push(m.type === "lost" ? "🔴 হারিয়েছে" : "🟢 পাওয়া গেছে");
  if (m.event_date) metaParts.push(`📅 ${new Date(m.event_date).toLocaleDateString("bn-BD")}`);
  if (m.deadline) metaParts.push(`⏰ ${new Date(m.deadline).toLocaleDateString("bn-BD")}`);
  if (m.rent_amount) metaParts.push(`🏠 ${m.rent_amount}`);
  if (m.item_category) metaParts.push(m.item_category);
  if (m.event_category) metaParts.push(m.event_category);
  if (m.job_category) metaParts.push(m.job_category);
  if (m.expat_category) metaParts.push(m.expat_category);

  return (
    <div className={`glass-card p-4 border-l-4 transition-shadow hover:shadow-lg ${s.is_featured ? "ring-2 ring-amber-400/30" : ""}`} style={{ borderColor: colors.accent }}>
      {s.is_featured && (
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span className="text-xs font-bold text-amber-600">ফিচার্ড</span>
        </div>
      )}
      <div className="flex items-start gap-3">
        {s.image_url ? (
          <img src={s.image_url} alt={s.title} className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-border" />
        ) : (
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-lg font-bold" style={{ background: colors.bg, color: colors.accent }}>
            {s.title.charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground text-sm">{s.title}</h3>
          {s.address && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 shrink-0" /> {s.address}
            </p>
          )}
          {metaParts.length > 0 && (
            <div className="flex gap-1.5 mt-1.5 flex-wrap">
              {metaParts.map((p, i) => (
                <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-muted text-foreground">{p}</span>
              ))}
            </div>
          )}
        </div>
      </div>
      {s.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{s.description}</p>}
      <div className="flex gap-2 mt-3">
        {s.phone && (
          <a href={`tel:${s.phone}`} className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-1.5">
            <Phone className="w-3.5 h-3.5" /> কল
          </a>
        )}
        {s.whatsapp && (
          <a href={`https://wa.me/88${s.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5" style={{ background: "hsl(140,70%,45%)", color: "white" }}>
            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
          </a>
        )}
        <button onClick={onShare} className="px-3 py-2 rounded-xl border border-border text-xs font-medium flex items-center justify-center gap-1">
          <Share2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

const CategoryServices = () => {
  const { slug } = useParams<{ slug: string }>();
  const [services, setServices] = useState<Service[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const colors = (slug && categoryColors[slug]) || defaultColor;

  useEffect(() => {
    if (!slug) return;

    const fetchCategory = async () => {
      const { data } = await supabase.from("service_categories").select("*").eq("slug", slug).single();
      if (data) setCategory(data as Category);
    };

    const fetchServices = async () => {
      setLoading(true);
      const { data: cat } = await supabase.from("service_categories").select("id").eq("slug", slug).single();
      if (!cat) { setLoading(false); return; }
      const { data } = await supabase.from("services").select("*").eq("category_id", (cat as any).id).eq("status", "approved").order("is_featured", { ascending: false }).order("created_at", { ascending: false });
      setServices((data as Service[]) || []);
      setLoading(false);
    };

    fetchCategory();
    fetchServices();

    const ch = supabase.channel(`services_${slug}`).on("postgres_changes", { event: "*", schema: "public", table: "services" }, () => fetchServices()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [slug]);

  const filtered = services.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    (s.description || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.address || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleShare = (service: Service) => {
    if (navigator.share) {
      navigator.share({ title: service.title, text: `${service.title} - ${service.address || ""}`, url: window.location.href });
    }
  };

  const handleSubmit = async (data: Record<string, string>) => {
    if (!category || !slug) return;
    const metadata = buildMetadata(slug, data);
    await supabase.from("services").insert({
      title: data.title,
      description: data.description || null,
      phone: data.phone || null,
      whatsapp: data.whatsapp || null,
      address: data.address || null,
      area: data.area || null,
      image_url: data.image_url || null,
      category_id: category.id,
      metadata,
    });
  };

  const formFields = slug ? getCategoryFormFields(slug) : [];

  const renderCard = (s: Service) => {
    switch (slug) {
      case "doctors":
        return <DoctorCard key={s.id} s={s} colors={colors} onShare={() => handleShare(s)} />;
      case "education":
        return <EducationCard key={s.id} s={s} colors={colors} onShare={() => handleShare(s)} />;
      case "jobs":
        return <JobCard key={s.id} s={s} colors={colors} onShare={() => handleShare(s)} />;
      case "shops":
        return <ShopCard key={s.id} s={s} colors={colors} onShare={() => handleShare(s)} />;
      default:
        return <DefaultCard key={s.id} s={s} colors={colors} onShare={() => handleShare(s)} />;
    }
  };

  return (
    <div className="min-h-screen bg-background max-w-4xl mx-auto pb-20">
      <PageHeader title={category?.name || "সেবাসমূহ"} color={colors.gradient} onAdd={() => setShowForm(true)} />

      <div className="px-4 -mt-2 space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input type="text" placeholder="নাম, ঠিকানা দিয়ে খুঁজুন..." className="search-input pl-12" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="rounded-2xl overflow-hidden border border-border/60">
                <div className="p-4 flex items-start gap-3.5 bg-muted/30">
                  <div className="w-[72px] h-[72px] rounded-full skeleton-shimmer shrink-0" />
                  <div className="flex-1 space-y-2 pt-2">
                    <div className="h-4 w-3/4 rounded skeleton-shimmer" />
                    <div className="flex gap-1.5">
                      <div className="h-5 w-16 rounded-full skeleton-shimmer" />
                      <div className="h-5 w-20 rounded-full skeleton-shimmer" />
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <div className="h-4 w-2/3 rounded skeleton-shimmer" />
                  <div className="h-3 w-1/2 rounded skeleton-shimmer" />
                </div>
                <div className="flex border-t border-border/30">
                  <div className="flex-1 h-12 skeleton-shimmer" />
                  <div className="flex-1 h-12 skeleton-shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">কোন তথ্য পাওয়া যায়নি</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-6">
            {filtered.map(renderCard)}
          </div>
        )}
      </div>

      <SubmitFormDialog
        open={showForm} onClose={() => setShowForm(false)}
        title="তথ্য যোগ করুন" subtitle={category?.name || ""}
        headerColor={colors.gradient}
        fields={formFields}
        onSubmit={handleSubmit}
      />
      <BottomNav />
    </div>
  );
};

export default CategoryServices;
