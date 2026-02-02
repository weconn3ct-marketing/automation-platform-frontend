import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container } from '../ui';

export const Hero = () => {
  const navigate = useNavigate();
  const formatValue = (value: number, decimals: number, suffix: string) => {
    const fixed = value.toFixed(decimals);
    const trimmed = decimals > 0 ? fixed.replace(/\.0+$/, '') : fixed;
    return `${trimmed}${suffix}`;
  };

  const parseStatValue = (raw: string) => {
    const normalized = raw.replace(/\s+/g, '');
    if (normalized.includes('/')) {
      const [current, total] = normalized.split('/');
      const target = Number.parseFloat(current);
      return {
        target,
        suffix: `/${total}`,
        decimals: Math.max(0, (current.split('.')[1] || '').length),
      };
    }

    const match = normalized.match(/^(\d*\.?\d+)([a-zA-Z+%]*)$/);
    const target = match ? Number.parseFloat(match[1]) : 0;
    const suffix = match ? match[2] : '';
    const decimals = match && match[1].includes('.') ? match[1].split('.')[1].length : 0;
    return { target, suffix, decimals };
  };

  const StatValue = ({ value }: { value: string }) => {
    const { target, suffix, decimals } = parseStatValue(value);
    const [display, setDisplay] = useState(0);

    useEffect(() => {
      const duration = 1400;
      const start = performance.now();

      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(target * eased);

        if (progress < 1) {
          requestAnimationFrame(tick);
        }
      };

      const animationId = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(animationId);
    }, [target]);

    return formatValue(display, decimals, suffix);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-purple-800">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
      
      <Container className="relative z-10 py-20">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-white text-sm font-medium">AI-Powered Social Media Automation</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Automate Your Social Media,
            <br />
            <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
              Grow Your Brand
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
            Schedule posts, generate AI captions, and analyze performance across all platforms. 
            Save 10+ hours per week on social media management.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => navigate('/signup')}
            >
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto">
            {[
              { value: '50K+', label: 'Active Users' },
              { value: '2M+', label: 'Posts Scheduled' },
              { value: '10+', label: 'Platforms' },
              { value: '4.9/5', label: 'User Rating' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-2">
                  <StatValue value={stat.value} />
                </div>
                <div className="text-white/80 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 80C1200 80 1320 70 1380 65L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
};
