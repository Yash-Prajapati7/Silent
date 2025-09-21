import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Github, Linkedin, Send, Paperclip, Eye, ExternalLink } from 'lucide-react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

// --- Data ---
const personalInfo = {
  name: "Yash Prajapati",
  title: "FullStack Developer | MERN | DSA | Java",
  phone: "+91 9152512584",
  email: "yash7prajapati@gmail.com",
  github: "https://github.com/Yash-Prajapati7",
  linkedin: "https://www.linkedin.com/in/prajapatiyash7",
  location: "Mumbai, India",
  resume: "https://drive.google.com/file/d/1tqmWen3p2i0yjNZkJoRuPEvQ6T71LlVN/view",
};

const aboutMe = `A Full Stack MERN Developer with a keen interest in backend development, Java, and problem-solving. Experienced in designing and optimizing backend systems, with a proven track record of solving Data Structures and Algorithms (DSA) problems. Adaptable to new technologies and passionate about continuous learning. A collaborative team player with excellent communication skills, eager to contribute expertise in a dynamic environment.`;

const projects = [
  {
    title: "Navrang – E-Commerce Platform",
    description: "Built a responsive and modern e-commerce website using React.js, Tailwind CSS, Node.js, and MongoDB.",
    impact: "Designed product pages, cart, and checkout workflows to optimize shopping experience. APIs enable secure order management and user sessions.",
    techStack: ["React", "Tailwind CSS", "Node.js", "MongoDB"],
    image: "https://res.cloudinary.com/dlxxeq0bh/image/upload/2dc96865-b010-44d8-b942-64646fa4426b.png",
    link: "https://navrang.page"
  },
  {
    title: "Purnata – Victim & Volunteer Management System",
    description: "Developed a full-stack web platform for an NGO to manage rescued victims and assigned volunteers, enabling seamless tracking and support coordination.",
    impact: "Enabled efficient case lifecycle monitoring through a user-friendly dashboard, secure role-based access control, and automated backend reporting.",
    techStack: ["MongoDB", "Express.js", "React", "Node.js", "Python"],
    image: "https://res.cloudinary.com/dlxxeq0bh/image/upload/v1750937066/Screenshot_2025-06-26_165010_s3s0vh.png",
    link: "https://purnata-demo.vercel.app"
  },
  {
    title: "Cold Mailer",
    description: "Designed a full-stack web application for bulk email distribution, integrating both frontend and backend for seamless user experience.",
    impact: "Enhanced email deliverability and throughput for large-scale campaigns, improving operational efficiency and maximizing outreach effectiveness.",
    techStack: ["React", "Node.js", "Express.js", "Nodemailer"],
    image: "https://res.cloudinary.com/dlxxeq0bh/image/upload/Coldmailer_yggpfp.png",
    link: "https://coldmailer-xi.vercel.app"
  },
  {
    title: "Self Destructive Mails",
    description: "Implemented view once and self-destruct messages functionality for Gmail.",
    impact: "Automated the deletion of sensitive messages after viewing once or 1 hour (whichever is earlier), enhancing data security protocols and reducing potential data breaches by 40%, leading to greater compliance with industry regulations and guidelines.",
    techStack: ["Node.js", "Express.js", "MongoDB", "Node-Cron"],
    image: "https://res.cloudinary.com/dlxxeq0bh/image/upload/v1748711391/Self_Destruct_mails_z3john.png",
    link: "https://github.com/Yash-Prajapati7/Self-Destruct-Messages.git"
  },
  {
    title: "Char Cryptor",
    description: "Developed an advanced text encryption tool incorporating a custom character-shifting algorithm to ensure robust data protection.",
    impact: "Increased data security by 90%, enabling secure transmission of sensitive information and reduced the chance of data exposure.",
    techStack: ["Java"],
    image: "https://kinsta.com/wp-content/uploads/2023/07/what-is-encryption.jpg",
    link: "https://github.com/Yash-Prajapati7/CharCryptor"
  },
];

// Education is now an array to allow for multiple entries
const education = [
  {
    degree: "B.Tech in Computer Engineering with Honors in Data Science",
    institution: "Dwarkadas J Sanghvi College of Engineering",
    years: "2023-2027",
    gpa: "9.47",
  },
  {
    degree: "HSC - Science",
    institution: "Sardar Vallabhbhai Patel Vidyalaya",
    years: "2021-2023",
    gpa: "99.6%ile",
  },
];

const skillCategories = [
  {
    category: "Frontend",
    skills: ["React", "JavaScript", "TypeScript", "HTML/CSS", "Tailwind CSS", "Redux"]
  },
  {
    category: "Backend",
    skills: ["Node.js", "Express.js", "Java", "Python", "REST API", "GraphQL"]
  },
  {
    category: "Database",
    skills: ["MongoDB", "MySQL", "Redis", "PostgreSQL"]
  },
  {
    category: "Tools & Deployment",
    skills: ["Git", "AWS", "Docker", "Vercel", "Netlify"]
  }
];

// Animated Background Component
const AnimatedBackground = ({ isDarkMode }) => (
  <div className="absolute inset-0 w-full h-full opacity-30">
    <svg viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full">
      <motion.path
        d="M720 450C720 450 742.459 440.315 755.249 425.626C768.039 410.937 778.88 418.741 789.478 401.499"
        stroke={isDarkMode ? "#46A5CA" : "#2563eb"}
        strokeWidth="2.3"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.8 }}
        transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
      />
      <motion.path
        d="M720 450C720 450 741.044 435.759 753.062 410.636C765.079 385.514 770.541 386.148 782.73 370.489"
        stroke={isDarkMode ? "#8C2F2F" : "#dc2626"}
        strokeWidth="2.3"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.6 }}
        transition={{ duration: 5, repeat: Infinity, repeatType: "reverse", delay: 1 }}
      />
      <motion.path
        d="M720 450C720 450 712.336 437.768 690.248 407.156C668.161 376.544 672.543 394.253 665.951 365.784"
        stroke={isDarkMode ? "#4FAE4D" : "#16a34a"}
        strokeWidth="2.3"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.7 }}
        transition={{ duration: 6, repeat: Infinity, repeatType: "reverse", delay: 2 }}
      />
    </svg>
  </div>
);

// Animated Section Title Component
const AnimatedSectionTitle = ({ title, isDarkMode }) => {
  const [animatedText, setAnimatedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < title.length) {
        setAnimatedText(title.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
        setTimeout(() => setShowCursor(false), 1000);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [title]);

  return (
    <div className="flex w-full px-4 sm:px-6 md:px-8 mb-12">
      <div className="max-w-full text-center">
        <div className="flex space-x-1 items-center justify-center">
          <div className="overflow-hidden">
            <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {animatedText}
              {showCursor && <span className="animate-pulse">|</span>}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
};

// Skill Button Component
const SkillButton = ({ skill, delay = 0, isDarkMode }) => (
  <motion.button
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3, delay }}
    className={`bg-gradient-to-br relative px-4 py-2 group/btn ${
      isDarkMode 
        ? 'from-zinc-800 to-zinc-700 text-white shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]' 
        : 'from-gray-200 to-gray-300 text-gray-900 shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#00000020_inset]'
    } rounded-md font-medium`}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    {skill}
    <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></span>
    <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></span>
  </motion.button>
);

// Project Card Component
const ProjectCard = ({ project, index, isDarkMode }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className={`${isDarkMode ? 'bg-zinc-900' : 'bg-white border border-gray-200'} p-6 rounded-2xl shadow-lg max-w-md w-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group`}
  >
    <div className="relative w-full h-48 rounded-xl overflow-hidden">
      <img
        src={project.image}
        alt={project.title}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        onError={(e) => { 
          e.target.onerror = null; 
          e.target.src = "https://placehold.co/400x300/CCCCCC/000000?text=Image+Error"; 
        }}
      />
    </div>
    <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-4`}>{project.title}</h3>
    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-2 text-sm`}>{project.description}</p>
    <div className="flex flex-wrap gap-2 mt-4">
      {project.techStack.map((tech, i) => (
        <span
          key={i}
          className={`bg-gradient-to-br px-3 py-1 ${
            isDarkMode 
              ? 'from-gray-700 to-gray-500 text-white' 
              : 'from-gray-100 to-gray-200 text-gray-800'
          } rounded-md font-medium text-xs shadow-inner`}
        >
          {tech}
        </span>
      ))}
    </div>
    <div className="flex justify-end gap-4 mt-6">
      {project.link && (
        <motion.a
          href={project.link}
          target="_blank"
          rel="noopener noreferrer"
          className={`${isDarkMode ? 'text-white hover:text-cyan-400' : 'text-gray-700 hover:text-blue-600'} transition-colors`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ExternalLink size={24} />
        </motion.a>
      )}
    </div>
  </motion.div>
);

// --- Main App Component ---
function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const animatedTitles = [
    "FullStack Developer",
    "MERN Stack Enthusiast", 
    "Problem Solver (DSA)",
    "Java Developer",
    "Backend Specialist"
  ];
  const [currentTitleIndex, setCurrentTitleIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Function to handle missing links
  const handleMissingLink = () => {
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Effect for animating the title text
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTitleIndex((prevIndex) => (prevIndex + 1) % animatedTitles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [animatedTitles.length]);

  // Function to scroll to a specific section on the page
  const scrollToSection = (id) => {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
  };

  // Handler for file input change
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  // Handler for sending the email
  const sendEmail = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    toast.promise(
      axios.post('https://portfolio-backend-27to.onrender.com/api/send-email', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
      {
        loading: 'Sending message...',
        success: 'Message sent successfully!',
        error: 'Failed to send message. Please try again later.'
      }
    )
      .then(() => {
        setSelectedFile(null);
        e.target.reset();
      })
      .catch((error) => {
        console.error("Email sending error:", error);
      });
  };

  return (
    <div className={`${isDarkMode ? 'bg-black' : 'bg-gray-50'} ${isDarkMode ? 'text-white' : 'text-gray-900'} min-h-screen font-inter antialiased transition-colors duration-300`}>
      {/* Toaster component */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        containerStyle={{
          top: 110,
          left: 20,
          right: 20,
        }}
        toastOptions={{
          style: {
            background: isDarkMode ? '#1f2937' : '#ffffff',
            color: isDarkMode ? '#fff' : '#111827',
            border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
          },
        }}
      />

      {/* Floating Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`flex max-w-fit fixed top-4 sm:top-10 inset-x-0 mx-auto border ${
          isDarkMode 
            ? 'border-white/[0.2] bg-black shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]' 
            : 'border-gray-300 bg-white shadow-[0px_2px_8px_rgba(0,0,0,0.1)]'
        } rounded-full z-[5000] px-4 sm:px-8 py-2 items-center justify-center space-x-2 sm:space-x-4 transition-all duration-300`}
      >
        <button className={`border text-xs sm:text-sm font-medium relative ${
          isDarkMode 
            ? 'border-white/[0.2] text-white' 
            : 'border-gray-300 text-gray-900'
        } px-3 py-2 rounded-full`}>
          <span>Yash Prajapati</span>
          <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent h-px"></span>
        </button>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-4">
          {['Projects', 'Education', 'Skills', 'Contact'].map((item) => (
            <button
              key={item}
              onClick={() => scrollToSection(item.toLowerCase())}
              className={`relative items-center flex space-x-1 ${
                isDarkMode 
                  ? 'text-neutral-50 hover:text-neutral-300' 
                  : 'text-gray-700 hover:text-gray-900'
              } text-sm transition-colors`}
            >
              <span>{item}</span>
            </button>
          ))}
        </div>

        {/* Theme Toggle Button */}
        <motion.button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`p-2 rounded-full ${
            isDarkMode 
              ? 'text-white hover:bg-white/10' 
              : 'text-gray-700 hover:bg-gray-100'
          } transition-all duration-200`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </motion.button>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`md:hidden ${isDarkMode ? 'text-white' : 'text-gray-700'} p-2`}
        >
          ☰
        </button>
      </motion.header>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            className={`fixed top-20 left-4 right-4 z-40 ${
              isDarkMode 
                ? 'bg-black/90 border-white/[0.2]' 
                : 'bg-white/90 border-gray-300'
            } backdrop-blur-md border rounded-lg py-4 px-6 md:hidden`}
          >
            {['Projects', 'Education', 'Skills', 'Contact'].map((item) => (
              <button
                key={item}
                className={`block ${
                  isDarkMode 
                    ? 'text-white hover:text-cyan-400' 
                    : 'text-gray-700 hover:text-blue-600'
                } font-medium text-lg text-left w-full py-2 transition-colors`}
                onClick={() => { 
                  scrollToSection(item.toLowerCase()); 
                  setIsMobileMenuOpen(false); 
                }}
              >
                {item}
              </button>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>

      {/* === HERO SECTION (START) === */}
      <section className="relative flex flex-col items-center justify-center min-h-screen text-center px-4 sm:px-6 overflow-hidden pt-24">
        <AnimatedBackground isDarkMode={isDarkMode} />

        {/* Name and Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10"
        >
          <h1 className={`text-4xl sm:text-5xl md:text-7xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {personalInfo.name}
          </h1>
          <div className="h-8 mt-4">
            <AnimatePresence mode="wait">
              <motion.p
                key={animatedTitles[currentTitleIndex]}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className={`${isDarkMode ? 'text-cyan-400' : 'text-blue-600'} text-lg sm:text-xl font-medium tracking-wider`}
              >
                {animatedTitles[currentTitleIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Hero Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-base sm:text-lg mt-8 max-w-3xl relative z-10 leading-relaxed`}
        >
          {aboutMe}
        </motion.p>

        {/* Hero Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 sm:gap-6 relative z-10"
        >
          <motion.a
            href={personalInfo.github}
            target="_blank"
            rel="noopener noreferrer"
            className={`px-8 py-4 ${
              isDarkMode 
                ? 'bg-gradient-to-r from-zinc-800 to-zinc-700 hover:from-zinc-700 hover:to-zinc-600 shadow-lg hover:shadow-zinc-500/30' 
                : 'bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 shadow-lg hover:shadow-gray-500/30'
            } rounded-lg text-white font-bold transition transform hover:scale-105 flex items-center justify-center gap-2`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Github size={20} />
            GitHub Profile
          </motion.a>
          
          <motion.a
            href={personalInfo.resume}
            target="_blank"
            rel="noopener noreferrer"
            className={`px-8 py-4 ${
              isDarkMode 
                ? 'bg-white text-black hover:shadow-cyan-500/30' 
                : 'bg-black text-white shadow-lg hover:shadow-blue-500/30'
            } rounded-lg font-bold transition transform hover:scale-105 flex items-center justify-center gap-2`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Eye size={20} />
            View Resume
          </motion.a>

          <motion.a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('contact');
            }}
            className={`px-8 py-4 border-2 ${
              isDarkMode 
                ? 'border-gray-400 hover:bg-gray-800 hover:border-white hover:shadow-white/30' 
                : 'border-gray-400 hover:bg-gray-100 hover:border-gray-600 hover:shadow-gray-400/30'
            } rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-800'} font-bold shadow-lg transition transform hover:scale-105`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get in Touch
          </motion.a>
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-10 flex gap-6 relative z-10"
        >
          <motion.a
            href={personalInfo.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className={`${isDarkMode ? 'text-white hover:text-cyan-400' : 'text-gray-700 hover:text-blue-600'} transition-colors`}
            whileHover={{ scale: 1.2 }}
          >
            <Linkedin size={28} />
          </motion.a>
          
          <motion.a
            href="https://leetcode.com/prajapatiyash"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center`}
            whileHover={{ scale: 1.2 }}
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/1/19/LeetCode_logo_black.png"
              alt="LeetCode"
              className={`w-7 h-7 ${isDarkMode ? 'filter invert hue-rotate-[-150deg]' : ''}`}
            />
          </motion.a>
        </motion.div>
      </section>
      {/* === HERO SECTION (END) === */}

      {/* Projects Section */}
      <motion.section
        id="projects"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-20 px-4 sm:px-6 lg:px-8"
      >
        <AnimatedSectionTitle title="Projects 🚀" isDarkMode={isDarkMode} />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center max-w-6xl mx-auto">
          {projects.map((project, index) => (
            <ProjectCard key={index} project={project} index={index} isDarkMode={isDarkMode} />
          ))}
        </div>
      </motion.section>

      {/* Skills Section */}
      <motion.section
        id="skills"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-20 px-4 sm:px-6 lg:px-8"
      >
        <AnimatedSectionTitle title="Skills ⚡" isDarkMode={isDarkMode} />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {skillCategories.map((category, categoryIndex) => (
            <motion.div
              key={categoryIndex}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
              className="w-full"
            >
              <h3 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-lg font-bold mb-4`}>{category.category}</h3>
              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill, skillIndex) => (
                  <SkillButton 
                    key={skillIndex} 
                    skill={skill} 
                    delay={skillIndex * 0.05}
                    isDarkMode={isDarkMode}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Education Section */}
      <motion.section
        id="education"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-20 px-4 sm:px-6 lg:px-8"
      >
        <AnimatedSectionTitle title="Education 🎓" isDarkMode={isDarkMode} />
        
        <div className="space-y-8 max-w-4xl mx-auto">
          {education.map((edu, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`${
                isDarkMode 
                  ? 'bg-zinc-900 border-white/[0.2]' 
                  : 'bg-white border-gray-200'
              } p-8 rounded-2xl shadow-lg border text-center hover:shadow-xl transition-shadow duration-300`}
            >
              <h3 className={`text-2xl font-semibold ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'} mb-2`}>{edu.degree}</h3>
              <p className={`text-xl ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>{edu.institution}</p>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>{edu.years}</p>
              <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{index === (education.length - 1) ? "Percentile" : "GPA"}: {edu.gpa}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Contact Section */}
      <motion.section
        id="contact"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-20 px-4 sm:px-6 lg:px-8"
      >
        <AnimatedSectionTitle title="Contact Me 📧" isDarkMode={isDarkMode} />
        
        <form onSubmit={sendEmail} className="max-w-2xl mx-auto" encType="multipart/form-data">
          <div className={`${
            isDarkMode 
              ? 'bg-zinc-900 border-white/[0.2]' 
              : 'bg-white border-gray-200'
          } border rounded-2xl shadow-2xl overflow-hidden`}>
            <div className={`${isDarkMode ? 'border-gray-700' : 'border-gray-200'} border-b p-6`}>
              <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>New Message</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} w-20`}>To:</label>
                <div className={`flex-1 px-3 py-2 ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'} rounded-md text-sm`}>
                  {personalInfo.email}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} w-20`}>From:</label>
                <input
                  type="email"
                  name="from"
                  required
                  placeholder="Your Email"
                  className={`flex-1 px-3 py-2 border ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-800 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-md`}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} w-20`}>Subject:</label>
                <input
                  type="text"
                  name="subject"
                  required
                  placeholder="Project Inquiry"
                  className={`flex-1 px-3 py-2 border ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-800 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-md`}
                />
              </div>
              
              <div className="space-y-2">
                <textarea
                  name="message"
                  placeholder="Hi Yash, I am XYZ & I am reaching out to you because..."
                  rows={8}
                  required
                  className={`w-full px-3 py-2 border ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-800 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-md resize-none`}
                />
              </div>
            </div>
            
            <div className={`${isDarkMode ? 'border-gray-700' : 'border-gray-200'} border-t p-6 flex items-center justify-between`}>
              <div className="flex items-center space-x-4">
                <motion.button
                  type="submit"
                  className={`inline-flex items-center justify-center px-6 py-2 ${
                    isDarkMode 
                      ? 'bg-white text-black' 
                      : 'bg-black text-white'
                  }  rounded-md shadow-sm text-sm font-medium transition-colors`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </motion.button>
                
                <label className={`p-2 rounded-full ${
                  isDarkMode 
                    ? 'text-gray-400 hover:bg-gray-800' 
                    : 'text-gray-600 hover:bg-gray-100'
                } transition-colors cursor-pointer flex items-center space-x-2`}>
                  <Paperclip className="w-4 h-4" />
                  {selectedFile ? (
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {selectedFile.name}
                    </span>
                  ) : (
                    <span className="sr-only">Attach File</span>
                  )}
                  <input type="file" name="attachment" hidden onChange={handleFileChange} />
                </label>
                
                {selectedFile && (
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="ml-2 text-red-500 hover:text-red-400 text-sm transition-colors"
                    title="Remove attachment"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </motion.section>

      {/* Footer */}
      <footer className={`${
        isDarkMode 
          ? 'bg-zinc-900 border-white/[0.2]' 
          : 'bg-gray-100 border-gray-300'
      } py-12 px-4 sm:px-6 lg:px-8 border-t`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0 text-center md:text-left">
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'} mb-2`}>{personalInfo.name}</h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Building the future, one line of code at a time.</p>
            </div>

            <div className="flex space-x-6">
              <motion.a
                href={personalInfo.github}
                target="_blank"
                rel="noopener noreferrer"
                className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
                whileHover={{ scale: 1.2 }}
              >
                <Github className="w-6 h-6" />
              </motion.a>
              <motion.a
                href={personalInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
                whileHover={{ scale: 1.2 }}
              >
                <Linkedin className="w-6 h-6" />
              </motion.a>
            </div>
          </div>

          <div className={`${isDarkMode ? 'border-gray-800' : 'border-gray-300'} border-t mt-8 pt-8 text-center`}>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Designed by Yash in India ❤️</p>
          </div>
        </div>
      </footer>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`${
              isDarkMode 
                ? 'bg-zinc-900 border-white/[0.2]' 
                : 'bg-white border-gray-300'
            } border rounded-lg shadow-lg p-6 max-w-sm w-full mx-4`}
          >
            <motion.img
              src="https://img.freepik.com/free-vector/cute-boy-riding-rocket-cartoon-icon-illustration_138676-2458.jpg"
              alt="Coming Soon"
              className="w-32 h-32 mx-auto"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4 text-center`}>Ooopssss!</h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6 text-center`}>Link for this project will be added soon!</p>
            <motion.button
              onClick={closeModal}
              className={`w-full px-4 py-2 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
              } text-white rounded-md text-sm font-medium transition-colors`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Close
            </motion.button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default App;