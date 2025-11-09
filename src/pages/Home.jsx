import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, PieChart, Bell, Target, Zap, ArrowRight, LineChart, Shield, CreditCard, Smartphone} from 'lucide-react';
import NavbarHome from '../components/NavbarHome';
import FeatureCard from '../components/FeatureCard';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [income, setIncome] = useState(8527);
  const [expense, setExpense] = useState(2172);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
    setActiveFeature(prev => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Smart Tracking",
      desc: "Automatically categorize and track all your expenses in real-time"
    },
    {
      icon: <PieChart className="w-6 h-6" />,
      title: "Visual Insights",
      desc: "Beautiful charts and analytics to understand your spending patterns"
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Smart Alerts",
      desc: "Get notified before you exceed your budget limits"
    }
  ];

  const stats = [
    { label: "Active Users", value: "50K+", change: "+12%" },
    { label: "Money Saved", value: "$2M+", change: "+24%" },
    { label: "Transactions", value: "1M+", change: "+8%" }
  ];

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 font-alan">
      <NavbarHome />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Take control of
                <br />
                your money with
                <br />
                <span className="italic bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">smart budgeting</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Track expenses effortlessly, set goals that matter, and watch your savings grow—all in one beautifully simple app designed for your financial success.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={"/dashboard"} className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-xl transform hover:-translate-y-1 transition-all hover:text-white duration-200 font-medium flex items-center justify-center group">
                  Start Budgeting Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Interactive Dashboard Preview */}
            <div className="relative animate-slide-up">
              <div className="bg-white rounded-2xl shadow-2xl p-6 transform transition-all duration-500">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">Your Budget</h3>
                    <span className="text-sm text-green-600 font-medium">+4.5% this week</span>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-6 text-white">
                    <div className="text-sm opacity-90 mb-2">Total Balance</div>
                    <div className="text-4xl font-bold">${(income - expense).toLocaleString()}</div>
                    <div className="mt-4 flex items-center text-sm">
                      <div className="flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        <span>Income: ${income.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center">
                          🍔
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">Food & Dining</div>
                          <div className="text-sm text-gray-500">-$420.50</div>
                        </div>
                      </div>
                      <div className="text-orange-600 font-semibold">35%</div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center">
                          🏠
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">Housing</div>
                          <div className="text-sm text-gray-500">-$1,200.00</div>
                        </div>
                      </div>
                      <div className="text-amber-600 font-semibold">55%</div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center">
                          🎮
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">Entertainment</div>
                          <div className="text-sm text-gray-500">-$180.00</div>
                        </div>
                      </div>
                      <div className="text-orange-600 font-semibold">10%</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -top-4 -left-4 bg-white rounded-xl shadow-lg p-4 animate-float">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Saved</div>
                    <div className="text-sm font-bold text-gray-800">$420</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg p-4 animate-float-delayed">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <Zap className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Goal</div>
                    <div className="text-sm font-bold text-gray-800">75%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-gray-600">Add expenses in seconds with our intuitive interface</p>
            </div>
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Goal Focused</h3>
              <p className="text-gray-600">Set savings goals and track your progress in real-time</p>
            </div>
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <LineChart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Smart Insights</h3>
              <p className="text-gray-600">Get AI-powered recommendations to save more</p>
            </div>
          </div>
        </div>
      </section>

        {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features to help you manage your money better
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={TrendingUp}
              title="Real-time Analytics"
              description="Track spending patterns and trends with beautiful, interactive charts and insights."
              delay={100}
            />
            <FeatureCard
              icon={PieChart}
              title="Budget Planning"
              description="Create custom budgets for different categories and never overspend again."
              delay={200}
            />
            <FeatureCard
              icon={Bell}
              title="Smart Alerts"
              description="Get notified about bills, budget limits, and unusual spending instantly."
              delay={300}
            />
            {/* <FeatureCard
              icon={Shield}
              title="Bank-level Security"
              description="Your financial data is encrypted and protected with industry-leading security."
              delay={400}
            />
            <FeatureCard
              icon={Smartphone}
              title="Multi-platform"
              description="Access your finances anywhere with our web, iOS, and Android apps."
              delay={500}
            />
            <FeatureCard
              icon={CreditCard}
              title="Card Management"
              description="Track all your cards in one place and manage subscriptions effortlessly."
              delay={600}
            /> */}
          </div>
        </div>
      </section>

      {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div>
          <h1 className='text-3xl md:text-4xl font-bold text-center text-gray-900 leading-tight animate-fade-in'>
            Empowering Your Financial Journey, One Smart Budget at a Time.
          </h1>
        </div>
        <div className='grid grid-cols-2 md:grid-cols-3 gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20'>
              <div className='border-l-4 border-orange-500 pl-4 w-full'>
                Hello
              </div>
        </div>
      </div> */}

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-3xl p-12 text-center text-white shadow-2xl transform transition-transform duration-300">
            <h2 className="text-4xl font-bold mb-4">Ready to transform your</h2>
            <h2 className="text-4xl font-bold italic mb-6">budgeting?</h2>
            {/* <p className="text-xl mb-8 text-orange-50">Join thousands of users who've taken control of their finances</p> */}
            <Link to={"/dashboard"} className="px-10 py-4 bg-white text-orange-600 rounded-lg font-bold hover:shadow-2xl hover:text-black transform hover:-translate-y-1 transition-all duration-200">
              Start For Free
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-fade-in { animation: fade-in 0.8s ease-out; }
        .animate-slide-up { animation: slide-up 1s ease-out; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-float-delayed { animation: float 3s ease-in-out 1.5s infinite; }
      `}</style>
    </div>
  );
}