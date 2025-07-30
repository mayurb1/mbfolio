import { useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle, 
  AlertCircle,
  Github,
  Linkedin,
  Twitter,
  Calendar,
  Clock,
  Globe
} from 'lucide-react'

const Contact = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  })

  const [submitStatus, setSubmitStatus] = useState(null) // 'success', 'error', or null
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validationSchema = Yup.object({
    name: Yup.string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be less than 50 characters')
      .required('Name is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    subject: Yup.string()
      .min(5, 'Subject must be at least 5 characters')
      .max(100, 'Subject must be less than 100 characters')
      .required('Subject is required'),
    message: Yup.string()
      .min(10, 'Message must be at least 10 characters')
      .max(1000, 'Message must be less than 1000 characters')
      .required('Message is required'),
    budget: Yup.string().optional(),
    timeline: Yup.string().optional()
  })

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
      budget: '',
      timeline: ''
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      setIsSubmitting(true)
      setSubmitStatus(null)

      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // In a real app, you would send the form data to your backend
        console.log('Form submitted:', values)
        
        // Analytics tracking
        if (window.gtag) {
          window.gtag('event', 'form_submit', {
            event_category: 'engagement',
            event_label: 'contact_form'
          })
        }

        setSubmitStatus('success')
        resetForm()
      } catch (error) {
        console.error('Error submitting form:', error)
        setSubmitStatus('error')
      } finally {
        setIsSubmitting(false)
      }
    }
  })

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'mayur@example.com',
      href: 'mailto:mayur@example.com',
      description: 'Send me an email anytime'
    },
    {
      icon: Phone,
      label: 'Phone',
      value: '+1 (555) 123-4567',
      href: 'tel:+15551234567',
      description: 'Call during business hours'
    },
    {
      icon: MapPin,
      label: 'Location',
      value: 'San Francisco, CA',
      href: 'https://maps.google.com/?q=San+Francisco,CA',
      description: 'Available for remote work worldwide'
    }
  ]

  const socialLinks = [
    {
      icon: Github,
      label: 'GitHub',
      href: 'https://github.com/mayurbhalgama',
      color: 'hover:text-gray-900 dark:hover:text-white'
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      href: 'https://linkedin.com/in/mayurbhalgama',
      color: 'hover:text-blue-600'
    },
    {
      icon: Twitter,
      label: 'Twitter',
      href: 'https://twitter.com/mayurbhalgama',
      color: 'hover:text-blue-400'
    }
  ]

  const FormField = ({ label, name, type = 'text', as = 'input', required = false, ...props }) => {
    const hasError = formik.touched[name] && formik.errors[name]
    const Component = as

    return (
      <div className="space-y-2">
        <label htmlFor={name} className="block text-sm font-medium text-text">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <Component
          id={name}
          name={name}
          type={type}
          className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 bg-background text-text placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary ${
            hasError 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
              : 'border-border focus:border-primary'
          }`}
          placeholder={props.placeholder}
          value={formik.values[name]}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          {...props}
        />
        {hasError && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm flex items-center space-x-1"
          >
            <AlertCircle size={14} />
            <span>{formik.errors[name]}</span>
          </motion.p>
        )}
      </div>
    )
  }

  return (
    <section 
      id="contact" 
      className="py-20 lg:py-32 bg-background"
      ref={ref}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-text mb-4">
              Let's Work Together
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Have a project in mind? I'd love to hear about it. Send me a message and let's create something amazing together.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-1 space-y-8"
            >
              {/* Contact Info Cards */}
              <div className="space-y-6">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon
                  return (
                    <motion.a
                      key={index}
                      href={info.href}
                      target={info.href.startsWith('http') ? '_blank' : undefined}
                      rel={info.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="block p-6 bg-surface border border-border rounded-xl hover:shadow-lg transition-all duration-200 group"
                      whileHover={{ scale: 1.02 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={inView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary group-hover:text-background transition-colors duration-200">
                          <Icon size={24} className="text-primary group-hover:text-background" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-text mb-1">{info.label}</h3>
                          <p className="text-primary font-medium mb-1">{info.value}</p>
                          <p className="text-text-secondary text-sm">{info.description}</p>
                        </div>
                      </div>
                    </motion.a>
                  )
                })}
              </div>

              {/* Availability */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-xl"
              >
                <h3 className="font-semibold text-text mb-4 flex items-center">
                  <Calendar size={20} className="mr-2 text-primary" />
                  Availability
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-text">Available for new projects</span>
                  </div>
                  <div className="flex items-center space-x-2 text-text-secondary">
                    <Clock size={14} />
                    <span>Response time: Within 24 hours</span>
                  </div>
                  <div className="flex items-center space-x-2 text-text-secondary">
                    <Globe size={14} />
                    <span>Timezone: PST (UTC-8)</span>
                  </div>
                </div>
              </motion.div>

              {/* Social Links */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 1.0 }}
                className="text-center"
              >
                <h3 className="font-semibold text-text mb-4">Connect With Me</h3>
                <div className="flex justify-center space-x-4">
                  {socialLinks.map((social, index) => {
                    const Icon = social.icon
                    return (
                      <motion.a
                        key={index}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-3 bg-surface border border-border rounded-lg text-text-secondary transition-colors duration-200 ${social.color}`}
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label={`Visit my ${social.label} profile`}
                      >
                        <Icon size={20} />
                      </motion.a>
                    )
                  })}
                </div>
              </motion.div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-2"
            >
              <div className="bg-surface border border-border rounded-xl p-8">
                <h3 className="text-2xl font-bold text-text mb-6">Send Me a Message</h3>
                
                {/* Success Message */}
                {submitStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center space-x-3"
                  >
                    <CheckCircle size={20} className="text-green-500" />
                    <div>
                      <h4 className="font-semibold text-green-600">Message Sent!</h4>
                      <p className="text-green-600/80 text-sm">
                        Thank you for reaching out. I'll get back to you within 24 hours.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Error Message */}
                {submitStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center space-x-3"
                  >
                    <AlertCircle size={20} className="text-red-500" />
                    <div>
                      <h4 className="font-semibold text-red-600">Error Sending Message</h4>
                      <p className="text-red-600/80 text-sm">
                        Sorry, there was an error sending your message. Please try again or contact me directly.
                      </p>
                    </div>
                  </motion.div>
                )}

                <form onSubmit={formik.handleSubmit} className="space-y-6">
                  {/* Name and Email */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      label="Full Name"
                      name="name"
                      placeholder="Mayur Bhalgama"
                      required
                    />
                    <FormField
                      label="Email Address"
                      name="email"
                      type="email"
                      placeholder="mayur@example.com"
                      required
                    />
                  </div>

                  {/* Subject */}
                  <FormField
                    label="Subject"
                    name="subject"
                    placeholder="Project Inquiry / Collaboration / Question"
                    required
                  />

                  {/* Budget and Timeline */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="budget" className="block text-sm font-medium text-text">
                        Budget Range
                      </label>
                      <select
                        id="budget"
                        name="budget"
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200"
                        value={formik.values.budget}
                        onChange={formik.handleChange}
                      >
                        <option value="">Select budget range</option>
                        <option value="< $5,000">Less than $5,000</option>
                        <option value="$5,000 - $10,000">$5,000 - $10,000</option>
                        <option value="$10,000 - $25,000">$10,000 - $25,000</option>
                        <option value="$25,000 - $50,000">$25,000 - $50,000</option>
                        <option value="> $50,000">More than $50,000</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="timeline" className="block text-sm font-medium text-text">
                        Project Timeline
                      </label>
                      <select
                        id="timeline"
                        name="timeline"
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200"
                        value={formik.values.timeline}
                        onChange={formik.handleChange}
                      >
                        <option value="">Select timeline</option>
                        <option value="ASAP">ASAP</option>
                        <option value="1-2 weeks">1-2 weeks</option>
                        <option value="1 month">1 month</option>
                        <option value="2-3 months">2-3 months</option>
                        <option value="3+ months">3+ months</option>
                        <option value="Just exploring">Just exploring</option>
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <FormField
                    label="Message"
                    name="message"
                    as="textarea"
                    rows={5}
                    placeholder="Tell me about your project, goals, and how I can help you achieve them..."
                    required
                  />

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isSubmitting || !formik.isValid}
                    className={`w-full flex items-center justify-center space-x-2 px-8 py-4 rounded-lg font-semibold transition-all duration-200 ${
                      isSubmitting || !formik.isValid
                        ? 'bg-text-secondary text-surface cursor-not-allowed'
                        : 'bg-primary text-background hover:bg-secondary shadow-lg hover:shadow-xl'
                    }`}
                    whileHover={!isSubmitting && formik.isValid ? { scale: 1.02 } : {}}
                    whileTap={!isSubmitting && formik.isValid ? { scale: 0.98 } : {}}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-surface border-t-transparent rounded-full animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        <span>Send Message</span>
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>

          {/* Map Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-16"
          >
            <div className="bg-surface border border-border rounded-xl p-6">
              <h3 className="text-xl font-bold text-text mb-4 flex items-center">
                <MapPin size={20} className="mr-2 text-primary" />
                My Location
              </h3>
              
              {/* Embedded Map */}
              <div className="relative h-64 bg-background rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d50323.61899092698!2d-122.48395624692456!3d37.768093625703344!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80859a6d00690021%3A0x4a501367f076adff!2sSan%20Francisco%2C%20CA%2C%20USA!5e0!3m2!1sen!2sus!4v1635787234567!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="San Francisco Location"
                  className="grayscale hover:grayscale-0 transition-all duration-300"
                ></iframe>
                
                {/* Overlay for better integration */}
                <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
              </div>
              
              <p className="text-text-secondary text-sm mt-4">
                Based in San Francisco, but available for remote work worldwide. 
                I'm happy to work across different timezones and travel for the right projects.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Contact