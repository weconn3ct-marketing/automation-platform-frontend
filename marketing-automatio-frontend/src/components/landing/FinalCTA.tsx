import { useNavigate } from 'react-router-dom';
import { Button, Container } from '../ui';

export const FinalCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-gradient-to-br from-primary-600 to-purple-700">
      <Container>
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Social Media?
          </h2>
          <p className="text-lg sm:text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join 50,000+ businesses automating their social media. Start your free trial today—no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => navigate('/signup')}
            >
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Schedule a Demo
            </Button>
          </div>
          <p className="text-white/80 text-sm mt-6">
            ✓ 14-day free trial &nbsp;&nbsp; ✓ No credit card required &nbsp;&nbsp; ✓ Cancel anytime
          </p>
        </div>
      </Container>
    </section>
  );
};
