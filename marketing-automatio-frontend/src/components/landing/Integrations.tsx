import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube } from 'react-icons/fa6';
import { Container } from '../ui';

const platforms = [
  { name: 'Instagram', Icon: FaInstagram, color: 'text-pink-500' },
  { name: 'Facebook', Icon: FaFacebookF, color: 'text-blue-600' },
  { name: 'LinkedIn', Icon: FaLinkedinIn, color: 'text-blue-700' },
  { name: 'YouTube', Icon: FaYoutube, color: 'text-red-600' },
];

export const Integrations = () => {
  return (
    <section className="py-20 bg-gray-50">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Connect All Your Platforms
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Manage all your social media accounts from one powerful dashboard.
          </p>
        </div>

        {/* Platforms Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {platforms.map((platform) => (
            <div
              key={platform.name}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col items-center justify-center text-center group"
            >
              <platform.Icon
                className={`text-5xl mb-3 ${platform.color} transition-transform duration-300 group-hover:scale-110`}
                aria-hidden="true"
              />
              <h3 className="font-semibold text-gray-900">{platform.name}</h3>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600">
            + More platforms added every month
          </p>
        </div>
      </Container>
    </section>
  );
};
