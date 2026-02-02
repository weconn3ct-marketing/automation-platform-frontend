import { Card, Container } from '../ui';

const features = [
  {
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
    title: 'AI-Powered Captions',
    description: 'Generate engaging, on-brand captions in seconds using advanced AI technology.',
  },
  {
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80',
    title: 'Smart Scheduling',
    description: 'Auto-schedule posts at optimal times based on audience engagement data.',
  },
  {
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    title: 'Advanced Analytics',
    description: 'Track performance across all platforms with real-time insights and reports.',
  },
  {
    image: 'https://images.unsplash.com/photo-1525182008055-f88b95ff7980?auto=format&fit=crop&w=800&q=80',
    title: 'Multi-Platform Posting',
    description: 'Post to Instagram, Facebook, Twitter, LinkedIn, TikTok, and more simultaneously.',
  },
  {
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    title: 'Content Library',
    description: 'Organize and manage all your media assets in one centralized library.',
  },
  {
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80',
    title: 'Team Collaboration',
    description: 'Work seamlessly with your team with roles, approvals, and workflows.',
  },
];

export const Features = () => {
  return (
    <section className="py-20 bg-gray-50">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to save you time and grow your social media presence.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Card key={feature.title} hover className="relative overflow-hidden border border-gray-100">
              <div className="mb-5 overflow-hidden rounded-2xl">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="h-44 w-full object-cover transition-transform duration-500 hover:scale-110"
                  loading="lazy"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              <div className="pointer-events-none absolute inset-x-0 -bottom-12 h-24 bg-gradient-to-t from-primary-50/60 to-transparent" />
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
};
