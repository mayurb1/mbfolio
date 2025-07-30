# Portfolio Design System & Standards

A comprehensive guide to maintain consistency across the personal portfolio project. This document outlines UI standards, theme guidelines, component patterns, and coding conventions.

## 📋 Table of Contents

1. [Theme System](#-theme-system)
2. [Typography](#-typography)
3. [Color System](#-color-system)
4. [Spacing & Layout](#-spacing--layout)
5. [Component Standards](#-component-standards)
6. [Animation Guidelines](#-animation-guidelines)
7. [Accessibility Standards](#-accessibility-standards)
8. [Code Conventions](#-code-conventions)
9. [File Organization](#-file-organization)
10. [Common Patterns](#-common-patterns)

---

## 🎨 Theme System

### Available Themes

Our portfolio supports 5 distinct themes, each with specific use cases:

#### Light Theme (Default)
```css
:root {
  --color-primary: #2563eb;      /* Blue 600 */
  --color-secondary: #7c3aed;    /* Violet 600 */
  --color-accent: #f59e0b;       /* Amber 500 */
  --color-background: #ffffff;   /* White */
  --color-surface: #f8fafc;      /* Slate 50 */
  --color-text: #1e293b;         /* Slate 800 */
  --color-text-secondary: #64748b; /* Slate 500 */
  --color-border: #e2e8f0;       /* Slate 200 */
}
```

#### Dark Theme
```css
.dark {
  --color-primary: #3b82f6;      /* Blue 500 */
  --color-secondary: #8b5cf6;    /* Violet 500 */
  --color-accent: #fbbf24;       /* Amber 400 */
  --color-background: #0f172a;   /* Slate 900 */
  --color-surface: #1e293b;      /* Slate 800 */
  --color-text: #f1f5f9;         /* Slate 100 */
  --color-text-secondary: #94a3b8; /* Slate 400 */
  --color-border: #334155;       /* Slate 700 */
}
```

#### Cosmic Theme
```css
.cosmic {
  --color-primary: #9333ea;      /* Purple 600 */
  --color-secondary: #ec4899;    /* Pink 500 */
  --color-accent: #06b6d4;       /* Cyan 500 */
  --color-background: #0c0a1e;   /* Deep space */
  --color-surface: #1a1332;      /* Dark purple */
  --color-text: #e2e8f0;         /* Light gray */
  --color-text-secondary: #a78bfa; /* Purple 400 */
  --color-border: #4c1d95;       /* Purple 800 */
}
```

#### Neon Theme
```css
.neon {
  --color-primary: #00ff88;      /* Neon green */
  --color-secondary: #ff0080;    /* Neon pink */
  --color-accent: #00ccff;       /* Neon blue */
  --color-background: #000011;   /* Deep black */
  --color-surface: #111122;      /* Dark gray */
  --color-text: #ffffff;         /* White */
  --color-text-secondary: #88ffaa; /* Light neon green */
  --color-border: #00ff88;       /* Neon green */
}
```

#### Forest Theme
```css
.forest {
  --color-primary: #059669;      /* Emerald 600 */
  --color-secondary: #0891b2;    /* Cyan 600 */
  --color-accent: #d97706;       /* Amber 600 */
  --color-background: #f0fdf4;   /* Green 50 */
  --color-surface: #ecfdf5;      /* Green 100 */
  --color-text: #064e3b;         /* Emerald 900 */
  --color-text-secondary: #047857; /* Emerald 700 */
  --color-border: #6ee7b7;       /* Emerald 300 */
}
```

### Theme Usage Rules

1. **Always use CSS variables** instead of hardcoded colors
2. **Test all themes** before deploying new features
3. **Maintain contrast ratios** for accessibility
4. **Use semantic color names** (primary, secondary, etc.)

---

## 📝 Typography

### Font Families

```css
/* Primary font for body text */
font-family: 'Inter', system-ui, -apple-system, sans-serif;

/* Monospace font for code */
font-family: 'JetBrains Mono', monospace;
```

### Font Scale

```css
/* Headings */
.text-4xl { font-size: 2.25rem; }  /* 36px - Main titles */
.text-3xl { font-size: 1.875rem; } /* 30px - Section titles */
.text-2xl { font-size: 1.5rem; }   /* 24px - Subsection titles */
.text-xl { font-size: 1.25rem; }   /* 20px - Card titles */
.text-lg { font-size: 1.125rem; }  /* 18px - Large body text */

/* Body text */
.text-base { font-size: 1rem; }    /* 16px - Default body */
.text-sm { font-size: 0.875rem; }  /* 14px - Small text */
.text-xs { font-size: 0.75rem; }   /* 12px - Caption text */
```

### Font Weights

```css
.font-light { font-weight: 300; }    /* Light text */
.font-normal { font-weight: 400; }   /* Regular text */
.font-medium { font-weight: 500; }   /* Medium emphasis */
.font-semibold { font-weight: 600; } /* Strong emphasis */
.font-bold { font-weight: 700; }     /* Headings */
```

### Typography Rules

1. **Use consistent font sizes** from the defined scale
2. **Maintain proper line height** (1.5 for body, 1.2 for headings)
3. **Limit font weights** to the defined set
4. **Use semantic HTML** elements (h1, h2, p, etc.)

---

## 🎨 Color System

### Color Usage Guidelines

#### Primary Color
- **Use for**: Main CTAs, active states, links, primary buttons
- **Don't use for**: Large backgrounds, body text

#### Secondary Color  
- **Use for**: Secondary CTAs, hover states, accents
- **Don't use for**: Primary actions, body text

#### Accent Color
- **Use for**: Highlights, badges, special elements
- **Don't use for**: Main navigation, primary content

#### Background Colors
```css
/* Page background */
background-color: var(--color-background);

/* Card/section background */
background-color: var(--color-surface);
```

#### Text Colors
```css
/* Primary text */
color: var(--color-text);

/* Secondary text */
color: var(--color-text-secondary);
```

### Color Accessibility

1. **Maintain contrast ratios**:
   - Normal text: 4.5:1 minimum
   - Large text: 3:1 minimum
   - UI components: 3:1 minimum

2. **Test color blindness** compatibility
3. **Don't rely on color alone** for information

---

## 📏 Spacing & Layout

### Spacing Scale

```css
/* Tailwind spacing scale (rem) */
.p-1 { padding: 0.25rem; }   /* 4px */
.p-2 { padding: 0.5rem; }    /* 8px */
.p-3 { padding: 0.75rem; }   /* 12px */
.p-4 { padding: 1rem; }      /* 16px */
.p-6 { padding: 1.5rem; }    /* 24px */
.p-8 { padding: 2rem; }      /* 32px */
.p-12 { padding: 3rem; }     /* 48px */
.p-16 { padding: 4rem; }     /* 64px */
.p-20 { padding: 5rem; }     /* 80px */
.p-32 { padding: 8rem; }     /* 128px */
```

### Layout Patterns

#### Container
```jsx
<div className="container mx-auto px-4 lg:px-8">
  {/* Content */}
</div>
```

#### Section Padding
```jsx
<section className="py-20 lg:py-32">
  {/* Section content */}
</section>
```

#### Card Component
```jsx
<div className="bg-surface border border-border rounded-xl p-6 hover:shadow-lg transition-shadow duration-200">
  {/* Card content */}
</div>
```

### Grid System

#### Standard Grid
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Grid items */}
</div>
```

#### Responsive Breakpoints
```css
/* Mobile first approach */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X large devices */
```

---

## 🧩 Component Standards

### Button Components

#### Primary Button
```jsx
<motion.button
  className="bg-primary text-background px-6 py-3 rounded-lg font-semibold hover:bg-secondary transition-colors duration-200"
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Button Text
</motion.button>
```

#### Secondary Button
```jsx
<motion.button
  className="border border-border text-text px-6 py-3 rounded-lg font-semibold hover:bg-surface transition-colors duration-200"
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Button Text
</motion.button>
```

### Form Components

#### Input Field
```jsx
<input
  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200"
  placeholder="Placeholder text"
/>
```

#### Textarea
```jsx
<textarea
  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200"
  rows={4}
  placeholder="Placeholder text"
/>
```

### Card Components

#### Standard Card
```jsx
<motion.div
  className="bg-surface border border-border rounded-xl p-6 hover:shadow-lg transition-shadow duration-200"
  whileHover={{ scale: 1.02 }}
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  {/* Card content */}
</motion.div>
```

#### Feature Card
```jsx
<motion.div
  className="text-center p-6 bg-surface border border-border rounded-xl hover:shadow-lg transition-shadow duration-200"
  whileHover={{ scale: 1.05 }}
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
  <div className="text-4xl mb-4">{icon}</div>
  <h3 className="text-xl font-bold text-text mb-2">{title}</h3>
  <p className="text-text-secondary">{description}</p>
</motion.div>
```

---

## 🎬 Animation Guidelines

### Framer Motion Patterns

#### Page/Section Animations
```jsx
<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={inView ? { opacity: 1, y: 0 } : {}}
  transition={{ duration: 0.6 }}
>
  {/* Content */}
</motion.div>
```

#### Stagger Children
```jsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ staggerChildren: 0.1 }}
>
  {items.map((item, index) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      {/* Item content */}
    </motion.div>
  ))}
</motion.div>
```

#### Hover Animations
```jsx
<motion.div
  whileHover={{ scale: 1.05, y: -2 }}
  whileTap={{ scale: 0.95 }}
  transition={{ duration: 0.2 }}
>
  {/* Hoverable content */}
</motion.div>
```

### Animation Timing

```css
/* Standard durations */
.duration-100 { transition-duration: 100ms; }  /* Quick feedback */
.duration-200 { transition-duration: 200ms; }  /* Standard hover */
.duration-300 { transition-duration: 300ms; }  /* Medium transitions */
.duration-500 { transition-duration: 500ms; }  /* Content animations */
.duration-700 { transition-duration: 700ms; }  /* Page transitions */
```

### Animation Rules

1. **Keep animations subtle** and purposeful
2. **Respect user preferences** (prefers-reduced-motion)
3. **Use consistent timing** across similar elements
4. **Test performance** on lower-end devices

---

## ♿ Accessibility Standards

### WCAG 2.1 Compliance

#### Semantic HTML
```jsx
// Good
<main role="main">
  <section aria-labelledby="about-heading">
    <h2 id="about-heading">About Me</h2>
    {/* Content */}
  </section>
</main>

// Bad
<div>
  <div>About Me</div>
  {/* Content */}
</div>
```

#### ARIA Labels
```jsx
<button
  aria-label="Close modal"
  aria-expanded={isOpen}
  aria-controls="modal-content"
>
  <X size={20} />
</button>
```

#### Focus Management
```jsx
<button
  className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleAction()
    }
  }}
>
  Interactive Element
</button>
```

### Accessibility Checklist

- [ ] **Keyboard navigation** works for all interactive elements
- [ ] **Screen reader** compatibility with proper ARIA labels
- [ ] **Color contrast** meets WCAG standards
- [ ] **Focus indicators** are visible and consistent
- [ ] **Alternative text** for all images
- [ ] **Form labels** are properly associated
- [ ] **Error messages** are descriptive and helpful

---

## 💻 Code Conventions

### Component Structure

```jsx
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Icon } from 'lucide-react'

const ComponentName = ({ prop1, prop2 }) => {
  // 1. Hooks and state
  const [state, setState] = useState(initialValue)
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  })

  // 2. Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies])

  // 3. Event handlers
  const handleEvent = () => {
    // Handler logic
  }

  // 4. Computed values
  const computedValue = useMemo(() => {
    // Computation
  }, [dependencies])

  // 5. Early returns
  if (condition) {
    return <div>Loading...</div>
  }

  // 6. Main render
  return (
    <section 
      id="section-id" 
      className="py-20 lg:py-32 bg-background"
      ref={ref}
    >
      {/* Component content */}
    </section>
  )
}

export default ComponentName
```

### Naming Conventions

#### Files and Directories
```
PascalCase for components: ComponentName.jsx
camelCase for utilities: utilityFunction.js
kebab-case for assets: background-image.jpg
```

#### Variables and Functions
```jsx
// camelCase for variables and functions
const userName = 'Mayur Bhalgama'
const handleSubmit = () => {}

// PascalCase for components
const UserProfile = () => {}

// SCREAMING_SNAKE_CASE for constants
const API_BASE_URL = 'https://api.example.com'
```

#### CSS Classes
```jsx
// Use Tailwind utilities primarily
<div className="bg-surface border border-border rounded-xl p-6">

// Custom classes in camelCase for dynamic styles
<div className={`transition-colors duration-200 ${isActive ? 'bg-primary' : 'bg-surface'}`}>
```

---

## 📁 File Organization

### Directory Structure

```
src/
├── components/
│   ├── blog/           # Blog-specific components
│   │   ├── BlogPost.jsx
│   │   └── BlogCard.jsx
│   ├── layout/         # Layout components
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── Navigation.jsx
│   ├── pages/          # Page components
│   │   ├── NotFound.jsx
│   │   └── Home.jsx
│   ├── sections/       # Main section components
│   │   ├── Hero.jsx
│   │   ├── About.jsx
│   │   ├── Skills.jsx
│   │   ├── Experience.jsx
│   │   ├── Projects.jsx
│   │   ├── Blog.jsx

│   │   ├── Testimonials.jsx
│   │   └── Contact.jsx
│   └── ui/             # Reusable UI components
│       ├── Button.jsx
│       ├── Card.jsx
│       ├── Modal.jsx
│       ├── LoadingSpinner.jsx
│       ├── ThemeToggle.jsx
│       └── ScrollToTop.jsx
├── contexts/           # React contexts
│   ├── ThemeContext.jsx
│   └── AuthContext.jsx
├── hooks/              # Custom React hooks
│   ├── useLocalStorage.js
│   ├── useIntersectionObserver.js
│   └── useTheme.js
├── utils/              # Utility functions
│   ├── helpers.js
│   ├── constants.js
│   └── formatters.js
├── data/               # Static data files
│   ├── projects.js
│   ├── experiences.js
│   └── testimonials.js
├── assets/             # Static assets
│   ├── images/
│   ├── icons/
│   └── documents/
├── styles/             # Global styles
│   ├── globals.css
│   └── components.css
├── App.jsx             # Main app component
├── main.jsx            # Entry point
└── index.css           # Main stylesheet
```

### Component Organization Rules

1. **One component per file**
2. **Export default at the end**
3. **Import order**: External libraries → Internal components → Relative imports
4. **Group related components** in subdirectories
5. **Use index.js files** for clean imports

---

## 🔧 Common Patterns

### Loading States

```jsx
const ComponentWithLoading = () => {
  const [loading, setLoading] = useState(true)
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }
  
  return <div>{/* Loaded content */}</div>
}
```

### Error Boundaries

```jsx
const ComponentWithError = () => {
  return (
    <ErrorBoundary>
      <SomeComponent />
    </ErrorBoundary>
  )
}
```

### Responsive Images

```jsx
<img
  src={imageSrc}
  alt={altText}
  className="w-full h-auto object-cover rounded-lg"
  onError={(e) => {
    e.target.src = '/fallback-image.jpg'
  }}
  loading="lazy"
/>
```

### Form Validation

```jsx
const formik = useFormik({
  initialValues: { /* initial values */ },
  validationSchema: Yup.object({
    // Validation schema
  }),
  onSubmit: async (values) => {
    // Submit logic
  }
})
```

### Modal Pattern

```jsx
<AnimatePresence>
  {isOpen && (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-background rounded-xl max-w-lg w-full p-6"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal content */}
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

---

## 📋 Development Checklist

### Before Adding New Components

- [ ] **Follow naming conventions**
- [ ] **Use established patterns**
- [ ] **Include proper TypeScript/PropTypes**
- [ ] **Add accessibility attributes**
- [ ] **Test all themes**
- [ ] **Check responsive design**
- [ ] **Add appropriate animations**
- [ ] **Include error states**
- [ ] **Add loading states**
- [ ] **Write documentation**

### Before Deploying

- [ ] **Run linting**: `npm run lint`
- [ ] **Format code**: `npm run format`
- [ ] **Build successfully**: `npm run build`
- [ ] **Test all themes**
- [ ] **Test responsiveness**
- [ ] **Check accessibility**
- [ ] **Verify performance**
- [ ] **Test on different browsers**

---

## 🚀 Performance Guidelines

### Bundle Optimization

1. **Use dynamic imports** for heavy components
2. **Implement code splitting** at route level
3. **Lazy load images** with appropriate placeholders
4. **Minimize bundle size** by tree shaking unused code

### Image Optimization

```jsx
// Use appropriate formats
<img
  src="image.webp"
  alt="Description"
  loading="lazy"
  className="w-full h-auto"
/>

// Provide fallbacks
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <source srcSet="image.jpg" type="image/jpeg" />
  <img src="image.jpg" alt="Description" />
</picture>
```

### Memory Management

1. **Clean up event listeners** in useEffect cleanup
2. **Cancel pending requests** when components unmount
3. **Use React.memo** for expensive components
4. **Optimize re-renders** with useMemo and useCallback

---

## 📚 Resources

### Documentation
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [React Documentation](https://react.dev/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Tools
- [Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Color Palette Generator](https://coolors.co/)
- [Font Pairing Tool](https://fontpair.co/)
- [Accessibility Checker](https://wave.webaim.org/)

---

**Remember**: This design system is a living document. Update it as the project evolves and new patterns emerge. Consistency is key to a professional and maintainable codebase.

## 🤝 Contributing to the Design System

When adding new patterns or components:

1. **Document the pattern** in this file
2. **Provide code examples**
3. **Explain the rationale** behind design decisions
4. **Update the checklist** if needed
5. **Test across all themes**
6. **Ensure accessibility compliance**

---

*Last updated: January 2024*