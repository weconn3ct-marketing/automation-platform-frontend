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
              className="group relative rounded-2xl border border-white/60 bg-white/80 p-6 shadow-md backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-400/0 via-purple-400/0 to-pink-400/0 opacity-0 transition-opacity duration-300 group-hover:opacity-10"></div>
              <platform.Icon
                className={`text-5xl mb-3 ${platform.color} transition-transform duration-300 group-hover:scale-110`}
                aria-hidden="true"
              />
             
            </div>
          ))}
        </div>

       
      
      </Container>
    </section>
  );
};
