import React from 'react';
import { Mail, MapPin, MessageSquare, Instagram, Globe } from 'lucide-react';
import { motion } from 'motion/react';

const Contact = () => {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-navy-900 mb-8">
              Get in <span className="text-hive-green italic font-serif">Touch</span>
            </h2>
            <p className="text-lg text-navy-900/60 mb-12 max-w-md leading-relaxed">
              HIVE와 함께 호스피탈리티의 가치를 나누고 싶으신가요? <br/>
              궁금한 점이나 협력 제안이 있다면 언제든 편하게 연락주세요.
            </p>

            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-navy-900/5 flex items-center justify-center text-hive-green flex-shrink-0">
                  <Mail size={20} />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-widest font-bold text-navy-900/40 mb-1">Email</h4>
                  <p className="text-navy-900 font-medium">duhospitality@naver.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-navy-900/5 flex items-center justify-center text-hive-green flex-shrink-0">
                   <MapPin size={20} />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-widest font-bold text-navy-900/40 mb-1">Location</h4>
                  <p className="text-navy-900 font-medium">
                    Daegu University, Gyeongsan, Korea<br/>
                    Hospitality Management Dept.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-navy-900/5 flex items-center justify-center text-hive-green flex-shrink-0">
                   <MessageSquare size={20} />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-widest font-bold text-navy-900/40 mb-1">Social</h4>
                  <div className="flex space-x-4 mt-2">
                    <a 
                      href="https://www.instagram.com/du_hive/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-navy-900/40 hover:text-hive-green transition-colors cursor-pointer"
                    >
                      <Instagram size={20} />
                    </a>
                    <a href="#" className="text-navy-900/40 hover:text-hive-green transition-colors cursor-pointer">
                      <Globe size={20} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-navy-900/5 p-8 md:p-12 rounded-2xl"
          >
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-navy-900/40 mb-2">Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-white border border-navy-900/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-hive-green/20 focus:border-hive-green transition-all"
                    placeholder="Your Name"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-navy-900/40 mb-2">Email</label>
                  <input 
                    type="email" 
                    className="w-full bg-white border border-navy-900/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-hive-green/20 focus:border-hive-green transition-all"
                    placeholder="Your Email"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-navy-900/40 mb-2">Subject</label>
                <input 
                  type="text" 
                  className="w-full bg-white border border-navy-900/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-hive-green/20 focus:border-hive-green transition-all"
                  placeholder="How can we help?"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-navy-900/40 mb-2">Message</label>
                <textarea 
                  rows={4}
                  className="w-full bg-white border border-navy-900/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-hive-green/20 focus:border-hive-green transition-all resize-none font-sans"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-hive-green text-white font-bold py-4 rounded-lg hover:bg-opacity-90 transition-all uppercase tracking-widest text-xs cursor-pointer"
              >
                Send Message
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
