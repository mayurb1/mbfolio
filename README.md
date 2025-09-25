# Personal Portfolio Website

A modern, responsive, and feature-rich personal portfolio website built with React, Vite, and Tailwind CSS. This portfolio showcases professional experience, skills, projects, and includes interactive elements to engage visitors.

![Portfolio Preview](https://via.placeholder.com/1200x600/3B82F6/FFFFFF?text=Portfolio+Preview)

## 🌟 Features

### Core Functionality
- **Single Page Application** with smooth scrolling navigation
- **Responsive Design** - Mobile-first approach, works on all devices
- **Multiple Themes** - 5 beautiful themes (Light, Dark, Cosmic, Neon, Forest)
- **Accessibility** - WCAG 2.1 compliant with keyboard navigation
- **Performance Optimized** - Code splitting, lazy loading, and optimized assets

### Sections
- **Hero Section** - Animated introduction with particle background
- **About** - Personal bio, stats, and downloadable resume
- **Skills** - Interactive D3.js charts (bar and radar charts)
- **Experience** - Animated timeline with achievements
- **Projects** - Filterable grid with modal details and hover effects
- **Blog** - Markdown support with syntax highlighting
- **Fun Corner** - Interactive games (Memory game, Tech quiz) with achievements
- **Testimonials** - Carousel with auto-play and manual controls
- **Contact** - Form with validation, maps integration, and submission handling

### Technical Features
- **PWA Support** - Service worker, offline capabilities, installable
- **SEO Optimized** - Meta tags, Open Graph, Twitter cards, sitemap
- **Analytics Ready** - Google Analytics integration
- **Code Quality** - ESLint, Prettier, comprehensive error handling
- **Theme Persistence** - Remembers user's theme preference
- **Performance Monitoring** - Lighthouse-friendly optimizations

## 🚀 Quick Start

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mayurb1/mbfolio.git
   cd personal-portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open in browser**
   - Navigate to `http://localhost:3000`
   - The site will automatically reload when you make changes

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build locally

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Format code with Prettier

# Deployment
npm run deploy:vercel   # Deploy to Vercel
npm run deploy:netlify  # Deploy to Netlify
```

### Project Structure

```
src/
├── components/
│   ├── blog/           # Blog-related components
│   ├── layout/         # Header, Footer components
│   ├── pages/          # Page components (NotFound)
│   ├── sections/       # Main section components
│   └── ui/             # Reusable UI components
├── contexts/           # React contexts (Theme)
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── index.css          # Global styles and CSS variables
└── main.jsx           # Application entry point
```

### Key Technologies

- **React 18** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework with custom theming
- **Framer Motion** - Smooth animations and transitions
- **D3.js** - Interactive data visualizations
- **React Router** - Client-side routing
- **Formik + Yup** - Form handling and validation
- **React Markdown** - Markdown rendering with syntax highlighting
- **Lucide React** - Beautiful icon library

## 🎨 Customization

### Personal Information

Update the following files with your information:

1. **Personal Details** (`src/components/sections/`)
   - `Hero.jsx` - Name, tagline, social links
   - `About.jsx` - Bio, stats, location
   - `Experience.jsx` - Work history and education
   - `Contact.jsx` - Contact information

2. **Projects** (`src/components/sections/Projects.jsx`)
   - Add your projects with descriptions, technologies, and links

3. **Blog Posts** (`src/components/sections/Blog.jsx`)
   - Add your blog posts or connect to a CMS

4. **Theme Colors** (`src/index.css`)
   - Customize CSS variables for different themes

### Adding New Themes

1. Add theme definition in `src/contexts/ThemeContext.jsx`:
   ```jsx
   newTheme: {
     name: 'New Theme',
     class: 'new-theme',
     icon: '🎨',
     description: 'Your theme description'
   }
   ```

2. Add CSS variables in `src/index.css`:
   ```css
   .new-theme {
     --color-primary: #your-primary;
     --color-secondary: #your-secondary;
     /* ... other variables */
   }
   ```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Analytics
VITE_GA_ID=G-YOUR_GA_ID

# Contact Form (if using a backend service)
VITE_CONTACT_API_URL=https://your-api.com/contact

# Social Media
VITE_GITHUB_USERNAME=yourusername
VITE_LINKEDIN_URL=https://linkedin.com/in/yourprofile
VITE_TWITTER_URL=https://twitter.com/yourhandle
```

## 📦 Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   npm run build
   vercel --prod
   ```

3. **Environment Variables**
   - Add environment variables in Vercel dashboard
   - Set build command: `npm run build`
   - Set output directory: `dist`

### Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy**
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

3. **Netlify Configuration**
   Create `netlify.toml`:
   ```toml
   [build]
     publish = "dist"
     command = "npm run build"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

### GitHub Pages

1. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add script to package.json**
   ```json
   "scripts": {
     "deploy:gh-pages": "npm run build && gh-pages -d dist"
   }
   ```

3. **Deploy**
   ```bash
   npm run deploy:gh-pages
   ```

## 🔧 Configuration

### PWA Configuration

The app includes PWA support with:
- Service worker for offline functionality
- Web app manifest for installation
- Icon generation for different platforms

### SEO Configuration

- Meta tags for search engines
- Open Graph tags for social media
- Twitter Card tags
- Structured data markup
- Sitemap generation

### Analytics Setup

1. Create Google Analytics 4 property
2. Add tracking ID to environment variables
3. Analytics events are automatically tracked for:
   - Page views
   - Form submissions
   - File downloads
   - Theme changes
   - Game interactions

## 🧪 Testing

### Manual Testing Checklist

- [ ] All sections render correctly
- [ ] Navigation works smoothly
- [ ] Theme switching functions
- [ ] Contact form validation
- [ ] Responsive design on mobile/tablet
- [ ] Games function properly
- [ ] All external links work
- [ ] Performance is satisfactory

### Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] Color contrast meets WCAG standards
- [ ] Focus indicators are visible
- [ ] Alt text for images

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**
   - Ensure Node.js version is 16+
   - Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`

2. **Theme Not Persisting**
   - Check localStorage is enabled in browser
   - Verify theme context is properly wrapped around app

3. **D3 Charts Not Rendering**
   - Ensure D3 dependencies are installed
   - Check console for JavaScript errors

4. **Form Not Submitting**
   - Verify form validation schema
   - Check network requests in browser dev tools

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS
- [Framer Motion](https://www.framer.com/motion/) for smooth animations
- [D3.js](https://d3js.org/) for data visualizations
- [Lucide](https://lucide.dev/) for beautiful icons
- [Vite](https://vitejs.dev/) for the fast build tool

## 📞 Support

If you have any questions or need help with setup, feel free to:
- Open an issue on GitHub
- Reach out via email: [mayurbhalgama2419@gmail.com](mailto:mayurbhalgama2419@gmail.com)
- Connect on [LinkedIn](https://in.linkedin.com/in/mayur-bhalgama-reactjs)

---

**⭐ If you found this portfolio template helpful, please give it a star on GitHub!**