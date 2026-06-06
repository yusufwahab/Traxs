import { Link, useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      {/* Navigation Bar */}
      <nav
        style={{ background: 'rgba(13, 17, 23, 0.95)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-[#30363D] h-14 flex items-center px-8"
      >
        <Link to="/" className="flex flex-col justify-center hover:opacity-80 transition-opacity">
          <span className="text-white font-bold text-lg tracking-tight">TRAXS</span>
          <span className="text-[#8B949E] text-[10px] font-mono tracking-widest uppercase">
            Transport Real-time Analytics &amp; Exchange System
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-6">
          <a href="#how-it-works" className="text-[#8B949E] text-sm hover:text-white transition-colors hidden md:block">
            How It Works
          </a>
          <a href="#who-it-serves" className="text-[#8B949E] text-sm hover:text-white transition-colors hidden md:block">
            Who It Serves
          </a>
          <button
            onClick={() => navigate('/map')}
            className="bg-[#1A6B3C] hover:bg-[#2D9E5F] text-white text-sm px-4 py-1.5 rounded transition-colors"
          >
            Open Dashboard
          </button>
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
        <div
          className="absolute inset-0 z-0"
          style={{ background: 'linear-gradient(to bottom, rgba(13,17,23,0.75) 0%, rgba(13,17,23,0.35) 40%, rgba(13,17,23,0.55) 100%)' }}
        />

        <div className="text-center max-w-4xl relative z-10">
          <div className="inline-block border border-[#30363D] px-3 py-1 rounded-sm mb-6">
            <span className="text-[#2D9E5F] font-mono text-xs tracking-[0.2em] uppercase">
              Mobility Intelligence Platform
            </span>
          </div>

          <h1
            className="text-white font-bold tracking-tight mb-6"
            style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', lineHeight: '1.1', textShadow: '0 2px 20px rgba(0,0,0,0.8)', maxWidth: '720px', margin: '0 auto 1.5rem' }}
          >
            Nigeria&#39;s cities move every day.<br />
            Now they can see themselves move.
          </h1>

          <p
            className="text-[#cbd5e1] text-base mb-10 max-w-[520px] mx-auto leading-relaxed"
            style={{ textShadow: '0 1px 12px rgba(0,0,0,0.9)' }}
          >
            TRAXS transforms fragmented informal transit data into structured intelligence
            for city planners, investors, and government.
          </p>

          <div className="flex items-center gap-4 justify-center mb-16">
            <button
              onClick={() => navigate('/map')}
              className="bg-[#1A6B3C] hover:bg-[#2D9E5F] text-white text-sm font-medium px-6 py-2.5 rounded transition-colors"
            >
              Open Live Dashboard
            </button>
            <button
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-white text-sm font-medium px-6 py-2.5 rounded transition-colors border border-white/30 hover:border-white/60"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            >
              Read the Brief
            </button>
          </div>

          <div
            className="flex items-center gap-8 justify-center px-8 py-4 rounded"
            style={{ background: 'rgba(13,17,23,0.55)', backdropFilter: 'blur(8px)', border: '1px solid rgba(48,54,61,0.6)' }}
          >
            <div className="text-center">
              <span className="text-[#2D9E5F] font-mono font-bold text-2xl">4M+</span>
              <span className="text-[#8B949E] text-xs ml-2">daily trips</span>
            </div>
            <div className="w-px h-6 bg-[#30363D]" />
            <div className="text-center">
              <span className="text-[#2D9E5F] font-mono font-bold text-2xl">0</span>
              <span className="text-[#8B949E] text-xs ml-2">data collected before TRAXS</span>
            </div>
            <div className="w-px h-6 bg-[#30363D]" />
            <div className="text-center">
              <span className="text-[#2D9E5F] font-mono font-bold text-2xl">5</span>
              <span className="text-[#8B949E] text-xs ml-2">AWS services</span>
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
      <section id="who-it-serves" className="bg-[#0D1117] py-24 px-6">
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