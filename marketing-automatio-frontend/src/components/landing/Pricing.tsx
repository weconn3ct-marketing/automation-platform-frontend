import { useNavigate } from 'react-router-dom';
import { Button, Card, Container } from '../ui';

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for getting started',
    features: [
      'Up to 3 social accounts',
      '10 scheduled posts per month',
      'Basic analytics',
      'AI caption generator (50/month)',
      'Email support',
    ],
    cta: 'Start Free',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$29',
    description: 'For growing businesses',
    features: [
      'Up to 10 social accounts',
      'Unlimited scheduled posts',
      'Advanced analytics & reports',
      'Unlimited AI captions',
      'Team collaboration (3 members)',
      'Priority support',
      'Custom branding',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Business',
    price: '$99',
    description: 'For teams and agencies',
    features: [
      'Unlimited social accounts',
      'Unlimited scheduled posts',
      'Advanced analytics & white-label reports',
      'Unlimited AI captions',
      'Team collaboration (unlimited)',
      'Dedicated account manager',
      'API access',
      'Custom integrations',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export const Pricing = () => {
  const navigate = useNavigate();

  const handleCta = (cta: string) => {
    if (cta === 'Start Free Trial' || cta === 'Start Free') {
      navigate('/signup');
    }
  };

  return (
    <section className="py-20 bg-white">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Start free. Upgrade when you need more. Cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div key={plan.name} className="relative group">
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-primary-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              <Card
                className={`h-full flex flex-col transition-all duration-300 ease-out transform-gpu will-change-transform ${
                  plan.popular
                    ? 'border-2 border-primary-500 shadow-2xl'
                    : 'border border-gray-100 shadow-lg'
                } group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:border-primary-200`}
                hover={!plan.popular}
              >
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-end justify-center mb-1">
                    <span className="text-5xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-primary-600">
                      {plan.price}
                    </span>
                    {plan.price !== '$0' && (
                      <span className="text-gray-600 ml-2 mb-2">/month</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start transition-transform duration-200 group-hover:translate-x-1"
                    >
                      <svg
                        className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0 transition-colors duration-300 group-hover:text-primary-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.popular ? 'primary' : 'secondary'}
                  className="w-full transition-transform duration-200 group-hover:scale-[1.02]"
                  onClick={() => handleCta(plan.cta)}
                >
                  {plan.cta}
                </Button>
              </Card>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="text-center mt-12">
          <p className="text-gray-600">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </Container>
    </section>
  );
};
