import { Link } from 'react-router-dom';
import { Home, Phone, Mail, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Home className="h-8 w-8 text-indigo-500" />
              <span className="text-2xl font-bold text-white">DreamNest</span>
            </div>
            <p className="text-sm">
              Your trusted partner in finding the perfect home.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="hover:text-indigo-400 transition"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="hover:text-indigo-400 transition"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="hover:text-indigo-400 transition"><Linkedin className="h-5 w-5" /></a>
              <a href="#" className="hover:text-indigo-400 transition"><Instagram className="h-5 w-5" /></a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-indigo-400 transition">Home</Link></li>
              <li><Link to="/properties" className="hover:text-indigo-400 transition">Properties</Link></li>
              <li><Link to="/about" className="hover:text-indigo-400 transition">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-indigo-400 transition">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/buy" className="hover:text-indigo-400 transition">Buy Property</Link></li>
              <li><Link to="/rent" className="hover:text-indigo-400 transition">Rent Property</Link></li>
              <li><Link to="/sell" className="hover:text-indigo-400 transition">Sell Property</Link></li>
              <li><Link to="/agents" className="hover:text-indigo-400 transition">Find Agent</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Get in Touch</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-indigo-400" />
                <span>123 Main St, New York, NY 10001</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-indigo-400" />
                <a href="tel:+1234567890" className="hover:text-indigo-400">+1 (234) 567-890</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-indigo-400" />
                <a href="mailto:hello@dreamnest.com" className="hover:text-indigo-400">hello@dreamnest.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-800 text-center text-sm">
          <p>&copy; {currentYear} DreamNest. All rights reserved.</p>
          <div className="mt-2 flex justify-center space-x-4">
            <Link to="/privacy" className="hover:text-indigo-400">Privacy Policy</Link>
            <span>|</span>
            <Link to="/terms" className="hover:text-indigo-400">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}