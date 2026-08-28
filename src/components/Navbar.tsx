import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { UserMenu } from './Auth';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();

  const navItems = [
    { 
      name: 'About Us', 
      path: '/about',
      subItems: [
        { name: 'About HIVE', path: '/about' },
        { name: 'Greetings', path: '/greetings' },
        { name: 'Network', path: '/network' },
      ]
    },
    { 
      name: 'Activities', 
      path: '/activities',
      subItems: [
        { name: 'Curriculum', path: '/activities' },
        { name: 'Notice', path: '/notices' },
        { name: 'H&T Column', path: '/columns' },
        { name: 'Projects', path: '/projects' },
        { name: 'Photo', path: '/photo' },
      ]
    },
    { 
      name: 'Members', 
      path: '/members',
      subItems: [
        { name: 'Member List', path: '/members' },
        { name: 'Organization', path: '/organization' },
      ]
    },
    { name: 'Recruit', path: '/join' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-3xl font-black tracking-tighter text-hive-green">
                HI<span className="inline-block scale-x-[0.8] origin-center -mx-[0.02em]">V</span>E
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <div 
                key={item.name} 
                className="relative h-full flex items-center"
                onMouseEnter={() => setActiveDropdown(item.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  to={item.path}
                  className={`nav-link flex items-center space-x-1 py-4 ${
                    location.pathname === item.path || 
                    (item.subItems?.some(sub => location.pathname === sub.path)) 
                    ? 'active' : ''
                  }`}
                >
                  <span>{item.name}</span>
                  {item.subItems && <ChevronDown size={12} className={`transition-transform duration-200 ${activeDropdown === item.name ? 'rotate-180' : ''}`} />}
                </Link>

                <AnimatePresence>
                  {item.subItems && activeDropdown === item.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 w-48 bg-white border border-gray-100 shadow-xl rounded-lg py-3 z-50"
                    >
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.path}
                          className={`block px-5 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-hive-green transition-colors ${
                            location.pathname === subItem.path ? 'text-hive-green font-bold' : ''
                          }`}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
            <div className="pl-4 border-l border-gray-100">
              <UserMenu />
            </div>
          </div>

          <div className="md:hidden flex items-center space-x-4">
            <UserMenu />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-900 hover:text-hive-green transition-colors"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>


      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navItems.map((item) => (
                <div key={item.name} className="space-y-1">
                  <Link
                    to={item.path}
                    onClick={() => !item.subItems && setIsOpen(false)}
                    className={`block py-3 text-lg font-medium transition-all ${
                      location.pathname === item.path ? 'text-hive-green' : 'text-gray-900'
                    }`}
                  >
                    {item.name}
                  </Link>
                  {item.subItems && (
                    <div className="pl-4 space-y-1 border-l-2 border-gray-50">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.path}
                          onClick={() => setIsOpen(false)}
                          className={`block py-2 text-base transition-all ${
                            location.pathname === subItem.path ? 'text-hive-green font-bold' : 'text-gray-500'
                          }`}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
