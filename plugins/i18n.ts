import { createI18n } from 'vue-i18n'
import en from '../locales/en.json'
import ru from '../locales/ru.json'

export default defineNuxtPlugin(({ vueApp }) => {
  const route = useRoute()
  const locales = ['en', 'ru', ] // 'de', 'es', 'it', 'pt', 'fr', 'sv', 'nl', 'ja', 'zh'
  
  // Определяем язык из URL (первый сегмент)
  const pathFirstSegment = route.path.split('/')[1]
  const lang = locales.includes(pathFirstSegment) ? pathFirstSegment : 'en'

  const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: lang,
    messages: { en, ru } // Добавь остальные импорты сюда
  })

  vueApp.use(i18n)
})