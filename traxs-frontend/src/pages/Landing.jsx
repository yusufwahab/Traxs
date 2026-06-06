import { ArrowRight, MapPin, TrendingUp, Shield, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Landing() {
  const features = [
    {
      icon: MapPin,
      title: "Real-time Tracking",
      description: "Monitor vehicle movements and passenger flow with precision mapping technology"
    },
    {
      icon: TrendingUp,
      title: "Smart Analytics",
      description: "Data-driven insights for optimizing routes and improving operational efficiency"
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Enterprise-grade security ensuring data protection and system reliability"
    },
    {
      icon: Users,
      title: "Multi-stakeholder",
      description: "Tailored dashboards for government, investors, planners, and operators"
    }
  ];

  const stats = [
    { value: "99.9%", label: "Uptime Reliability" },
    { value: "10ms", label: "Response Time" },
    { value: "500K+", label: "Daily Transactions" },
    { value: "24/7", label: "Support Coverage" }
  ];

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3]">
      {/* Navigation */}
      <nav className="border-b border-[#30363D] bg-[#161B22]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-xl font-bold text-[#1A6B3C]">TRAXS</div>
            <Link 
              to="/planner" 
              className="bg-[#1A6B3C] hover:bg-[#2D9E5F] px-6 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Launch Platform
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Intelligent
                <span className="text-[#1A6B3C]"> Mobility</span>
                <br />Platform
              </h1>
              <p className="text-xl text-[#8B949E] mb-8 leading-relaxed">
                Transform urban transportation with AI-powered analytics, real-time tracking, 
                and comprehensive mobility intelligence for smarter cities.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/planner"
                  className="bg-[#1A6B3C] hover:bg-[#2D9E5F] px-8 py-3 rounded-md font-medium inline-flex items-center justify-center transition-colors"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link 
                  to="/simulator"
                  className="border border-[#30363D] hover:bg-[#161B22] px-8 py-3 rounded-md font-medium transition-colors"
                >
                  View Demo
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-[#1A6B3C] to-[#2D9E5F] rounded-2xl p-8 transform rotate-2 opacity-20 absolute inset-0"></div>
              <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-8 relative">
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-2xl font-bold text-[#1A6B3C]">{stat.value}</div>
                      <div className="text-sm text-[#8B949E]">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 lg:px-8 bg-[#161B22]/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Platform Capabilities</h2>
            <p className="text-xl text-[#8B949E] max-w-3xl mx-auto">
              Comprehensive mobility solutions designed for modern transportation challenges
            </p>
          </div>
          <div className="grid lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-[#161B22] border border-[#30363D] rounded-xl p-6 hover:border-[#1A6B3C]/50 transition-colors">
                <div className="bg-[#1A6B3C]/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-[#1A6B3C]" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-[#8B949E] text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Tailored Solutions</h2>
            <p className="text-xl text-[#8B949E] max-w-3xl mx-auto">
              Specialized dashboards and tools for every stakeholder in the mobility ecosystem
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            <Link to="/government" className="group">
              <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-8 hover:border-[#1A6B3C]/50 transition-all group-hover:scale-105">
                <h3 className="text-xl font-semibold mb-3">Government Portal</h3>
                <p className="text-[#8B949E] mb-4">Policy insights, traffic management, and urban planning tools</p>
                <div className="text-[#1A6B3C] text-sm font-medium">Explore Dashboard →</div>
              </div>
            </Link>
            <Link to="/investor" className="group">
              <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-8 hover:border-[#1A6B3C]/50 transition-all group-hover:scale-105">
                <h3 className="text-xl font-semibold mb-3">Investor Analytics</h3>
                <p className="text-[#8B949E] mb-4">Market analysis, ROI tracking, and investment opportunities</p>
                <div className="text-[#1A6B3C] text-sm font-medium">View Analytics →</div>
              </div>
            </Link>
            <Link to="/planner" className="group">
              <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-8 hover:border-[#1A6B3C]/50 transition-all group-hover:scale-105">
                <h3 className="text-xl font-semibold mb-3">Route Planner</h3>
                <p className="text-[#8B949E] mb-4">Optimization tools, route analysis, and operational planning</p>
                <div className="text-[#1A6B3C] text-sm font-medium">Start Planning →</div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#30363D] py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-center">
            <div className="text-xl font-bold text-[#1A6B3C] mb-4 lg:mb-0">TRAXS</div>
            <div className="text-sm text-[#8B949E]">
              © 2024 TRAXS Mobility Platform. Advanced transportation intelligence.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}