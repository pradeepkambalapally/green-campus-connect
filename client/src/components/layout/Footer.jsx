import { Link } from 'react-router-dom';
import { Leaf, ExternalLink, Mail, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-emerald-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Green Campus Connect</h3>
                <p className="text-emerald-300 text-xs">Learn Green. Act Green.</p>
              </div>
            </div>
            <p className="text-emerald-200 text-sm leading-relaxed max-w-md">
              A gamified sustainability learning platform designed to educate, engage,
              and empower university students to make a positive environmental impact
              on their campus and beyond.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-emerald-300">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="text-emerald-200 hover:text-white text-sm transition-colors">Features</a>
              </li>
              <li>
                <a href="#how-it-works" className="text-emerald-200 hover:text-white text-sm transition-colors">How It Works</a>
              </li>
              <li>
                <a href="#topics" className="text-emerald-200 hover:text-white text-sm transition-colors">Topics</a>
              </li>
              <li>
                <Link to="/login" className="text-emerald-200 hover:text-white text-sm transition-colors">Log In</Link>
              </li>
              <li>
                <Link to="/register" className="text-emerald-200 hover:text-white text-sm transition-colors">Sign Up</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-emerald-300">Project</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-emerald-200 text-sm">
                <Mail className="w-4 h-4" />
                <span>Final Year Project</span>
              </li>
              <li className="flex items-center gap-2 text-emerald-200 text-sm">
                <ExternalLink className="w-4 h-4" />
                <a
                  href="https://github.com/pradeepkambalapally/green-campus-connect"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  GitHub Repository
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-emerald-800 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-emerald-300 text-sm">
            &copy; {new Date().getFullYear()} Green Campus Connect. Academic Project.
          </p>
          <p className="text-emerald-300 text-sm flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-400 fill-red-400" /> for a greener campus
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
