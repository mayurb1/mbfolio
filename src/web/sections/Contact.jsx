import { useState, useRef } from 'react'
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
  Calendar,
  Clock,
  Globe,
} from 'lucide-react'
import { LINKS } from '../../data/links'
import Toast from '../ui/Toast'
import Select from '../ui/Select'

// Stable form field component to prevent remounts (and focus loss)
const FormField = ({
  formik,
  label,
  name,
  type = 'text',
  as = 'input',
  required = false,
  ...props
}) => {
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
        className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg border transition-colors duration-200 bg-background text-text placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base ${
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
          className="text-red-500 text-xs sm:text-sm flex items-center space-x-1"
        >
          <AlertCircle size={12} className="sm:w-3.5 sm:h-3.5" />
          <span>{formik.errors[name]}</span>
        </motion.p>
      )}
    </div>
  )
}

const Contact = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  })

  const [submitStatus, setSubmitStatus] = useState(null) // 'success', 'error', or null
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  const validationSchema = Yup.object({
    name: Yup.string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be less than 50 characters')
      .required('Name is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    subject: Yup.string().required('Subject is required'),
    message: Yup.string()
      .min(10, 'Message must be at least 10 characters')
      .max(1000, 'Message must be less than 1000 characters')
      .required('Message is required'),
    budget: Yup.string().optional(),
    timeline: Yup.string().optional(),
  })

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
      budget: '',
      timeline: '',
      botField: '',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      setIsSubmitting(true)
      setSubmitStatus(null)
      setErrorMessage('')

      const encode = data =>
        Object.keys(data)
          .map(
            key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key])
          )
          .join('&')

      try {
        // 24-hour per-email rate limit (client-side)
        const emailKey = (values.email || '').trim().toLowerCase()
        const storageKey = `contact:lastSubmit:${emailKey}`
        const DAY_MS = 24 * 60 * 60 * 1000
        const now = Date.now()
        const last = parseInt(localStorage.getItem(storageKey) || '0', 10)
        if (emailKey && last && now - last < DAY_MS) {
          const remainingMs = DAY_MS - (now - last)
          const hrs = Math.floor(remainingMs / (60 * 60 * 1000))
          const mins = Math.floor(
            (remainingMs % (60 * 60 * 1000)) / (60 * 1000)
          )
          setSubmitStatus('error')
          setErrorMessage(
            `You have already submitted a message with this email in the last 24 hours. Please try again in ${hrs}h ${mins}m.`
          )
          return
        }

        const formspreeId = import.meta.env.VITE_FORMSPREE_FORM_ID
        const apiUrl = import.meta.env.VITE_CONTACT_API_URL
        if (apiUrl) {
          const emailSubject = `Portfolio Contact — ${values.subject} from ${values.name}`
          const lines = [
            'Hello Mayur,',
            '',
            'You have a new contact request via your portfolio:',
            '',
            `• Name: ${values.name}`,
            `• Email: ${values.email}`,
            `• Subject: ${values.subject}`,
          ]
          if (values.budget) lines.push(`• Budget: ${values.budget}`)
          if (values.timeline) lines.push(`• Timeline: ${values.timeline}`)
          lines.push(
            '',
            'Message:',
            values.message,
            '',
            '—',
            'Sent from mayurbhalgama.dev'
          )
          const emailText = lines.join('\n')

          const body = {
            subject: emailSubject,
            reply_to: values.email,
            message: emailText,
            name: values.name,
            email: values.email,
          }
          if (values.budget) body.budget = values.budget
          if (values.timeline) body.timeline = values.timeline

          const res = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify(body),
          })

          if (!res.ok) throw new Error('Contact API request failed')
        } else if (formspreeId) {
          const emailSubject = `Portfolio Contact — ${values.subject} from ${values.name}`
          const lines = [
            'Hello Mayur,',
            '',
            'You have a new contact request via your portfolio:',
            '',
            `• Name: ${values.name}`,
            `• Email: ${values.email}`,
            `• Subject: ${values.subject}`,
          ]
          if (values.budget) lines.push(`• Budget: ${values.budget}`)
          if (values.timeline) lines.push(`• Timeline: ${values.timeline}`)
          lines.push(
            '',
            'Message:',
            values.message,
            '',
            '—',
            'Sent from mayurbhalgama.dev'
          )
          const emailText = lines.join('\n')

          const body = {
            subject: emailSubject,
            reply_to: values.email,
            message: emailText,
            name: values.name,
            email: values.email,
          }
          if (values.budget) body.budget = values.budget
          if (values.timeline) body.timeline = values.timeline

          const res = await fetch(`https://formspree.io/f/${formspreeId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify(body),
          })

          if (!res.ok) throw new Error('Formspree request failed')
        } else {
          const payload = {
            'form-name': 'contact',
            name: values.name,
            email: values.email,
            subject: values.subject,
            message: values.message,
            budget: values.budget,
            timeline: values.timeline,
            'bot-field': values.botField || '',
          }
          const res = await fetch('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: encode(payload),
          })
          if (!res.ok) throw new Error('Netlify request failed')
        }

        if (window.gtag) {
          window.gtag('event', 'form_submit', {
            event_category: 'engagement',
            event_label: 'contact_form',
          })
        }

        setSubmitStatus('success')
        resetForm()
        if (formRef.current) {
          try {
            formRef.current.reset()
          } catch (e) {
            // ignore reset errors
          }
        }
        // Save last submit timestamp for this email
        if (emailKey) localStorage.setItem(storageKey, String(now))
        setToastOpen(true)
      } catch (error) {
        console.error('Error submitting form:', error)
        setSubmitStatus('error')
        if (!errorMessage)
          setErrorMessage(
            'Sorry, there was an error sending your message. Please try again later.'
          )
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'mayurbhalgama2419@gmail.com',
      href: LINKS.email,
      description: 'Send me an email anytime',
    },
    {
      icon: Phone,
      label: 'Phone',
      value: '+91 8160146264',
      href: 'tel:+918160146264',
      description: 'Call during business hours',
    },
    {
      icon: MapPin,
      label: 'Location',
      value: 'Ahmedabad, India',
      href: 'https://maps.google.com/?q=Ahmedabad,India',
      description: 'Remote collaboration worldwide',
    },
  ]

  return (
    <section id="contact" className="py-24 lg:py-40 bg-background" ref={ref}>
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
              Let&apos;s Work Together
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Have a project in mind? I&apos;d love to hear about it. Send me a
              message and let&apos;s create something amazing together.
            </p>
          </motion.div>

          {/* Instruction about unique email submission */}

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-1 space-y-6 sm:space-y-8 order-2 lg:order-1"
            >
              {/* Contact Info Cards */}
              <div className="space-y-4 sm:space-y-6">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon
                  return (
                    <motion.a
                      key={index}
                      href={info.href}
                      target={
                        info.href.startsWith('http') ? '_blank' : undefined
                      }
                      rel={
                        info.href.startsWith('http')
                          ? 'noopener noreferrer'
                          : undefined
                      }
                      className="block p-4 sm:p-6 bg-surface border border-border rounded-xl hover:shadow-lg transition-all duration-200 group"
                      whileHover={{ scale: 1.02 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={inView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                    >
                      <div className="flex items-start space-x-3 sm:space-x-4">
                        <div className="p-2.5 sm:p-3 bg-primary/10 rounded-lg group-hover:bg-primary group-hover:text-background transition-colors duration-200 flex-shrink-0">
                          <Icon
                            size={20}
                            className="sm:w-6 sm:h-6 text-primary group-hover:text-background"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-text mb-1 text-sm sm:text-base">
                            {info.label}
                          </h3>
                          <p className="text-primary font-medium mb-1 text-sm sm:text-base break-all">
                            {info.value}
                          </p>
                          <p className="text-text-secondary text-xs sm:text-sm">
                            {info.description}
                          </p>
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
                className="p-4 sm:p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-xl"
              >
                <h3 className="font-semibold text-text mb-4 flex items-center text-sm sm:text-base">
                  <Calendar
                    size={18}
                    className="sm:w-5 sm:h-5 mr-2 text-primary"
                  />
                  Availability
                </h3>
                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span className="text-text">
                      Available for new projects
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-text-secondary">
                    <Clock
                      size={12}
                      className="sm:w-3.5 sm:h-3.5 flex-shrink-0"
                    />
                    <span>Response time: Within 24 hours</span>
                  </div>
                  <div className="flex items-center space-x-2 text-text-secondary">
                    <Globe
                      size={12}
                      className="sm:w-3.5 sm:h-3.5 flex-shrink-0"
                    />
                    <span>Timezone: IST (UTC+5:30)</span>
                  </div>
                </div>
              </motion.div>

              {/* Social Links */}
              {/* <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 1.0 }}
                className="text-center"
              >
                <h3 className="font-semibold text-text mb-4 text-sm sm:text-base">
                  Connect With Me
                </h3>
                <div className="flex justify-center space-x-3 sm:space-x-4">
                  {socialLinks.map((social, index) => {
                    const Icon = social.icon
                    return (
                      <motion.a
                        key={index}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-2.5 sm:p-3 bg-surface border border-border rounded-lg text-text-secondary transition-colors duration-200 ${social.color}`}
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label={`Visit my ${social.label} profile`}
                      >
                        <Icon size={18} className="sm:w-5 sm:h-5" />
                      </motion.a>
                    )
                  })}
                </div>
              </motion.div> */}
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-2 order-1 lg:order-2"
            >
              <div className="bg-surface border border-border rounded-xl p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-text mb-2">
                  Send Me a Message
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary bg-background border border-border rounded-md px-3 py-2 mb-4">
                  Note: Each unique email can submit the form{' '}
                  <span className="text-primary font-medium">
                    only once within 24 hours
                  </span>
                  . Please fill in the details carefully.
                </p>

                {/* Success Message */}
                {submitStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start space-x-3"
                  >
                    <CheckCircle
                      size={20}
                      className="text-green-500 flex-shrink-0 mt-0.5"
                    />
                    <div>
                      <h4 className="font-semibold text-green-600 text-sm sm:text-base">
                        Message Sent!
                      </h4>
                      <p className="text-green-600/80 text-xs sm:text-sm">
                        Thank you for reaching out. I&apos;ll get back to you
                        within 24 hours.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Error Message */}
                {submitStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start space-x-3"
                  >
                    <AlertCircle
                      size={20}
                      className="text-red-500 flex-shrink-0 mt-0.5"
                    />
                    <div>
                      <h4 className="font-semibold text-red-600 text-sm sm:text-base">
                        Error Sending Message
                      </h4>
                      <p className="text-red-600/80 text-xs sm:text-sm">
                        {errorMessage ||
                          'Sorry, there was an error sending your message. Please try again or contact me directly.'}
                      </p>
                    </div>
                  </motion.div>
                )}

                <form
                  name="contact"
                  method="POST"
                  data-netlify="true"
                  data-netlify-honeypot="bot-field"
                  onSubmit={formik.handleSubmit}
                  ref={formRef}
                  className="space-y-4 sm:space-y-6"
                >
                  {/* Netlify hidden fields */}
                  <input type="hidden" name="form-name" value="contact" />
                  <input
                    type="hidden"
                    name="bot-field"
                    value={formik.values.botField}
                    onChange={formik.handleChange}
                  />
                  {/* Name and Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <FormField
                      formik={formik}
                      label="Full Name"
                      name="name"
                      placeholder="Mayur Bhalgama"
                      required
                    />
                    <FormField
                      formik={formik}
                      label="Email Address"
                      name="email"
                      type="email"
                      placeholder="mayur@example.com"
                      required
                    />
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-text"
                    >
                      Subject<span className="text-red-500 ml-1">*</span>
                    </label>
                    <Select
                      id="subject"
                      name="subject"
                      value={formik.values.subject}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="sm:py-3 sm:pl-4"
                    >
                      <option value="">Select subject</option>
                      <option value="Project Inquiry">Project Inquiry</option>
                      <option value="Collaboration">Collaboration</option>
                      <option value="General Question">General Question</option>
                      <option value="Bug Report">Bug Report</option>
                      <option value="Speaking/Workshop">
                        Speaking/Workshop
                      </option>
                    </Select>
                    {formik.touched.subject && formik.errors.subject && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-xs sm:text-sm flex items-center space-x-1"
                      >
                        <AlertCircle size={12} className="sm:w-3.5 sm:h-3.5" />
                        <span>{formik.errors.subject}</span>
                      </motion.p>
                    )}
                  </div>

                  {/* Budget and Timeline */}
                  {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <label
                        htmlFor="budget"
                        className="block text-sm font-medium text-text"
                      >
                        Budget Range
                      </label>
                      <Select
                        id="budget"
                        name="budget"
                        value={formik.values.budget}
                        onChange={formik.handleChange}
                        className="sm:py-3 sm:pl-4"
                      >
                        <option value="">Select budget range</option>
                        <option value="< $5,000">Less than $5,000</option>
                        <option value="$5,000 - $10,000">
                          $5,000 - $10,000
                        </option>
                        <option value="$10,000 - $25,000">
                          $10,000 - $25,000
                        </option>
                        <option value="$25,000 - $50,000">
                          $25,000 - $50,000
                        </option>
                        <option value="> $50,000">More than $50,000</option>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="timeline"
                        className="block text-sm font-medium text-text"
                      >
                        Project Timeline
                      </label>
                      <Select
                        id="timeline"
                        name="timeline"
                        value={formik.values.timeline}
                        onChange={formik.handleChange}
                        className="sm:py-3 sm:pl-4"
                      >
                        <option value="">Select timeline</option>
                        <option value="ASAP">ASAP</option>
                        <option value="1-2 weeks">1-2 weeks</option>
                        <option value="1 month">1 month</option>
                        <option value="2-3 months">2-3 months</option>
                        <option value="3+ months">3+ months</option>
                        <option value="Just exploring">Just exploring</option>
                      </Select>
                    </div>
                  </div> */}

                  {/* Message */}
                  <FormField
                    formik={formik}
                    label="Message"
                    name="message"
                    as="textarea"
                    rows={4}
                    placeholder="Tell me about your project, goals, and how I can help you achieve them..."
                    required
                  />

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isSubmitting || !formik.isValid}
                    className={`w-full flex items-center justify-center space-x-2 px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-semibold transition-all duration-200 text-sm sm:text-base ${
                      isSubmitting || !formik.isValid
                        ? 'bg-text-secondary text-surface cursor-not-allowed'
                        : 'bg-primary text-background hover:bg-secondary shadow-lg hover:shadow-xl'
                    }`}
                    whileHover={
                      !isSubmitting && formik.isValid ? { scale: 1.02 } : {}
                    }
                    whileTap={
                      !isSubmitting && formik.isValid ? { scale: 0.98 } : {}
                    }
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-surface border-t-transparent rounded-full animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send size={18} className="sm:w-5 sm:h-5" />
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
            className="mt-12 lg:mt-16"
          >
            <div className="bg-surface border border-border rounded-xl p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-text mb-4 flex items-center">
                <MapPin size={18} className="sm:w-5 sm:h-5 mr-2 text-primary" />
                My Location
              </h3>

              {/* Embedded Map */}
              <div className="relative h-48 sm:h-64 bg-background rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps?q=Ahmedabad,+India&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ahmedabad Location"
                  className="grayscale hover:grayscale-0 transition-all duration-300"
                ></iframe>

                {/* Overlay for better integration */}
                <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
              </div>

              <p className="text-text-secondary text-xs sm:text-sm mt-4">
                <span className="block sm:inline">
                  <span className="font-medium text-text">Location:</span>{' '}
                  Ahmedabad, India.
                </span>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
      {/* Toast */}
      <Toast
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        variant="success"
        title="Message sent"
        description="Thanks for reaching out! I'll reply within 24 hours."
      />
    </section>
  )
}

export default Contact
