import { Card, Container } from '../ui';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Marketing Manager',
    company: 'TechCorp',
    avatar: '👩‍💼',
    text: 'This platform saved me 15 hours per week. The AI caption generator is a game-changer!',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Social Media Director',
    company: 'GrowthCo',
    avatar: '👨‍💻',
    text: 'Best social media tool we\'ve used. Analytics are incredibly detailed and easy to understand.',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'Content Creator',
    company: 'Creative Studio',
    avatar: '👩‍🎨',
    text: 'The scheduling feature is perfect. I can plan my entire month in one sitting.',
    rating: 5,
  },
  {
    name: 'David Park',
    role: 'Agency Owner',
    company: 'Digital Agency',
    avatar: '👨‍💼',
    text: 'Managing multiple client accounts has never been easier. Highly recommend!',
    rating: 5,
  },
  {
    name: 'Lisa Wang',
    role: 'E-commerce Manager',
    company: 'ShopNow',
    avatar: '👩',
    text: 'The multi-platform posting saves so much time. Our engagement has tripled!',
    rating: 5,
  },
  {
    name: 'James Miller',
    role: 'Startup Founder',
    company: 'StartupXYZ',
    avatar: '👨',
    text: 'As a solo founder, this tool is invaluable. It\'s like having a social media team.',
    rating: 5,
  },
];

export const Testimonials = () => {
  return (
    <section className="py-20 bg-gray-50">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Loved by 50,000+ Users
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See what our customers are saying about us.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.name} className="group">
              <Card
                hover
                className="relative h-full overflow-hidden border border-gray-100 shadow-lg transition-all duration-300 ease-out transform-gpu will-change-transform group-hover:-translate-y-2 group-hover:shadow-2xl"
              >
                {/* Decorative gradient */}
                <div className="pointer-events-none absolute -top-16 -right-16 h-32 w-32 rounded-full bg-gradient-to-br from-primary-200/40 to-purple-300/40 blur-2xl opacity-60 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="h-5 w-5 text-yellow-400 drop-shadow-sm"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      fill="currentColor"
                    >
                      <path d="M12 2.5l2.72 5.51 6.08.88-4.4 4.29 1.04 6.06L12 16.9l-5.44 2.86 1.04-6.06-4.4-4.29 6.08-.88L12 2.5z" />
                    </svg>
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-gray-700 mb-6 leading-relaxed">
                  <span className="text-2xl text-primary-500 mr-1">“</span>
                  {testimonial.text}
                  <span className="text-2xl text-primary-500 ml-1">”</span>
                </p>

                {/* Author Info */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-purple-100 text-2xl shadow-inner">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors duration-200">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {testimonial.role} at {testimonial.company}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};
