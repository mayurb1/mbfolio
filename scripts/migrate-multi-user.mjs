// One-off, idempotent migration to the multi-user model.
//
// 1. Ensures the "primary" user has a URL-safe `username`.
// 2. Backfills `userId` on every pre-existing content document (Category,
//    Project, Skills, Experience, Education) that lacks one, assigning them to
//    the primary user.
// 3. Rebuilds indexes so the new per-user compound unique index on Category is
//    created only after the backfill.
//
// Usage:
//   node --env-file=.env scripts/migrate-multi-user.mjs
//   PRIMARY_USERNAME=mayur node --env-file=.env scripts/migrate-multi-user.mjs
//
// Safe to re-run: documents that already have a userId are skipped.

import mongoose from 'mongoose'
import Users from '../models/users.js'
import Category from '../models/Category.js'
import Project from '../models/Project.js'
import Skills from '../models/Skills.js'
import Experience from '../models/Experience.js'
import Education from '../models/Education.js'

const RESERVED = new Set([
  'admin', 'api', 'profile', 'login', 'logout', 'register', 'dashboard',
  'me', 'auth', 'master', 'health', 'blog', 'about', 'contact', 'settings',
  'null', 'undefined', '_next', 'static', 'public',
])

function slugify(value = '') {
  const slug = String(value)
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 30)
    .replace(/-+$/g, '')
  return slug || 'user'
}

async function ensureUniqueUsername(base, excludeId) {
  let root = slugify(base).slice(0, 26)
  if (RESERVED.has(root)) root = `${root}-1`
  let candidate = root
  let suffix = 1
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const query = { username: candidate }
    if (excludeId) query._id = { $ne: excludeId }
    const existing = await Users.findOne(query).select('_id').lean()
    if (!existing && !RESERVED.has(candidate)) return candidate
    suffix += 1
    candidate = `${root}-${suffix}`
  }
}

async function main() {
  const uri = process.env.MONGO_URI
  if (!uri) throw new Error('MONGO_URI is not defined (pass --env-file=.env)')

  await mongoose.connect(uri, { bufferCommands: false })
  console.log('Connected to MongoDB.')

  // 1. Resolve the primary user.
  const primaryUsername = process.env.PRIMARY_USERNAME
  let primary
  if (primaryUsername) {
    primary = await Users.findOne({ username: primaryUsername.toLowerCase().trim() })
    if (!primary) {
      // Username not set yet — fall back to first user, then assign it.
      primary = await Users.findOne({}).sort({ createdAt: 1 })
    }
  } else {
    primary = await Users.findOne({}).sort({ createdAt: 1 })
  }

  if (!primary) {
    console.log('No users found — nothing to migrate. Register a user first.')
    await mongoose.disconnect()
    return
  }

  // 2. Ensure the primary user has a username.
  if (!primary.username) {
    const desired = primaryUsername || primary.name
    primary.username = await ensureUniqueUsername(desired, primary._id)
    await primary.save()
    console.log(`Set primary user's username -> "${primary.username}" (${primary.email})`)
  } else {
    console.log(`Primary user: "${primary.username}" (${primary.email})`)
  }

  const userId = primary._id

  // 3. Backfill userId on content documents lacking one.
  const collections = [
    ['Category', Category],
    ['Project', Project],
    ['Skills', Skills],
    ['Experience', Experience],
    ['Education', Education],
  ]

  for (const [label, Model] of collections) {
    const missing = await Model.countDocuments({ userId: { $exists: false } })
    const total = await Model.countDocuments({})
    if (missing === 0) {
      console.log(`${label}: ${total} docs, 0 need backfill (skipped).`)
      continue
    }
    const res = await Model.updateMany(
      { userId: { $exists: false } },
      { $set: { userId } }
    )
    console.log(`${label}: backfilled ${res.modifiedCount}/${missing} (of ${total} total).`)
  }

  // 4. Rebuild indexes now that userId is populated (creates the per-user
  //    unique index on Category, etc.). syncIndexes drops stale indexes too.
  console.log('Synchronizing indexes...')
  for (const [label, Model] of collections) {
    await Model.syncIndexes()
    console.log(`  ${label} indexes synced.`)
  }
  await Users.syncIndexes()
  console.log('  Users indexes synced.')

  console.log('\nMigration complete.')
  await mongoose.disconnect()
}

main().catch(async (err) => {
  console.error('Migration failed:', err)
  await mongoose.disconnect().catch(() => {})
  process.exit(1)
})
