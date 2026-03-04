"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const data = {
  nameBalika: "দারুন নাজাত আদর্শ বালিকা মাদরাসা",
  nameBalok: "দারুন নাজাত মাদরাসা",
  address: "কাওলার জমিদার বাড়ি, দক্ষিণ খান, ঢাকা-১২২৯",
  muhtamim: "হাফেয মাওলানা শাহিদুল্লাহ",
  teachers: "১৮+",
  staff: "৩",
  branches: [
    {
      id: "balika",
      label: "বালিকা শাখা",
      name: "দারুন নাজাত আদর্শ বালিকা মাদরাসা",
      established: "২০১৩",
      emoji: "👩‍🎓",
      color: "from-emerald-700 to-teal-600",
      accent: "emerald",
      departments: [
        { name: "নূরানী বিভাগ", icon: "🌱", desc: "প্রাথমিক কুরআন শিক্ষা" },
        { name: "নাজেরা বিভাগ", icon: "📖", desc: "কুরআন তিলাওয়াত" },
        { name: "হিফয বিভাগ", icon: "💚", desc: "কুরআন হিফজ" },
        { name: "কিতাব বিভাগ", icon: "🎓", desc: "ইসলামি শাস্ত্র" },
      ],
      range: "ইবতেদাই থেকে দাওরায়ে হাদীস (তাকমীল)",
      rangeShort: "তাকমীল পর্যন্ত",
    },
    {
      id: "balok",
      label: "বালক শাখা",
      name: "দারুন নাজাত মাদরাসা",
      established: "২০২৪",
      emoji: "👨‍🎓",
      color: "from-blue-700 to-indigo-600",
      accent: "blue",
      departments: [
        { name: "নূরানী বিভাগ", icon: "🌱", desc: "প্রাথমিক কুরআন শিক্ষা" },
        { name: "নাজেরা বিভাগ", icon: "📖", desc: "কুরআন তিলাওয়াত" },
        { name: "হিফয বিভাগ", icon: "💚", desc: "কুরআন হিফজ" },
        { name: "কিতাব বিভাগ", icon: "🎓", desc: "ইসলামি শাস্ত্র" },
      ],
      range: "ইবতেদাই থেকে ছানাবিয়া উলিয়া (শরহে বেকায়া)",
      rangeShort: "শরহে বেকায়া পর্যন্ত",
    },
  ],
  curriculum: [
    {
      icon: "🎵",
      title: "কুরআন তিলাওয়াত ও তাজবিদ",
      desc: "শুদ্ধ উচ্চারণ ও সুললিত কণ্ঠে কুরআন পড়ার দক্ষতা অর্জন",
    },
    {
      icon: "⚖️",
      title: "ফিকহ ও ইসলামি আইন",
      desc: "দৈনন্দিন জীবনে শরীয়াহ মেনে চলার ব্যবহারিক শিক্ষা",
    },
    {
      icon: "🌙",
      title: "আদব ও আখলাক",
      desc: "উত্তম চরিত্র ও ইসলামি আচরণের পরিপূর্ণ গঠন",
    },
    {
      icon: "🌍",
      title: "আরবি ভাষাশিক্ষা",
      desc: "কুরআন ও হাদিস বোঝার জন্য আরবি ভাষায় দক্ষতা অর্জন",
    },
    {
      icon: "💡",
      title: "সাধারণ জ্ঞান ও নৈতিক মূল্যবোধ",
      desc: "আধুনিক সমাজে দ্বীনদার মানুষের যোগ্যতা বিকাশ",
    },
  ],
  activities: [
    { icon: "🤲", text: "নিয়মিত দোয়া ও ইসলাহী মাহফিল" },
    { icon: "🏆", text: "ক্বিরাত ও হামদ-নাত প্রতিযোগিতা" },
    { icon: "🎊", text: "বার্ষিক অনুষ্ঠান ও পুরস্কার বিতরণ" },
  ],
  goals: [
    { icon: "📜", text: "কুরআন-সুন্নাহ ভিত্তিক শিক্ষা প্রদান" },
    { icon: "🌺", text: "আদর্শ নৈতিক চরিত্র গঠন" },
    { icon: "🕌", text: "যোগ্য দ্বীনদার মানুষ তৈরি" },
  ],
};

function SectionTitle({ icon, title, dark }) {
  return (
    <div className={`flex items-center gap-2 mb-3 mt-6`}>
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm 
        ${dark ? "bg-emerald-900/60" : "bg-emerald-100"}`}
      >
        {icon}
      </div>
      <span
        className={`font-bold text-base ${dark ? "text-emerald-300" : "text-emerald-800"}`}
      >
        {title}
      </span>
      <div
        className={`flex-1 h-px ${dark ? "bg-gradient-to-r from-yellow-500/40 to-transparent" : "bg-gradient-to-r from-yellow-500/60 to-transparent"}`}
      />
    </div>
  );
}

export default function MadrasahProfile() {
  const [dark, setDark] = useState(false);
  const [activeBranch, setActiveBranch] = useState("balika");
  const branch = data.branches.find((b) => b.id === activeBranch);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${dark ? "bg-gray-950 text-white" : "bg-amber-50 text-gray-900"}`}
      style={{ fontFamily: "'Noto Serif Bengali', 'Amiri', serif" }}
    >
      {/* Google Fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Noto+Serif+Bengali:wght@300;400;600;700&display=swap');`}</style>

      {/* DARK MODE TOGGLE */}
      <div className="flex justify-end p-3">
        <button
          onClick={() => setDark(!dark)}
          className={`text-xs px-3 py-1.5 rounded-full border transition-all
            ${dark ? "border-emerald-600 text-emerald-400 bg-emerald-900/30" : "border-emerald-600 text-emerald-700 bg-emerald-50"}`}
        >
          {dark ? "☀️ লাইট মোড" : "🌙 ডার্ক মোড"}
        </button>
      </div>

      {/* HERO */}
      <div
        className={`mx-3 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 relative`}
      >
        {/* pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-rule='evenodd'%3E%3Cpath d='M20 20.5V18H0v5h5v5H0v5h20v-4.5zm0 2.5h5v4H20v-4zm5-2.5V15H15v5h5v2.5h5zM0 5h10v5H0V5zm5 5h5v5H5v-5zM0 0h5v5H0V0zm10 5h5v5h-5V5z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative p-6 text-center">
          <p
            className="text-yellow-200 text-2xl mb-1"
            style={{ fontFamily: "'Amiri', serif" }}
          >
            بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ
          </p>
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-3xl mb-3 shadow-lg shadow-black/30 ring-4 ring-yellow-400/30">
            🕌
          </div>
          <h1 className="text-white font-bold text-lg leading-relaxed mb-1">
            দারুন নাজাত আদর্শ বালিকা মাদরাসা
          </h1>
          <p className="text-yellow-300 text-sm mb-1">
            & দারুন নাজাত মাদরাসা (বালক শাখা)
          </p>
          <p className="text-emerald-200 text-xs italic mb-3">
            ✨ আলোর পথে, ইসলামের ছায়ায় ✨
          </p>
          <div className="inline-flex items-center gap-1.5 bg-white/10 border border-yellow-400/30 rounded-full px-4 py-1.5 text-xs text-white/90">
            📍 {data.address}
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-4 border-t border-white/10">
          {[
            { num: "২", label: "শাখা" },
            { num: data.teachers, label: "শিক্ষক-শিক্ষিকা" },
            { num: data.staff, label: "স্টাফ" },
            { num: "২০১৩", label: "প্রতিষ্ঠিত" },
          ].map((s) => (
            <div
              key={s.label}
              className="text-center py-3 border-r border-white/10 last:border-0"
            >
              <div className="text-yellow-300 font-bold text-base">{s.num}</div>
              <div className="text-white/70 text-[10px] leading-tight">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MUHTAMIM */}
      <div className="mx-3 mt-3">
        <Card
          className={`border-l-4 border-l-yellow-500 ${dark ? "bg-gray-900 border-gray-800" : "bg-white border-amber-200"}`}
        >
          <CardContent className="p-3 flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${dark ? "bg-emerald-900/50" : "bg-emerald-100"}`}
            >
              👨‍🏫
            </div>
            <div>
              <p
                className={`text-[11px] ${dark ? "text-gray-400" : "text-gray-500"}`}
              >
                প্রতিষ্ঠাতা ও মুহতামিম
              </p>
              <p
                className={`font-bold text-sm ${dark ? "text-emerald-300" : "text-emerald-800"}`}
              >
                {data.muhtamim}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MAIN CONTENT */}
      <div className="mx-3 mt-1 pb-8">
        {/* ABOUT */}
        <SectionTitle icon="ℹ️" title="আমাদের পরিচয়" dark={dark} />
        <Card
          className={`${dark ? "bg-gray-900 border-gray-800" : "bg-white border-amber-200"}`}
        >
          <CardContent className="p-4 text-sm leading-8">
            দারুন নাজাত মাদরাসা একটি সুপরিচিত দ্বীনি শিক্ষা প্রতিষ্ঠান —{" "}
            <span
              className={`font-semibold ${dark ? "text-emerald-400" : "text-emerald-700"}`}
            >
              বালিকা শাখা (২০১৩)
            </span>{" "}
            ও{" "}
            <span
              className={`font-semibold ${dark ? "text-blue-400" : "text-blue-700"}`}
            >
              বালক শাখা (২০২৪)
            </span>{" "}
            নিয়ে গঠিত। কুরআন-হাদিসের আলোকে আদর্শ চরিত্র গঠন ও নৈতিক শিক্ষায়
            বিশেষ গুরুত্ব দেওয়া হয়।
          </CardContent>
        </Card>

        {/* BRANCH SELECTOR */}
        <SectionTitle icon="🏫" title="দুটি শাখা" dark={dark} />
        <div className="flex gap-2 mb-3">
          {data.branches.map((b) => (
            <button
              key={b.id}
              onClick={() => setActiveBranch(b.id)}
              className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition-all border
                ${
                  activeBranch === b.id
                    ? `bg-gradient-to-br ${b.color} text-white border-transparent shadow-lg`
                    : dark
                      ? "bg-gray-900 border-gray-700 text-gray-400"
                      : "bg-white border-gray-200 text-gray-500"
                }`}
            >
              {b.emoji} {b.label}
            </button>
          ))}
        </div>

        <Card
          className={`${dark ? "bg-gray-900 border-gray-800" : "bg-white border-amber-200"} overflow-hidden`}
        >
          <div className={`h-1.5 bg-gradient-to-r ${branch.color}`} />
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span
                className={`text-sm font-bold ${dark ? "text-white" : "text-gray-900"}`}
              >
                {branch.name}
              </span>
              <Badge
                variant="outline"
                className={`text-[10px] ${dark ? "border-emerald-700 text-emerald-400" : "border-emerald-600 text-emerald-700"}`}
              >
                প্রতিষ্ঠিত {branch.established}
              </Badge>
            </div>

            <p
              className={`text-xs mb-3 px-3 py-2 rounded-lg ${dark ? "bg-emerald-900/30 text-emerald-300" : "bg-emerald-50 text-emerald-800"}`}
            >
              📚 {branch.range}
            </p>

            <div className="grid grid-cols-2 gap-2">
              {branch.departments.map((d) => (
                <div
                  key={d.name}
                  className={`rounded-xl p-3 text-center border ${dark ? "bg-gray-800 border-gray-700" : "bg-amber-50 border-amber-100"}`}
                >
                  <div className="text-xl mb-1">{d.icon}</div>
                  <div
                    className={`text-xs font-semibold ${dark ? "text-emerald-300" : "text-emerald-800"}`}
                  >
                    {d.name}
                  </div>
                  <div
                    className={`text-[10px] mt-0.5 ${dark ? "text-gray-500" : "text-gray-500"}`}
                  >
                    {d.desc}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CURRICULUM */}
        <SectionTitle icon="📝" title="পাঠ্যক্রম বিশেষত্ব" dark={dark} />
        <div className="flex flex-col gap-2">
          {data.curriculum.map((c) => (
            <Card
              key={c.title}
              className={`${dark ? "bg-gray-900 border-gray-800" : "bg-white border-amber-200"}`}
            >
              <CardContent className="p-3 flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0 ${dark ? "bg-emerald-900/50" : "bg-emerald-100"}`}
                >
                  {c.icon}
                </div>
                <div>
                  <div
                    className={`text-xs font-semibold ${dark ? "text-emerald-300" : "text-emerald-800"}`}
                  >
                    {c.title}
                  </div>
                  <div
                    className={`text-[11px] mt-0.5 leading-relaxed ${dark ? "text-gray-400" : "text-gray-600"}`}
                  >
                    {c.desc}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ACTIVITIES */}
        <SectionTitle icon="🌸" title="সহপাঠ্য কার্যক্রম" dark={dark} />
        <div className="flex flex-col gap-2">
          {data.activities.map((a) => (
            <div
              key={a.text}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm border
              ${dark ? "bg-gray-900 border-gray-800" : "bg-white border-amber-200"}`}
            >
              <span className="text-lg">{a.icon}</span>
              <span className={dark ? "text-gray-300" : "text-gray-700"}>
                {a.text}
              </span>
            </div>
          ))}
        </div>

        {/* GOALS */}
        <SectionTitle icon="🎯" title="লক্ষ্য ও উদ্দেশ্য" dark={dark} />
        <div className="grid grid-cols-3 gap-2">
          {data.goals.map((g) => (
            <div
              key={g.text}
              className={`rounded-xl p-3 text-center text-xs leading-relaxed
              ${dark ? "bg-emerald-900/40 text-emerald-300" : "bg-emerald-700 text-white"}`}
            >
              <div className="text-2xl mb-1">{g.icon}</div>
              {g.text}
            </div>
          ))}
        </div>

        {/* TEACHERS */}
        <SectionTitle icon="👨‍🏫" title="শিক্ষক ও স্টাফ" dark={dark} />
        <div className="grid grid-cols-2 gap-2">
          <Card
            className={`${dark ? "bg-gray-900 border-gray-800" : "bg-white border-amber-200"}`}
          >
            <CardContent className="p-4 text-center">
              <div
                className={`text-3xl font-bold ${dark ? "text-yellow-400" : "text-emerald-700"}`}
              >
                {data.teachers}
              </div>
              <div
                className={`text-xs mt-1 ${dark ? "text-gray-400" : "text-gray-600"}`}
              >
                অভিজ্ঞ শিক্ষক-শিক্ষিকা
              </div>
            </CardContent>
          </Card>
          <Card
            className={`${dark ? "bg-gray-900 border-gray-800" : "bg-white border-amber-200"}`}
          >
            <CardContent className="p-4 text-center">
              <div
                className={`text-3xl font-bold ${dark ? "text-yellow-400" : "text-emerald-700"}`}
              >
                {data.staff}
              </div>
              <div
                className={`text-xs mt-1 ${dark ? "text-gray-400" : "text-gray-600"}`}
              >
                স্টাফ সদস্য
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FOOTER */}
        <Separator
          className={`my-6 ${dark ? "bg-gray-800" : "bg-amber-200"}`}
        />
        <div className="text-center">
          <p
            className="text-xl text-yellow-500 mb-1"
            style={{ fontFamily: "'Amiri', serif" }}
          >
            اللّٰهُمَّ انْفَعْنَا بِمَا عَلَّمْتَنَا
          </p>
          <p
            className={`text-xs italic mb-3 ${dark ? "text-gray-500" : "text-gray-500"}`}
          >
            হে আল্লাহ! আমাদের শেখানো বিষয় দ্বারা আমাদের উপকৃত করুন।
          </p>
          <p className={`text-xs ${dark ? "text-gray-600" : "text-gray-400"}`}>
            📍 {data.address}
          </p>
        </div>
      </div>
    </div>
  );
}
