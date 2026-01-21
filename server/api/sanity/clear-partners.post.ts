import { defineEventHandler, createError } from 'h3'
import type { EventHandler } from 'h3'

const handler: EventHandler = defineEventHandler(async (event) => {
  // 1. Только локалка
  if (!process.dev) throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

  const config = useRuntimeConfig()
  const { sanityProjectId: projectId, sanityDataset: dataset, sanityWriteToken: token, sanityApiVersion: apiVersion } = config

  // Ссылка для мутаций
  const url = `https://${projectId}.api.sanity.io/v${apiVersion}/data/mutate/${dataset}`

  // 2. Массовое удаление через запрос (query)
  // Мы говорим Sanity: "Удали все документы, где _type == 'partner'"
  const body = {
    mutations: [
      {
        delete: {
          query: "*[_type == 'partner']"
        }
      }
    ]
  }

  try {
    const res = await $fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body
    })
    return { success: true, res }
  } catch (e: any) {
    throw createError({ statusCode: 500, statusMessage: e?.data?.error?.message || 'Delete Error' })
  }
})

export default handler