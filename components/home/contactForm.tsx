
function ContactForm() {
  return (
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
                <p className="text-muted-foreground">+88 01712-084833 <br />+88 01975-024262</p>
              </div>
              <div>
                <h3 className="font-semibold text-primary text-lg mb-2">
                  ইমেইল
                </h3>
                <p className="text-muted-foreground">darunnazat@gmail.com</p>
              </div>
              <div>
                <h3 className="font-semibold text-primary text-lg mb-2">
                  ঠিকানা
                </h3>
                <p className="text-muted-foreground">
                  দারুন নাজাত মাদরাসা
                  <br />
                  কাওলার, জমিদার বাড়ী, দক্ষিণখান, ঢাকা-১২২৯, বাংলাদেশ।
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
  )
}

export default ContactForm
