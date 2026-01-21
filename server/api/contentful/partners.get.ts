import type { H3Event } from 'h3'
import { getQuery, createError } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  const { contentfulToken } = useRuntimeConfig()
  const query = getQuery(event)

  console.log('qwr', contentfulToken)

  const numberRaw = query.number
  const number =
    typeof numberRaw === 'string' && numberRaw.length > 0
      ? Number(numberRaw)
      : undefined

  const fakeRequest = query.fakeRequest

  if (!contentfulToken) {
    throw createError({ statusCode: 500, statusMessage: 'No CONTENTFUL token on server' })
  }

  if (number === undefined || !Number.isFinite(number)) {
    throw createError({ statusCode: 400, statusMessage: 'Query param "number" is required and must be a number' })
  }

  if (fakeRequest) {
    const res = await $fetch<{
        items?: any[]
        includes?: { Asset?: any[] }
    }>(
        'https://cdn.contentful.com/spaces/mi75wentww24/environments/master/entries',
        {
        headers: { Authorization: `Bearer ${contentfulToken}` },
        query: {
            content_type: 'partner',
            'fields.number': number,
            limit: 1,
            include: 1,
        },
        }
    )

    const entry = res.items?.[0] ?? null
    if (!entry) return null

    const assetId = entry?.fields?.logo?.sys?.id as string | undefined
    const asset = assetId
        ? res.includes?.Asset?.find((a: any) => a?.sys?.id === assetId)
        : null

    const logoUrl =
        asset?.fields?.file?.url
        ? `https:${asset.fields.file.url}`
        : null

    return {
        id: entry.sys?.id ?? null,
        company: entry.fields?.company ?? null,
        number: entry.fields?.number ?? null,
        logoUrl,
    }
  }

  return {
    id: 0,
    company: 'Default',
    number: 1,
    logoUrl: 'https://google.com',
}
})

