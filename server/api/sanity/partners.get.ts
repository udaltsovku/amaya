import type { H3Event } from 'h3'
import { getQuery, createError } from 'h3'

type PartnerResponse = {
  id: number | null
  name: string | null
  logoUrl: string | null
  link: string | null
  loc_website_title: string | null
  loc_hero_title: string | null
  loc_hero_button: string | null
  loc_signup_title: string | null
  loc_signup_card_title: string | null
  loc_signup_card_email_label: string | null
  loc_signup_card_email_placeholder: string | null
  loc_signup_card_password_label: string | null
  loc_signup_card_password_placeholder: string | null
  loc_signup_card_button: string | null
  loc_congrats_title: string | null
  loc_congrats_button: string | null
  loc_step_1: string | null
  loc_step_2: string | null
  loc_step_3: string | null
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
      loc_website_title: '',
      loc_hero_title: '',
      loc_hero_button: '',
      loc_signup_title: '',
      loc_signup_card_title: '',
      loc_signup_card_email_label: '',
      loc_signup_card_email_placeholder: '',
      loc_signup_card_password_label: '',
      loc_signup_card_password_placeholder: '',
      loc_signup_card_button: '',
      loc_congrats_title: '',
      loc_congrats_button: '',
      loc_step_1: '',
      loc_step_2: '',
      loc_step_3: '',
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
      link,
      loc_website_title,
      loc_hero_title,
      loc_hero_button,
      loc_signup_title,
      loc_signup_card_title,
      loc_signup_card_email_label,
      loc_signup_card_email_placeholder,
      loc_signup_card_password_label,
      loc_signup_card_password_placeholder,
      loc_signup_card_button,
      loc_congrats_title,
      loc_congrats_button,
      loc_step_1,
      loc_step_2,
      loc_step_3,
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
      loc_website_title?: string
      loc_hero_title?: string
      loc_hero_button?: string
      loc_signup_title?: string
      loc_signup_card_title?: string
      loc_signup_card_email_label?: string
      loc_signup_card_email_placeholder?: string
      loc_signup_card_password_label?: string
      loc_signup_card_password_placeholder?: string
      loc_signup_card_button?: string
      loc_congrats_title?: string
      loc_congrats_button?: string
      loc_step_1?: string
      loc_step_2?: string
      loc_step_3?: string
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
    loc_website_title: doc.loc_website_title ?? null,
    loc_hero_title: doc.loc_hero_title ?? null,
    loc_hero_button: doc.loc_hero_button ?? null,
    loc_signup_title: doc.loc_signup_title ?? null,
    loc_signup_card_title: doc.loc_signup_card_title ?? null,
    loc_signup_card_email_label: doc.loc_signup_card_email_label ?? null,
    loc_signup_card_email_placeholder: doc.loc_signup_card_email_placeholder ?? null,
    loc_signup_card_password_label: doc.loc_signup_card_password_label ?? null,
    loc_signup_card_password_placeholder: doc.loc_signup_card_password_placeholder ?? null,
    loc_signup_card_button: doc.loc_signup_card_button ?? null,
    loc_congrats_title: doc.loc_congrats_title ?? null,
    loc_congrats_button: doc.loc_congrats_button ?? null,
    loc_step_1: doc.loc_step_1 ?? null,
    loc_step_2: doc.loc_step_2 ?? null,
    loc_step_3: doc.loc_step_3 ?? null,
  }

  if (fakeRequest) return mapped

  return mapped
})
