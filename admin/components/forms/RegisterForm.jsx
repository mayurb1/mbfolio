'use client'

import { useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

const RegisterForm = ({ onSubmit, isLoading = false }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [usernameEdited, setUsernameEdited] = useState(false)

  const formik = useFormik({
    initialValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must be less than 50 characters')
        .required('Name is required'),
      username: Yup.string()
        .min(3, 'Username must be at least 3 characters')
        .max(30, 'Username must be less than 30 characters')
        .matches(
          /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/,
          'Only lowercase letters, numbers and hyphens'
        )
        .required('Username is required'),
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        )
        .required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm password is required')
    }),
    onSubmit: (values) => {
      // Don't send confirmPassword to backend
      const { confirmPassword: _, ...submitData } = values
      onSubmit(submitData)
    }
  })

  // Derive a URL-safe username suggestion from the display name.
  const toSlug = (value = '') =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 30)
      .replace(/-+$/g, '')

  // Auto-fill the username from the name until the user edits it themselves.
  const handleNameChange = (e) => {
    formik.handleChange(e)
    if (!usernameEdited) {
      formik.setFieldValue('username', toSlug(e.target.value))
    }
  }

  const handleUsernameChange = (e) => {
    setUsernameEdited(true)
    formik.setFieldValue('username', e.target.value.toLowerCase())
  }

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Full Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="John Doe"
          value={formik.values.name}
          onChange={handleNameChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.name && formik.errors.name && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {formik.errors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Username
        </label>
        <div className="flex items-center">
          <span className="inline-flex items-center px-3 py-2 rounded-l-lg border border-r-0 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-sm select-none">
            /profile/
          </span>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-r-lg shadow-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="john-doe"
            value={formik.values.username}
            onChange={handleUsernameChange}
            onBlur={formik.handleBlur}
          />
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Your public portfolio will live at <span className="font-mono">/profile/{formik.values.username || 'username'}</span>
        </p>
        {formik.touched.username && formik.errors.username && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {formik.errors.username}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="admin@example.com"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.email && formik.errors.email && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {formik.errors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            className="w-full px-3 py-2 pr-10 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Create a strong password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-slate-500 hover:text-slate-600" />
            ) : (
              <Eye className="h-5 w-5 text-slate-500 hover:text-slate-600" />
            )}
          </button>
        </div>
        {formik.touched.password && formik.errors.password && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {formik.errors.password}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            className="w-full px-3 py-2 pr-10 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Confirm your password"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5 text-slate-500 hover:text-slate-600" />
            ) : (
              <Eye className="h-5 w-5 text-slate-500 hover:text-slate-600" />
            )}
          </button>
        </div>
        {formik.touched.confirmPassword && formik.errors.confirmPassword && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {formik.errors.confirmPassword}
          </p>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading || !formik.isValid}
          aria-label="Create new admin account"
          className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center">
              <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
              Creating account...
            </div>
          ) : (
            'Create account'
          )}
        </button>
      </div>
    </form>
  )
}

export default RegisterForm