export default defineNuxtRouteMiddleware((to) => {
  const locales = ['en', 'ru', 'de', 'es', 'it', 'pt', 'fr', 'sv', 'nl', 'ja', 'zh']
  
  // Убираем пустые части и получаем массив сегментов
  const segments = to.path.split('/').filter(Boolean)
  
  let targetLocale = ''
  let targetId = ''

  // Сценарий А: Пустой путь "/"
  if (segments.length === 0) {
    targetLocale = 'en'
    targetId = '0'
  } 
  // Сценарий Б: Только один сегмент (например, "/ru" или "/5")
  else if (segments.length === 1) {
    if (locales.includes(segments[0])) {
      targetLocale = segments[0]
      targetId = '0'
    } else {
      targetLocale = 'en'
      targetId = segments[0]
    }
  } 
  // Сценарий В: Путь уже имеет 2+ сегмента
  else {
    targetLocale = locales.includes(segments[0]) ? segments[0] : 'en'
    targetId = segments[1]
  }

  const targetPath = `/${targetLocale}/${targetId}`

  // Если мы уже на нужном пути — выходим (защита от цикла)
  if (to.path === targetPath) return

  // Редирект с сохранением всех query-параметров (?data=...)
  return navigateTo({
    path: targetPath,
    query: to.query
  }, { redirectCode: 302 })
})