"use client";

import AboutOnHomePage from "@/components/home/about";
import ContactForm from "@/components/home/contactForm";
import Curriculum from "@/components/home/curriculum";
import Service from "@/components/home/services";
import { BookOpen, ChevronRight, LogIn, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  const currentYear = new Date().getFullYear().toString();

  return (
    <div className="w-full bg-background text-foreground font-hind-siliguri">
      {/* Header/Navigation */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-border z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="text-primary-foreground w-6 h-6" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-primary">দারুন নাজাত</h1>
              <p className="text-xs text-muted-foreground">মাদরাসা</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("home")}
              className="text-sm font-medium text-foreground hover:text-primary transition"
            >
              হোম
            </button>
            <button
              onClick={() => scrollToSection("services")}
              className="text-sm font-medium text-foreground hover:text-primary transition"
            >
              সেবাসমূহ
            </button>
            <button
              onClick={() => scrollToSection("curriculum")}
              className="text-sm font-medium text-foreground hover:text-primary transition"
            >
              ক্লাসগুলি
            </button>
            <button
              onClick={() => scrollToSection("about")}
              className="text-sm font-medium text-foreground hover:text-primary transition"
            >
              আমাদের সম্পর্কে
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="text-sm font-medium text-foreground hover:text-primary transition"
            >
              যোগাযোগ
            </button>
          </nav>

          {/* Dashboard & Mobile Menu */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition text-sm font-medium"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden md:inline">ড্যাশবোর্ড</span>
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 hover:bg-secondary rounded-lg transition"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-border bg-white">
            <nav className="flex flex-col gap-2 p-4">
              <button
                onClick={() => scrollToSection("home")}
                className="text-left px-4 py-2 hover:bg-secondary rounded-lg transition"
              >
                হোম
              </button>
              <button
                onClick={() => scrollToSection("services")}
                className="text-left px-4 py-2 hover:bg-secondary rounded-lg transition"
              >
                সেবাসমূহ
              </button>
              <button
                onClick={() => scrollToSection("classes")}
                className="text-left px-4 py-2 hover:bg-secondary rounded-lg transition"
              >
                ক্লাসগুলি
              </button>
              <button
                onClick={() => scrollToSection("about")}
                className="text-left px-4 py-2 hover:bg-secondary rounded-lg transition"
              >
                আমাদের সম্পর্কে
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="text-left px-4 py-2 hover:bg-secondary rounded-lg transition"
              >
                যোগাযোগ
              </button>
              <Link
                href="/dashboard"
                className="text-left px-4 py-2 bg-primary text-primary-foreground rounded-lg mt-2"
              >
                ড্যাশবোর্ড
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section
        id="home"
        className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-secondary/30"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary mb-6 leading-tight">
            দারুন নাজাত মাদরাসায় স্বাগতম
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed">
            ইসলামিক শিক্ষা এবং আধুনিক জ্ঞানের সমন্বয়ে আমরা গড়ে তুলছি দেশের
            ভবিষ্যৎ প্রজন্ম। ছাত্র-ছাত্রীদের জন্য আমরা নিয়ে এসেছি সর্বোচ্চ
            মানের শিক্ষাব্যবস্থা এবং আবাসিক সুবিধা।
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => scrollToSection("classes")}
              className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition inline-flex items-center justify-center gap-2"
            >
              ক্লাসগুলি দেখুন <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="px-8 py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary/5 transition"
            >
              যোগাযোগ করুন
            </button>
          </div>
        </div>
      </section>

      <Service />

      <Curriculum />

      <AboutOnHomePage />

      <ContactForm />

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">দারুন নাজাত মাদরাসা</h3>
              <p className="text-sm opacity-90">
                ইসলামিক শিক্ষায় নিবেদিত একটি আধুনিক শিক্ষা প্রতিষ্ঠান।
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">লিঙ্ক</h4>
              <ul className="space-y-2 text-sm opacity-90">
                <li>
                  <button
                    onClick={() => scrollToSection("home")}
                    className="hover:opacity-100 transition"
                  >
                    হোম
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("services")}
                    className="hover:opacity-100 transition"
                  >
                    সেবাসমূহ
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("classes")}
                    className="hover:opacity-100 transition"
                  >
                    ক্লাসগুলি
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">আরও</h4>
              <ul className="space-y-2 text-sm opacity-90">
                <li>
                  <button
                    onClick={() => scrollToSection("about")}
                    className="hover:opacity-100 transition"
                  >
                    আমাদের সম্পর্কে
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("contact")}
                    className="hover:opacity-100 transition"
                  >
                    যোগাযোগ
                  </button>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="hover:opacity-100 transition"
                  >
                    ড্যাশবোর্ড
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">যোগাযোগ</h4>
              <p className="text-sm opacity-90">
                ফোন: +88 01712-084833
                <br />
                ফোন: +88 01975-024262
                <br />
                ইমেইল: darunnazat@gmail.com
              </p>
            </div>
          </div>
          <div className="border-t border-primary-foreground/20 pt-8 text-center text-sm opacity-75">
            <p>{`${currentYear} — দারুন নাজাত মাদরাসা। সব অধিকার সংরক্ষিত।`}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}


