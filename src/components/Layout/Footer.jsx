import React from 'react'
import { HeartIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import {motion} from 'framer-motion'
const Footer = () => {
  return (
     <motion.footer
     initial={{ opacity: 0 }}
     whileInView={{ opacity: 1 }}
     transition={{ duration: 0.6 }}
     className="bg-gray-900 text-gray-300"
   >
     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
       <div className="grid md:grid-cols-4 gap-8">
         <div className="space-y-4">
           <motion.div
             className="flex items-center space-x-2"
             whileHover={{ scale: 1.05 }}
           >
             <div className="bg-gradient-to-r from-gradient-primary to-gradient-secondary p-2 rounded-lg">
               <HeartIcon className="w-6 h-6 text-white" />
             </div>
             <span className="text-lg font-semibold text-white">
               Terminal143
             </span>
           </motion.div>
           <p className="text-sm">
             Making meaningful connections since 2024
           </p>
         </div>

         {[
           { title: "Company", links: ["about", "careers", "blog"] },
           { title: "Legal", links: ["privacy", "terms", "security"] },
           { title: "Connect", links: ["contact", "faq", "press"] },
         ].map((section) => (
           <div key={section.title} className="space-y-2">
             <h4 className="text-sm font-semibold text-white">
               {section.title}
             </h4>
             <ul className="space-y-2">
               {section.links.map((link) => (
                 <motion.li key={link} whileHover={{ x: 5 }}>
                   <Link
                     to={`/${link}`}
                     className="hover:text-indigo-400 transition-colors duration-300 capitalize"
                   >
                     {link}
                   </Link>
                 </motion.li>
               ))}
             </ul>
           </div>
         ))}
       </div>

       <motion.div
         initial={{ opacity: 0 }}
         whileInView={{ opacity: 1 }}
         className="border-t border-gray-800 mt-12 pt-8 text-center text-sm"
       >
         <p>&copy; 2024 Terminal143. All rights reserved.</p>
       </motion.div>
     </div>
   </motion.footer>
  )
}

export default Footer