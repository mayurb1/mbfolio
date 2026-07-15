import * as Yup from 'yup'

// Shared Yup schema for the `endDate` field used by EducationForm and
// ExperienceForm. Verified byte-identical between the two before extraction.
export const endDateSchema = Yup.mixed()
  .nullable()
  .test('is-date-or-present', 'End date must be a valid date or "Present"', function(value) {
    if (!value || value === '' || value === 'Present' || value.toLowerCase() === 'present') {
      return true
    }
    const date = new Date(value)
    return !isNaN(date.getTime())
  })
  .when('startDate', {
    is: (startDate) => startDate && startDate !== '',
    then: (schema) => schema.test('is-after-start', 'End date must be after start date', function(value) {
      if (!value || value === 'Present' || value.toLowerCase() === 'present') {
        return true
      }
      const startDate = new Date(this.parent.startDate)
      const endDate = new Date(value)
      return endDate >= startDate
    })
  })
  .test('not-future', 'End date cannot be in the future', function(value) {
    if (!value || value === 'Present' || value.toLowerCase() === 'present') {
      return true
    }
    const date = new Date(value)
    return date <= new Date()
  })

// Derive the initial `startDate` / `endDate` string values from a stored entity
// (education or experience). Returns '' / 'Present' as the inline code did.
export const getInitialDateRange = (entity) => {
  if (!entity) return { startDate: '', endDate: '' }

  return {
    startDate: entity.startDate ? new Date(entity.startDate).toISOString().split('T')[0] : '',
    endDate: entity.isOngoing ? 'Present' : (entity.endDate ? new Date(entity.endDate).toISOString().split('T')[0] : '')
  }
}

// Convert the form's date/isOngoing values into the payload shape expected by
// the API. Spread into the cleaned submit values.
export const serializeDateRange = (values) => ({
  startDate: values.startDate ? new Date(values.startDate) : null,
  endDate: values.endDate && values.endDate.toLowerCase() !== 'present' ? new Date(values.endDate) : null,
  isOngoing: values.endDate && values.endDate.toLowerCase() === 'present'
})
