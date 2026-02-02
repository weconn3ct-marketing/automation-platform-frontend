import {
  Hero,
  SocialProof,
  Features,
  HowItWorks,
  Integrations,
  Pricing,
  Testimonials,
  FinalCTA,
  Footer,
} from '../../components/landing';

export const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <SocialProof />
      <Features />
      <HowItWorks />
      <Integrations />
      <Pricing />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </div>
  );
};

export default LandingPage;
