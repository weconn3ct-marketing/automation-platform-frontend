import { Container } from '../ui';

const companies = [
  'Shopify',
  'Netflix',
  'Airbnb',
  'Spotify',
  'Uber',
  'Slack',
];

export const SocialProof = () => {
  return (
    <section className="py-16 bg-white">
      <Container>
        <p className="text-center text-gray-500 text-sm font-medium mb-8 uppercase tracking-wider">
          Trusted by 50,000+ businesses worldwide
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center">
          {companies.map((company) => (
            <div
              key={company}
              className="text-2xl font-bold text-gray-300 hover:text-gray-600 transition-colors duration-200"
            >
              {company}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};
