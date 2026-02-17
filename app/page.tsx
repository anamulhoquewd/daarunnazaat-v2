"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  ChevronRight,
  BookOpen,
  Users,
  LogIn,
  HomeIcon,
} from "lucide-react";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="w-full bg-background text-foreground">
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
              <p className="text-xs text-muted-foreground">মাদ্রাসা</p>
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
              onClick={() => scrollToSection("classes")}
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
            দারুন নাজাত মাদ্রাসায় স্বাগতম
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

      {/* Services Section */}
      <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-primary mb-4">
            আমাদের সেবাসমূহ
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            আমরা ছাত্র-ছাত্রীদের সর্বাঙ্গীণ উন্নয়নের জন্য বিভিন্ন সুবিধা এবং
            সেবা প্রদান করি
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Service 1 */}
            <div className="p-6 rounded-lg bg-secondary/50 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="text-primary-foreground w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">
                কুরআন শিক্ষা
              </h3>
              <p className="text-muted-foreground">
                যথাযথ তাজবীদ এবং মাখরাজ সহ কুরআন পাঠের শিক্ষা প্রদান করা হয়।
              </p>
            </div>

            {/* Service 2 */}
            <div className="p-6 rounded-lg bg-secondary/50 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                <Users className="text-primary-foreground w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">
                হোস্টেল সুবিধা
              </h3>
              <p className="text-muted-foreground">
                আরামদায়ক এবং নিরাপদ হোস্টেল পরিবেশ যেখানে ছাত্ররা পড়াশোনায়
                মনোনিবেশ করতে পারে।
              </p>
            </div>

            {/* Service 3 */}
            <div className="p-6 rounded-lg bg-secondary/50 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                <HomeIcon className="text-primary-foreground w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">
                নন-রেসিডেনশিয়াল
              </h3>
              <p className="text-muted-foreground">
                যারা বাড়িতে থেকে পড়তে চান তাদের জন্য নন-রেসিডেনশিয়াল সুবিধা
                রয়েছে।
              </p>
            </div>

            {/* Service 4 */}
            <div className="p-6 rounded-lg bg-secondary/50 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="text-primary-foreground w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">
                হাদিস শিক্ষা
              </h3>
              <p className="text-muted-foreground">
                সহিহ হাদিস এবং সুন্নাহ অনুযায়ী জীবনযাপনের শিক্ষা দেওয়া হয়।
              </p>
            </div>

            {/* Service 5 */}
            <div className="p-6 rounded-lg bg-secondary/50 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                <Users className="text-primary-foreground w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">
                অভিজ্ঞ শিক্ষকমণ্ডলী
              </h3>
              <p className="text-muted-foreground">
                অভিজ্ঞ এবং যোগ্য শিক্ষকদের দ্বারা পরিচালিত আমাদের মাদ্রাসা।
              </p>
            </div>

            {/* Service 6 */}
            <div className="p-6 rounded-lg bg-secondary/50 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                <HomeIcon className="text-primary-foreground w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">
                স্বাস্থ্যসেবা
              </h3>
              <p className="text-muted-foreground">
                শিক্ষার্থীদের স্বাস্থ্য এবং সুস্থতার জন্য নিয়মিত স্বাস্থ্য
                পরীক্ষা করা হয়।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Classes Section */}
      <section
        id="classes"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/20"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-primary mb-4">
            আমাদের ক্লাসগুলি
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            দুটি শাখায় আমরা বিভিন্ন স্তরের শিক্ষা প্রদান করি যা ছাত্র-ছাত্রীদের
            ক্রমান্বয়ে উন্নত করে
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Girls Branch */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-border">
              <h3 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
                <Users className="w-6 h-6" />
                শিক্ষার্থী শাখা (মেয়ে)
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-foreground">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  <span>প্লে / নার্সারি</span>
                </li>
                <li className="flex items-center gap-3 text-foreground">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  <span>এক (নুরানি)</span>
                </li>
                <li className="flex items-center gap-3 text-foreground">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  <span>দুই</span>
                </li>
                <li className="flex items-center gap-3 text-foreground">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  <span>তিন</span>
                </li>
                <li className="flex items-center gap-3 text-foreground">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  <span>চার</span>
                </li>
                <li className="flex items-center gap-3 text-foreground">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  <span>পাঁচ (মিজান থেকে তাকমিল)</span>
                </li>
              </ul>
            </div>

            {/* Boys Branch */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-border">
              <h3 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
                <Users className="w-6 h-6" />
                শিক্ষার্থী শাখা (ছেলে)
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-foreground">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  <span>নুরানি - প্রাথমিক পর্যায়</span>
                </li>
                <li className="flex items-center gap-3 text-foreground">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  <span>নাজেরা - কুরআন পঠন</span>
                </li>
                <li className="flex items-center gap-3 text-foreground">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  <span>হিফজ - কুরআন মুখস্থকরণ</span>
                </li>
                <li className="flex items-center gap-3 text-foreground">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  <span>কিতাব বিভাগ - উন্নত শিক্ষা</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-primary mb-4">
            আমাদের সম্পর্কে
          </h2>
          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <p>
              দারুন নাজাত মাদ্রাসা একটি আধুনিক ইসলামিক শিক্ষা প্রতিষ্ঠান যেখানে
              আমরা ছাত্র-ছাত্রীদের ধর্মীয় এবং নৈতিক শিক্ষার পাশাপাশি সর্বাধুনিক
              শিক্ষা পদ্ধতি অনুসরণ করি।
            </p>
            <p>
              আমাদের লক্ষ্য হল এমন মানুষ তৈরি করা যারা শুধুমাত্র ধার্মিক নয়,
              বরং সমাজে দায়িত্বশীল এবং নৈতিক নাগরিক। প্রতিটি শিক্ষার্থী আমাদের
              কাছে অমূল্য এবং আমরা তাদের সর্বোচ্চ উন্নয়নে প্রতিশ্রুতিবদ্ধ।
            </p>
            <p>
              দুটি শাখায় (মেয়ে এবং ছেলে) আমরা একাধিক স্তরের শিক্ষা প্রদান করি
              এবং রেসিডেনশিয়াল ও নন-রেসিডেনশিয়াল উভয় সুবিধা রয়েছে। আমাদের
              অভিজ্ঞ শিক্ষকমণ্ডলী এবং আধুনিক সুবিধাদি নিশ্চিত করে যে প্রতিটি
              শিক্ষার্থী সর্বোত্তম শিক্ষা লাভ করতে পারে।
            </p>
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section
        id="contact"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/20"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-primary mb-12">
            আমাদের সাথে যোগাযোগ করুন
          </h2>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Contact Info */}
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-primary text-lg mb-2">ফোন</h3>
                <p className="text-muted-foreground">+88 01234-567890</p>
              </div>
              <div>
                <h3 className="font-semibold text-primary text-lg mb-2">
                  ইমেইল
                </h3>
                <p className="text-muted-foreground">info@darunnazat.edu.bd</p>
              </div>
              <div>
                <h3 className="font-semibold text-primary text-lg mb-2">
                  ঠিকানা
                </h3>
                <p className="text-muted-foreground">
                  দারুন নাজাত মাদ্রাসা
                  <br />
                  [আপনার শহর], বাংলাদেশ
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <form className="space-y-4 bg-white p-6 rounded-lg shadow-sm border border-border">
              <input
                type="text"
                placeholder="আপনার নাম"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <input
                type="email"
                placeholder="আপনার ইমেইল"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <textarea
                placeholder="আপনার বার্তা"
                rows={3}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              ></textarea>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition"
              >
                পাঠান
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">দারুন নাজাত মাদ্রাসা</h3>
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
                ফোন: +88 01234-567890
                <br />
                ইমেইল: info@darunnazat.edu.bd
              </p>
            </div>
          </div>
          <div className="border-t border-primary-foreground/20 pt-8 text-center text-sm opacity-75">
            <p>&copy; 2024 দারুন নাজাত মাদ্রাসা। সব অধিকার সংরক্ষিত।</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
