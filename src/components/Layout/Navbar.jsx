import React,{useState} from 'react'
import { Link } from 'react-router-dom'
import { Bars3Icon, XMarkIcon, ArrowRightIcon, HeartIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
const Navbar = () => {
        const [menuOpen, setMenuOpen] = useState(false);
    
  return (

      <motion.header
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            className="bg-white border-b border-gray-100 sticky top-0 z-50"
          >
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 items-center">
                {/* Logo */}
                <motion.div whileHover={{ scale: 1.05 }} className="flex-shrink-0 flex items-center">
                  <div className="bg-gradient-to-r from-gradient-primary to-gradient-secondary p-2 rounded-lg">
                    <HeartIcon className="w-6 h-6 text-white" />
                  </div>
                  <span className="ml-3 text-xl font-bold text-gray-900">Terminal143</span>
                </motion.div>
    
                {/* Desktop Links */}
                <div className="hidden md:flex items-center space-x-8">
                  {['about', 'pricing', 'login'].map((link) => (
                    <motion.div key={link} whileHover={{ scale: 1.05 }}>
                      <Link
                        to={`/${link}`}
                        className="text-gray-600 hover:text-indigo-600 transition-colors duration-300 capitalize"
                      >
                        {link === 'login' ? 'Sign In' : link}
                      </Link>
                    </motion.div>
                  ))}
               
                </div>
    
                {/* Mobile Toggle Button */}
                <div className="flex md:hidden">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {menuOpen ? (
                      <XMarkIcon className="block h-6 w-6 text-gray-700" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6 text-gray-700" />
                    )}
                  </button>
                </div>
              </div>
    
              {/* Mobile Menu */}
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="md:hidden bg-white border-t border-gray-100"
                >
                  <div className="px-2 pt-2 pb-3 space-y-1">
                    {['about', 'pricing', 'login'].map((link) => (
                      <Link
                        key={link}
                        to={`/${link}`}
                        onClick={() => setMenuOpen(false)}
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      >
                        {link === 'login' ? 'Sign In' : link.charAt(0).toUpperCase() + link.slice(1)}
                      </Link>
                    ))}
                    <div className="mt-2 px-3">
                     
                    </div>
                  </div>
                </motion.div>
              )}
            </nav>
          </motion.header>
      
  )
}

export default Navbar