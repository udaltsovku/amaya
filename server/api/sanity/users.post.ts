import { readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const projectId = config.sanityProjectId
  const dataset = config.sanityDataset
  const token = config.sanityWriteToken
  const apiVersion = config.sanityApiVersion

  if (!projectId || !dataset || !token) {
    throw createError({ statusCode: 500, statusMessage: 'Sanity env missing' })
  }

  const body = await readBody<{ email?: string; password?: string; partner?: string }>(event)
  const email = body?.email?.trim()
  const password = body?.password?.trim()
  const partner = body?.partner?.trim()

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'email and password required' })
  }

  // sanity mutations endpoint
  const url = `https://${projectId}.api.sanity.io/v${apiVersion}/data/mutate/${dataset}`

  // создаём документ типа user
  const mutationRes = await $fetch<any>(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: {
      mutations: [
        {
          create: {
            _type: 'user',
            email,
            password,
            partner: partner ?? null,
          },
        },
      ],
    },
  })

  // вернём id созданного документа
  const createdId = mutationRes?.results?.[0]?.id ?? null
  return { id: createdId }
})
