import { BookOpen, HomeIcon, Users } from "lucide-react"

function Service() {
  return (
    <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold text-center text-primary mb-4">
                আমাদের বৈশিষ্ট্যসমূহ
              </h2>
              <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
                আমরা সর্বোচ্চ মানের ইসলামিক শিক্ষা প্রদানে প্রতিশ্রুতিবদ্ধ
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
                    আবাসিক সুবিধা
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
                  <h3 className="text-xl font-bold text-primary mb-2">অনাবাসিক</h3>
                  <p className="text-muted-foreground">
                    যারা বাড়িতে থেকে পড়তে চান তাদের জন্য অনাবাসিক সুবিধা রয়েছে।
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
                    অভিজ্ঞ শিক্ষক/শিক্ষিকামণ্ডলী
                  </h3>
                  <p className="text-muted-foreground">
                    অভিজ্ঞ এবং যোগ্য শিক্ষক ও শিক্ষিকাদের দ্বারা পরিচালিত আমাদের
                    মাদরাসা।
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
  )
}

export default Service
