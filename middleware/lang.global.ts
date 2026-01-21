// export default defineNuxtRouteMiddleware((to) => {
//   const locales = ['en', 'ru', 'de', 'es', 'it', 'pt', 'fr', 'sv', 'nl', 'ja', 'zh']
//   const pathFirstSegment = to.path.split('/')[1]

//   if (!locales.includes(pathFirstSegment)) {
//     // Если языка нет в пути, подставляем 'en'
//     return navigateTo(`/en${to.fullPath}`, { redirectCode: 302 })
//   }
// })

export default defineNuxtRouteMiddleware((to) => {
  const locales = ['en', 'ru', 'de', 'es', 'it', 'pt', 'fr', 'sv', 'nl', 'ja', 'zh']
  
  // Разбиваем путь на сегменты: /en/2 -> ["", "en", "2"]
  const segments = to.path.split('/').filter(Boolean)
  
  let locale = segments[0]
  let id = segments[1]

  let shouldRedirect = false
  let newPath = ''

  // 1. Проверяем локаль
  if (!locales.includes(locale)) {
    locale = 'en'
    // Если первый сегмент не локаль, значит это может быть ID или вообще пустой путь
    // В этом случае нам нужно пересобрать всё заново
    id = segments[0] || '0'
    shouldRedirect = true
  }

  // 2. Проверяем ID (если его нет или он не второй сегмент)
  if (id === undefined) {
    id = '0'
    shouldRedirect = true
  }

  // Если сработал любой из флагов, редиректим на правильную структуру
  if (shouldRedirect) {
    // Собираем путь вида /en/0
    return navigateTo(`/${locale}/${id}`, { redirectCode: 302 })
  }
})