import { defineEventHandler, createError } from 'h3'
import type { EventHandler } from 'h3'

const handler: EventHandler = defineEventHandler(async (event) => {
  if (!process.dev) throw createError({ statusCode: 403, statusMessage: 'Only for local dev' })

  const config = useRuntimeConfig()
  const { sanityProjectId: projectId, sanityDataset: dataset, sanityWriteToken: token, sanityApiVersion: apiVersion } = config

  const url = `https://${projectId}.api.sanity.io/v${apiVersion}/data/mutate/${dataset}`

  const mutations = Array.from({ length: 98 }, (_, i) => ({
    createIfNotExists: {
      _type: 'partner',
      _id: `partner-${i + 3}`,
      id: i + 3,
    },
  }))

  return await $fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: { mutations },
  })
})

export default handler