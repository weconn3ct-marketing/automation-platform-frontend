import { FaInstagram, FaLinkedinIn, FaXTwitter, FaYoutube } from 'react-icons/fa6';
import { Container } from '../ui';

const footerLinks = {
  Product: ['Features', 'Pricing', 'Integrations', 'API', 'Changelog'],
  Company: ['About', 'Blog', 'Careers', 'Press', 'Partners'],
  Resources: ['Help Center', 'Community', 'Guides', 'Webinars', 'Status'],
  Legal: ['Privacy', 'Terms', 'Security', 'Cookies'],
};

const socialLinks = [
  { name: 'Twitter', Icon: FaXTwitter },
  { name: 'LinkedIn', Icon: FaLinkedinIn },
  { name: 'Instagram', Icon: FaInstagram },
  { name: 'YouTube', Icon: FaYoutube },
];

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold mb-4">SocialAutomate</h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              The all-in-one social media automation platform trusted by 50,000+ businesses worldwide.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors duration-200"
                  aria-label={social.name}
                >
                  <social.Icon className="text-lg" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold mb-4 text-white">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} SocialAutomate. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
};
