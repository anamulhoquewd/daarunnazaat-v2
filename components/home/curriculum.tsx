import { BookOpen, CheckCircle2, Users } from "lucide-react";

interface CurriculumCardProps {
  level: string;
  description: string;
}


export default function Curriculum() {
  const girlsCurriculum = [
    { level: "নুরানি", description: "প্রাথমিক আরবি অক্ষর শিক্ষা" },
    { level: "প্রথম শ্রেনী", description: "বেসিক কুরআন শিক্ষা" },
    { level: "দ্বিতীয় শ্রেনী", description: "মধ্যম স্তরের কুরআন শিক্ষা" },
    { level: "তৃতীয় শ্রেনী", description: "উন্নত কুরআন পাঠ" },
    { level: "চতুর্থ শ্রেনী", description: "কুরআন সংরক্ষণ প্রোগ্রাম" },
    {
      level: "পঞ্চম শ্রেনী (রমজান থেকে শুরু)",
      description: "বিশেষ দীর্ঘমেয়াদী কোর্স",
    },
    {
      level: "মিজান থেকে দাওরায়ে আদীস (তাকমীল)",
      description: "কুরআন ও হাদিসের গভীর শিক্ষা",
    },
  ];

  const boysCurriculum = [
    {
      level: "নুরানি - প্রাথমিক বর্ণ",
      description: "আরবি অক্ষর ও উচ্চারণ শিক্ষা",
    },
    { level: "নাজেরা - কুরআন পড়ন", description: "সঠিক তাজবীদ সহ কুরআন পাঠ" },
    {
      level: "হিফজ - কুরআন মুখস্থকরণ",
      description: "সম্পূর্ণ কুরআন মুখস্ত করা",
    },
    {
      level: "কিতাব বিদ্যা - উন্নত শিক্ষা",
      description: "ইসলামিক জ্ঞান ও আইন",
    },
  ];

  return (
    <section id="curriculum" className="py-20 md:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-primary mb-4">
            আমাদের শিক্ষা কর্মসূচি
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            ছাত্র ও ছাত্রীদের জন্য বিশেষভাবে ডিজাইন করা শিক্ষা কর্মসূচি
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Girls Section */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <Users className="text-primary" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-foreground">বালক শাখা</h3>
            </div>
            <div className="space-y-4">
              {boysCurriculum.reverse().map((item, index) => (
                <CurriculumCard key={index} {...item} />
              ))}
            </div>
          </div>

          {/* Boys Section */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <BookOpen className="text-primary" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-foreground">
                বালিকা সাখা
              </h3>
            </div>
            <div className="space-y-4">
              {girlsCurriculum.reverse().map((item, index) => (
                <CurriculumCard key={index} {...item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}



export function CurriculumCard({ level, description }: CurriculumCardProps) {
  return (
    <div className="p-6 bg-white border border-border rounded-xl hover:shadow-lg transition group">
      <div className="flex items-start gap-4">
        <CheckCircle2 className="text-primary flex-shrink-0 mt-1" size={24} />
        <div>
          <h4 className="font-bold text-lg text-foreground group-hover:text-primary transition">
            {level}
          </h4>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}