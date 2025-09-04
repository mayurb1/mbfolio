const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    bio: { type: String, maxlength: 1000 },
    profileImage: { type: String },
    linkedUrl: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return true // Allow empty string
          return /^https?:\/\/.+\..+/.test(v)
        },
        message: 'Please enter a valid LinkedIn URL',
      },
    },
    githubUrl: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return true // Allow empty string
          return /^https?:\/\/(www\.)?github\.com\/.+/.test(v)
        },
        message: 'Please enter a valid GitHub URL',
      },
    },
    location: {
      coordinates: {
        latitude: {
          type: Number,
          min: [-90, 'Latitude must be between -90 and 90'],
          max: [90, 'Latitude must be between -90 and 90'],
        },
        longitude: {
          type: Number,
          min: [-180, 'Longitude must be between -180 and 180'],
          max: [180, 'Longitude must be between -180 and 180'],
        },
      },
      address: {
        type: String,
        trim: true,
        maxLength: [200, 'Address cannot exceed 200 characters'],
      },
      city: {
        type: String,
        trim: true,
        maxLength: [100, 'City cannot exceed 100 characters'],
      },
      state: {
        type: String,
        trim: true,
        maxLength: [100, 'State cannot exceed 100 characters'],
      },
      country: {
        type: String,
        trim: true,
        maxLength: [100, 'Country cannot exceed 100 characters'],
      },
      zipCode: {
        type: String,
        trim: true,
        maxLength: [20, 'Zip code cannot exceed 20 characters'],
      },
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Users', userSchema)
