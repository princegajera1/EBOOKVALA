import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { toast } from "react-hot-toast";

export const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API request
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success("Message sent! We will get back to you soon. ✉️");
    }, 1200);
  };

  return (
    <div className="bg-brand-bg min-h-screen py-20 md:py-28 select-none text-left transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Header */}
        <div className="mb-16">
          <span className="text-[10px] font-mono text-brand-text-secondary font-bold tracking-widest uppercase mb-3 block">
            Contact Support
          </span>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-brand-text leading-tight tracking-tight">
            We'd love to hear from you.
          </h1>
          <p className="text-sm text-brand-text-secondary mt-2 leading-relaxed max-w-xl font-normal">
            Have a question about our books, interested in publishing with us, or need technical assistance? Our support team is here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Form (7 cols) */}
          <div className="lg:col-span-7 bg-brand-card border border-brand-border rounded-brand-card p-6 md:p-8 shadow-brand">
            {submitted ? (
              <div className="text-center py-12 flex flex-col items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-brand-primary text-brand-bg flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-brand-text">Message Sent Successfully</h3>
                <p className="text-sm text-brand-text-secondary max-w-sm mx-auto leading-relaxed font-normal">
                  Thank you for reaching out! A support representative has received your request and will respond within 24 business hours.
                </p>
                <Button 
                  onClick={() => setSubmitted(false)}
                  variant="secondary" 
                  className="h-10 px-6 rounded-full text-xs font-bold mt-4 border-brand-border bg-brand-bg-secondary hover:bg-brand-bg text-brand-text"
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input 
                    label="Full Name" 
                    name="name"
                    type="text" 
                    required 
                    placeholder="Enter your name" 
                  />
                  <Input 
                    label="Email Address" 
                    name="email"
                    type="email" 
                    required 
                    placeholder="name@example.com" 
                  />
                </div>
                
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-xs font-bold text-brand-text uppercase tracking-wider">Subject</label>
                  <select 
                    name="subject"
                    required
                    className="w-full bg-brand-bg-secondary border border-brand-border rounded-brand-input py-2.5 px-4 text-xs focus:outline-none focus:bg-brand-bg focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/10 text-brand-text font-semibold transition-all"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="billing">Billing & Refunds</option>
                    <option value="author">Author Publishing</option>
                    <option value="technical">Technical Support</option>
                  </select>
                </div>
 
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-xs font-bold text-brand-text uppercase tracking-wider">Your Message</label>
                  <textarea 
                    name="message"
                    rows="5" 
                    required
                    placeholder="How can we help you?"
                    className="w-full bg-brand-bg-secondary border border-brand-border rounded-brand-input py-3 px-4 text-xs focus:outline-none focus:bg-brand-bg focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/10 text-brand-text font-medium transition-all resize-none"
                  />
                </div>
 
                <Button 
                  type="submit" 
                  variant="primary" 
                  isLoading={loading}
                  className="h-12 w-full text-xs font-bold rounded-full mt-2 shadow-sm animate-pulse-subtle"
                >
                  Send Message
                </Button>
              </form>
            )}
          </div>
 
          {/* Right Column: Office info & FAQ shortcut (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Info Card */}
            <div className="bg-brand-bg-secondary border border-brand-border rounded-brand-card p-6 flex flex-col gap-6">
              <h3 className="text-sm font-bold text-brand-text uppercase tracking-wider">Contact Details</h3>
              
              <div className="flex flex-col gap-5 text-xs text-brand-text-secondary font-semibold">
                <div className="flex items-start gap-3">
                  <Mail className="h-4.5 w-4.5 text-brand-text shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-brand-text">Email Support</p>
                    <p className="mt-0.5 font-normal">support@ebookvala.com</p>
                  </div>
                </div>
 
                <div className="flex items-start gap-3">
                  <Phone className="h-4.5 w-4.5 text-brand-text shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-brand-text">Call Support</p>
                    <p className="mt-0.5 font-normal">+91 98765 43210</p>
                  </div>
                </div>
 
                <div className="flex items-start gap-3">
                  <MapPin className="h-4.5 w-4.5 text-brand-text shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-brand-text">Headquarters</p>
                    <p className="mt-0.5 font-normal">
                      Vikas Marg, Sector 62,<br />
                      Noida, UP 201301, India
                    </p>
                  </div>
                </div>
 
                <div className="flex items-start gap-3">
                  <Clock className="h-4.5 w-4.5 text-brand-text shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-brand-text">Business Hours</p>
                    <p className="mt-0.5 font-normal">Monday – Friday: 9 AM – 6 PM IST</p>
                  </div>
                </div>
              </div>
            </div>
 
            {/* FAQ Shortcut */}
            <div className="bg-brand-card border border-brand-border rounded-brand-card p-6 flex flex-col gap-3 shadow-sm">
              <h3 className="text-sm font-bold text-brand-text">Looking for quick answers?</h3>
              <p className="text-sm text-brand-text-secondary leading-relaxed font-normal">
                Check our Frequently Asked Questions for instant help with downloads, payments, and account setup.
              </p>
              <Link to="/faq" className="text-xs text-brand-text hover:text-brand-accent font-bold flex items-center gap-1 mt-2 transition-colors">
                Read our FAQs
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
 
          </div>
 
        </div>
 
      </div>
    </div>
  );
};

export default Contact;
