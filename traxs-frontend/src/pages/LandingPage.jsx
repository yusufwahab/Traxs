import { Link } from 'react-router-dom';

export default function LandingPage() {
  const handleScrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0D1117] border-b border-[#30363D] h-14">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            {/* TRAXS Logo Icon */}
            <div className="w-8 h-8 bg-[#1A6B3C] rounded-md flex items-center justify-center relative overflow-hidden">
              {/* Road/Route pattern */}
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="relative z-10">
                {/* Curved road lines */}
                <path 
                  d="M2 10 C6 6, 14 6, 18 10 M2 10 C6 14, 14 14, 18 10" 
                  stroke="white" 
                  strokeWidth="1.5" 
                  fill="none" 
                  strokeLinecap="round"
                />
                {/* Data points/nodes */}
                <circle cx="4" cy="8" r="1.5" fill="#F4A823" />
                <circle cx="10" cy="6" r="1.5" fill="#F4A823" />
                <circle cx="16" cy="8" r="1.5" fill="#F4A823" />
                <circle cx="6" cy="12" r="1.5" fill="white" />
                <circle cx="14" cy="12" r="1.5" fill="white" />
              </svg>
              {/* Background pattern for depth */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#2D9E5F] to-[#1A6B3C] opacity-20"></div>
            </div>
            
            <div>
              <div className="font-bold text-white">TRAXS</div>
              <div className="text-xs text-[#8B949E] leading-tight">Transport Real-time Analytics & Exchange System</div>
            </div>
          </Link>
          
          <div className="flex items-center gap-6">
            <a href="#" className="text-[#8B949E] hover:text-white transition-colors hidden sm:block">
              View Documentation
            </a>
            <Link 
              to="/map" 
              className="bg-[#1A6B3C] text-white px-4 py-1.5 rounded text-sm hover:bg-[#2D9E5F] transition-colors"
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section 
        className="min-h-screen flex items-center justify-center px-6 pt-14 relative overflow-hidden"
        style={{
          backgroundImage: `url('/NigeriaCity.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Single clean overlay — dark enough for text, light enough to see the city */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(13,17,23,0.55) 0%, rgba(13,17,23,0.45) 50%, rgba(13,17,23,0.75) 100%)' }}></div>
        
        {/* Content */}
        <div className="text-center max-w-4xl relative z-10">
          <div className="border border-white/20 text-[#A8D8B9] font-mono text-xs tracking-widest px-3 py-1 rounded-sm inline-block mb-8">
            [ MOBILITY INTELLIGENCE PLATFORM ]
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6 text-white" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>
            Nigeria&#39;s cities move<br />
            every day. Now they<br />
            can see themselves move.
          </h1>
          
          <p className="text-[#C9D1D9] text-base max-w-[560px] mx-auto mb-8" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.9)' }}>
            TRAXS transforms fragmented informal transit data into 
            structured intelligence for city planners, investors, and government.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              to="/map"
              className="bg-[#1A6B3C] text-white px-6 py-2.5 rounded hover:bg-[#2D9E5F] transition-colors"
              style={{ boxShadow: '0 0 20px rgba(26,107,60,0.5)' }}
            >
              Open Live Dashboard
            </Link>
            <button 
              onClick={handleScrollToHowItWorks}
              className="border border-white/30 text-white px-6 py-2.5 rounded hover:bg-white/10 transition-colors backdrop-blur-sm"
            >
              Read the Brief
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm border border-white/15 rounded-lg px-6 py-4 backdrop-blur-md" style={{ background: 'rgba(13,17,23,0.5)' }}>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[#2D9E5F] text-xl font-bold">4M+</span>
              <span className="text-[#8B949E] text-xs">daily trips</span>
            </div>
            <div className="hidden sm:block text-white/20">|</div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[#2D9E5F] text-xl font-bold">0</span>
              <span className="text-[#8B949E] text-xs">data collected before TRAXS</span>
            </div>
            <div className="hidden sm:block text-white/20">|</div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[#2D9E5F] text-xl font-bold">5</span>
              <span className="text-[#8B949E] text-xs">AWS services</span>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="bg-[#0D1117] py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-left mb-12">
            <div className="text-[#1A6B3C] font-mono text-xs uppercase tracking-widest mb-4">
              THE PROBLEM
            </div>
            <h2 className="text-white text-3xl font-bold">
              Lagos moves 4 million people daily.<br />
              Zero of that movement is captured.
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#161B22] border border-[#30363D] p-6 rounded">
              <h3 className="text-white text-sm font-semibold mb-2">Urban Planners Fly Blind</h3>
              <p className="text-[#8B949E] text-sm">
                Infrastructure decisions are made using outdated manual surveys. BRT stops are placed where data suggests demand — not where people actually move.
              </p>
            </div>
            
            <div className="bg-[#161B22] border border-[#30363D] p-6 rounded">
              <h3 className="text-white text-sm font-semibold mb-2">Investors Have No Signal</h3>
              <p className="text-[#8B949E] text-sm">
                No route viability data means capital avoids high-potential corridors. Decisions are made on gut feel, not evidence.
              </p>
            </div>
            
            <div className="bg-[#161B22] border border-[#30363D] p-6 rounded">
              <h3 className="text-white text-sm font-semibold mb-2">Government Regulates Without Visibility</h3>
              <p className="text-[#8B949E] text-sm">
                Policies like okada restrictions are enacted without understanding the mobility impact on the communities that depend on them.
              </p>
            </div>
            
            <div className="bg-[#161B22] border border-[#30363D] p-6 rounded">
              <h3 className="text-white text-sm font-semibold mb-2">Operators Cannot Optimize</h3>
              <p className="text-[#8B949E] text-sm">
                Drivers have no tools to understand demand patterns, benchmark their earnings, or know which routes are underserved.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-[#161B22] py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-left mb-12">
            <div className="text-[#1A6B3C] font-mono text-xs uppercase tracking-widest mb-4">
              HOW IT WORKS
            </div>
            <h2 className="text-white text-3xl font-bold">
              Three data streams. One intelligence layer.
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[#0D1117] border border-[#30363D] p-6 rounded">
              <div className="text-[#1A6B3C] font-mono text-xs mb-4">01</div>
              <h3 className="text-white text-sm font-semibold mb-2">Driver Activation</h3>
              <p className="text-[#8B949E] text-sm">
                Drivers activate via USSD on feature phones or a lightweight web app on smartphones. Every check-in earns ₦50 airtime automatically. Cell tower triangulation tracks movement passively — no data cost to the driver.
              </p>
            </div>
            
            <div className="bg-[#0D1117] border border-[#30363D] p-6 rounded">
              <div className="text-[#1A6B3C] font-mono text-xs mb-4">02</div>
              <h3 className="text-white text-sm font-semibold mb-2">Crowd Inference Engine</h3>
              <p className="text-[#8B949E] text-sm">
                When multiple passenger devices move in the same direction at the same speed, TRAXS infers a vehicle. Occupancy, route, and position are derived automatically — without any tracker on the vehicle.
              </p>
            </div>
            
            <div className="bg-[#0D1117] border border-[#30363D] p-6 rounded">
              <div className="text-[#1A6B3C] font-mono text-xs mb-4">03</div>
              <h3 className="text-white text-sm font-semibold mb-2">Intelligence Delivery</h3>
              <p className="text-[#8B949E] text-sm">
                Processed data becomes structured insights — ghost corridor detection, congestion forecasting, load factor analysis, and policy simulation — delivered through role-specific dashboards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who It Serves Section */}
      <section className="bg-[#0D1117] py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-left mb-12">
            <div className="text-[#1A6B3C] font-mono text-xs uppercase tracking-widest mb-4">
              WHO IT SERVES
            </div>
            <h2 className="text-white text-3xl font-bold">
              Built for the people who shape cities.
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#161B22] border border-[#30363D] p-6 rounded">
              <div className="text-[#F4A823] font-mono text-xs uppercase mb-3">URBAN PLANNERS</div>
              <h3 className="text-white text-sm font-semibold mb-2">See where the city actually moves</h3>
              <p className="text-[#8B949E] text-sm">
                Live movement maps, ghost corridor detection, and congestion hotspots — built for LAMATA, LASMA, and state transport ministries.
              </p>
            </div>
            
            <div className="bg-[#161B22] border border-[#30363D] p-6 rounded">
              <div className="text-[#F4A823] font-mono text-xs uppercase mb-3">INVESTORS</div>
              <h3 className="text-white text-sm font-semibold mb-2">Route viability before you commit capital</h3>
              <p className="text-[#8B949E] text-sm">
                Load factor data, revenue projections, and demand forecasting on specific corridors. Evidence-based infrastructure investment.
              </p>
            </div>
            
            <div className="bg-[#161B22] border border-[#30363D] p-6 rounded">
              <div className="text-[#F4A823] font-mono text-xs uppercase mb-3">GOVERNMENT</div>
              <h3 className="text-white text-sm font-semibold mb-2">Policy simulation before enforcement</h3>
              <p className="text-[#8B949E] text-sm">
                Model the mobility impact of a regulation before it is enacted. Understand which communities will be affected and where alternatives exist.
              </p>
            </div>
            
            <div className="bg-[#161B22] border border-[#30363D] p-6 rounded">
              <div className="text-[#F4A823] font-mono text-xs uppercase mb-3">OPERATORS</div>
              <h3 className="text-white text-sm font-semibold mb-2">Benchmark and optimize your fleet</h3>
              <p className="text-[#8B949E] text-sm">
                Route analytics, earnings tracking, and demand signals. Tools that help danfo unions and transport cooperatives run smarter operations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AWS Architecture Section */}
      <section className="bg-[#161B22] py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-left mb-12">
            <div className="text-[#1A6B3C] font-mono text-xs uppercase tracking-widest mb-4">
              BUILT ON AWS
            </div>
            <h2 className="text-white text-3xl font-bold">
              Enterprise cloud infrastructure. African market context.
            </h2>
          </div>
          
          <div className="bg-[#0D1117] border border-[#30363D] p-8 rounded">
            <div className="grid md:grid-cols-2 gap-8 mb-6">
              <div>
                <h3 className="text-[#8B949E] text-xs font-mono uppercase mb-4">DATA LAYER</h3>
                <div className="space-y-2">
                  <div className="text-white text-sm"><span className="text-[#1A6B3C]">—</span> AWS IoT Core</div>
                  <div className="text-white text-sm"><span className="text-[#1A6B3C]">—</span> Amazon Kinesis</div>
                  <div className="text-white text-sm"><span className="text-[#1A6B3C]">—</span> Amazon DynamoDB</div>
                  <div className="text-white text-sm"><span className="text-[#1A6B3C]">—</span> Amazon S3</div>
                </div>
              </div>
              
              <div>
                <h3 className="text-[#8B949E] text-xs font-mono uppercase mb-4">INTELLIGENCE LAYER</h3>
                <div className="space-y-2">
                  <div className="text-white text-sm"><span className="text-[#1A6B3C]">—</span> Amazon SageMaker</div>
                  <div className="text-white text-sm"><span className="text-[#1A6B3C]">—</span> Amazon Bedrock</div>
                  <div className="text-white text-sm"><span className="text-[#1A6B3C]">—</span> Amazon Rekognition</div>
                  <div className="text-white text-sm"><span className="text-[#1A6B3C]">—</span> Amazon Comprehend</div>
                  <div className="text-white text-sm"><span className="text-[#1A6B3C]">—</span> Amazon Forecast</div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-[#30363D] pt-4">
              <p className="text-[#8B949E] text-sm text-center">
                All services deployed in us-east-1. Scalable to any African city with mobile network coverage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Metrics Section */}
      <section className="bg-[#0D1117] py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-[#161B22] border border-[#30363D] p-8 rounded text-center">
              <div className="text-white font-mono text-5xl font-bold mb-2">4M+</div>
              <div className="text-[#8B949E] text-sm">Daily passenger trips in Lagos</div>
            </div>
            
            <div className="bg-[#161B22] border border-[#30363D] p-8 rounded text-center">
              <div className="text-white font-mono text-5xl font-bold mb-2">0</div>
              <div className="text-[#8B949E] text-sm">Hardware required to deploy TRAXS</div>
            </div>
            
            <div className="bg-[#161B22] border border-[#30363D] p-8 rounded text-center">
              <div className="text-white font-mono text-5xl font-bold mb-2">5</div>
              <div className="text-[#8B949E] text-sm">Amazon AI services powering the platform</div>
            </div>
            
            <div className="bg-[#161B22] border border-[#30363D] p-8 rounded text-center">
              <div className="text-white font-mono text-5xl font-bold mb-2">3</div>
              <div className="text-[#8B949E] text-sm">Data streams feeding the intelligence layer</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#161B22] border-t border-[#30363D] py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-6">
            <div>
              <div className="font-bold text-white mb-2">TRAXS</div>
              <p className="text-[#8B949E] text-sm">
                Transport Real-time Analytics & Exchange System.<br />
                Built for the One with AI Hackathon — Lagos, Nigeria.
              </p>
            </div>
            
            <div>
              <h3 className="text-[#8B949E] text-xs uppercase font-mono tracking-widest mb-4">DASHBOARDS</h3>
              <div className="space-y-2">
                <Link to="/planner" className="block text-[#8B949E] hover:text-white text-sm transition-colors">
                  Urban Planner
                </Link>
                <Link to="/investor" className="block text-[#8B949E] hover:text-white text-sm transition-colors">
                  Investor Intelligence
                </Link>
                <Link to="/government" className="block text-[#8B949E] hover:text-white text-sm transition-colors">
                  Government Policy
                </Link>
                <Link to="/map" className="block text-[#8B949E] hover:text-white text-sm transition-colors">
                  Live Map
                </Link>
              </div>
            </div>
            
            <div>
              <h3 className="text-[#8B949E] text-xs uppercase font-mono tracking-widest mb-4">TEAM</h3>
              <div className="text-[#8B949E] text-sm">
                <div>Team Overclock</div>
                <div>One with AI Hackathon 2025</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-[#30363D] pt-6 text-center">
            <p className="text-[#8B949E] text-xs font-mono">
              © 2025 TRAXS — Built with Amazon Web Services
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}