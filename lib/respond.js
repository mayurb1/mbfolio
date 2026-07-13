import { NextResponse } from 'next/server'

// All API responses use the envelope: { data?, message, status } and mirror
// the HTTP status code in the body `status` field (ported from the Express API).

export function ok(data, message, status = 200) {
  return NextResponse.json({ data, message, status }, { status })
}

// Success response without a `data` field (delete / logout / change-password).
export function okMessage(message, status = 200) {
  return NextResponse.json({ message, status }, { status })
}

export function fail(message, status) {
  return NextResponse.json({ message, status }, { status })
}

// Mongoose ValidationError -> { message: 'Validation failed', status: 400, errors }
export function validationError(err) {
  const errors = {}
  Object.keys(err.errors).forEach((key) => {
    errors[key] = err.errors[key].message
  })
  return NextResponse.json(
    { message: 'Validation failed', status: 400, errors },
    { status: 400 }
  )
}

// True for a Mongoose cast error on an _id (the Express code checks err.kind).
export function isObjectIdError(err) {
  return err?.kind === 'ObjectId' || err?.name === 'CastError'
}
