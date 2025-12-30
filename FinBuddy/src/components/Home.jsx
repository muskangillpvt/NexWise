import { useState } from 'react';
import { Wallet, Heart, Lightbulb, Calendar, ChevronRight, Menu, X } from 'lucide-react';4
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const coreFeatures = [
    {
      id: 1,
      title: 'Finance & Budget Hub',
      tagline: 'Master your money, reach your goals',
      icon: Wallet,
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700'
    },
    {
      id: 2,
      title: 'Routine & Wellness Assistant',
      tagline: 'Build healthy habits, thrive daily',
      icon: Heart,
      color: 'from-teal-500 to-teal-600',
      hoverColor: 'hover:from-teal-600 hover:to-teal-700'
    },
  
  ];

  const detailedFeatures = [
    {
      id: 1,
      title: 'Finance & Budget Hub',
      description: 'Take control of your finances with intelligent budgeting tools designed for international students. Track expenses, set savings goals, and understand your spending patterns.',
      subFeatures: [
        'Smart Budget Planner',
        'Expense Tracker & Categories',
        'Savings Goal Manager',
        'Currency Converter'
      ],
      icon: Wallet,
      bgColor: 'bg-white'
    },
    {
      id: 2,
      title: 'Routine & Wellness Assistant',
      description: 'Build and maintain healthy habits that support your academic and personal success. From morning routines to self-care reminders, stay balanced and energized.',
      subFeatures: [
        'Calendar',
        'Task Manager',
        'Notes'
      ],
      icon: Heart,
      bgColor: 'bg-gray-50'
    },

  ];

  const handleNavigateToLogin = () => {
    console.log('Navigate to login page');
    navigate("/login");    
  };
  const handleNavigateLogin = () => {
    console.log('Navigate to login page');
    navigate("/login");    
  };
  const handleFeatureClick = (featureId) => {
    const section = document.getElementById(`feature-${featureId}`);
    if (section) {
      section.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Wallet className="h-8 w-8 text-[#4A85FF]" />
              <span className="ml-2 text-2xl font-bold text-[#1A2D5F]">NexWise</span>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={handleNavigateToLogin}
                className="px-6 py-2 rounded-lg bg-[#4A85FF] text-white font-medium hover:bg-[#3a75ef] transition-colors"
              >
                Start for Free
              </button>
              <button
                onClick={handleNavigateLogin}
                className="px-6 py-2 rounded-lg border-2 border-[#4A85FF] text-[#4A85FF] font-medium hover:bg-[#4A85FF] hover:text-white transition-colors"
              >
                Log In
              </button>
            </div>

            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-[#1A2D5F]" />
              ) : (
                <Menu className="h-6 w-6 text-[#1A2D5F]" />
              )}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-2">
              <button
                onClick={handleNavigateToLogin}
                className="w-full px-6 py-2 rounded-lg bg-[#4A85FF] text-white font-medium hover:bg-[#3a75ef] transition-colors"
              >
                Start for Free
              </button>
              <button
                onClick={handleNavigateToLogin}
                className="w-full px-6 py-2 rounded-lg border-2 border-[#4A85FF] text-[#4A85FF] font-medium hover:bg-[#4A85FF] hover:text-white transition-colors"
              >
                Sign In
              </button>
            </div>
          )}
        </nav>
      </header>

      <main className="pt-16">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1A2D5F] leading-tight">
                Your everyday life; Upgraded, Simplified, and Smarter
              </h1>
              <p className="text-lg md:text-xl text-[#6E7A8A] leading-relaxed">
                Manage your finances, build healthy routines, and stay organized in one powerful platform. NexWise helps students plan better, stay focused, and take control of their daily life.
              </p>
              <p className="text-xl md:text-2xl font-semibold text-blue-400">
                Plan smarter. Live better. Succeed every day.
              </p>
              <button
                onClick={handleNavigateToLogin}
                className="px-8 py-3 rounded-lg bg-[#4A85FF] text-white font-medium text-lg hover:bg-[#3a75ef] transition-colors shadow-lg hover:shadow-xl"
              >
                Start for Free
              </button>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="International students managing life abroad"
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#3EC6A8] rounded-full opacity-20 blur-2xl"></div>
              <div className="absolute -top-6 -right-6 w-40 h-40 bg-[#4A85FF] rounded-full opacity-20 blur-2xl"></div>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-b from-white to-[#F7F9FC] py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[#1A2D5F] mb-4">
                Everything You Need in One Place
              </h2>
              <p className="text-lg text-[#6E7A8A]">
                Explore our comprehensive features here
              </p>
            </div>

            <div className="grid gap-6">
              {coreFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.id}
                    onClick={() => handleFeatureClick(feature.id)}
                    className={`cursor-pointer bg-gradient-to-r ${feature.color} ${feature.hoverColor} rounded-2xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-white bg-opacity-20 p-4 rounded-xl">
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl md:text-3xl font-bold text-white mb-1">
                            {feature.title}
                          </h3>
                          <p className="text-white text-opacity-90 text-lg">
                            {feature.tagline}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-8 w-8 text-white hidden md:block" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-[#1A2D5F] mb-4">
                Powerful Features, Beautifully Simple
              </h2>
              <p className="text-lg text-[#6E7A8A]">
                Dive deeper into your everyday companion #NexWise
              </p>
            </div>

            <div className="space-y-8">
              {detailedFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.id}
                    id={`feature-${feature.id}`}
                    className={`${feature.bgColor} rounded-2xl shadow-lg overflow-hidden`}
                  >
                    <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12">
                      <div className="space-y-6">
                        <div className="flex items-center space-x-4">
                          <div className="bg-[#4A85FF] p-3 rounded-xl">
                            <Icon className="h-8 w-8 text-white" />
                          </div>
                          <h3 className="text-2xl md:text-3xl font-bold text-[#1A2D5F]">
                            {feature.title}
                          </h3>
                        </div>

                        <p className="text-lg text-[#6E7A8A] leading-relaxed">
                          {feature.description}
                        </p>

                        <div className="space-y-3">
                          {feature.subFeatures.map((subFeature, idx) => (
                            <div key={idx} className="flex items-center space-x-3">
                              <div className="w-2 h-2 bg-[#3EC6A8] rounded-full"></div>
                              <span className="text-[#1A2D5F] font-medium">{subFeature}</span>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={handleNavigateToLogin}
                          className="px-8 py-3 rounded-lg bg-[#4A85FF] text-white font-medium hover:bg-[#3a75ef] transition-colors shadow-md hover:shadow-lg"
                        >
                          Start for Free
                        </button>
                      </div>

                      <div className="relative order-first md:order-last">
                        <img
                          src={
                            index === 0
                              ? 'https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=800'
                              : index === 1
                              ? 'https://images.pexels.com/photos/3768894/pexels-photo-3768894.jpeg?auto=compress&cs=tinysrgb&w=800'
                              : index === 2
                              ? 'https://images.pexels.com/photos/1595385/pexels-photo-1595385.jpeg?auto=compress&cs=tinysrgb&w=800'
                              : index === 3
                              ? 'https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg?auto=compress&cs=tinysrgb&w=800'
                              : 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800'
                          }
                          alt={feature.title}
                          className="w-full h-full object-cover rounded-xl shadow-md"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-[#1A2D5F] to-[#4A85FF] py-16 md:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to transform your student experience?
            </h2>
            <p className="text-xl text-white text-opacity-90 mb-8">
              Manage your day, your tasks, and your finances with NexWise.
            </p>
            <button
              onClick={handleNavigateToLogin}
              className="px-10 py-4 rounded-lg bg-white text-[#4A85FF] font-bold text-lg hover:bg-gray-100 transition-colors shadow-xl hover:shadow-2xl"
            >
              Get Started Now
            </button>
          </div>
        </section>
      </main>

      <footer className="bg-[#1A2D5F] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Wallet className="h-8 w-8 text-[#3EC6A8]" />
                <span className="ml-2 text-2xl font-bold">NexWise</span>
              </div>
              <p className="text-gray-300">
                Empowering international students to thrive abroad with smart financial and lifestyle management tools.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-300 hover:text-[#3EC6A8] transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-[#3EC6A8] transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-[#3EC6A8] transition-colors">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Connect With Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-white bg-opacity-10 rounded-full flex items-center justify-center hover:bg-opacity-20 transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-white bg-opacity-10 rounded-full flex items-center justify-center hover:bg-opacity-20 transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-white bg-opacity-10 rounded-full flex items-center justify-center hover:bg-opacity-20 transition-colors">
                  <span className="sr-only">Instagram</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-white border-opacity-20 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2025 NexWise. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
