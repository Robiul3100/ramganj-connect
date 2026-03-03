import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Phone, MapPin, Share2, MessageCircle, Star, GraduationCap, Building2, Briefcase, Clock, User, Award, Stethoscope, BadgeCheck, CalendarClock, Banknote, Filter, ChevronDown, Eye, Calendar, Search, X, Navigation, ImageIcon, BookOpen, Hash, Globe, Users, ShoppingBag, Tag, Facebook, ChevronLeft, ChevronRight, Package, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import SubmitFormDialog from "@/components/SubmitFormDialog";
import PageAdBanner from "@/components/PageAdBanner";
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
  doctors: { gradient: "linear-gradient(135deg, hsl(25,90%,55%), hsl(35,85%,50%))", accent: "hsl(25,90%,55%)", bg: "hsl(25,90%,92%)" },
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
        { name: "rating", label: "রেটিং (১-৫)", placeholder: "যেমন: 4.5" },
        { name: "available_today", label: "আজ উপলব্ধ?", type: "select" as const, options: ["হ্যাঁ", "না"] },
        { name: "description", label: "অতিরিক্ত তথ্য", type: "textarea" as const },
        { name: "phone", label: "ফোন নাম্বার", type: "tel" as const, required: true },
        { name: "whatsapp", label: "WhatsApp নাম্বার", type: "tel" as const },
        { name: "address", label: "ঠিকানা" },
        { name: "area", label: "এলাকা" },
        { name: "image_url", label: "ডাক্তারের ছবি (URL)", placeholder: "https://example.com/photo.jpg" },
      ];
    case "hospitals":
      return [
        { name: "title", label: "হাসপাতালের নাম", required: true, placeholder: "যেমন: রামগঞ্জ জেনারেল হাসপাতাল" },
        { name: "slogan", label: "স্লোগান", placeholder: "যেমন: সেবাই আমাদের ধর্ম" },
        { name: "open_hours", label: "সময়সূচি", placeholder: "যেমন: সকাল ৮টা - রাত ১০টা" },
        { name: "is_24hours", label: "২৪ ঘণ্টা খোলা?", type: "select" as const, options: ["হ্যাঁ", "না"] },
        { name: "description", label: "বিস্তারিত বিবরণ", type: "textarea" as const },
        { name: "phone", label: "ফোন নাম্বার", type: "tel" as const, required: true },
        { name: "whatsapp", label: "WhatsApp নাম্বার", type: "tel" as const },
        { name: "address", label: "ঠিকানা", required: true },
        { name: "area", label: "এলাকা" },
        { name: "map_url", label: "Google Maps লিংক", placeholder: "https://maps.google.com/..." },
        { name: "image_url", label: "হাসপাতালের ছবি (URL)", placeholder: "https://example.com/photo.jpg" },
      ];
    case "education":
      return [
        { name: "title", label: "প্রতিষ্ঠানের নাম", required: true },
        { name: "edu_type", label: "ধরন", type: "select" as const, options: ["স্কুল", "কলেজ", "মাদ্রাসা", "বিশ্ববিদ্যালয়", "কোচিং", "অন্যান্য"] },
        { name: "edu_level", label: "শিক্ষা স্তর", placeholder: "যেমন: প্রাথমিক, মাধ্যমিক, উচ্চমাধ্যমিক" },
        { name: "medium", label: "মাধ্যম", type: "select" as const, options: ["বাংলা", "ইংরেজি", "আরবি", "বাংলা ও ইংরেজি", "অন্যান্য"] },
        { name: "ownership", label: "পরিচালনা", type: "select" as const, options: ["সরকারি", "বেসরকারি", "স্বায়ত্তশাসিত", "অন্যান্য"] },
        { name: "motto", label: "মটো / স্লোগান", placeholder: "যেমন: শিক্ষাই আলো" },
        { name: "established_year", label: "প্রতিষ্ঠার সাল", placeholder: "যেমন: ১৯৯০" },
        { name: "eiin_code", label: "EIIN / কোড নম্বর", placeholder: "যেমন: 123456" },
        { name: "principal_name", label: "প্রধান শিক্ষক / অধ্যক্ষের নাম" },
        { name: "total_students", label: "মোট ছাত্র-ছাত্রী সংখ্যা", placeholder: "যেমন: ১২০০+" },
        { name: "total_teachers", label: "মোট শিক্ষক সংখ্যা", placeholder: "যেমন: ৪৫" },
        { name: "admission_open", label: "ভর্তি চলছে?", type: "select" as const, options: ["হ্যাঁ", "না"] },
        { name: "short_description", label: "সংক্ষিপ্ত বিবরণ", placeholder: "২-৩ লাইনে প্রতিষ্ঠান সম্পর্কে" },
        { name: "description", label: "বিস্তারিত বিবরণ", type: "textarea" as const },
        { name: "phone", label: "ফোন নাম্বার", type: "tel" as const },
        { name: "whatsapp", label: "WhatsApp নাম্বার", type: "tel" as const },
        { name: "address", label: "ঠিকানা" },
        { name: "area", label: "এলাকা" },
        { name: "map_url", label: "Google Maps লিংক", placeholder: "https://maps.google.com/..." },
        { name: "image_url", label: "প্রতিষ্ঠানের ছবি (URL)", placeholder: "https://example.com/photo.jpg" },
      ];
    case "pharmacy":
    case "shops":
      return [
        { name: "title", label: "দোকানের নাম", required: true, placeholder: "যেমন: আল-আমিন ফার্মেসী" },
        { name: "shop_category", label: "দোকানের ধরন", placeholder: "যেমন: ফার্মেসী, কাপড়, ইলেকট্রনিক্স" },
        { name: "owner_name", label: "মালিকের নাম", placeholder: "যেমন: মো. আব্দুল করিম" },
        { name: "short_description", label: "কি কি পাওয়া যায় (সংক্ষেপে)", placeholder: "যেমন: সব ধরনের ঔষধ, কসমেটিক্স, বেবি প্রোডাক্ট" },
        { name: "description", label: "বিস্তারিত বিবরণ", type: "textarea" as const },
        { name: "is_open", label: "এখন খোলা?", type: "select" as const, options: ["হ্যাঁ", "না"] },
        { name: "is_verified", label: "ভেরিফাইড?", type: "select" as const, options: ["হ্যাঁ", "না"] },
        { name: "years_in_service", label: "কত বছর ধরে সেবায়", placeholder: "যেমন: ১০+" },
        { name: "has_map", label: "ম্যাপ লিংক আছে?", type: "select" as const, options: ["হ্যাঁ", "না"] },
        { name: "map_url", label: "Google Maps লিংক", placeholder: "https://maps.google.com/..." },
        { name: "message_url", label: "মেসেজ লিংক (WhatsApp/Messenger)", placeholder: "https://m.me/..." },
        { name: "phone", label: "ফোন নাম্বার", type: "tel" as const, required: true },
        { name: "whatsapp", label: "WhatsApp নাম্বার", type: "tel" as const },
        { name: "address", label: "ঠিকানা", required: true },
        { name: "area", label: "এলাকা" },
        { name: "cover_image", label: "কভার ছবি (URL)", placeholder: "https://example.com/cover.jpg" },
        { name: "image_url", label: "মালিকের ছবি (URL)", placeholder: "https://example.com/owner.jpg" },
      ];
    case "marketplace":
      return [
        { name: "title", label: "পণ্যের নাম", required: true, placeholder: "যেমন: Samsung Galaxy S24 Ultra" },
        { name: "price", label: "দাম (৳)", required: true, placeholder: "যেমন: ৫৫,০০০" },
        { name: "condition", label: "পণ্যের অবস্থা", type: "select" as const, options: ["নতুন", "ব্যবহৃত - ভালো", "ব্যবহৃত - মোটামুটি", "রিফার্বিশড"] },
        { name: "product_category", label: "পণ্যের ক্যাটাগরি", type: "select" as const, options: ["মোবাইল", "ইলেকট্রনিক্স", "পোশাক", "আসবাবপত্র", "যানবাহন", "জমি/ফ্ল্যাট", "বই", "খাদ্যদ্রব্য", "অন্যান্য"] },
        { name: "description", label: "পণ্যের বিস্তারিত বিবরণ", type: "textarea" as const, required: true, placeholder: "পণ্যের ফিচার, স্পেসিফিকেশন, কেনো বিক্রি করছেন ইত্যাদি..." },
        { name: "image_url", label: "পণ্যের ছবি ১ (প্রধান)", placeholder: "https://example.com/product1.jpg" },
        { name: "image_2", label: "পণ্যের ছবি ২", placeholder: "https://example.com/product2.jpg" },
        { name: "image_3", label: "পণ্যের ছবি ৩", placeholder: "https://example.com/product3.jpg" },
        { name: "image_4", label: "পণ্যের ছবি ৪", placeholder: "https://example.com/product4.jpg" },
        { name: "seller_name", label: "বিক্রেতার নাম", required: true },
        { name: "seller_image", label: "বিক্রেতার ছবি (URL)", placeholder: "https://example.com/seller.jpg" },
        { name: "facebook_url", label: "ফেসবুক প্রোফাইল লিংক", placeholder: "https://facebook.com/..." },
        { name: "is_negotiable", label: "দাম আলোচনা সাপেক্ষ?", type: "select" as const, options: ["হ্যাঁ", "না"] },
        { name: "phone", label: "ফোন নাম্বার", type: "tel" as const, required: true },
        { name: "whatsapp", label: "WhatsApp নাম্বার", type: "tel" as const },
        { name: "address", label: "অবস্থান / ঠিকানা", required: true },
        { name: "area", label: "এলাকা" },
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
      if (data.rating) meta.rating = parseFloat(data.rating) || 0;
      if (data.available_today) meta.available_today = data.available_today === "হ্যাঁ";
      break;
    case "hospitals":
      if (data.slogan) meta.slogan = data.slogan;
      if (data.open_hours) meta.open_hours = data.open_hours;
      if (data.is_24hours) meta.is_24hours = data.is_24hours === "হ্যাঁ";
      if (data.map_url) meta.map_url = data.map_url;
      break;
    case "education":
      if (data.edu_type) meta.edu_category = data.edu_type;
      if (data.edu_level) meta.edu_level = data.edu_level;
      if (data.medium) meta.medium = data.medium;
      if (data.ownership) meta.ownership = data.ownership;
      if (data.motto) meta.motto = data.motto;
      if (data.established_year) meta.established_year = data.established_year;
      if (data.eiin_code) meta.eiin_code = data.eiin_code;
      if (data.principal_name) meta.principal_name = data.principal_name;
      if (data.total_students) meta.total_students = data.total_students;
      if (data.total_teachers) meta.total_teachers = data.total_teachers;
      if (data.admission_open) meta.admission_open = data.admission_open === "হ্যাঁ";
      if (data.short_description) meta.short_description = data.short_description;
      if (data.map_url) meta.map_url = data.map_url;
      break;
    case "pharmacy":
    case "shops":
      if (data.shop_category) meta.shop_category = data.shop_category;
      if (data.owner_name) meta.owner_name = data.owner_name;
      if (data.short_description) meta.short_description = data.short_description;
      if (data.is_open) meta.is_open = data.is_open === "হ্যাঁ";
      if (data.is_verified) meta.is_verified = data.is_verified === "হ্যাঁ";
      if (data.years_in_service) meta.years_in_service = data.years_in_service;
      if (data.has_map) meta.has_map = data.has_map === "হ্যাঁ";
      if (data.map_url) meta.map_url = data.map_url;
      if (data.message_url) meta.message_url = data.message_url;
      if (data.cover_image) meta.cover_image = data.cover_image;
      break;
    case "marketplace":
      if (data.price) meta.price = data.price;
      if (data.condition) meta.condition = data.condition;
      if (data.product_category) meta.product_category = data.product_category;
      if (data.seller_name) meta.seller_name = data.seller_name;
      if (data.seller_image) meta.seller_image = data.seller_image;
      if (data.facebook_url) meta.facebook_url = data.facebook_url;
      if (data.is_negotiable) meta.is_negotiable = data.is_negotiable === "হ্যাঁ";
      {
        const imgs: string[] = [];
        if (data.image_2) imgs.push(data.image_2);
        if (data.image_3) imgs.push(data.image_3);
        if (data.image_4) imgs.push(data.image_4);
        if (imgs.length > 0) meta.extra_images = imgs;
      }
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

// ──── Star Rating Component ────
const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i <= Math.floor(rating) ? "text-amber-400 fill-amber-400" : i - 0.5 <= rating ? "text-amber-400 fill-amber-400/50" : "text-muted-foreground/30"}`}
        />
      ))}
      <span className="text-[11px] font-bold text-amber-600 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
};

// ──── Doctor Card (Premium Healthcare Design) ────
const DoctorCard = ({ s, colors, onShare }: { s: Service; colors: { accent: string; bg: string; gradient: string }; onShare: () => void }) => {
  const m = s.metadata || {};
  const degrees: string[] = m.degrees || [];
  const specialty = m.specialty || "";
  const hospital = m.hospital_name || "";
  const regNo = m.registration_no || "";
  const experience = m.experience || "";
  const chamberTime = m.chamber_time || "";
  const fee = m.consultation_fee || "";
  const rating = typeof m.rating === "number" ? m.rating : 0;
  const availableToday = m.available_today === true;
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div className="relative rounded-2xl bg-card overflow-hidden border-y border-border/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 group"
      style={{ borderLeft: `3px solid ${colors.accent}`, borderRight: `3px solid ${colors.accent}` }}
    >

      {/* Featured ribbon */}
      {s.is_featured && (
        <div className="absolute top-3 right-0 flex items-center gap-1 px-3 py-1 rounded-l-full shadow-md z-10"
          style={{ background: "linear-gradient(135deg, hsl(45,90%,50%), hsl(35,85%,55%))" }}>
          <Star className="w-3 h-3 text-white fill-white" />
          <span className="text-[9px] font-extrabold text-white tracking-wide uppercase">ফিচার্ড</span>
        </div>
      )}

      {/* Available Today badge */}
      {availableToday && (
        <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/90 shadow-sm z-10">
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-[9px] font-bold text-white">আজ উপলব্ধ</span>
        </div>
      )}

      {/* Main content */}
      <div className="p-4 sm:p-5">
        {/* Profile row */}
        <div className="flex gap-4">
          {/* Circular avatar with ring */}
          <div className="relative shrink-0">
            {s.image_url ? (
              <img
                src={s.image_url}
                alt={s.title}
                className="w-20 h-20 sm:w-[88px] sm:h-[88px] rounded-full object-cover shadow-md"
                style={{ border: `3px solid ${colors.accent}30` }}
              />
            ) : (
              <div
                className="w-20 h-20 sm:w-[88px] sm:h-[88px] rounded-full flex items-center justify-center shadow-md"
                style={{ background: colors.bg, color: colors.accent, border: `3px solid ${colors.accent}30` }}
              >
                <Stethoscope className="w-8 h-8 sm:w-9 sm:h-9" />
              </div>
            )}
            {/* Online indicator */}
            {availableToday && (
              <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-[2.5px] border-card" />
            )}
          </div>

          {/* Name & info block */}
          <div className="flex-1 min-w-0 py-0.5">
            <h3 className="font-extrabold text-foreground text-[16px] sm:text-[18px] leading-snug line-clamp-2">{s.title}</h3>
            {specialty && (
              <p className="text-[12px] sm:text-[13px] font-semibold mt-0.5" style={{ color: colors.accent }}>{specialty}</p>
            )}
            {/* Verified badge */}
            {regNo && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500/20" />
                <span className="text-[10px] font-bold text-blue-600">যাচাইকৃত • BMDC {regNo}</span>
              </div>
            )}
            {/* Rating */}
            {rating > 0 && (
              <div className="mt-1.5">
                <StarRating rating={rating} />
              </div>
            )}
          </div>
        </div>

        {/* Degree tags */}
        {degrees.length > 0 && (
          <div className="flex gap-1.5 mt-3.5 flex-wrap">
            {degrees.map((deg, i) => (
              <span
                key={i}
                className="text-[10px] font-semibold px-2.5 py-1 rounded-full border"
                style={{
                  background: tagColors[i % tagColors.length].bg,
                  color: tagColors[i % tagColors.length].text,
                  borderColor: tagColors[i % tagColors.length].text + "20",
                }}
              >
                {deg}
              </span>
            ))}
          </div>
        )}

        {/* Info grid - 2x2 */}
        <div className="grid grid-cols-2 gap-2 mt-3.5">
          {experience && (
            <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 bg-muted/50 border border-border/30">
              <Award className="w-4 h-4 shrink-0" style={{ color: colors.accent }} />
              <div className="min-w-0">
                <p className="text-[9px] text-muted-foreground leading-none">অভিজ্ঞতা</p>
                <p className="text-[11px] font-bold text-foreground leading-tight mt-0.5 truncate">{experience}</p>
              </div>
            </div>
          )}
          {chamberTime && (
            <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 bg-muted/50 border border-border/30">
              <CalendarClock className="w-4 h-4 shrink-0" style={{ color: colors.accent }} />
              <div className="min-w-0">
                <p className="text-[9px] text-muted-foreground leading-none">সময়সূচি</p>
                <p className="text-[11px] font-bold text-foreground leading-tight mt-0.5 truncate">{chamberTime}</p>
              </div>
            </div>
          )}
          {fee && (
            <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 bg-muted/50 border border-border/30">
              <Banknote className="w-4 h-4 shrink-0" style={{ color: colors.accent }} />
              <div className="min-w-0">
                <p className="text-[9px] text-muted-foreground leading-none">ভিজিট ফি</p>
                <p className="text-[11px] font-bold text-foreground leading-tight mt-0.5 truncate">{fee}</p>
              </div>
            </div>
          )}
          {hospital && (
            <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 bg-muted/50 border border-border/30">
              <Building2 className="w-4 h-4 shrink-0" style={{ color: colors.accent }} />
              <div className="min-w-0">
                <p className="text-[9px] text-muted-foreground leading-none">চেম্বার</p>
                <p className="text-[11px] font-bold text-foreground leading-tight mt-0.5 truncate">{hospital}</p>
              </div>
            </div>
          )}
        </div>

        {/* Location */}
        {s.address && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/30">
            <MapPin className="w-4 h-4 shrink-0 text-muted-foreground" />
            <p className="text-[11px] text-muted-foreground line-clamp-1">{s.address}{s.area ? `, ${s.area}` : ""}</p>
          </div>
        )}

        {/* Expandable profile section */}
        {showProfile && s.description && (
          <div className="mt-3 pt-3 border-t border-border/30 animate-in fade-in slide-in-from-top-2 duration-200">
            <p className="text-[12px] text-muted-foreground leading-relaxed">{s.description}</p>
          </div>
        )}
      </div>

      {/* CTA Buttons */}
      <div className="px-4 sm:px-5 pb-4 sm:pb-5 grid grid-cols-3 gap-2">
        <button
          onClick={() => setShowProfile(!showProfile)}
          className="py-2.5 rounded-xl text-[11px] sm:text-[12px] font-bold flex items-center justify-center gap-1.5 bg-muted/70 text-foreground border border-border/40 hover:bg-muted transition-colors"
        >
          <Eye className="w-3.5 h-3.5" /> প্রোফাইল
        </button>
        {s.phone ? (
          <a
            href={`tel:${s.phone}`}
            className="py-2.5 rounded-xl text-[11px] sm:text-[12px] font-bold flex items-center justify-center gap-1.5 text-white active:scale-[0.97] transition-transform"
            style={{ background: colors.gradient }}
          >
            <Phone className="w-3.5 h-3.5" /> কল করুন
          </a>
        ) : (
          <div className="py-2.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 bg-muted/40 text-muted-foreground cursor-not-allowed">
            <Phone className="w-3.5 h-3.5" /> কল
          </div>
        )}
        {s.whatsapp ? (
          <a
            href={`https://wa.me/88${s.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 rounded-xl text-[11px] sm:text-[12px] font-bold flex items-center justify-center gap-1.5 text-white active:scale-[0.97] transition-transform"
            style={{ background: "linear-gradient(135deg, hsl(142,70%,38%), hsl(152,65%,45%))" }}
          >
            <Calendar className="w-3.5 h-3.5" /> অ্যাপয়েন্টমেন্ট
          </a>
        ) : (
          <div className="py-2.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 bg-muted/40 text-muted-foreground cursor-not-allowed">
            <Calendar className="w-3.5 h-3.5" /> অ্যাপয়েন্টমেন্ট
          </div>
        )}
      </div>
    </div>
  );
};

// ──── Hospital Card (Premium Healthcare Design) ────
const HospitalCard = ({ s, colors }: { s: Service; colors: { accent: string; bg: string; gradient: string } }) => {
  const m = s.metadata || {};
  const slogan = m.slogan || "";
  const openHours = m.open_hours || "";
  const is24h = m.is_24hours === true;
  const mapUrl = m.map_url || "";
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-[16px] bg-card overflow-hidden border border-border/40 transition-all duration-300 hover:shadow-xl group">
      {/* Hospital image with gradient overlay */}
      <div className="relative w-full h-40 sm:h-44 overflow-hidden">
        {s.image_url ? (
          <img
            src={s.image_url}
            alt={s.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${colors.bg}, hsl(0,0%,96%))` }}>
            <Building2 className="w-12 h-12" style={{ color: colors.accent, opacity: 0.4 }} />
          </div>
        )}
        {/* Bottom gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent" />

        {/* 24h badge or open hours */}
        {is24h && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/90 shadow-lg z-10">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-[11px] font-extrabold text-white">২৪ ঘণ্টা খোলা</span>
          </div>
        )}

        {/* Featured badge */}
        {s.is_featured && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-3 py-1.5 rounded-full shadow-lg z-10"
            style={{ background: "linear-gradient(135deg, hsl(45,90%,50%), hsl(35,85%,55%))" }}>
            <Star className="w-3 h-3 text-white fill-white" />
            <span className="text-[10px] font-extrabold text-white tracking-wide">ফিচার্ড</span>
          </div>
        )}
      </div>

      {/* Info section */}
      <div className="px-4 pt-2.5 pb-2.5">
        <h3 className="font-extrabold text-foreground text-[15px] sm:text-[17px] leading-snug line-clamp-1">{s.title}</h3>
        {slogan && (
          <p className="text-[12px] italic text-muted-foreground mt-0.5 line-clamp-1">"{slogan}"</p>
        )}

        {/* Location */}
        {s.address && (
          <div className="flex items-center gap-2 mt-1.5">
            <MapPin className="w-4 h-4 shrink-0" style={{ color: colors.accent }} />
            <p className="text-[12px] text-muted-foreground line-clamp-1">{s.address}{s.area ? `, ${s.area}` : ""}</p>
          </div>
        )}

        {/* Open hours (non-24h) */}
        {openHours && !is24h && (
          <div className="flex items-center gap-2 mt-1.5">
            <Clock className="w-4 h-4 shrink-0" style={{ color: colors.accent }} />
            <p className="text-[12px] text-muted-foreground">{openHours}</p>
          </div>
        )}

        {/* Expandable description */}
        {s.description && (
          <div className="mt-2.5">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-xl bg-muted/50 border border-border/40 text-[12px] font-bold text-foreground hover:bg-muted transition-colors"
            >
              <Eye className="w-3.5 h-3.5" style={{ color: colors.accent }} />
              <span>বিস্তারিত দেখুন</span>
              <ChevronDown className={`w-4 h-4 ml-auto text-muted-foreground transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} />
            </button>
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{ maxHeight: expanded ? "500px" : "0px", opacity: expanded ? 1 : 0 }}
            >
              <p className="text-[12px] text-muted-foreground leading-relaxed pt-3 px-1">{s.description}</p>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="px-4 pb-3 grid grid-cols-2 gap-2">
        {s.phone ? (
          <a
            href={`tel:${s.phone}`}
            className="py-2.5 rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 text-white active:scale-[0.97] transition-transform"
            style={{ background: colors.gradient }}
          >
            <Phone className="w-4 h-4" /> কল করুন
          </a>
        ) : (
          <div className="py-2.5 rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 bg-muted/40 text-muted-foreground cursor-not-allowed">
            <Phone className="w-4 h-4" /> কল করুন
          </div>
        )}
        {mapUrl ? (
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 border-2 active:scale-[0.97] transition-transform"
            style={{ borderColor: colors.accent, color: colors.accent }}
          >
            <Navigation className="w-4 h-4" /> ম্যাপ দেখুন
          </a>
        ) : (
          <div className="py-2.5 rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 bg-muted/40 text-muted-foreground cursor-not-allowed">
            <Navigation className="w-4 h-4" /> ম্যাপ দেখুন
          </div>
        )}
      </div>
    </div>
  );
};

// ──── Education Card (Premium Institute Design) ────
const EducationCard = ({ s, colors }: { s: Service; colors: { accent: string; bg: string; gradient: string } }) => {
  const m = s.metadata || {};
  const [expanded, setExpanded] = useState(false);
  const eduType = m.edu_category || "";
  const eduLevel = m.edu_level || "";
  const medium = m.medium || "";
  const ownership = m.ownership || "";
  const motto = m.motto || "";
  const estYear = m.established_year || "";
  const eiinCode = m.eiin_code || "";
  const principalName = m.principal_name || "";
  const totalStudents = m.total_students || "";
  const totalTeachers = m.total_teachers || "";
  const admissionOpen = m.admission_open === true;
  const shortDesc = m.short_description || "";
  const mapUrl = m.map_url || "";

  return (
    <div className="rounded-[16px] bg-card overflow-hidden border border-border/50 transition-all duration-200 hover:shadow-xl group">
      {/* Cover image */}
      <div className="relative w-full h-36 sm:h-40 overflow-hidden bg-muted">
        {s.image_url ? (
          <img src={s.image_url} alt={s.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${colors.bg}, hsl(0,0%,96%))` }}>
            <GraduationCap className="w-12 h-12" style={{ color: colors.accent, opacity: 0.4 }} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Type badge (top-left) */}
        {eduType && (
          <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full shadow-sm z-10 text-[9px] font-bold text-white" style={{ background: colors.gradient }}>
            🎓 {eduType}
          </div>
        )}

        {/* Ownership badge (top-right) */}
        {ownership && (
          <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full shadow-sm z-10 bg-card/90 backdrop-blur-sm">
            <span className="text-[9px] font-bold text-foreground">{ownership}</span>
          </div>
        )}

        {/* Admission Open badge */}
        {admissionOpen && (
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/90 shadow-md z-10">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[9px] font-bold text-white">ভর্তি চলছে</span>
          </div>
        )}

        {/* Featured badge */}
        {s.is_featured && (
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full shadow-md z-10"
            style={{ background: "linear-gradient(135deg, hsl(45,90%,50%), hsl(35,85%,55%))" }}>
            <Star className="w-3 h-3 text-white fill-white" />
            <span className="text-[9px] font-extrabold text-white">ফিচার্ড</span>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="px-4 pt-3 pb-2.5">
        {/* Institution name */}
        <h3 className="text-[15px] sm:text-[17px] font-extrabold text-foreground leading-tight line-clamp-2">{s.title}</h3>

        {/* Motto */}
        {motto && (
          <p className="text-[11px] italic text-muted-foreground mt-0.5 line-clamp-1">"{motto}"</p>
        )}

        {/* Tags row */}
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {eduLevel && (
            <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full" style={{ background: tagColors[0].bg, color: tagColors[0].text }}>
              📚 {eduLevel}
            </span>
          )}
          {medium && (
            <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full" style={{ background: tagColors[3].bg, color: tagColors[3].text }}>
              🗣 {medium}
            </span>
          )}
          {estYear && (
            <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full" style={{ background: tagColors[1].bg, color: tagColors[1].text }}>
              🏛 প্রতিষ্ঠা: {estYear}
            </span>
          )}
        </div>

        {/* Compact info grid */}
        <div className="grid grid-cols-2 gap-1.5 mt-2.5">
          {principalName && (
            <div className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 bg-muted/50 border border-border/30">
              <User className="w-3.5 h-3.5 shrink-0" style={{ color: colors.accent }} />
              <div className="min-w-0">
                <p className="text-[8px] text-muted-foreground leading-none">প্রধান</p>
                <p className="text-[10px] font-bold text-foreground leading-tight mt-0.5 truncate">{principalName}</p>
              </div>
            </div>
          )}
          {eiinCode && (
            <div className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 bg-muted/50 border border-border/30">
              <Hash className="w-3.5 h-3.5 shrink-0" style={{ color: colors.accent }} />
              <div className="min-w-0">
                <p className="text-[8px] text-muted-foreground leading-none">EIIN</p>
                <p className="text-[10px] font-bold text-foreground leading-tight mt-0.5 truncate">{eiinCode}</p>
              </div>
            </div>
          )}
          {totalStudents && (
            <div className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 bg-muted/50 border border-border/30">
              <Users className="w-3.5 h-3.5 shrink-0" style={{ color: colors.accent }} />
              <div className="min-w-0">
                <p className="text-[8px] text-muted-foreground leading-none">ছাত্র-ছাত্রী</p>
                <p className="text-[10px] font-bold text-foreground leading-tight mt-0.5 truncate">{totalStudents}</p>
              </div>
            </div>
          )}
          {totalTeachers && (
            <div className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 bg-muted/50 border border-border/30">
              <BookOpen className="w-3.5 h-3.5 shrink-0" style={{ color: colors.accent }} />
              <div className="min-w-0">
                <p className="text-[8px] text-muted-foreground leading-none">শিক্ষক</p>
                <p className="text-[10px] font-bold text-foreground leading-tight mt-0.5 truncate">{totalTeachers}</p>
              </div>
            </div>
          )}
        </div>

        {/* Short description */}
        {shortDesc && (
          <p className="text-[12px] text-muted-foreground mt-2 line-clamp-3 leading-relaxed">{shortDesc}</p>
        )}

        {/* Location */}
        {s.address && (
          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-2">
            <MapPin className="w-3 h-3 shrink-0" style={{ color: colors.accent }} />
            <span className="line-clamp-1">{s.address}{s.area ? `, ${s.area}` : ""}</span>
          </p>
        )}

        {/* Expandable full description */}
        {s.description && (
          <div className="mt-2.5">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-xl bg-muted/50 border border-border/40 text-[12px] font-bold text-foreground hover:bg-muted transition-colors"
            >
              <Eye className="w-3.5 h-3.5" style={{ color: colors.accent }} />
              <span>আরও দেখুন</span>
              <ChevronDown className={`w-4 h-4 ml-auto text-muted-foreground transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} />
            </button>
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{ maxHeight: expanded ? "500px" : "0px", opacity: expanded ? 1 : 0 }}
            >
              <p className="text-[12px] text-muted-foreground leading-relaxed pt-3 px-1">{s.description}</p>
            </div>
          </div>
        )}
      </div>

      {/* CTA Buttons */}
      <div className="px-4 pb-3 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {s.phone ? (
          <a
            href={`tel:${s.phone}`}
            className="py-2.5 rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 text-white active:scale-[0.97] transition-transform"
            style={{ background: colors.gradient }}
          >
            <Phone className="w-4 h-4" /> কল করুন
          </a>
        ) : (
          <div className="py-2.5 rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 bg-muted/40 text-muted-foreground cursor-not-allowed">
            <Phone className="w-4 h-4" /> কল করুন
          </div>
        )}
        {mapUrl ? (
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 border-2 active:scale-[0.97] transition-transform"
            style={{ borderColor: colors.accent, color: colors.accent }}
          >
            <Navigation className="w-4 h-4" /> ম্যাপ দেখুন
          </a>
        ) : s.whatsapp ? (
          <a
            href={`https://wa.me/88${s.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 border-2 active:scale-[0.97] transition-transform"
            style={{ borderColor: colors.accent, color: colors.accent }}
          >
            <MessageCircle className="w-4 h-4" /> মেসেজ করুন
          </a>
        ) : (
          <div className="py-2.5 rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 bg-muted/40 text-muted-foreground cursor-not-allowed">
            <Navigation className="w-4 h-4" /> ম্যাপ দেখুন
          </div>
        )}
      </div>
    </div>
  );
};

// ──── Job Card ────
const JobCard = ({ s, colors }: { s: Service; colors: { accent: string; bg: string; gradient: string } }) => {
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
      </div>
    </div>
  );
};

// ──── Shop / Pharmacy Card (Premium Business Listing) ────
const ShopCard = ({ s, colors }: { s: Service; colors: { accent: string; bg: string; gradient: string } }) => {
  const m = s.metadata || {};
  const [expanded, setExpanded] = useState(false);
  const coverImage = m.cover_image || s.image_url;
  const ownerImage = m.cover_image ? s.image_url : null;
  const isOpen = m.is_open === true;
  const isVerified = m.is_verified === true;
  const hasMap = m.has_map === true;
  const mapUrl = m.map_url || "";
  const messageUrl = m.message_url || (s.whatsapp ? `https://wa.me/88${s.whatsapp}` : "");
  const yearsInService = m.years_in_service || "";
  const shortDesc = m.short_description || "";

  return (
    <div className="rounded-[16px] bg-card overflow-hidden border border-border/50 transition-all duration-200 hover:shadow-xl group">
      {/* Cover image */}
      <div className="relative w-full h-36 sm:h-40 overflow-hidden bg-muted">
        {coverImage ? (
          <img src={coverImage} alt={s.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${colors.bg}, hsl(0,0%,96%))` }}>
            <Building2 className="w-12 h-12" style={{ color: colors.accent + "60" }} />
          </div>
        )}
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Featured badge */}
        {s.is_featured && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full shadow-md z-10"
            style={{ background: "linear-gradient(135deg, hsl(45,90%,50%), hsl(35,85%,55%))" }}>
            <Star className="w-3 h-3 text-white fill-white" />
            <span className="text-[9px] font-extrabold text-white">ফিচার্ড</span>
          </div>
        )}

        {/* Open/Closed badge */}
        <div className={`absolute top-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full shadow-sm z-10 ${isOpen ? "bg-emerald-500/90" : "bg-red-500/80"}`}>
          <div className={`w-1.5 h-1.5 rounded-full bg-white ${isOpen ? "animate-pulse" : ""}`} />
          <span className="text-[9px] font-bold text-white">{isOpen ? "খোলা আছে" : "বন্ধ"}</span>
        </div>

        {/* Owner profile image - overlapping cover */}
        {ownerImage && (
          <div className="absolute -bottom-5 left-4 z-10">
            <img
              src={ownerImage}
              alt={m.owner_name || "মালিক"}
              className="w-12 h-12 rounded-full object-cover shadow-lg border-[3px] border-card"
            />
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className={`px-4 ${ownerImage ? "pt-7" : "pt-3"} pb-2.5`}>
        {/* Owner name with badge */}
        {m.owner_name && (
          <div className="flex items-center gap-1.5 mb-1">
            <User className="w-3 h-3 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground font-medium">{m.owner_name}</span>
            {isVerified && (
              <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />
            )}
          </div>
        )}

        {/* Shop name */}
        <h3 className="text-[15px] sm:text-[17px] font-extrabold text-foreground leading-tight line-clamp-1">{s.title}</h3>

        {/* Category + trust badges */}
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          {m.shop_category && (
            <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full" style={{ background: colors.bg, color: colors.accent }}>
              {m.shop_category}
            </span>
          )}
          {isVerified && (
            <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              ✓ ভেরিফাইড
            </span>
          )}
          {yearsInService && (
            <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full" style={{ background: tagColors[4].bg, color: tagColors[4].text }}>
              🏪 {yearsInService} বছর
            </span>
          )}
        </div>

        {/* Short description */}
        {shortDesc && (
          <p className="text-[12px] text-muted-foreground mt-2 line-clamp-3 leading-relaxed">{shortDesc}</p>
        )}

        {/* Location */}
        {s.address && (
          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-2">
            <MapPin className="w-3 h-3 shrink-0" style={{ color: colors.accent }} />
            <span className="line-clamp-1">{s.address}{s.area ? `, ${s.area}` : ""}</span>
          </p>
        )}

        {/* Expandable description */}
        {s.description && (
          <div className="mt-2.5">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-xl bg-muted/50 border border-border/40 text-[12px] font-bold text-foreground hover:bg-muted transition-colors"
            >
              <Eye className="w-3.5 h-3.5" style={{ color: colors.accent }} />
              <span>আরও দেখুন</span>
              <ChevronDown className={`w-4 h-4 ml-auto text-muted-foreground transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} />
            </button>
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{ maxHeight: expanded ? "500px" : "0px", opacity: expanded ? 1 : 0 }}
            >
              <p className="text-[12px] text-muted-foreground leading-relaxed pt-3 px-1">{s.description}</p>
            </div>
          </div>
        )}
      </div>

      {/* CTA Buttons */}
      <div className="px-4 pb-3 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {s.phone ? (
          <a
            href={`tel:${s.phone}`}
            className="py-2.5 rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 text-white active:scale-[0.97] transition-transform"
            style={{ background: colors.gradient }}
          >
            <Phone className="w-4 h-4" /> কল করুন
          </a>
        ) : (
          <div className="py-2.5 rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 bg-muted/40 text-muted-foreground cursor-not-allowed">
            <Phone className="w-4 h-4" /> কল করুন
          </div>
        )}
        {hasMap && mapUrl ? (
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 border-2 active:scale-[0.97] transition-transform"
            style={{ borderColor: colors.accent, color: colors.accent }}
          >
            <Navigation className="w-4 h-4" /> ম্যাপ দেখুন
          </a>
        ) : messageUrl ? (
          <a
            href={messageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 border-2 active:scale-[0.97] transition-transform"
            style={{ borderColor: colors.accent, color: colors.accent }}
          >
            <MessageCircle className="w-4 h-4" /> মেসেজ করুন
          </a>
        ) : (
          <div className="py-2.5 rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 bg-muted/40 text-muted-foreground cursor-not-allowed">
            <MessageCircle className="w-4 h-4" /> মেসেজ করুন
          </div>
        )}
      </div>
    </div>
  );
};

// ──── Marketplace Card (Premium Product Listing) ────
const MarketplaceCard = ({ s, colors }: { s: Service; colors: { accent: string; bg: string; gradient: string } }) => {
  const m = s.metadata || {};
  const [expanded, setExpanded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [liked, setLiked] = useState(false);

  const price = m.price || "";
  const condition = m.condition || "";
  const productCategory = m.product_category || "";
  const sellerName = m.seller_name || "";
  const sellerImage = m.seller_image || "";
  const facebookUrl = m.facebook_url || "";
  const isNegotiable = m.is_negotiable === true;

  // Build image array
  const images: string[] = [];
  if (s.image_url) images.push(s.image_url);
  if (Array.isArray(m.extra_images)) images.push(...m.extra_images);

  const nextSlide = useCallback(() => setCurrentSlide(p => (p + 1) % Math.max(images.length, 1)), [images.length]);
  const prevSlide = useCallback(() => setCurrentSlide(p => (p - 1 + Math.max(images.length, 1)) % Math.max(images.length, 1)), [images.length]);

  const conditionColor = condition === "নতুন"
    ? { bg: "hsl(142,50%,90%)", text: "hsl(142,60%,30%)" }
    : { bg: "hsl(45,60%,90%)", text: "hsl(45,70%,30%)" };

  return (
    <div className="rounded-[16px] bg-card overflow-hidden border border-border/50 transition-all duration-200 hover:shadow-xl group">
      {/* Image Slider */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted">
        {images.length > 0 ? (
          <>
            <img
              src={images[currentSlide]}
              alt={`${s.title} - ছবি ${currentSlide + 1}`}
              className="w-full h-full object-cover transition-opacity duration-300"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

            {/* Nav arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-card transition-colors z-10"
                >
                  <ChevronLeft className="w-4 h-4 text-foreground" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-card transition-colors z-10"
                >
                  <ChevronRight className="w-4 h-4 text-foreground" />
                </button>
              </>
            )}

            {/* Slide dots */}
            {images.length > 1 && (
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setCurrentSlide(i); }}
                    className={`rounded-full transition-all duration-200 ${i === currentSlide ? "w-5 h-2 bg-white" : "w-2 h-2 bg-white/50"}`}
                  />
                ))}
              </div>
            )}

            {/* Image counter */}
            {images.length > 1 && (
              <div className="absolute top-2.5 right-2.5 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm z-10">
                <span className="text-[10px] font-bold text-white">{currentSlide + 1}/{images.length}</span>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center" style={{ background: `linear-gradient(135deg, ${colors.bg}, hsl(0,0%,96%))` }}>
            <Package className="w-12 h-12 mb-2" style={{ color: colors.accent, opacity: 0.4 }} />
            <span className="text-[11px] text-muted-foreground">ছবি নেই</span>
          </div>
        )}

        {/* Like button */}
        <button
          onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
          className="absolute top-2.5 left-2.5 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center shadow-md z-10 transition-transform active:scale-90"
        >
          <Heart className={`w-4 h-4 transition-colors ${liked ? "text-red-500 fill-red-500" : "text-foreground"}`} />
        </button>

        {/* Featured badge */}
        {s.is_featured && (
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full shadow-md z-10"
            style={{ background: "linear-gradient(135deg, hsl(45,90%,50%), hsl(35,85%,55%))" }}>
            <Star className="w-3 h-3 text-white fill-white" />
            <span className="text-[9px] font-extrabold text-white">ফিচার্ড</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="px-4 pt-3 pb-2.5">
        {/* Price + condition row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[18px] sm:text-[20px] font-extrabold" style={{ color: colors.accent }}>
              ৳{price}
            </span>
            {isNegotiable && (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                আলোচনা সাপেক্ষ
              </span>
            )}
          </div>
          {condition && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: conditionColor.bg, color: conditionColor.text }}>
              {condition}
            </span>
          )}
        </div>

        {/* Product name */}
        <h3 className="text-[15px] sm:text-[17px] font-extrabold text-foreground leading-tight line-clamp-2 mt-1.5">{s.title}</h3>

        {/* Category tag */}
        {productCategory && (
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full" style={{ background: colors.bg, color: colors.accent }}>
              <Tag className="w-3 h-3 inline mr-1" />{productCategory}
            </span>
          </div>
        )}

        {/* Short description (first 3 lines) */}
        {s.description && (
          <p className="text-[12px] text-muted-foreground mt-2 line-clamp-3 leading-relaxed">{s.description}</p>
        )}

        {/* Location */}
        {s.address && (
          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-2">
            <MapPin className="w-3 h-3 shrink-0" style={{ color: colors.accent }} />
            <span className="line-clamp-1">{s.address}{s.area ? `, ${s.area}` : ""}</span>
          </p>
        )}

        {/* Expandable full description */}
        {s.description && s.description.length > 120 && (
          <div className="mt-2.5">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-xl bg-muted/50 border border-border/40 text-[12px] font-bold text-foreground hover:bg-muted transition-colors"
            >
              <Eye className="w-3.5 h-3.5" style={{ color: colors.accent }} />
              <span>বিস্তারিত দেখুন</span>
              <ChevronDown className={`w-4 h-4 ml-auto text-muted-foreground transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} />
            </button>
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{ maxHeight: expanded ? "600px" : "0px", opacity: expanded ? 1 : 0 }}
            >
              <p className="text-[12px] text-muted-foreground leading-relaxed pt-3 px-1 whitespace-pre-line">{s.description}</p>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-border/40 mt-3 pt-3">
          {/* Seller info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {sellerImage ? (
                <img src={sellerImage} alt={sellerName} className="w-9 h-9 rounded-full object-cover border-2 border-border/60" />
              ) : (
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold" style={{ background: colors.bg, color: colors.accent }}>
                  {sellerName ? sellerName.charAt(0) : "?"}
                </div>
              )}
              <div>
                <p className="text-[12px] font-bold text-foreground leading-tight">{sellerName || "বিক্রেতা"}</p>
                <p className="text-[10px] text-muted-foreground">বিক্রেতা</p>
              </div>
            </div>
            {facebookUrl && (
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors"
                style={{ background: "hsl(220,70%,94%)", color: "hsl(220,70%,45%)" }}
              >
                <Facebook className="w-3.5 h-3.5" /> প্রোফাইল
              </a>
            )}
          </div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="px-4 pb-3 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {s.phone ? (
          <a
            href={`tel:${s.phone}`}
            className="py-2.5 rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 text-white active:scale-[0.97] transition-transform"
            style={{ background: colors.gradient }}
          >
            <Phone className="w-4 h-4" /> কল করুন
          </a>
        ) : (
          <div className="py-2.5 rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 bg-muted/40 text-muted-foreground cursor-not-allowed">
            <Phone className="w-4 h-4" /> কল করুন
          </div>
        )}
        {s.whatsapp ? (
          <a
            href={`https://wa.me/88${s.whatsapp}?text=${encodeURIComponent(`"${s.title}" পণ্যটি সম্পর্কে জানতে চাই।`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 text-white active:scale-[0.97] transition-transform"
            style={{ background: "linear-gradient(135deg, hsl(142,70%,38%), hsl(152,65%,45%))" }}
          >
            <MessageCircle className="w-4 h-4" /> মেসেজ করুন
          </a>
        ) : facebookUrl ? (
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 border-2 active:scale-[0.97] transition-transform"
            style={{ borderColor: colors.accent, color: colors.accent }}
          >
            <Facebook className="w-4 h-4" /> মেসেঞ্জার
          </a>
        ) : (
          <div className="py-2.5 rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 bg-muted/40 text-muted-foreground cursor-not-allowed">
            <MessageCircle className="w-4 h-4" /> মেসেজ
          </div>
        )}
      </div>
    </div>
  );
};

// ──── Default Card (for other categories) ────
const DefaultCard = ({ s, colors }: { s: Service; colors: { accent: string; bg: string; gradient: string } }) => {
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
      </div>
    </div>
  );
};

// ──── Doctor Filters Component ────
const DoctorFilters = ({
  services,
  filters,
  setFilters,
}: {
  services: Service[];
  filters: { specialty: string; location: string; feeRange: string; rating: string; search: string };
  setFilters: (f: any) => void;
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const specialties = useMemo(() => {
    const set = new Set<string>();
    services.forEach(s => { if (s.metadata?.specialty) set.add(s.metadata.specialty); });
    return Array.from(set).sort();
  }, [services]);

  const locations = useMemo(() => {
    const set = new Set<string>();
    services.forEach(s => { if (s.area) set.add(s.area); if (s.address) set.add(s.address); });
    return Array.from(set).sort();
  }, [services]);

  const activeCount = [filters.specialty, filters.location, filters.feeRange, filters.rating].filter(Boolean).length;

  return (
    <div className="space-y-2">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="ডাক্তার খুঁজুন..."
          value={filters.search}
          onChange={e => setFilters({ ...filters, search: e.target.value })}
          className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-card border border-border/60 text-sm outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
        />
        {filters.search && (
          <button onClick={() => setFilters({ ...filters, search: "" })} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Filter toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border/60 text-sm font-semibold text-foreground w-full justify-between"
      >
        <span className="flex items-center gap-2">
          <Filter className="w-4 h-4" style={{ color: "hsl(185,60%,42%)" }} />
          ফিল্টার করুন
          {activeCount > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: "hsl(185,60%,42%)" }}>{activeCount}</span>
          )}
        </span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showFilters ? "rotate-180" : ""}`} />
      </button>

      {/* Filter options */}
      {showFilters && (
        <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-card border border-border/40 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Specialty */}
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">বিশেষত্ব</label>
            <select
              value={filters.specialty}
              onChange={e => setFilters({ ...filters, specialty: e.target.value })}
              className="w-full text-xs px-2 py-2 rounded-lg bg-muted/50 border border-border/40 outline-none"
            >
              <option value="">সকল</option>
              {specialties.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {/* Location */}
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">এলাকা</label>
            <select
              value={filters.location}
              onChange={e => setFilters({ ...filters, location: e.target.value })}
              className="w-full text-xs px-2 py-2 rounded-lg bg-muted/50 border border-border/40 outline-none"
            >
              <option value="">সকল</option>
              {locations.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          {/* Fee range */}
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">ভিজিট ফি</label>
            <select
              value={filters.feeRange}
              onChange={e => setFilters({ ...filters, feeRange: e.target.value })}
              className="w-full text-xs px-2 py-2 rounded-lg bg-muted/50 border border-border/40 outline-none"
            >
              <option value="">সকল</option>
              <option value="low">৫০০ টাকার নিচে</option>
              <option value="mid">৫০০-১০০০ টাকা</option>
              <option value="high">১০০০+ টাকা</option>
            </select>
          </div>
          {/* Rating */}
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">রেটিং</label>
            <select
              value={filters.rating}
              onChange={e => setFilters({ ...filters, rating: e.target.value })}
              className="w-full text-xs px-2 py-2 rounded-lg bg-muted/50 border border-border/40 outline-none"
            >
              <option value="">সকল</option>
              <option value="4">৪+ স্টার</option>
              <option value="3">৩+ স্টার</option>
              <option value="2">২+ স্টার</option>
            </select>
          </div>
          {/* Clear all */}
          {activeCount > 0 && (
            <button
              onClick={() => setFilters({ specialty: "", location: "", feeRange: "", rating: "", search: filters.search })}
              className="col-span-2 text-xs font-bold py-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
            >
              সকল ফিল্টার মুছুন
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ──── Marketplace Filters + Hero ────
const MarketplaceHero = ({
  services,
  filters,
  setFilters,
  totalCount,
}: {
  services: Service[];
  filters: { search: string; category: string; condition: string; priceRange: string };
  setFilters: (f: any) => void;
  totalCount: number;
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const colors = categoryColors.marketplace;

  const categories = useMemo(() => {
    const set = new Set<string>();
    services.forEach(s => { if (s.metadata?.product_category) set.add(s.metadata.product_category); });
    return Array.from(set).sort();
  }, [services]);

  const activeCount = [filters.category, filters.condition, filters.priceRange].filter(Boolean).length;

  return (
    <div className="space-y-3">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden" style={{ background: colors.gradient }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-6 w-20 h-20 rounded-full border-4 border-white/30" />
          <div className="absolute bottom-3 left-8 w-12 h-12 rounded-full border-4 border-white/20" />
          <div className="absolute top-8 left-20 w-6 h-6 rounded-full bg-white/20" />
        </div>
        <div className="relative px-5 py-6 sm:py-8">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag className="w-6 h-6 text-white/90" />
            <h2 className="text-lg sm:text-xl font-extrabold text-white">মার্কেটপ্লেস</h2>
          </div>
          <p className="text-[13px] text-white/80 leading-relaxed max-w-sm">
            রামগঞ্জের সবচেয়ে বড় অনলাইন মার্কেট। কিনুন, বিক্রি করুন — সহজে ও নিরাপদে।
          </p>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-[11px] font-bold text-white/90 bg-white/15 px-3 py-1 rounded-full">
              📦 {totalCount}টি পণ্য
            </span>
            <span className="text-[11px] font-bold text-white/90 bg-white/15 px-3 py-1 rounded-full">
              🛡️ নিরাপদ লেনদেন
            </span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="পণ্য খুঁজুন... (যেমন: মোবাইল, ল্যাপটপ)"
          value={filters.search}
          onChange={e => setFilters({ ...filters, search: e.target.value })}
          className="w-full pl-10 pr-10 py-3 rounded-xl bg-card border border-border/60 text-sm outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
        />
        {filters.search && (
          <button onClick={() => setFilters({ ...filters, search: "" })} className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Filter toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-card border border-border/60 text-sm font-semibold text-foreground w-full justify-between"
      >
        <span className="flex items-center gap-2">
          <Filter className="w-4 h-4" style={{ color: colors.accent }} />
          ফিল্টার করুন
          {activeCount > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: colors.accent }}>{activeCount}</span>
          )}
        </span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${showFilters ? "rotate-180" : ""}`} />
      </button>

      {/* Filter options */}
      {showFilters && (
        <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-card border border-border/40 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Category */}
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">ক্যাটাগরি</label>
            <select
              value={filters.category}
              onChange={e => setFilters({ ...filters, category: e.target.value })}
              className="w-full text-xs px-2 py-2 rounded-lg bg-muted/50 border border-border/40 outline-none"
            >
              <option value="">সকল</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {/* Condition */}
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">অবস্থা</label>
            <select
              value={filters.condition}
              onChange={e => setFilters({ ...filters, condition: e.target.value })}
              className="w-full text-xs px-2 py-2 rounded-lg bg-muted/50 border border-border/40 outline-none"
            >
              <option value="">সকল</option>
              <option value="নতুন">নতুন</option>
              <option value="ব্যবহৃত">ব্যবহৃত</option>
              <option value="রিফার্বিশড">রিফার্বিশড</option>
            </select>
          </div>
          {/* Price Range */}
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">দাম</label>
            <select
              value={filters.priceRange}
              onChange={e => setFilters({ ...filters, priceRange: e.target.value })}
              className="w-full text-xs px-2 py-2 rounded-lg bg-muted/50 border border-border/40 outline-none"
            >
              <option value="">সকল</option>
              <option value="low">৫,০০০ এর নিচে</option>
              <option value="mid">৫,০০০ - ২০,০০০</option>
              <option value="high">২০,০০০ - ৫০,০০০</option>
              <option value="premium">৫০,০০০+</option>
            </select>
          </div>
          {/* Clear */}
          {activeCount > 0 && (
            <button
              onClick={() => setFilters({ search: filters.search, category: "", condition: "", priceRange: "" })}
              className="col-span-3 text-xs font-bold py-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
            >
              সকল ফিল্টার মুছুন
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const CategoryServices = () => {
  const { slug } = useParams<{ slug: string }>();
  const [services, setServices] = useState<Service[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [doctorFilters, setDoctorFilters] = useState({ specialty: "", location: "", feeRange: "", rating: "", search: "" });
  const [marketplaceFilters, setMarketplaceFilters] = useState({ search: "", category: "", condition: "", priceRange: "" });

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

  // Doctor filtering logic
  const filteredDoctors = useMemo(() => {
    if (slug !== "doctors") return services;
    return services.filter(s => {
      const m = s.metadata || {};
      if (doctorFilters.search) {
        const q = doctorFilters.search.toLowerCase();
        const match = s.title.toLowerCase().includes(q) || (m.specialty || "").toLowerCase().includes(q) || (m.hospital_name || "").toLowerCase().includes(q);
        if (!match) return false;
      }
      if (doctorFilters.specialty && m.specialty !== doctorFilters.specialty) return false;
      if (doctorFilters.location && s.area !== doctorFilters.location && s.address !== doctorFilters.location) return false;
      if (doctorFilters.feeRange) {
        const feeNum = parseInt((m.consultation_fee || "").replace(/[^\d]/g, "")) || 0;
        if (doctorFilters.feeRange === "low" && feeNum >= 500) return false;
        if (doctorFilters.feeRange === "mid" && (feeNum < 500 || feeNum > 1000)) return false;
        if (doctorFilters.feeRange === "high" && feeNum <= 1000) return false;
      }
      if (doctorFilters.rating) {
        const minRating = parseInt(doctorFilters.rating);
        if ((m.rating || 0) < minRating) return false;
      }
      return true;
    });
  }, [services, doctorFilters, slug]);

  // Marketplace filtering logic
  const filteredMarketplace = useMemo(() => {
    if (slug !== "marketplace") return services;
    return services.filter(s => {
      const m = s.metadata || {};
      if (marketplaceFilters.search) {
        const q = marketplaceFilters.search.toLowerCase();
        const match = s.title.toLowerCase().includes(q) || (s.description || "").toLowerCase().includes(q) || (m.product_category || "").toLowerCase().includes(q) || (m.seller_name || "").toLowerCase().includes(q);
        if (!match) return false;
      }
      if (marketplaceFilters.category && m.product_category !== marketplaceFilters.category) return false;
      if (marketplaceFilters.condition) {
        const cond = (m.condition || "").toLowerCase();
        if (marketplaceFilters.condition === "ব্যবহৃত" && !cond.includes("ব্যবহৃত")) return false;
        if (marketplaceFilters.condition === "নতুন" && cond !== "নতুন") return false;
        if (marketplaceFilters.condition === "রিফার্বিশড" && cond !== "রিফার্বিশড") return false;
      }
      if (marketplaceFilters.priceRange) {
        const priceNum = parseInt((m.price || "").replace(/[^\d]/g, "")) || 0;
        if (marketplaceFilters.priceRange === "low" && priceNum >= 5000) return false;
        if (marketplaceFilters.priceRange === "mid" && (priceNum < 5000 || priceNum > 20000)) return false;
        if (marketplaceFilters.priceRange === "high" && (priceNum < 20000 || priceNum > 50000)) return false;
        if (marketplaceFilters.priceRange === "premium" && priceNum <= 50000) return false;
      }
      return true;
    });
  }, [services, marketplaceFilters, slug]);

  const filtered = slug === "doctors" ? filteredDoctors : slug === "marketplace" ? filteredMarketplace : services;

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
      case "hospitals":
        return <HospitalCard key={s.id} s={s} colors={colors} />;
      case "education":
        return <EducationCard key={s.id} s={s} colors={colors} />;
      case "jobs":
        return <JobCard key={s.id} s={s} colors={colors} />;
      case "pharmacy":
      case "shops":
        return <ShopCard key={s.id} s={s} colors={colors} />;
      case "marketplace":
        return <MarketplaceCard key={s.id} s={s} colors={colors} />;
      default:
        return <DefaultCard key={s.id} s={s} colors={colors} />;
    }
  };

  return (
    <div className="min-h-screen bg-background max-w-4xl mx-auto pb-20">
      <PageHeader title={category?.name || "সেবাসমূহ"} color={colors.gradient} onAdd={() => setShowForm(true)} />

      <div className="px-4 -mt-2 space-y-3">
        {/* Ad Banner */}
        <PageAdBanner pageSlug={slug || "services"} />

        {/* Doctor Filters */}
        {slug === "doctors" && !loading && services.length > 0 && (
          <DoctorFilters services={services} filters={doctorFilters} setFilters={setDoctorFilters} />
        )}

        {/* Marketplace Hero + Filters */}
        {slug === "marketplace" && !loading && (
          <MarketplaceHero services={services} filters={marketplaceFilters} setFilters={setMarketplaceFilters} totalCount={services.length} />
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="rounded-2xl overflow-hidden border border-border/60">
                <div className="p-4 flex items-start gap-3.5 bg-muted/30">
                  <div className="w-20 h-20 rounded-full skeleton-shimmer shrink-0" />
                  <div className="flex-1 space-y-2 pt-2">
                    <div className="h-5 w-3/4 rounded skeleton-shimmer" />
                    <div className="h-3 w-1/2 rounded skeleton-shimmer" />
                    <div className="flex gap-1.5">
                      <div className="h-5 w-16 rounded-full skeleton-shimmer" />
                      <div className="h-5 w-20 rounded-full skeleton-shimmer" />
                    </div>
                  </div>
                </div>
                <div className="p-4 grid grid-cols-2 gap-2">
                  <div className="h-12 rounded-xl skeleton-shimmer" />
                  <div className="h-12 rounded-xl skeleton-shimmer" />
                  <div className="h-12 rounded-xl skeleton-shimmer" />
                  <div className="h-12 rounded-xl skeleton-shimmer" />
                </div>
                <div className="px-4 pb-4 grid grid-cols-3 gap-2">
                  <div className="h-10 rounded-xl skeleton-shimmer" />
                  <div className="h-10 rounded-xl skeleton-shimmer" />
                  <div className="h-10 rounded-xl skeleton-shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            {slug === "marketplace" ? <Package className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" /> : <Stethoscope className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />}
            <p className="text-muted-foreground font-semibold">কোন তথ্য পাওয়া যায়নি</p>
            {slug === "doctors" && (doctorFilters.specialty || doctorFilters.location || doctorFilters.feeRange || doctorFilters.rating || doctorFilters.search) && (
              <button
                onClick={() => setDoctorFilters({ specialty: "", location: "", feeRange: "", rating: "", search: "" })}
                className="mt-2 text-sm font-bold text-primary"
              >
                ফিল্টার মুছুন
              </button>
            )}
            {slug === "marketplace" && (marketplaceFilters.search || marketplaceFilters.category || marketplaceFilters.condition || marketplaceFilters.priceRange) && (
              <button
                onClick={() => setMarketplaceFilters({ search: "", category: "", condition: "", priceRange: "" })}
                className="mt-2 text-sm font-bold text-primary"
              >
                ফিল্টার মুছুন
              </button>
            )}
          </div>
        ) : (
          <>
            {slug === "doctors" && (
              <p className="text-xs text-muted-foreground font-semibold">{filtered.length}জন ডাক্তার পাওয়া গেছে</p>
            )}
            {slug === "marketplace" && (
              <p className="text-xs text-muted-foreground font-semibold">{filtered.length}টি পণ্য পাওয়া গেছে</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-6">
              {filtered.map(renderCard)}
            </div>
          </>
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
