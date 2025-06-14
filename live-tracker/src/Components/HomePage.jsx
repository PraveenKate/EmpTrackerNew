import React, { useState } from 'react';
import { Briefcase, MapPin, Users, Clock, Menu, Sun, Moon, Mail, Phone, MapPin as LocationPin, Facebook, Twitter, Linkedin,UserCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const services = [
  {
    icon: <MapPin size={32} className="text-blue-600 dark:text-blue-400" />,
    title: 'Real-time Location Tracking',
    description: 'Monitor employee movement and ensure on-field transparency.',
  },
  {
    icon: <Users size={32} className="text-green-600 dark:text-green-400" />,
    title: 'Team Management',
    description: 'Manage roles, permissions, and organizational hierarchy efficiently.',
  },
  {
    icon: <Clock size={32} className="text-purple-600 dark:text-purple-400" />,
    title: 'Attendance Monitoring',
    description: 'Track in-time, out-time, and working hours for all employees.',
  },
  {
  icon: <UserCircle2 size={32} className="text-blue-600 dark:text-blue-400" />,
  title: 'Profile Management',
  description: 'Easily manage employee profiles, roles, and permissions.',
},

];

const HomePage = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  React.useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  return (
    <div className="min-h-screen font-sans text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 transition-colors duration-500">
     
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">EmpTracker</div>
          <nav className="space-x-6 text-gray-700 dark:text-gray-300 font-medium hidden md:flex items-center">
            <a href="#home" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Home</a>
            <a href="#about" className="hover:text-blue-600 dark:hover:text-blue-400 transition">About Us</a>
            <a href="#services" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Services</a>
            <a href="#contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Contact Us</a>
            <div className="relative inline-block">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none transition"
              >
                Login
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-lg z-10">
                  <Link  className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition" to="/admin">Admin Login</Link>
                  <Link className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition" to="/user">Employee Login</Link>
                </div>
              )}
            </div>
            {/* Dark/Light mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="ml-6 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              aria-label="Toggle Dark Mode"
              title="Toggle Dark Mode"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </nav>
          <div className="md:hidden">
            <Menu size={28} className="text-gray-700 dark:text-gray-300" />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        id="home"
        className="relative bg-cover bg-center text-white text-center py-32"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1521737604893-d14cc237f11d?fit=crop&w=1950&q=80)' }}
      >
        <div className="bg-black bg-opacity-60 absolute inset-0"></div>
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <h1 className="text-5xl font-bold mb-4 animate-fade-in">Employee Tracking System</h1>
          <p className="text-xl mb-6 animate-fade-in delay-100">
            Welcome to EmpTracker, your reliable solution for managing employee attendance and
location tracking with efficiency and ease. Designed for both administrators and
employees. Whether you're
running a small team or a large workforce, our system ensures you stay informed,
organized, and efficient.
          </p>
          <Link to="/admin"><button className="px-6 py-3 bg-blue-600 hover:bg-blue-800 transition rounded-lg font-semibold shadow-md animate-fade-in delay-200">
            Get Started
          </button></Link>
        </div>
      </section>

      {/* About Us Section */}
      <section
        id="about"
        className="py-8 bg-white dark:bg-gray-800 transition-colors duration-500"
      >
        <div className="max-w-6xl mx-auto px-6 flex flex-col-reverse lg:flex-row items-center gap-10">
          <div className="lg:w-1/2">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">About Our Project</h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-6">
              Our EmpTracker is designed to help organizations efficiently monitor and manage their on-field or off-field employees.
              From real-time location tracking to comprehensive attendance reports and task-based project monitoring, our system empowers companies
              to make data-driven workforce decisions.
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Built using modern web technologies and real-time communication protocols, EmpTracker is a robust solution for today's dynamic work environments.
            </p>
          </div>
          <div className="lg:w-1/2">
           <img
  src="assets/about.png"
  alt="About Illustration"
  className="w-[110%] max-w-none h-auto rounded-xl transition duration-500 ease-in-out transform hover:scale-110 filter drop-shadow-[0_20px_25px_rgba(0,0,0,0.3)]"
/>






          </div>
        </div>
      </section>

       {/* Services Section - slightly darker background */}
      <section
        id="services"
        className="py-16 bg-gray-100 dark:bg-gray-900 transition-colors duration-500"
      >
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-200 mb-12">Our Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow hover:shadow-xl transition duration-300 text-center"
              >
                <div className="flex justify-center mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold mb-2 dark:text-gray-100">{service.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Call to Action */}
      <section
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md max-w-6xl mx-auto px-6 py-10 my-12 text-center transition-colors duration-500"
      >
        <h3 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Start Tracking Smarter Today</h3>
        <p className="mb-6 text-gray-600 dark:text-gray-300">Join hundreds of businesses using our platform for smarter workforce management.</p>
        <button className="bg-blue-600 text-white px-6 py-3 font-semibold rounded-lg shadow-md hover:bg-blue-700 transition">
          Get Started
        </button>
      </section>

      {/* Contact Us Section */}
      <section
  id="contact"
  className="relative max-w-xl mx-auto px-6 py-16 rounded-xl bg-gray-100 dark:bg-gray-900 shadow-md transition-colors duration-500 border-2 border-transparent before:absolute before:inset-0 before:rounded-xl before:p-[2px] before:bg-gradient-to-r before:from-gray-400 before:via-gray-600 before:to-gray-400 before:animate-pulse before:z-[-1] overflow-hidden"
>



        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-200 mb-12">Contact Us</h2>
        <form className="max-w-3xl mx-auto space-y-6">
          <div>
            <label htmlFor="name" className="block mb-2 font-medium text-gray-700 dark:text-gray-300">Name</label>
            <input
              type="text"
              id="name"
              placeholder="Your name"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block mb-2 font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Your email"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
            />
          </div>
          <div>
            <label htmlFor="message" className="block mb-2 font-medium text-gray-700 dark:text-gray-300">Message</label>
            <textarea
              id="message"
              placeholder="Your message"
              rows={5}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 font-semibold rounded-lg shadow-md hover:bg-blue-700 transition w-full sm:w-auto"
          >
            Send Message
          </button>
        </form>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16 transition-colors duration-500">

        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10 text-gray-700 dark:text-gray-300">
          {/* About / Social */}
          <div>
            <h4 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">About EmpTracker</h4>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              EmpTracker helps you monitor your workforce efficiently with real-time tracking and project management tools.
            </p>
            <div className="flex space-x-6 text-gray-600 dark:text-gray-400">
              <a href="#" aria-label="Facebook" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                <Facebook size={24} />
              </a>
              <a href="#" aria-label="Twitter" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                <Twitter size={24} />
              </a>
              <a href="#" aria-label="LinkedIn" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                <Linkedin size={24} />
              </a>
            </div>
          </div>
          {/* Services Summary */}
          <div>
            <h4 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Our Services</h4>
            <ul className="space-y-2">
              {services.map((service, i) => (
                <li key={i} className="flex items-center space-x-3 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-default">
                  {service.icon}
                  <span>{service.title}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Creator Details */}
          <div>
            <h4 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Contact Info</h4>
            <ul className="space-y-3 text-gray-600 dark:text-gray-400">
              <li className="flex items-center space-x-3">
                <Mail size={20} />
                <span>manjunathkate1234@example.com</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={20} />
                <span>+91 9731318600</span>
              </li>
              <li className="flex items-center space-x-3">
                <LocationPin size={20} />
                <span>Hubli, Karnataka, India</span>
              </li>
            </ul>
          </div>

          
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 mt-6 py-4 text-center text-gray-600 dark:text-gray-400 text-sm">
          © 2025 EmpTracker. All rights reserved.
        </div>
      </footer>

      {/* Animations via Tailwind (fade-in) */}
     <style>{`
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fade-in 0.7s ease forwards;
  }
  .animate-fade-in.delay-100 {
    animation-delay: 0.1s;
  }
  .animate-fade-in.delay-200 {
    animation-delay: 0.2s;
  }
`}</style>

    </div>
  );
};

export default HomePage;