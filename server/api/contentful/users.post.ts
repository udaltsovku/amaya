import { readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const space = config.contentfulSpace
  const env = config.contentfulEnv || 'master'
  const token = config.contentfulCmaToken

  console.log(config, 'qw')

  if (!space || !token) {
    throw createError({ statusCode: 500, statusMessage: 'Contentful CMA env missing' })
  }

  const body = await readBody<{ email?: string; password?: string }>(event)
  const email = body?.email?.trim()
  const password = body?.password?.trim()

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'email and password required' })
  }

  const url = `https://api.contentful.com/spaces/${space}/environments/${env}/entries`

  // создаём entry типа user
  const entry = await $fetch<any>(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/vnd.contentful.management.v1+json',
      'X-Contentful-Content-Type': 'user',
    },
    body: {
      fields: {
        email: { 'en-US': email },
        password: { 'en-US': password },
      },
    },
  })

  // если хочешь, чтобы он читался через CDN (Delivery API), надо опубликовать
  const published = await $fetch<any>(
    `https://api.contentful.com/spaces/${space}/environments/${env}/entries/${entry.sys.id}/published`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Contentful-Version': String(entry.sys.version),
      },
    }
  )

  return { id: published.sys.id }
})
