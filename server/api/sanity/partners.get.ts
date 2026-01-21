import type { H3Event } from 'h3'
import { getQuery, createError } from 'h3'

type PartnerResponse = {
  id: number | null
  name: string | null
  logoUrl: string | null
  link: string | null
}

export default defineEventHandler(async (event: H3Event): Promise<PartnerResponse | null> => {
  const { sanityReadToken, sanityProjectId, sanityDataset } = useRuntimeConfig()
  const query = getQuery(event)

  const idRaw = query.id
  const id =
    typeof idRaw === 'string' && idRaw.length > 0
      ? Number(idRaw)
      : undefined

  const fakeRequest = query.fakeRequest

  if (fakeRequest) {
    return {
      id: 1,
      name: 'Fake Google',
      logoUrl: 'https://cdn.sanity.io/images/pyzqxu80/production/c3938db5ba213a8babed0fd7c45b6ba0245de7c5-2560x866.png?w=256&h=256&fit=max&crop=center&auto=format',
      link: 'https://google.com',
    }
  }

  if (!sanityReadToken) {
    throw createError({ statusCode: 500, statusMessage: 'No SANITY token on server' })
  }

  if (!sanityProjectId) {
    throw createError({ statusCode: 500, statusMessage: 'No SANITY projectId on server' })
  }

  if (!sanityDataset) {
    throw createError({ statusCode: 500, statusMessage: 'No SANITY dataset on server' })
  }

  if (id === undefined || !Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Query param "id" is required and must be a number' })
  }

  const groq = `
    *[_type=="partner" && id==$id][0]{
      id,
      name,
      "logoUrl": logo.asset->url,
      link
    }
  `

  const apiVersion = '2026-01-19'
  const url = `https://${sanityProjectId}.api.sanity.io/v${apiVersion}/data/query/${sanityDataset}`

  const res = await $fetch<{
    result: {
      id?: number
      name?: string
      logoUrl?: string
      link?: string
    } | null
  }>(url, {
    headers: { Authorization: `Bearer ${sanityReadToken}` },
    query: {
      query: groq,
      $id: id,
    },
  })

  const doc = res?.result
  if (!doc) return null

const croppedLogoUrl = (() => {
  const u = doc.logoUrl
  if (!u) return null

  // трансформации работают только для /images/
  if (!u.includes('cdn.sanity.io/images/')) return u

  const sep = u.includes('?') ? '&' : '?'
  return `${u}${sep}w=256&h=256&fit=max&crop=center&auto=format`
  // &fm=png
})()

  const mapped: PartnerResponse = {
    id: typeof doc.id === 'number' ? doc.id : null,
    name: doc.name ?? null,
    logoUrl: croppedLogoUrl,
    link: doc.link ?? null,
  }

  if (fakeRequest) return mapped

  return mapped
})
