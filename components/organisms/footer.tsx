import React from 'react'
import Link from 'next/link'
import { Mail, Phone, MapPin } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#0f172a] text-slate-300 py-12 px-6 md:px-16 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-10">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <h2 className="text-white text-xl font-bold">Highland Medical Center</h2>
            <p className="text-sm leading-relaxed max-w-xs text-slate-400">
              Excellence in Healthcare, Committed to Your Well-being
            </p>
          </div>

          {/* Spacer for Tablet/Desktop alignment */}
          <div className="hidden lg:block"></div>

          {/* Contact Us Section */}
          <div className="space-y-4">
            <h3 className="text-white text-lg font-semibold">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm hover:text-white transition-colors">
                <Phone className="h-4 w-4 text-slate-500" />
                <a href="tel:5551234567">(555) 123-4567</a>
              </li>
              <li className="flex items-center gap-3 text-sm hover:text-white transition-colors">
                <Mail className="h-4 w-4 text-slate-500" />
                <a href="mailto:info@highland.med">info@highland.med</a>
              </li>
              <li className="flex items-start gap-3 text-sm hover:text-white transition-colors">
                <MapPin className="h-4 w-4 text-slate-500 mt-0.5" />
                <span>123 Medical Center Dr, Highland, CA 92346</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 text-center">
          <p className="text-xs text-slate-500">
            © {currentYear} Highland Medical Center. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer