import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Megaphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Animated colorful SVG icons for each service category
// Border colors matching each icon's theme
export const borderColorMap: Record<string, string> = {
  Stethoscope: "hsl(195,80%,70%)",
  Building2: "hsl(160,60%,70%)",
  Pill: "hsl(150,55%,70%)",
  GraduationCap: "hsl(40,85%,72%)",
  Store: "hsl(340,60%,75%)",
  Briefcase: "hsl(230,55%,72%)",
  MapPin: "hsl(0,70%,75%)",
  Calendar: "hsl(280,58%,75%)",
  Globe: "hsl(205,70%,70%)",
  Ambulance: "hsl(355,68%,75%)",
  Shield: "hsl(235,48%,72%)",
  Flame: "hsl(15,82%,72%)",
  Bus: "hsl(218,48%,72%)",
  Zap: "hsl(45,88%,68%)",
  Scale: "hsl(230,35%,72%)",
  Landmark: "hsl(178,55%,68%)",
  Users: "hsl(220,52%,72%)",
  Package: "hsl(25,62%,72%)",
  Sprout: "hsl(115,50%,68%)",
  Home: "hsl(22,82%,72%)",
  BookOpenCheck: "hsl(180,52%,68%)",
  UtensilsCrossed: "hsl(25,78%,72%)",
  Wrench: "hsl(215,32%,70%)",
  Heart: "hsl(348,72%,75%)",
  Newspaper: "hsl(355,68%,75%)",
  Activity: "hsl(200,62%,70%)",
  Car: "hsl(168,58%,68%)",
  Building: "hsl(218,42%,72%)",
  TrendingUp: "hsl(150,52%,68%)",
  BedDouble: "hsl(30,72%,72%)",
  Coffee: "hsl(15,72%,72%)",
  Video: "hsl(355,62%,75%)",
  TreePine: "hsl(140,52%,68%)",
  Tag: "hsl(220,62%,72%)",
  PenTool: "hsl(260,42%,75%)",
  Umbrella: "hsl(210,62%,70%)",
  ShoppingBag: "hsl(338,58%,75%)",
  SearchX: "hsl(20,72%,72%)",
};

export const SvgIcons: Record<string, { svg: React.ReactNode; bg: string }> = {
  Stethoscope: {
    bg: "linear-gradient(135deg, hsl(185,50%,95%), hsl(195,55%,92%))",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7 animate-icon-float">
        <defs><linearGradient id="steth-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="hsl(185,70%,50%)"/><stop offset="100%" stopColor="hsl(200,80%,40%)"/></linearGradient></defs>
        <path d="M14 8C14 8 9 8 9 15V25C9 33 16 39 24 39" stroke="url(#steth-g)" strokeWidth="3" strokeLinecap="round" fill="none"/>
        <path d="M34 8C34 8 39 8 39 15V25C39 29 37 32 34 34" stroke="url(#steth-g)" strokeWidth="3" strokeLinecap="round" fill="none"/>
        <circle cx="14" cy="8" r="3.5" fill="hsl(185,70%,55%)" stroke="hsl(185,80%,40%)" strokeWidth="1.5"><animate attributeName="r" values="3.5;4;3.5" dur="2s" repeatCount="indefinite"/></circle>
        <circle cx="34" cy="8" r="3.5" fill="hsl(185,70%,55%)" stroke="hsl(185,80%,40%)" strokeWidth="1.5"/>
        <circle cx="34" cy="35" r="6" fill="hsl(340,75%,58%)" opacity="0.9"><animate attributeName="r" values="6;7;6" dur="1.5s" repeatCount="indefinite"/></circle>
        <circle cx="34" cy="35" r="3" fill="hsl(340,85%,65%)"/>
      </svg>
    ),
  },
  Building2: {
    bg: "linear-gradient(135deg, hsl(150,45%,95%), hsl(165,50%,92%))",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7 animate-icon-float">
        <defs><linearGradient id="bld-g" x1="0" y1="0" x2="0.5" y2="1"><stop offset="0%" stopColor="hsl(150,60%,50%)"/><stop offset="100%" stopColor="hsl(165,65%,38%)"/></linearGradient></defs>
        <rect x="8" y="12" width="20" height="32" rx="2" fill="url(#bld-g)" opacity="0.2" stroke="url(#bld-g)" strokeWidth="2.5"/>
        <rect x="28" y="20" width="14" height="24" rx="2" fill="hsl(150,55%,55%)" opacity="0.15" stroke="url(#bld-g)" strokeWidth="2.5"/>
        <rect x="13" y="18" width="4" height="4" rx="1" fill="hsl(50,90%,60%)"><animate attributeName="fill-opacity" values="0.5;1;0.5" dur="2.5s" begin="0s" repeatCount="indefinite"/></rect>
        <rect x="21" y="18" width="4" height="4" rx="1" fill="hsl(50,90%,60%)"><animate attributeName="fill-opacity" values="0.5;1;0.5" dur="2.5s" begin="0.6s" repeatCount="indefinite"/></rect>
        <rect x="13" y="26" width="4" height="4" rx="1" fill="hsl(50,90%,60%)"><animate attributeName="fill-opacity" values="0.5;1;0.5" dur="2.5s" begin="1.2s" repeatCount="indefinite"/></rect>
        <rect x="21" y="26" width="4" height="4" rx="1" fill="hsl(50,90%,60%)"><animate attributeName="fill-opacity" values="0.5;1;0.5" dur="2.5s" begin="1.8s" repeatCount="indefinite"/></rect>
        <rect x="16" y="36" width="6" height="8" rx="1.5" fill="hsl(150,55%,50%)" opacity="0.6"/>
        <path d="M4 44H44" stroke="url(#bld-g)" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  Pill: {
    bg: "linear-gradient(135deg, hsl(160,45%,95%), hsl(145,50%,92%))",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7 animate-icon-bounce">
        <defs><linearGradient id="pill-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="hsl(160,60%,48%)"/><stop offset="100%" stopColor="hsl(140,55%,40%)"/></linearGradient></defs>
        <rect x="6" y="16" width="36" height="16" rx="8" fill="url(#pill-g)" opacity="0.15" stroke="url(#pill-g)" strokeWidth="2.5" transform="rotate(-30 24 24)"/>
        <rect x="6" y="16" width="18" height="16" rx="8" fill="url(#pill-g)" opacity="0.4" transform="rotate(-30 24 24)"/>
        <circle cx="38" cy="10" r="6" fill="hsl(340,70%,58%)"><animate attributeName="r" values="5.5;6.5;5.5" dur="1.5s" repeatCount="indefinite"/></circle>
        <path d="M35.5 10H40.5M38 7.5V12.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  GraduationCap: {
    bg: "linear-gradient(135deg, hsl(45,60%,95%), hsl(35,55%,92%))",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7 animate-icon-float">
        <defs><linearGradient id="grad-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="hsl(45,90%,50%)"/><stop offset="100%" stopColor="hsl(30,80%,42%)"/></linearGradient></defs>
        <path d="M24 8L2 20L24 32L46 20L24 8Z" fill="url(#grad-g)" opacity="0.35" stroke="url(#grad-g)" strokeWidth="2.5" strokeLinejoin="round"/>
        <path d="M12 26V36C12 36 17 42 24 42C31 42 36 36 36 36V26" stroke="url(#grad-g)" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M42 20V32" stroke="url(#grad-g)" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="42" cy="34" r="3" fill="hsl(0,70%,55%)"><animate attributeName="fill-opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/></circle>
        <path d="M15 28L24 33L33 28" stroke="hsl(45,90%,55%)" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
      </svg>
    ),
  },
  Store: {
    bg: "linear-gradient(135deg, hsl(330,40%,96%), hsl(345,45%,93%))",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7 animate-icon-float">
        <defs><linearGradient id="store-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="hsl(330,60%,55%)"/><stop offset="100%" stopColor="hsl(345,65%,45%)"/></linearGradient></defs>
        <path d="M6 18L10 8H38L42 18" stroke="url(#store-g)" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M6 18C6 21.3 8.7 24 12 24C15.3 24 18 21.3 18 18C18 21.3 20.7 24 24 24C27.3 24 30 21.3 30 18C30 21.3 32.7 24 36 24C39.3 24 42 21.3 42 18" stroke="url(#store-g)" strokeWidth="2.5"/>
        <rect x="6" y="24" width="36" height="18" rx="1" fill="hsl(330,55%,55%)" opacity="0.1" stroke="url(#store-g)" strokeWidth="2.5"/>
        <rect x="20" y="30" width="8" height="12" rx="1.5" fill="hsl(330,55%,55%)" opacity="0.3"/>
        <rect x="11" y="29" width="7" height="7" rx="1" fill="hsl(50,85%,58%)" opacity="0.6"><animate attributeName="fill-opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite"/></rect>
      </svg>
    ),
  },
  Briefcase: {
    bg: "linear-gradient(135deg, hsl(220,45%,96%), hsl(235,40%,93%))",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7 animate-icon-float">
        <defs><linearGradient id="brief-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="hsl(220,60%,55%)"/><stop offset="100%" stopColor="hsl(240,55%,45%)"/></linearGradient></defs>
        <rect x="5" y="16" width="38" height="26" rx="4" fill="url(#brief-g)" opacity="0.15" stroke="url(#brief-g)" strokeWidth="2.5"/>
        <path d="M16 16V12C16 10.3 17.3 9 19 9H29C30.7 9 32 10.3 32 12V16" stroke="url(#brief-g)" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M5 28H43" stroke="url(#brief-g)" strokeWidth="2"/>
        <rect x="19" y="24" width="10" height="8" rx="2" fill="hsl(45,90%,55%)" opacity="0.8"><animate attributeName="fill-opacity" values="0.5;0.9;0.5" dur="2s" repeatCount="indefinite"/></rect>
      </svg>
    ),
  },
  MapPin: {
    bg: "linear-gradient(135deg, hsl(0,45%,96%), hsl(350,50%,93%))",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7 animate-icon-bounce">
        <defs><linearGradient id="pin-g" x1="0.5" y1="0" x2="0.5" y2="1"><stop offset="0%" stopColor="hsl(0,75%,58%)"/><stop offset="100%" stopColor="hsl(350,70%,45%)"/></linearGradient></defs>
        <path d="M24 4C16.3 4 10 10.3 10 18C10 28 24 44 24 44C24 44 38 28 38 18C38 10.3 31.7 4 24 4Z" fill="url(#pin-g)" opacity="0.2" stroke="url(#pin-g)" strokeWidth="2.5"/>
        <circle cx="24" cy="18" r="6" fill="hsl(0,75%,58%)" stroke="white" strokeWidth="2.5"><animate attributeName="r" values="5.5;6.5;5.5" dur="2s" repeatCount="indefinite"/></circle>
        <circle cx="24" cy="18" r="2.5" fill="white"/>
      </svg>
    ),
  },
  Calendar: {
    bg: "linear-gradient(135deg, hsl(270,45%,96%), hsl(285,40%,93%))",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7 animate-icon-float">
        <defs><linearGradient id="cal-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="hsl(270,65%,55%)"/><stop offset="100%" stopColor="hsl(290,60%,45%)"/></linearGradient></defs>
        <rect x="6" y="10" width="36" height="32" rx="4" fill="url(#cal-g)" opacity="0.12" stroke="url(#cal-g)" strokeWidth="2.5"/>
        <rect x="6" y="10" width="36" height="10" rx="4" fill="url(#cal-g)" opacity="0.3"/>
        <path d="M16 5V12M32 5V12" stroke="url(#cal-g)" strokeWidth="3" strokeLinecap="round"/>
        <rect x="14" y="26" width="7" height="7" rx="2" fill="hsl(340,75%,58%)"><animate attributeName="fill-opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/></rect>
        <rect x="27" y="26" width="7" height="7" rx="2" fill="hsl(270,60%,58%)" opacity="0.4"/>
        <rect x="14" y="35" width="7" height="3" rx="1" fill="hsl(270,60%,55%)" opacity="0.25"/>
      </svg>
    ),
  },
  Globe: {
    bg: "linear-gradient(135deg, hsl(195,50%,95%), hsl(210,45%,92%))",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7 animate-icon-spin-slow">
        <defs><linearGradient id="globe-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="hsl(195,75%,52%)"/><stop offset="100%" stopColor="hsl(215,70%,42%)"/></linearGradient></defs>
        <circle cx="24" cy="24" r="17" fill="url(#globe-g)" opacity="0.12" stroke="url(#globe-g)" strokeWidth="2.5"/>
        <ellipse cx="24" cy="24" rx="7" ry="17" stroke="url(#globe-g)" strokeWidth="2" fill="none"/>
        <path d="M7 24H41" stroke="url(#globe-g)" strokeWidth="2"/>
        <path d="M9 15H39M9 33H39" stroke="url(#globe-g)" strokeWidth="1.5" opacity="0.5"/>
        <circle cx="24" cy="24" r="3" fill="hsl(45,90%,55%)"><animate attributeName="fill-opacity" values="0.4;0.9;0.4" dur="3s" repeatCount="indefinite"/></circle>
      </svg>
    ),
  },
  Ambulance: {
    bg: "linear-gradient(135deg, hsl(0,50%,96%), hsl(355,45%,93%))",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7 animate-icon-float">
        <defs><linearGradient id="amb-g" x1="0" y1="0" x2="1" y2="0.5"><stop offset="0%" stopColor="hsl(0,75%,55%)"/><stop offset="100%" stopColor="hsl(350,70%,48%)"/></linearGradient></defs>
        <rect x="4" y="16" width="30" height="20" rx="3" fill="url(#amb-g)" opacity="0.15" stroke="url(#amb-g)" strokeWidth="2.5"/>
        <path d="M34 24H40L44 29V36H34" stroke="url(#amb-g)" strokeWidth="2.5" strokeLinejoin="round"/>
        <circle cx="13" cy="38" r="4" fill="hsl(220,25%,35%)" stroke="white" strokeWidth="2.5"/>
        <circle cx="38" cy="38" r="4" fill="hsl(220,25%,35%)" stroke="white" strokeWidth="2.5"/>
        <path d="M16 23H22M19 20V26" stroke="white" strokeWidth="3" strokeLinecap="round"><animate attributeName="stroke-opacity" values="0.6;1;0.6" dur="1s" repeatCount="indefinite"/></path>
      </svg>
    ),
  },
  Shield: {
    bg: "linear-gradient(135deg, hsl(225,35%,96%), hsl(240,30%,93%))",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7 animate-icon-float">
        <defs><linearGradient id="shield-g" x1="0.5" y1="0" x2="0.5" y2="1"><stop offset="0%" stopColor="hsl(225,55%,55%)"/><stop offset="100%" stopColor="hsl(240,50%,42%)"/></linearGradient></defs>
        <path d="M24 4L6 12V26C6 36 14 44 24 46C34 44 42 36 42 26V12L24 4Z" fill="url(#shield-g)" opacity="0.15" stroke="url(#shield-g)" strokeWidth="2.5" strokeLinejoin="round"/>
        <path d="M16 24L22 30L32 18" stroke="hsl(140,60%,45%)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/></path>
      </svg>
    ),
  },
  Flame: {
    bg: "linear-gradient(135deg, hsl(20,55%,96%), hsl(10,50%,93%))",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7 animate-icon-float">
        <defs><linearGradient id="flame-g" x1="0.5" y1="0" x2="0.5" y2="1"><stop offset="0%" stopColor="hsl(40,95%,55%)"/><stop offset="50%" stopColor="hsl(20,90%,50%)"/><stop offset="100%" stopColor="hsl(5,80%,45%)"/></linearGradient></defs>
        <path d="M24 4C24 4 32 14 32 22C32 22 37 17 34 10C40 16 42 23 40 31C38 39 31 43 24 43C17 43 9 39 9 31C9 23 15 14 24 4Z" fill="url(#flame-g)" opacity="0.25" stroke="url(#flame-g)" strokeWidth="2.5" strokeLinejoin="round"/>
        <path d="M24 43C20 43 16 39 18 33C19.5 29 24 27 24 27C24 27 28.5 29 30 33C32 39 28 43 24 43Z" fill="hsl(45,95%,58%)" opacity="0.9"><animate attributeName="fill-opacity" values="0.6;1;0.6" dur="0.7s" repeatCount="indefinite"/></path>
      </svg>
    ),
  },
  Bus: {
    bg: "linear-gradient(135deg, hsl(210,35%,96%), hsl(220,30%,93%))",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7 animate-icon-float">
        <defs><linearGradient id="bus-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="hsl(210,55%,52%)"/><stop offset="100%" stopColor="hsl(225,50%,42%)"/></linearGradient></defs>
        <rect x="8" y="8" width="32" height="28" rx="4" fill="url(#bus-g)" opacity="0.12" stroke="url(#bus-g)" strokeWidth="2.5"/>
        <rect x="8" y="8" width="32" height="10" rx="4" fill="url(#bus-g)" opacity="0.2"/>
        <rect x="12" y="12" width="8" height="6" rx="1.5" fill="hsl(195,70%,65%)" opacity="0.8"/>
        <rect x="22" y="12" width="8" height="6" rx="1.5" fill="hsl(195,70%,65%)" opacity="0.8"/>
        <rect x="32" y="12" width="6" height="6" rx="1.5" fill="hsl(195,70%,65%)" opacity="0.8"/>
        <path d="M8 24H40" stroke="url(#bus-g)" strokeWidth="2"/>
        <circle cx="15" cy="40" r="4" fill="hsl(220,30%,30%)" stroke="hsl(0,0%,90%)" strokeWidth="2"><animate attributeName="r" values="3.5;4.2;3.5" dur="0.8s" repeatCount="indefinite"/></circle>
        <circle cx="33" cy="40" r="4" fill="hsl(220,30%,30%)" stroke="hsl(0,0%,90%)" strokeWidth="2"><animate attributeName="r" values="3.5;4.2;3.5" dur="0.8s" repeatCount="indefinite"/></circle>
      </svg>
    ),
  },
  Zap: {
    bg: "linear-gradient(135deg, hsl(50,55%,95%), hsl(40,50%,92%))",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7 animate-icon-pulse">
        <defs><linearGradient id="zap-g" x1="0.5" y1="0" x2="0.5" y2="1"><stop offset="0%" stopColor="hsl(50,95%,55%)"/><stop offset="100%" stopColor="hsl(35,90%,45%)"/></linearGradient></defs>
        <path d="M28 4L8 26H24L20 44L40 22H24L28 4Z" fill="url(#zap-g)" opacity="0.3" stroke="url(#zap-g)" strokeWidth="2.5" strokeLinejoin="round"/>
        <path d="M28 4L8 26H24L20 44L40 22H24L28 4Z" fill="url(#zap-g)" opacity="0.15"/>
        <circle cx="14" cy="18" r="4" fill="hsl(50,95%,60%)" opacity="0.6"><animate attributeName="fill-opacity" values="0.2;0.7;0.2" dur="1s" repeatCount="indefinite"/></circle>
      </svg>
    ),
  },
  Scale: {
    bg: "linear-gradient(135deg, hsl(225,25%,96%), hsl(235,20%,93%))",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7 animate-icon-float">
        <defs><linearGradient id="scale-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="hsl(225,40%,50%)"/><stop offset="100%" stopColor="hsl(240,35%,42%)"/></linearGradient></defs>
        <path d="M24 6V42" stroke="url(#scale-g)" strokeWidth="3" strokeLinecap="round"/>
        <path d="M14 42H34" stroke="url(#scale-g)" strokeWidth="3" strokeLinecap="round"/>
        <path d="M6 16H24H42" stroke="url(#scale-g)" strokeWidth="2.5"/>
        <path d="M6 16L2 28H10L6 16Z" fill="hsl(50,85%,55%)" opacity="0.5" stroke="url(#scale-g)" strokeWidth="2" strokeLinejoin="round"><animate attributeName="fill-opacity" values="0.3;0.6;0.3" dur="3s" repeatCount="indefinite"/></path>
        <path d="M42 16L38 28H46L42 16Z" fill="hsl(225,40%,55%)" opacity="0.35" stroke="url(#scale-g)" strokeWidth="2" strokeLinejoin="round"/>
      </svg>
    ),
  },
  Landmark: {
    bg: "linear-gradient(135deg, hsl(170,45%,95%), hsl(185,40%,92%))",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7 animate-icon-float">
        <defs><linearGradient id="land-g" x1="0.5" y1="0" x2="0.5" y2="1"><stop offset="0%" stopColor="hsl(170,60%,48%)"/><stop offset="100%" stopColor="hsl(185,55%,38%)"/></linearGradient></defs>
        <path d="M24 6L4 18H44L24 6Z" fill="url(#land-g)" opacity="0.25" stroke="url(#land-g)" strokeWidth="2.5" strokeLinejoin="round"/>
        <rect x="9" y="20" width="6" height="20" rx="1" fill="url(#land-g)" opacity="0.2" stroke="url(#land-g)" strokeWidth="2"/>
        <rect x="21" y="20" width="6" height="20" rx="1" fill="url(#land-g)" opacity="0.2" stroke="url(#land-g)" strokeWidth="2"/>
        <rect x="33" y="20" width="6" height="20" rx="1" fill="url(#land-g)" opacity="0.2" stroke="url(#land-g)" strokeWidth="2"/>
        <path d="M4 42H44" stroke="url(#land-g)" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="24" cy="12" r="2" fill="hsl(45,90%,55%)"><animate attributeName="fill-opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite"/></circle>
      </svg>
    ),
  },
  Users: {
    bg: "linear-gradient(135deg, hsl(210,40%,96%), hsl(225,35%,93%))",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7 animate-icon-float">
        <defs><linearGradient id="users-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="hsl(210,55%,55%)"/><stop offset="100%" stopColor="hsl(230,50%,45%)"/></linearGradient></defs>
        <circle cx="18" cy="14" r="8" fill="url(#users-g)" opacity="0.15" stroke="url(#users-g)" strokeWidth="2.5"/>
        <path d="M4 42C4 33 10 26 18 26C26 26 32 33 32 42" stroke="url(#users-g)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <circle cx="35" cy="17" r="6" fill="hsl(340,65%,60%)" opacity="0.3" stroke="url(#users-g)" strokeWidth="2"><animate attributeName="fill-opacity" values="0.2;0.5;0.2" dur="2.5s" repeatCount="indefinite"/></circle>
        <path d="M34 28C38 28 44 31 44 42" stroke="url(#users-g)" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  Package: {
    bg: "linear-gradient(135deg, hsl(30,45%,96%), hsl(20,40%,93%))",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7 animate-icon-float">
        <defs><linearGradient id="pkg-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="hsl(30,65%,52%)"/><stop offset="100%" stopColor="hsl(15,60%,42%)"/></linearGradient></defs>
        <path d="M24 4L44 14V34L24 44L4 34V14L24 4Z" fill="url(#pkg-g)" opacity="0.12" stroke="url(#pkg-g)" strokeWidth="2.5" strokeLinejoin="round"/>
        <path d="M4 14L24 24L44 14" stroke="url(#pkg-g)" strokeWidth="2" strokeLinecap="round"/>
        <path d="M24 24V44" stroke="url(#pkg-g)" strokeWidth="2"/>
        <path d="M14 9L34 19" stroke="hsl(45,90%,55%)" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
      </svg>
    ),
  },
  Sprout: {
    bg: "linear-gradient(135deg, hsl(100,40%,95%), hsl(115,35%,92%))",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7 animate-icon-float">
        <defs><linearGradient id="sprout-g" x1="0.5" y1="0" x2="0.5" y2="1"><stop offset="0%" stopColor="hsl(110,55%,48%)"/><stop offset="100%" stopColor="hsl(130,50%,38%)"/></linearGradient></defs>
        <path d="M24 40V20" stroke="url(#sprout-g)" strokeWidth="3" strokeLinecap="round"/>
        <path d="M24 20C24 20 10 20 10 8C10 8 22 8 24 20Z" fill="hsl(110,55%,48%)" opacity="0.4" stroke="url(#sprout-g)" strokeWidth="2.5" strokeLinejoin="round"><animate attributeName="fill-opacity" values="0.25;0.5;0.25" dur="3s" repeatCount="indefinite"/></path>
        <path d="M24 28C24 28 38 28 38 16C38 16 26 16 24 28Z" fill="hsl(130,50%,45%)" opacity="0.4" stroke="url(#sprout-g)" strokeWidth="2.5" strokeLinejoin="round"><animate attributeName="fill-opacity" values="0.25;0.5;0.25" dur="3s" begin="1s" repeatCount="indefinite"/></path>
        <path d="M16 44H32" stroke="url(#sprout-g)" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  Home: {
    bg: "linear-gradient(135deg, hsl(25,55%,96%), hsl(15,50%,93%))",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7 animate-icon-float">
        <defs><linearGradient id="home-g" x1="0.5" y1="0" x2="0.5" y2="1"><stop offset="0%" stopColor="hsl(25,85%,52%)"/><stop offset="100%" stopColor="hsl(15,80%,42%)"/></linearGradient></defs>
        <path d="M4 22L24 6L44 22" stroke="url(#home-g)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 20V42H38V20" stroke="url(#home-g)" strokeWidth="2.5" fill="url(#home-g)" fillOpacity="0.08"/>
        <rect x="20" y="28" width="8" height="14" rx="2" fill="hsl(25,80%,55%)" opacity="0.4" stroke="url(#home-g)" strokeWidth="1.5"/>
        <rect x="12" y="24" width="7" height="7" rx="1.5" fill="hsl(195,70%,60%)" opacity="0.7"><animate attributeName="fill-opacity" values="0.5;0.9;0.5" dur="2.5s" repeatCount="indefinite"/></rect>
        <rect x="29" y="24" width="7" height="7" rx="1.5" fill="hsl(195,70%,60%)" opacity="0.7"><animate attributeName="fill-opacity" values="0.5;0.9;0.5" dur="2.5s" begin="0.8s" repeatCount="indefinite"/></rect>
      </svg>
    ),
  },
  BookOpenCheck: {
    bg: "linear-gradient(135deg, hsl(170,40%,95%), hsl(185,35%,92%))",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7 animate-icon-float">
        <defs><linearGradient id="book-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="hsl(170,55%,48%)"/><stop offset="100%" stopColor="hsl(190,50%,38%)"/></linearGradient></defs>
        <path d="M24 8C24 8 14 6 4 10V40C14 36 24 38 24 38C24 38 34 36 44 40V10C34 6 24 8 24 8Z" fill="url(#book-g)" opacity="0.1" stroke="url(#book-g)" strokeWidth="2.5"/>
        <path d="M24 8V38" stroke="url(#book-g)" strokeWidth="2"/>
        <path d="M30 18L33 21L40 14" stroke="hsl(140,65%,42%)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite"/></path>
      </svg>
    ),
  },
  UtensilsCrossed: {
    bg: "linear-gradient(135deg, hsl(30,55%,96%), hsl(20,50%,93%))",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7 animate-icon-float">
        <defs><linearGradient id="food-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="hsl(30,80%,50%)"/><stop offset="100%" stopColor="hsl(15,75%,42%)"/></linearGradient></defs>
        <path d="M16 6V18C16 22 13 24 10 24V6" stroke="url(#food-g)" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M13 6V24M13 24V42" stroke="url(#food-g)" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M34 6C34 6 40 12 40 20C40 25 36 28 34 28V42" stroke="url(#food-g)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="13" cy="15" r="2.5" fill="hsl(45,95%,58%)" opacity="0.7"><animate attributeName="fill-opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite"/></circle>
      </svg>
    ),
  },
  Wrench: {
    bg: "linear-gradient(135deg, hsl(220,25%,96%), hsl(210,20%,93%))",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7 animate-icon-float">
        <defs><linearGradient id="wrench-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="hsl(220,35%,52%)"/><stop offset="100%" stopColor="hsl(210,30%,40%)"/></linearGradient></defs>
        <path d="M37 7C33 7 29 10.5 29 15C29 16.2 29.3 17.3 29.8 18.2L10 37L14 43L33 24C33.8 24.5 35 25 36 25C40 25 43 21.5 43 17.5C43 16.3 42.7 15 42 13.8L38 18L34 14L38.5 9.5C38 8.5 37.5 7.5 37 7Z" fill="url(#wrench-g)" opacity="0.2" stroke="url(#wrench-g)" strokeWidth="2.5" strokeLinejoin="round"/>
        <circle cx="12" cy="40" r="3" fill="hsl(45,90%,55%)" opacity="0.6"><animate attributeName="fill-opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite"/></circle>
      </svg>
    ),
  },
  Heart: {
    bg: "linear-gradient(135deg, hsl(340,50%,96%), hsl(355,45%,93%))",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7 animate-icon-pulse">
        <defs><linearGradient id="heart-g" x1="0.5" y1="0" x2="0.5" y2="1"><stop offset="0%" stopColor="hsl(340,75%,60%)"/><stop offset="100%" stopColor="hsl(355,70%,48%)"/></linearGradient></defs>
        <path d="M24 42C24 42 6 30 6 17C6 10.5 11 6 17 6C20.5 6 24 8.5 24 8.5C24 8.5 27.5 6 31 6C37 6 42 10.5 42 17C42 30 24 42 24 42Z" fill="url(#heart-g)" opacity="0.25" stroke="url(#heart-g)" strokeWidth="2.5" strokeLinejoin="round"/>
        <path d="M16 22L21 27L30 18" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"><animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite"/></path>
      </svg>
    ),
  },
  Newspaper: {
    bg: "linear-gradient(135deg, hsl(0,50%,96%), hsl(350,45%,93%))",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7 animate-icon-float">
        <defs><linearGradient id="news-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="hsl(0,70%,55%)"/><stop offset="100%" stopColor="hsl(350,65%,45%)"/></linearGradient></defs>
        <rect x="4" y="8" width="32" height="32" rx="3" fill="url(#news-g)" opacity="0.12" stroke="url(#news-g)" strokeWidth="2.5"/>
        <rect x="10" y="14" width="20" height="10" rx="2" fill="url(#news-g)" opacity="0.2"/>
        <path d="M10 28H30M10 34H22" stroke="url(#news-g)" strokeWidth="2" strokeLinecap="round"/>
        <path d="M36 14V36C36 38.2 37.8 40 40 40C42.2 40 44 38.2 44 36V14" stroke="url(#news-g)" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="40" cy="12" r="3" fill="hsl(45,90%,55%)"><animate attributeName="fill-opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite"/></circle>
      </svg>
    ),
  },
  Activity: {
    bg: "linear-gradient(135deg, hsl(190,45%,95%), hsl(205,40%,92%))",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7 animate-icon-float">
        <defs><linearGradient id="act-g" x1="0" y1="0.5" x2="1" y2="0.5"><stop offset="0%" stopColor="hsl(190,65%,48%)"/><stop offset="100%" stopColor="hsl(210,60%,42%)"/></linearGradient></defs>
        <circle cx="24" cy="24" r="18" fill="url(#act-g)" opacity="0.08" stroke="url(#act-g)" strokeWidth="1.5" strokeDasharray="3 4"/>
        <path d="M4 24H12L16 10L24 38L32 18L36 28H44" stroke="url(#act-g)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><animate attributeName="stroke-dashoffset" from="120" to="0" dur="3s" repeatCount="indefinite"/></path>
      </svg>
    ),
  },
  Car: {
    bg: "linear-gradient(135deg, hsl(160,45%,95%), hsl(175,40%,92%))",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7 animate-icon-float">
        <defs><linearGradient id="car-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="hsl(160,60%,48%)"/><stop offset="100%" stopColor="hsl(175,55%,38%)"/></linearGradient></defs>
        <path d="M8 26L13 14H35L40 26" stroke="url(#car-g)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="4" y="26" width="40" height="12" rx="3" fill="url(#car-g)" opacity="0.12" stroke="url(#car-g)" strokeWidth="2.5"/>
        <rect x="15" y="16" width="18" height="9" rx="2" fill="hsl(195,70%,65%)" opacity="0.6"/>
        <circle cx="13" cy="40" r="4" fill="hsl(220,30%,30%)" stroke="hsl(0,0%,92%)" strokeWidth="2.5"><animate attributeName="r" values="3.5;4.2;3.5" dur="0.8s" repeatCount="indefinite"/></circle>
        <circle cx="35" cy="40" r="4" fill="hsl(220,30%,30%)" stroke="hsl(0,0%,92%)" strokeWidth="2.5"><animate attributeName="r" values="3.5;4.2;3.5" dur="0.8s" repeatCount="indefinite"/></circle>
      </svg>
    ),
  },
  Building: {
    bg: "linear-gradient(135deg, hsl(210,30%,96%), hsl(225,25%,93%))",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7 animate-icon-float">
        <defs><linearGradient id="bldg-g" x1="0.5" y1="0" x2="0.5" y2="1"><stop offset="0%" stopColor="hsl(210,45%,55%)"/><stop offset="100%" stopColor="hsl(225,40%,42%)"/></linearGradient></defs>
        <rect x="10" y="6" width="28" height="38" rx="3" fill="url(#bldg-g)" opacity="0.12" stroke="url(#bldg-g)" strokeWidth="2.5"/>
        <rect x="16" y="12" width="5" height="5" rx="1" fill="hsl(50,90%,60%)"><animate attributeName="fill-opacity" values="0.4;0.9;0.4" dur="3s" begin="0s" repeatCount="indefinite"/></rect>
        <rect x="27" y="12" width="5" height="5" rx="1" fill="hsl(50,90%,60%)"><animate attributeName="fill-opacity" values="0.4;0.9;0.4" dur="3s" begin="0.8s" repeatCount="indefinite"/></rect>
        <rect x="16" y="22" width="5" height="5" rx="1" fill="hsl(50,90%,60%)"><animate attributeName="fill-opacity" values="0.4;0.9;0.4" dur="3s" begin="1.6s" repeatCount="indefinite"/></rect>
        <rect x="27" y="22" width="5" height="5" rx="1" fill="hsl(50,90%,60%)"><animate attributeName="fill-opacity" values="0.4;0.9;0.4" dur="3s" begin="2.4s" repeatCount="indefinite"/></rect>
        <rect x="20" y="34" width="8" height="10" rx="2" fill="url(#bldg-g)" opacity="0.35"/>
      </svg>
    ),
  },
  TrendingUp: {
    bg: "linear-gradient(135deg, hsl(140,40%,95%), hsl(155,35%,92%))",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7 animate-icon-float">
        <defs><linearGradient id="trend-g" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stopColor="hsl(140,55%,48%)"/><stop offset="100%" stopColor="hsl(160,50%,40%)"/></linearGradient></defs>
        <path d="M4 38L16 24L26 32L40 14" stroke="url(#trend-g)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M34 14H40V20" stroke="url(#trend-g)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4 44H44" stroke="url(#trend-g)" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="40" cy="14" r="4" fill="hsl(140,55%,52%)"><animate attributeName="fill-opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite"/></circle>
      </svg>
    ),
  },
  BedDouble: {
    bg: "linear-gradient(135deg, hsl(35,50%,96%), hsl(25,45%,93%))",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7 animate-icon-float">
        <defs><linearGradient id="bed-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="hsl(35,75%,52%)"/><stop offset="100%" stopColor="hsl(20,70%,42%)"/></linearGradient></defs>
        <path d="M4 32V16H44V32" stroke="url(#bed-g)" strokeWidth="2.5" strokeLinecap="round"/>
        <rect x="4" y="28" width="40" height="10" rx="3" fill="url(#bed-g)" opacity="0.15" stroke="url(#bed-g)" strokeWidth="2.5"/>
        <rect x="8" y="18" width="14" height="10" rx="3" fill="hsl(195,65%,65%)" opacity="0.5" stroke="url(#bed-g)" strokeWidth="1.5"/>
        <rect x="26" y="18" width="14" height="10" rx="3" fill="hsl(195,65%,65%)" opacity="0.5" stroke="url(#bed-g)" strokeWidth="1.5"/>
        <path d="M4 38V44M44 38V44" stroke="url(#bed-g)" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    ),
  },
  Coffee: {
    bg: "linear-gradient(135deg, hsl(20,50%,96%), hsl(10,45%,93%))",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7 animate-icon-float">
        <defs><linearGradient id="cof-g" x1="0" y1="0" x2="0.5" y2="1"><stop offset="0%" stopColor="hsl(20,75%,52%)"/><stop offset="100%" stopColor="hsl(10,70%,40%)"/></linearGradient></defs>
        <path d="M8 16H34V36C34 40 31 43 27 43H15C11 43 8 40 8 36V16Z" fill="url(#cof-g)" opacity="0.12" stroke="url(#cof-g)" strokeWidth="2.5"/>
        <path d="M34 22H39C41.8 22 44 24.2 44 27C44 29.8 41.8 32 39 32H34" stroke="url(#cof-g)" strokeWidth="2.5"/>
        <path d="M17 8C17 8 15 11 17 14" stroke="url(#cof-g)" strokeWidth="2.5" strokeLinecap="round"><animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite"/></path>
        <path d="M24 6C24 6 22 10 24 14" stroke="url(#cof-g)" strokeWidth="2.5" strokeLinecap="round"><animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" begin="0.6s" repeatCount="indefinite"/></path>
      </svg>
    ),
  },
  Video: {
    bg: "linear-gradient(135deg, hsl(0,45%,96%), hsl(350,40%,93%))",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7 animate-icon-float">
        <defs><linearGradient id="vid-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="hsl(0,65%,55%)"/><stop offset="100%" stopColor="hsl(350,60%,45%)"/></linearGradient></defs>
        <rect x="4" y="12" width="30" height="24" rx="4" fill="url(#vid-g)" opacity="0.12" stroke="url(#vid-g)" strokeWidth="2.5"/>
        <path d="M34 20L46 12V36L34 28" stroke="url(#vid-g)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="19" cy="24" r="6" fill="url(#vid-g)" opacity="0.15"><animate attributeName="r" values="5;6.5;5" dur="2s" repeatCount="indefinite"/></circle>
        <path d="M16 21L24 24L16 28Z" fill="white" opacity="0.85"/>
      </svg>
    ),
  },
  TreePine: {
    bg: "linear-gradient(135deg, hsl(130,40%,95%), hsl(145,35%,92%))",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7 animate-icon-float">
        <defs><linearGradient id="tree-g" x1="0.5" y1="0" x2="0.5" y2="1"><stop offset="0%" stopColor="hsl(130,55%,48%)"/><stop offset="100%" stopColor="hsl(150,50%,35%)"/></linearGradient></defs>
        <path d="M24 4L12 20H18L8 36H40L30 20H36L24 4Z" fill="url(#tree-g)" opacity="0.2" stroke="url(#tree-g)" strokeWidth="2.5" strokeLinejoin="round"/>
        <rect x="20" y="36" width="8" height="8" rx="2" fill="hsl(25,65%,42%)" opacity="0.6" stroke="hsl(25,60%,35%)" strokeWidth="1.5"/>
        <circle cx="24" cy="18" r="3" fill="hsl(45,90%,58%)" opacity="0.6"><animate attributeName="fill-opacity" values="0.3;0.8;0.3" dur="2.5s" repeatCount="indefinite"/></circle>
      </svg>
    ),
  },
  Tag: {
    bg: "linear-gradient(135deg, hsl(210,45%,96%), hsl(225,40%,93%))",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7 animate-icon-float">
        <defs><linearGradient id="tag-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="hsl(210,70%,55%)"/><stop offset="100%" stopColor="hsl(230,65%,45%)"/></linearGradient></defs>
        <path d="M6 6H26L44 24L26 42L6 42V6Z" fill="url(#tag-g)" opacity="0.12" stroke="url(#tag-g)" strokeWidth="2.5" strokeLinejoin="round"/>
        <circle cx="16" cy="16" r="4" fill="hsl(45,95%,58%)" stroke="url(#tag-g)" strokeWidth="1.5"><animate attributeName="fill-opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/></circle>
      </svg>
    ),
  },
  PenTool: {
    bg: "linear-gradient(135deg, hsl(250,30%,96%), hsl(265,25%,93%))",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7 animate-icon-float">
        <defs><linearGradient id="pen-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="hsl(250,45%,55%)"/><stop offset="100%" stopColor="hsl(270,40%,45%)"/></linearGradient></defs>
        <path d="M34 4L44 14L20 38H10V28L34 4Z" fill="url(#pen-g)" opacity="0.12" stroke="url(#pen-g)" strokeWidth="2.5" strokeLinejoin="round"/>
        <path d="M28 10L38 20" stroke="url(#pen-g)" strokeWidth="2"/>
        <path d="M6 44L10 38" stroke="url(#pen-g)" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="40" cy="8" r="3" fill="hsl(45,95%,58%)"><animate attributeName="fill-opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite"/></circle>
      </svg>
    ),
  },
  Umbrella: {
    bg: "linear-gradient(135deg, hsl(200,45%,95%), hsl(215,40%,92%))",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7 animate-icon-float">
        <defs><linearGradient id="umb-g" x1="0.5" y1="0" x2="0.5" y2="0.6"><stop offset="0%" stopColor="hsl(200,65%,55%)"/><stop offset="100%" stopColor="hsl(220,60%,45%)"/></linearGradient></defs>
        <path d="M24 6C12 6 4 16 4 26H44C44 16 36 6 24 6Z" fill="url(#umb-g)" opacity="0.2" stroke="url(#umb-g)" strokeWidth="2.5"/>
        <path d="M24 26V40C24 42.2 26 44 28 44C30 44 32 42.2 32 40" stroke="url(#umb-g)" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M24 6V4" stroke="url(#umb-g)" strokeWidth="3" strokeLinecap="round"/>
        <path d="M12 26C12 22 16 22 16 26C16 22 20 22 20 26" stroke="url(#umb-g)" strokeWidth="1.5" opacity="0.6"/>
        <path d="M28 26C28 22 32 22 32 26C32 22 36 22 36 26" stroke="url(#umb-g)" strokeWidth="1.5" opacity="0.6"/>
      </svg>
    ),
  },
  ShoppingBag: {
    bg: "linear-gradient(135deg, hsl(330,42%,96%), hsl(345,38%,93%))",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7 animate-icon-float">
        <defs><linearGradient id="shop-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="hsl(330,65%,55%)"/><stop offset="100%" stopColor="hsl(345,60%,45%)"/></linearGradient></defs>
        <path d="M10 14H38L36 44H12L10 14Z" fill="url(#shop-g)" opacity="0.12" stroke="url(#shop-g)" strokeWidth="2.5" strokeLinejoin="round"/>
        <path d="M18 14V10C18 6.7 20.7 4 24 4C27.3 4 30 6.7 30 10V14" stroke="url(#shop-g)" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="20" cy="24" r="2.5" fill="hsl(330,65%,55%)" opacity="0.5"/>
        <circle cx="28" cy="24" r="2.5" fill="hsl(330,65%,55%)" opacity="0.5"/>
      </svg>
    ),
  },
  SearchX: {
    bg: "linear-gradient(135deg, hsl(25,50%,96%), hsl(15,45%,93%))",
    svg: (
      <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7 animate-icon-float">
        <defs><linearGradient id="sx-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="hsl(25,75%,52%)"/><stop offset="100%" stopColor="hsl(10,70%,42%)"/></linearGradient></defs>
        <circle cx="20" cy="20" r="15" fill="url(#sx-g)" opacity="0.1" stroke="url(#sx-g)" strokeWidth="2.5"/>
        <path d="M31 31L44 44" stroke="url(#sx-g)" strokeWidth="3.5" strokeLinecap="round"/>
        <path d="M15 15L25 25M25 15L15 25" stroke="hsl(0,70%,52%)" strokeWidth="2.5" strokeLinecap="round"><animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite"/></path>
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
  svg_icon?: string | null;
  accent_color?: string | null;
  icon_url?: string | null;
}

/* Shared SVG filter definitions for 3D icon effects */
const IconFilterDefs = () => (
  <svg width="0" height="0" style={{ position: "absolute" }}>
    <defs>
      {/* Drop shadow + inner glow combined */}
      <filter id="icon-3d" x="-20%" y="-20%" width="140%" height="140%">
        {/* Outer drop shadow for depth */}
        <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="rgba(0,0,0,0.18)" />
        {/* Inner highlight (top-left bevel) */}
        <feComponentTransfer>
          <feFuncA type="linear" slope="1" />
        </feComponentTransfer>
      </filter>
      {/* Bevel/emboss effect */}
      <filter id="icon-bevel" x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur" />
        <feSpecularLighting in="blur" surfaceScale="4" specularConstant="0.8" specularExponent="20" result="spec">
          <fePointLight x="10" y="8" z="25" />
        </feSpecularLighting>
        <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut" />
        <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="0.6" k4="0" />
      </filter>
    </defs>
  </svg>
);



interface Ad {
  id: string;
  title: string;
  description?: string | null;
  image_url?: string | null;
  link_url?: string | null;
}

const AdCard = ({ ad }: { ad?: Ad }) => {
  if (!ad) return null;
  const handleAdClick = () => {
    supabase.rpc("increment_ad_click", { ad_id: ad.id });
  };
  const content = (
    <div className="rounded-xl overflow-hidden relative group" onClick={handleAdClick}>
      {ad.image_url ? (
        <img src={ad.image_url} alt={ad.title} className="w-full aspect-[6/1] object-cover" />
      ) : (
        <div className="w-full aspect-[6/1] bg-primary/5 flex items-center justify-center gap-2">
          <Megaphone className="w-5 h-5 text-primary" />
          <p className="text-sm font-bold text-primary">{ad.title}</p>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none ad-shine" />
    </div>
  );
  return ad.link_url ? <a href={ad.link_url} target="_blank" rel="noopener noreferrer">{content}</a> : content;
};

const ServiceGrid = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "card">("grid");
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: setting } = await (supabase.from as any)("site_settings")
        .select("value").eq("key", "service_grid_enabled").single();
      if (setting?.value === "false") { setEnabled(false); setLoading(false); return; }
      setEnabled(true);
      const [catRes, adRes] = await Promise.all([
        supabase.from("service_categories").select("*").eq("is_active", true).order("sort_order"),
        (supabase.from as any)("advertisements").select("*").eq("is_active", true).order("sort_order"),
      ]);
      setCategories((catRes.data as Category[]) || []);
      const now = new Date().toISOString();
      setAds(((adRes.data as Ad[]) || []).filter((a: any) => !a.expire_at || a.expire_at > now));
      setLoading(false);
    };
    fetchData();
  }, []);

  const allItems = categories;

  const staticRoutes: Record<string, string> = {
    news: "/news",
  };

  const handleNavigate = async (cat: Category) => {
    if (navigator.vibrate) navigator.vibrate(30);
    await supabase.rpc("increment_category_view", { cat_id: cat.id });
    setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, view_count: (c.view_count ?? 0) + 1 } : c));
    const route = staticRoutes[cat.slug] || `/service/${cat.slug}`;
    navigate(route);
  };

  const handleViewModeChange = (mode: "grid" | "card") => {
    setViewMode(mode);
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  };

  if (!enabled) return null;

  return (
    <section className="px-4">
      <IconFilterDefs />
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

      {loading ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-card rounded-2xl flex flex-col items-center gap-1.5 py-4 px-1.5" style={{ border: "0.8px solid hsl(220,15%,88%)" }}>
                <div className="w-12 h-12 rounded-xl skeleton-shimmer" />
                <div className="w-16 h-3 rounded-md skeleton-shimmer" />
                <div className="w-10 h-2 rounded skeleton-shimmer" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card rounded-2xl flex items-center gap-3.5 p-3.5" style={{ border: "0.8px solid hsl(220,15%,88%)" }}>
                <div className="w-11 h-11 rounded-xl skeleton-shimmer shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="w-3/4 h-3.5 rounded-md skeleton-shimmer" />
                  <div className="w-1/2 h-2.5 rounded skeleton-shimmer" />
                </div>
                <div className="w-12 h-5 rounded-full skeleton-shimmer shrink-0" />
              </div>
            ))}
          </div>
        )
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {allItems.map((cat) => {
            const iconData = SvgIcons[cat.icon] || SvgIcons["Tag"];
            const bColor = cat.accent_color || borderColorMap[cat.icon] || "hsl(210,60%,72%)";
            const hasDynamicSvg = !!cat.svg_icon;
            const hasPngIcon = !!cat.icon_url;
            return (
              <button
                key={cat.id}
                onClick={() => handleNavigate(cat)}
                className="relative bg-card rounded-2xl flex flex-col items-center gap-1.5 py-4 px-1.5 h-full transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95"
                style={{ border: `0.8px solid ${bColor}` }}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center relative overflow-hidden"
                  style={{
                    boxShadow: `0 4px 12px -2px ${bColor}33, inset 0 1px 2px rgba(255,255,255,0.6), inset 0 -1px 2px rgba(0,0,0,0.05)`,
                  }}
                >
                  {hasPngIcon ? (
                    <>
                      <div className="absolute inset-0 rounded-xl" style={{ background: `linear-gradient(135deg, ${bColor}22, ${bColor}11)`, opacity: 0.3 }} />
                      <div className="absolute inset-0 rounded-xl pointer-events-none" style={{
                        background: "linear-gradient(135deg, rgba(255,255,255,0.45) 0%, transparent 50%, rgba(0,0,0,0.04) 100%)",
                      }} />
                      <img src={cat.icon_url!} alt="" className="relative w-8 h-8 object-contain" style={{ transform: "scale(1.15)" }} />
                    </>
                  ) : hasDynamicSvg ? (
                    <>
                      <div className="absolute inset-0 rounded-xl" style={{ background: `linear-gradient(135deg, ${bColor}22, ${bColor}11)`, opacity: 0.3 }} />
                      <div className="absolute inset-0 rounded-xl pointer-events-none" style={{
                        background: "linear-gradient(135deg, rgba(255,255,255,0.45) 0%, transparent 50%, rgba(0,0,0,0.04) 100%)",
                      }} />
                      <div className="relative w-7 h-7" style={{ filter: "url(#icon-3d)", transform: "scale(1.15)" }}
                        dangerouslySetInnerHTML={{ __html: cat.svg_icon! }} />
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 rounded-xl" style={{ background: iconData.bg, opacity: 0.3 }} />
                      <div className="absolute inset-0 rounded-xl pointer-events-none" style={{
                        background: "linear-gradient(135deg, rgba(255,255,255,0.45) 0%, transparent 50%, rgba(0,0,0,0.04) 100%)",
                      }} />
                      <div className="relative" style={{ filter: "url(#icon-3d)", transform: "scale(1.15)" }}>
                        {iconData.svg}
                      </div>
                    </>
                  )}
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
            const bColor = cat.accent_color || borderColorMap[cat.icon] || "hsl(210,60%,72%)";
            const hasDynamicSvg = !!cat.svg_icon;
            const hasPngIcon = !!cat.icon_url;
            return (
              <div key={cat.id}>
                <button
                  onClick={() => handleNavigate(cat)}
                  className="bg-card rounded-2xl flex items-center gap-3.5 p-3.5 w-full text-left transition-all duration-200 hover:shadow-md hover:scale-[1.01] active:scale-[0.98]"
                  style={{ border: `0.8px solid ${bColor}` }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden"
                    style={{
                      boxShadow: `0 4px 12px -2px ${bColor}33, inset 0 1px 2px rgba(255,255,255,0.6), inset 0 -1px 2px rgba(0,0,0,0.05)`,
                    }}
                  >
                    {hasPngIcon ? (
                      <>
                        <div className="absolute inset-0 rounded-xl" style={{ background: `linear-gradient(135deg, ${bColor}22, ${bColor}11)`, opacity: 0.3 }} />
                        <div className="absolute inset-0 rounded-xl pointer-events-none" style={{
                          background: "linear-gradient(135deg, rgba(255,255,255,0.45) 0%, transparent 50%, rgba(0,0,0,0.04) 100%)",
                        }} />
                        <img src={cat.icon_url!} alt="" className="relative w-7 h-7 object-contain" style={{ transform: "scale(1.15)" }} />
                      </>
                    ) : hasDynamicSvg ? (
                      <>
                        <div className="absolute inset-0 rounded-xl" style={{ background: `linear-gradient(135deg, ${bColor}22, ${bColor}11)`, opacity: 0.3 }} />
                        <div className="absolute inset-0 rounded-xl pointer-events-none" style={{
                          background: "linear-gradient(135deg, rgba(255,255,255,0.45) 0%, transparent 50%, rgba(0,0,0,0.04) 100%)",
                        }} />
                        <div className="relative w-7 h-7" style={{ filter: "url(#icon-3d)", transform: "scale(1.15)" }}
                          dangerouslySetInnerHTML={{ __html: cat.svg_icon! }} />
                      </>
                    ) : (
                      <>
                        <div className="absolute inset-0 rounded-xl" style={{ background: iconData.bg, opacity: 0.3 }} />
                        <div className="absolute inset-0 rounded-xl pointer-events-none" style={{
                          background: "linear-gradient(135deg, rgba(255,255,255,0.45) 0%, transparent 50%, rgba(0,0,0,0.04) 100%)",
                        }} />
                        <div className="relative" style={{ filter: "url(#icon-3d)", transform: "scale(1.15)" }}>
                          {iconData.svg}
                        </div>
                      </>
                    )}
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
                {(index + 1) % 5 === 0 && ads.length > 0 && <div className="mt-2.5"><AdCard ad={ads[Math.floor((index + 1) / 5 - 1) % ads.length]} /></div>}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default ServiceGrid;
