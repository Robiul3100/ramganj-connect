import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Megaphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Beautiful custom SVG icons for each service category
const SvgIcons: Record<string, { svg: React.ReactNode; bg: string }> = {
  Stethoscope: {
    bg: "hsl(185,65%,90%)",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
        <circle cx="34" cy="34" r="7" fill="hsl(185,65%,45%)" opacity="0.2"/>
        <circle cx="34" cy="34" r="4" fill="hsl(185,65%,45%)"/>
        <path d="M14 8C14 8 10 8 10 14V24C10 31.732 16.268 38 24 38" stroke="hsl(185,65%,40%)" strokeWidth="3" strokeLinecap="round"/>
        <path d="M34 8C34 8 38 8 38 14V24C38 28 36 31.5 33 33.5" stroke="hsl(185,65%,40%)" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="14" cy="8" r="3" fill="hsl(185,65%,50%)" stroke="hsl(185,65%,40%)" strokeWidth="1.5"/>
        <circle cx="34" cy="8" r="3" fill="hsl(185,65%,50%)" stroke="hsl(185,65%,40%)" strokeWidth="1.5"/>
        <path d="M24 38C27.866 38 31 34.866 31 31" stroke="hsl(185,65%,40%)" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  Building2: {
    bg: "hsl(150,55%,90%)",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
        <rect x="8" y="14" width="22" height="30" rx="2" fill="hsl(150,55%,45%)" opacity="0.15"/>
        <rect x="8" y="14" width="22" height="30" rx="2" stroke="hsl(150,55%,40%)" strokeWidth="2.5"/>
        <rect x="30" y="22" width="12" height="22" rx="2" fill="hsl(150,55%,55%)" opacity="0.25"/>
        <rect x="30" y="22" width="12" height="22" rx="2" stroke="hsl(150,55%,40%)" strokeWidth="2.5"/>
        <rect x="13" y="20" width="5" height="5" rx="1" fill="hsl(150,55%,45%)"/>
        <rect x="21" y="20" width="5" height="5" rx="1" fill="hsl(150,55%,45%)"/>
        <rect x="13" y="29" width="5" height="5" rx="1" fill="hsl(150,55%,45%)"/>
        <rect x="21" y="29" width="5" height="5" rx="1" fill="hsl(150,55%,45%)"/>
        <rect x="17" y="36" width="6" height="8" rx="1" fill="hsl(150,55%,50%)"/>
        <path d="M4 44H44" stroke="hsl(150,55%,40%)" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M19 14V10L24 6L29 10V14" stroke="hsl(150,55%,40%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  Pill: {
    bg: "hsl(160,55%,90%)",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
        <rect x="10" y="18" width="28" height="12" rx="6" fill="hsl(160,55%,50%)" opacity="0.2"/>
        <rect x="10" y="18" width="28" height="12" rx="6" stroke="hsl(160,55%,42%)" strokeWidth="2.5"/>
        <rect x="10" y="18" width="14" height="12" rx="6" fill="hsl(160,55%,50%)" opacity="0.5"/>
        <line x1="24" y1="18" x2="24" y2="30" stroke="hsl(160,55%,42%)" strokeWidth="2"/>
        <circle cx="36" cy="12" r="5" fill="hsl(340,65%,60%)" opacity="0.8"/>
        <path d="M33.5 12H38.5M36 9.5V14.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  GraduationCap: {
    bg: "hsl(120,45%,90%)",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
        <path d="M24 10L4 20L24 30L44 20L24 10Z" fill="hsl(120,45%,45%)" opacity="0.3"/>
        <path d="M24 10L4 20L24 30L44 20L24 10Z" stroke="hsl(120,45%,38%)" strokeWidth="2.5" strokeLinejoin="round"/>
        <path d="M12 25V35C12 35 17 41 24 41C31 41 36 35 36 35V25" stroke="hsl(120,45%,38%)" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M40 20V30" stroke="hsl(120,45%,38%)" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="40" cy="32" r="3" fill="hsl(120,45%,50%)"/>
        <path d="M16 27L24 31L32 27" stroke="hsl(120,45%,45%)" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  Store: {
    bg: "hsl(330,55%,92%)",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
        <path d="M6 18L10 8H38L42 18" stroke="hsl(330,55%,48%)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 18C6 21.314 8.686 24 12 24C15.314 24 18 21.314 18 18" stroke="hsl(330,55%,48%)" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M18 18C18 21.314 20.686 24 24 24C27.314 24 30 21.314 30 18" stroke="hsl(330,55%,48%)" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M30 18C30 21.314 32.686 24 36 24C39.314 24 42 21.314 42 18" stroke="hsl(330,55%,48%)" strokeWidth="2.5" strokeLinecap="round"/>
        <rect x="6" y="24" width="36" height="18" rx="1" fill="hsl(330,55%,55%)" opacity="0.15"/>
        <rect x="6" y="24" width="36" height="18" rx="1" stroke="hsl(330,55%,48%)" strokeWidth="2.5"/>
        <rect x="20" y="30" width="8" height="12" rx="1" fill="hsl(330,55%,55%)" opacity="0.4"/>
        <rect x="12" y="30" width="6" height="6" rx="1" fill="hsl(330,55%,55%)" opacity="0.4"/>
      </svg>
    ),
  },
  Briefcase: {
    bg: "hsl(250,40%,92%)",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
        <rect x="6" y="18" width="36" height="24" rx="3" fill="hsl(250,40%,55%)" opacity="0.2"/>
        <rect x="6" y="18" width="36" height="24" rx="3" stroke="hsl(250,40%,48%)" strokeWidth="2.5"/>
        <path d="M16 18V14C16 12.343 17.343 11 19 11H29C30.657 11 32 12.343 32 14V18" stroke="hsl(250,40%,48%)" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M6 28H42" stroke="hsl(250,40%,48%)" strokeWidth="2" strokeLinecap="round"/>
        <rect x="20" y="25" width="8" height="6" rx="1" fill="hsl(250,40%,55%)" opacity="0.6"/>
        <path d="M20 28H28" stroke="hsl(250,40%,48%)" strokeWidth="1.5"/>
      </svg>
    ),
  },
  MapPin: {
    bg: "hsl(0,60%,92%)",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
        <path d="M24 6C17.373 6 12 11.373 12 18C12 26 24 42 24 42C24 42 36 26 36 18C36 11.373 30.627 6 24 6Z" fill="hsl(0,60%,55%)" opacity="0.25"/>
        <path d="M24 6C17.373 6 12 11.373 12 18C12 26 24 42 24 42C24 42 36 26 36 18C36 11.373 30.627 6 24 6Z" stroke="hsl(0,60%,48%)" strokeWidth="2.5" strokeLinejoin="round"/>
        <circle cx="24" cy="18" r="5" fill="hsl(0,60%,55%)" stroke="white" strokeWidth="2"/>
      </svg>
    ),
  },
  Calendar: {
    bg: "hsl(270,60%,92%)",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
        <rect x="6" y="12" width="36" height="30" rx="3" fill="hsl(270,60%,58%)" opacity="0.15"/>
        <rect x="6" y="12" width="36" height="30" rx="3" stroke="hsl(270,60%,50%)" strokeWidth="2.5"/>
        <path d="M6 22H42" stroke="hsl(270,60%,50%)" strokeWidth="2.5"/>
        <circle cx="16" cy="9" r="2" fill="hsl(270,60%,55%)"/>
        <path d="M16 7V12" stroke="hsl(270,60%,50%)" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="32" cy="9" r="2" fill="hsl(270,60%,55%)"/>
        <path d="M32 7V12" stroke="hsl(270,60%,50%)" strokeWidth="2" strokeLinecap="round"/>
        <rect x="14" y="28" width="6" height="6" rx="1" fill="hsl(270,60%,58%)"/>
        <rect x="24" y="28" width="6" height="6" rx="1" fill="hsl(270,60%,58%)" opacity="0.5"/>
      </svg>
    ),
  },
  Globe: {
    bg: "hsl(195,70%,90%)",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
        <circle cx="24" cy="24" r="16" fill="hsl(195,70%,55%)" opacity="0.15"/>
        <circle cx="24" cy="24" r="16" stroke="hsl(195,70%,45%)" strokeWidth="2.5"/>
        <ellipse cx="24" cy="24" rx="7" ry="16" stroke="hsl(195,70%,45%)" strokeWidth="2"/>
        <path d="M8 24H40" stroke="hsl(195,70%,45%)" strokeWidth="2"/>
        <path d="M10 16H38M10 32H38" stroke="hsl(195,70%,45%)" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  Ambulance: {
    bg: "hsl(0,70%,92%)",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
        <rect x="4" y="18" width="30" height="18" rx="2" fill="hsl(0,70%,55%)" opacity="0.2"/>
        <rect x="4" y="18" width="30" height="18" rx="2" stroke="hsl(0,70%,48%)" strokeWidth="2.5"/>
        <path d="M34 26H40L44 30V36H34" stroke="hsl(0,70%,48%)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="38" r="4" fill="hsl(220,20%,40%)" stroke="white" strokeWidth="2"/>
        <circle cx="36" cy="38" r="4" fill="hsl(220,20%,40%)" stroke="white" strokeWidth="2"/>
        <path d="M16 24H22M19 21V27" stroke="hsl(0,70%,48%)" strokeWidth="2" strokeLinecap="round"/>
        <rect x="6" y="12" width="16" height="7" rx="1" fill="hsl(0,70%,55%)" opacity="0.3" stroke="hsl(0,70%,48%)" strokeWidth="1.5"/>
      </svg>
    ),
  },
  Shield: {
    bg: "hsl(265,50%,92%)",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
        <path d="M24 6L8 13V25C8 34.389 15.19 43.182 24 45C32.81 43.182 40 34.389 40 25V13L24 6Z" fill="hsl(265,50%,58%)" opacity="0.2"/>
        <path d="M24 6L8 13V25C8 34.389 15.19 43.182 24 45C32.81 43.182 40 34.389 40 25V13L24 6Z" stroke="hsl(265,50%,50%)" strokeWidth="2.5" strokeLinejoin="round"/>
        <path d="M17 24L22 29L32 19" stroke="hsl(265,50%,50%)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  Flame: {
    bg: "hsl(15,80%,92%)",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
        <path d="M24 6C24 6 30 14 30 20C30 20 34 16 32 10C38 16 40 22 38 30C36 38 30 42 24 42C18 42 10 38 10 30C10 22 16 14 24 6Z" fill="hsl(15,80%,55%)" opacity="0.3"/>
        <path d="M24 6C24 6 30 14 30 20C30 20 34 16 32 10C38 16 40 22 38 30C36 38 30 42 24 42C18 42 10 38 10 30C10 22 16 14 24 6Z" stroke="hsl(15,80%,48%)" strokeWidth="2.5" strokeLinejoin="round"/>
        <path d="M24 42C20 42 16 38 18 32C19.5 28 24 26 24 26C24 26 28.5 28 30 32C32 38 28 42 24 42Z" fill="hsl(40,90%,55%)" opacity="0.8"/>
      </svg>
    ),
  },
  Bus: {
    bg: "hsl(220,25%,90%)",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
        <rect x="6" y="10" width="36" height="26" rx="3" fill="hsl(220,25%,50%)" opacity="0.15"/>
        <rect x="6" y="10" width="36" height="26" rx="3" stroke="hsl(220,25%,42%)" strokeWidth="2.5"/>
        <path d="M6 22H42" stroke="hsl(220,25%,42%)" strokeWidth="2"/>
        <rect x="10" y="14" width="8" height="6" rx="1" fill="hsl(195,60%,60%)" opacity="0.7"/>
        <rect x="20" y="14" width="8" height="6" rx="1" fill="hsl(195,60%,60%)" opacity="0.7"/>
        <rect x="30" y="14" width="8" height="6" rx="1" fill="hsl(195,60%,60%)" opacity="0.7"/>
        <circle cx="14" cy="38" r="4" fill="hsl(220,25%,35%)" stroke="white" strokeWidth="2"/>
        <circle cx="34" cy="38" r="4" fill="hsl(220,25%,35%)" stroke="white" strokeWidth="2"/>
        <path d="M6 36H10M38 36H42" stroke="hsl(220,25%,42%)" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  Zap: {
    bg: "hsl(50,80%,90%)",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
        <path d="M28 6L10 28H24L20 42L38 20H24L28 6Z" fill="hsl(45,90%,52%)" opacity="0.3"/>
        <path d="M28 6L10 28H24L20 42L38 20H24L28 6Z" stroke="hsl(45,85%,42%)" strokeWidth="2.5" strokeLinejoin="round"/>
        <circle cx="38" cy="10" r="4" fill="hsl(45,90%,55%)" opacity="0.5"/>
      </svg>
    ),
  },
  Scale: {
    bg: "hsl(220,30%,92%)",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
        <path d="M24 8V40" stroke="hsl(220,30%,45%)" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M12 40H36" stroke="hsl(220,30%,45%)" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M8 16H24" stroke="hsl(220,30%,45%)" strokeWidth="2"/>
        <path d="M24 16H40" stroke="hsl(220,30%,45%)" strokeWidth="2"/>
        <path d="M8 16L4 26H12L8 16Z" fill="hsl(220,30%,50%)" opacity="0.4" stroke="hsl(220,30%,45%)" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M40 16L36 26H44L40 16Z" fill="hsl(50,80%,50%)" opacity="0.4" stroke="hsl(220,30%,45%)" strokeWidth="2" strokeLinejoin="round"/>
      </svg>
    ),
  },
  Landmark: {
    bg: "hsl(170,55%,90%)",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
        <path d="M6 42H42" stroke="hsl(170,55%,40%)" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M8 22H40" stroke="hsl(170,55%,40%)" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M24 8L6 18H42L24 8Z" fill="hsl(170,55%,48%)" opacity="0.3" stroke="hsl(170,55%,40%)" strokeWidth="2.5" strokeLinejoin="round"/>
        <rect x="10" y="22" width="5" height="20" fill="hsl(170,55%,48%)" opacity="0.3" stroke="hsl(170,55%,40%)" strokeWidth="2"/>
        <rect x="19" y="22" width="10" height="20" fill="hsl(170,55%,48%)" opacity="0.2" stroke="hsl(170,55%,40%)" strokeWidth="2"/>
        <rect x="33" y="22" width="5" height="20" fill="hsl(170,55%,48%)" opacity="0.3" stroke="hsl(170,55%,40%)" strokeWidth="2"/>
      </svg>
    ),
  },
  Users: {
    bg: "hsl(210,50%,91%)",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
        <circle cx="18" cy="16" r="7" fill="hsl(210,50%,55%)" opacity="0.25"/>
        <circle cx="18" cy="16" r="7" stroke="hsl(210,50%,48%)" strokeWidth="2.5"/>
        <path d="M6 40C6 33.373 11.373 28 18 28C24.627 28 30 33.373 30 40" stroke="hsl(210,50%,48%)" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="34" cy="18" r="5" fill="hsl(210,50%,60%)" opacity="0.4" stroke="hsl(210,50%,48%)" strokeWidth="2"/>
        <path d="M32 30C35.866 30 42 32.239 42 40" stroke="hsl(210,50%,48%)" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  Package: {
    bg: "hsl(30,60%,91%)",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
        <path d="M24 6L42 16V32L24 42L6 32V16L24 6Z" fill="hsl(30,60%,55%)" opacity="0.2"/>
        <path d="M24 6L42 16V32L24 42L6 32V16L24 6Z" stroke="hsl(30,60%,45%)" strokeWidth="2.5" strokeLinejoin="round"/>
        <path d="M24 6V42M6 16L24 26L42 16" stroke="hsl(30,60%,45%)" strokeWidth="2" strokeLinecap="round"/>
        <path d="M15 11L33 21" stroke="hsl(30,60%,45%)" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  Sprout: {
    bg: "hsl(100,50%,90%)",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
        <path d="M24 38V22" stroke="hsl(100,50%,38%)" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M24 22C24 22 12 22 12 10C12 10 22 10 24 22Z" fill="hsl(100,50%,48%)" opacity="0.4" stroke="hsl(100,50%,38%)" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M24 30C24 30 36 30 36 18C36 18 26 18 24 30Z" fill="hsl(120,50%,45%)" opacity="0.4" stroke="hsl(100,50%,38%)" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M16 42H32" stroke="hsl(100,50%,38%)" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  Home: {
    bg: "hsl(25,80%,91%)",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
        <path d="M6 22L24 8L42 22" stroke="hsl(25,80%,48%)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 20V40H38V20" stroke="hsl(25,80%,48%)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="10" y="20" width="28" height="20" rx="1" fill="hsl(25,80%,55%)" opacity="0.15"/>
        <rect x="20" y="28" width="8" height="12" rx="1" fill="hsl(25,80%,55%)" opacity="0.5" stroke="hsl(25,80%,48%)" strokeWidth="1.5"/>
        <rect x="13" y="26" width="7" height="7" rx="1" fill="hsl(195,60%,60%)" opacity="0.6"/>
      </svg>
    ),
  },
  BookOpenCheck: {
    bg: "hsl(170,50%,90%)",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
        <path d="M24 10C24 10 14 8 6 12V40C14 36 24 38 24 38" stroke="hsl(170,50%,42%)" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M24 10C24 10 34 8 42 12V40C34 36 24 38 24 38" stroke="hsl(170,50%,42%)" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M24 10V38" stroke="hsl(170,50%,42%)" strokeWidth="2"/>
        <path d="M30 20L33 23L40 16" stroke="hsl(100,50%,40%)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  UtensilsCrossed: {
    bg: "hsl(30,75%,91%)",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
        <path d="M16 8V20C16 23.314 13.314 26 10 26" stroke="hsl(30,75%,48%)" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M10 8V26" stroke="hsl(30,75%,48%)" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M13 26V40" stroke="hsl(30,75%,48%)" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M34 8C34 8 38 14 38 20C38 24 35 27 32 28V40" stroke="hsl(30,75%,48%)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 18C14 18 12 17 10 16" stroke="hsl(30,75%,55%)" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  Wrench: {
    bg: "hsl(220,30%,91%)",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
        <path d="M36 8C32 8 28 11 28 15C28 16 28.3 17 28.8 17.8L10 36L12 40L14 42L32 24C32.8 24.5 34 25 35 25C39 25 42 21 42 17C42 16 41.8 15 41.4 14.1L37 19L33 15L37.5 10.5C36.7 9.2 36 8.5 36 8Z" fill="hsl(220,30%,50%)" opacity="0.25"/>
        <path d="M36 8C32 8 28 11 28 15C28 16 28.3 17 28.8 17.8L10 36L12 40L14 42L32 24C32.8 24.5 34 25 35 25C39 25 42 21 42 17C42 16 41.8 15 41.4 14.1L37 19L33 15L37.5 10.5C36.7 9.2 36 8.5 36 8Z" stroke="hsl(220,30%,42%)" strokeWidth="2.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
  Heart: {
    bg: "hsl(340,70%,92%)",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
        <path d="M24 40C24 40 8 30 8 18C8 12.477 12.477 8 18 8C21.164 8 24 10 24 10C24 10 26.836 8 30 8C35.523 8 40 12.477 40 18C40 30 24 40 24 40Z" fill="hsl(340,70%,60%)" opacity="0.3"/>
        <path d="M24 40C24 40 8 30 8 18C8 12.477 12.477 8 18 8C21.164 8 24 10 24 10C24 10 26.836 8 30 8C35.523 8 40 12.477 40 18C40 30 24 40 24 40Z" stroke="hsl(340,70%,50%)" strokeWidth="2.5" strokeLinejoin="round"/>
        <path d="M15 22L20 27L28 19" stroke="hsl(340,70%,50%)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  Newspaper: {
    bg: "hsl(0,70%,92%)",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
        <rect x="6" y="10" width="30" height="30" rx="2" fill="hsl(0,70%,55%)" opacity="0.15"/>
        <rect x="6" y="10" width="30" height="30" rx="2" stroke="hsl(0,70%,48%)" strokeWidth="2.5"/>
        <rect x="12" y="16" width="18" height="8" rx="1" fill="hsl(0,70%,55%)" opacity="0.3"/>
        <path d="M12 28H30M12 33H24" stroke="hsl(0,70%,48%)" strokeWidth="2" strokeLinecap="round"/>
        <rect x="32" y="10" width="10" height="18" rx="1" fill="hsl(0,70%,48%)" opacity="0.15" stroke="hsl(0,70%,48%)" strokeWidth="2"/>
      </svg>
    ),
  },
  Activity: {
    bg: "hsl(190,60%,90%)",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
        <path d="M4 24H14L18 12L24 36L30 20L34 28H44" stroke="hsl(190,60%,42%)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="24" cy="24" r="16" stroke="hsl(190,60%,42%)" strokeWidth="1" strokeDasharray="2 3" opacity="0.4"/>
      </svg>
    ),
  },
  Car: {
    bg: "hsl(160,55%,90%)",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
        <path d="M8 26L12 16H36L40 26" stroke="hsl(160,55%,40%)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="4" y="26" width="40" height="12" rx="2" fill="hsl(160,55%,48%)" opacity="0.2"/>
        <rect x="4" y="26" width="40" height="12" rx="2" stroke="hsl(160,55%,40%)" strokeWidth="2.5"/>
        <rect x="14" y="18" width="20" height="8" rx="1" fill="hsl(195,65%,65%)" opacity="0.5"/>
        <circle cx="13" cy="40" r="4" fill="hsl(220,25%,35%)" stroke="white" strokeWidth="2"/>
        <circle cx="35" cy="40" r="4" fill="hsl(220,25%,35%)" stroke="white" strokeWidth="2"/>
        <path d="M8 30H40" stroke="hsl(160,55%,40%)" strokeWidth="1.5"/>
      </svg>
    ),
  },
  TrendingUp: {
    bg: "hsl(140,50%,90%)",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
        <path d="M6 36L18 22L26 30L38 16" stroke="hsl(140,50%,42%)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M32 16H38V22" stroke="hsl(140,50%,42%)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 42H42" stroke="hsl(140,50%,42%)" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="38" cy="16" r="3" fill="hsl(140,50%,55%)"/>
        <circle cx="26" cy="30" r="3" fill="hsl(140,50%,55%)"/>
      </svg>
    ),
  },
  BedDouble: {
    bg: "hsl(35,70%,91%)",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
        <path d="M6 32V18H42V32" stroke="hsl(35,70%,48%)" strokeWidth="2.5" strokeLinecap="round"/>
        <rect x="6" y="28" width="36" height="10" rx="2" fill="hsl(35,70%,55%)" opacity="0.2" stroke="hsl(35,70%,48%)" strokeWidth="2.5"/>
        <rect x="10" y="20" width="12" height="8" rx="2" fill="hsl(195,60%,65%)" opacity="0.5" stroke="hsl(35,70%,48%)" strokeWidth="1.5"/>
        <rect x="26" y="20" width="12" height="8" rx="2" fill="hsl(195,60%,65%)" opacity="0.5" stroke="hsl(35,70%,48%)" strokeWidth="1.5"/>
        <path d="M6 38V42M42 38V42" stroke="hsl(35,70%,48%)" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  Coffee: {
    bg: "hsl(15,70%,91%)",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
        <path d="M8 18H34V36C34 39.314 31.314 42 28 42H14C10.686 42 8 39.314 8 36V18Z" fill="hsl(15,70%,55%)" opacity="0.2"/>
        <path d="M8 18H34V36C34 39.314 31.314 42 28 42H14C10.686 42 8 39.314 8 36V18Z" stroke="hsl(15,70%,48%)" strokeWidth="2.5"/>
        <path d="M34 22H38C40.209 22 42 23.791 42 26V28C42 30.209 40.209 32 38 32H34" stroke="hsl(15,70%,48%)" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M18 10C18 10 16 13 18 16" stroke="hsl(15,70%,48%)" strokeWidth="2" strokeLinecap="round"/>
        <path d="M24 8C24 8 22 12 24 16" stroke="hsl(15,70%,48%)" strokeWidth="2" strokeLinecap="round"/>
        <path d="M6 44H40" stroke="hsl(15,70%,48%)" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  Video: {
    bg: "hsl(240,50%,92%)",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
        <rect x="4" y="14" width="28" height="20" rx="3" fill="hsl(240,50%,58%)" opacity="0.2"/>
        <rect x="4" y="14" width="28" height="20" rx="3" stroke="hsl(240,50%,50%)" strokeWidth="2.5"/>
        <path d="M32 20L44 14V34L32 28" stroke="hsl(240,50%,50%)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="18" cy="24" r="5" fill="hsl(240,50%,60%)" opacity="0.4"/>
        <path d="M16 24L21 24M16 21L16 27" stroke="hsl(240,50%,50%)" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  TreePine: {
    bg: "hsl(130,50%,90%)",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
        <path d="M24 6L10 24H18L8 38H40L30 24H38L24 6Z" fill="hsl(130,50%,45%)" opacity="0.3"/>
        <path d="M24 6L10 24H18L8 38H40L30 24H38L24 6Z" stroke="hsl(130,50%,38%)" strokeWidth="2.5" strokeLinejoin="round"/>
        <rect x="20" y="38" width="8" height="6" rx="1" fill="hsl(25,60%,45%)" opacity="0.6" stroke="hsl(25,60%,38%)" strokeWidth="1.5"/>
      </svg>
    ),
  },
  Tag: {
    bg: "hsl(210,65%,91%)",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
        <path d="M8 8H26L42 24L26 40H8V8Z" fill="hsl(210,65%,58%)" opacity="0.2"/>
        <path d="M8 8H26L42 24L26 40H8V8Z" stroke="hsl(210,65%,48%)" strokeWidth="2.5" strokeLinejoin="round"/>
        <circle cx="16" cy="16" r="3" fill="hsl(210,65%,55%)" stroke="hsl(210,65%,40%)" strokeWidth="1.5"/>
      </svg>
    ),
  },
  PenTool: {
    bg: "hsl(250,40%,92%)",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
        <path d="M34 6L42 14L20 36H12V28L34 6Z" fill="hsl(250,40%,55%)" opacity="0.2"/>
        <path d="M34 6L42 14L20 36H12V28L34 6Z" stroke="hsl(250,40%,48%)" strokeWidth="2.5" strokeLinejoin="round"/>
        <path d="M28 12L36 20" stroke="hsl(250,40%,48%)" strokeWidth="2"/>
        <path d="M8 42L12 36" stroke="hsl(250,40%,48%)" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="38" cy="10" r="2" fill="hsl(250,40%,60%)"/>
      </svg>
    ),
  },
  Umbrella: {
    bg: "hsl(200,60%,90%)",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
        <path d="M24 8C14.059 8 6 16.059 6 26H42C42 16.059 33.941 8 24 8Z" fill="hsl(200,60%,52%)" opacity="0.25"/>
        <path d="M24 8C14.059 8 6 16.059 6 26H42C42 16.059 33.941 8 24 8Z" stroke="hsl(200,60%,45%)" strokeWidth="2.5"/>
        <path d="M24 26V38C24 40.209 25.791 42 28 42C30.209 42 32 40.209 32 38" stroke="hsl(200,60%,45%)" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M14 26C14 22 18 22 18 26C18 22 22 22 22 26" stroke="hsl(200,60%,45%)" strokeWidth="1.5"/>
        <path d="M26 26C26 22 30 22 30 26C30 22 34 22 34 26" stroke="hsl(200,60%,45%)" strokeWidth="1.5"/>
        <path d="M24 8V6" stroke="hsl(200,60%,45%)" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
  },
};

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  description?: string | null;
  view_count?: number;
}

const newsItem = { id: "news-static", name: "খবর ও সংবাদ", slug: "news", icon: "Newspaper", sort_order: -1, description: "সকল খবর ও সংবাদ", view_count: 0 };

interface Ad {
  id: string;
  title: string;
  description?: string | null;
  image_url?: string | null;
  link_url?: string | null;
}

const AdCard = ({ ad }: { ad?: Ad }) => {
  if (!ad) return null;
  const content = (
    <div className="rounded-xl overflow-hidden">
      {ad.image_url ? (
        <img src={ad.image_url} alt={ad.title} className="w-full aspect-[6/1] object-cover" />
      ) : (
        <div className="w-full aspect-[6/1] bg-primary/5 flex items-center justify-center gap-2">
          <Megaphone className="w-5 h-5 text-primary" />
          <p className="text-sm font-bold text-primary">{ad.title}</p>
        </div>
      )}
    </div>
  );
  return ad.link_url ? <a href={ad.link_url} target="_blank" rel="noopener noreferrer">{content}</a> : content;
};

const ServiceGrid = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "card">("grid");

  useEffect(() => {
    const fetchData = async () => {
      const [catRes, adRes] = await Promise.all([
        supabase.from("service_categories").select("*").eq("is_active", true).order("sort_order"),
        (supabase.from as any)("advertisements").select("*").eq("is_active", true).order("sort_order"),
      ]);
      setCategories((catRes.data as Category[]) || []);
      setAds((adRes.data as Ad[]) || []);
    };
    fetchData();
  }, []);

  const allItems = [newsItem as Category, ...categories];

  const staticRoutes: Record<string, string> = {
    news: "/news",
  };

  const handleNavigate = async (cat: Category) => {
    if (cat.id !== "news-static") {
      await supabase.rpc("increment_category_view", { cat_id: cat.id });
      setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, view_count: (c.view_count ?? 0) + 1 } : c));
    }
    const route = staticRoutes[cat.slug] || `/service/${cat.slug}`;
    navigate(route);
  };

  const handleViewModeChange = (mode: "grid" | "card") => {
    setViewMode(mode);
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  };

  return (
    <section className="px-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">সেবাসমূহ</h2>
        <div className="flex items-center gap-1 bg-muted rounded-full p-0.5">
          <button
            onClick={() => handleViewModeChange("grid")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${viewMode === "grid" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"}`}
          >
            গ্রিড
          </button>
          <button
            onClick={() => handleViewModeChange("card")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${viewMode === "card" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"}`}
          >
            কার্ড
          </button>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {allItems.map((cat) => {
            const iconData = SvgIcons[cat.icon] || SvgIcons["Tag"];
            return (
              <button
                key={cat.id}
                onClick={() => handleNavigate(cat)}
                className="relative bg-card rounded-2xl border border-border/60 flex flex-col items-center gap-1.5 py-4 px-1.5 h-full transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95 hover:border-primary/30"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: iconData.bg }}
                >
                  {iconData.svg}
                </div>
                <span className="text-[11px] font-semibold text-foreground text-center leading-tight line-clamp-2">
                  {cat.name}
                </span>
                <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
                  <Eye className="w-2.5 h-2.5" /> {cat.view_count ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {allItems.map((cat, index) => {
            const iconData = SvgIcons[cat.icon] || SvgIcons["Tag"];
            return (
              <div key={cat.id}>
                <button
                  onClick={() => handleNavigate(cat)}
                  className="bg-card rounded-2xl border border-border/60 flex items-center gap-3.5 p-3.5 w-full text-left transition-all duration-200 hover:shadow-md hover:scale-[1.01] active:scale-[0.98] hover:border-primary/30"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: iconData.bg }}
                  >
                    {iconData.svg}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-foreground leading-tight">{cat.name}</h3>
                    {cat.description && (
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{cat.description}</p>
                    )}
                  </div>
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0 bg-muted/60 px-2 py-0.5 rounded-full">
                    <Eye className="w-3 h-3" /> {cat.view_count ?? 0}
                  </span>
                </button>
                {(index + 1) % 5 === 0 && ads.length > 0 && <div className="mt-2.5"><AdCard ad={ads[Math.floor(index / 5) % ads.length]} /></div>}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default ServiceGrid;
