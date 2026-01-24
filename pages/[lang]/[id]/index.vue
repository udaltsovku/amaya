<script setup lang="ts">
import { track } from '@vercel/analytics';

definePageMeta({
  layout: "default",
});

const cms = ref('sanity');

const route = useRoute();

// Create Link
function encodeData(data: { id: number; app: string }) {
  return btoa(JSON.stringify(data))
}

const url = `/?data=${encodeData({ id: 2, app: 'dino1' })}`

const urlData = computed<{ id: number; app: string } | null>(() => {
  try {
    return route.query.data
      ? JSON.parse(atob(String(route.query.data)))
      : null
  } catch {
    return null
  }
})
const id = computed(() => route.params.id);
const app = computed(() => urlData.value?.app ?? null)


const email = ref('');

const emailC = computed({
  get: () => email.value,
  set: v => {
    email.value = v.toLowerCase();
  }
});

const password = ref('');

const passwordC = computed({
  get: () => password.value,
  set: v => {
    password.value = v.toLowerCase();
  }
});

const loading = ref<boolean>(false)
const success = ref<boolean>(false)

const { data, pending, error } = useLazyFetch(`/api/${cms.value}/partners`, {
  immediate: !isNaN(Number(id.value)),
  query: {
    id: id.value,
  },
  server: true,
})

const err = ref(false);
const errorReason = ref<null | number>(null); // 1 - error data, 2 - network error

const submit = async () => {
  err.value = false
  errorReason.value = null
  success.value = false

  if (!email.value || !password.value) {
    err.value = true;
    errorReason.value = 1
    return
  }

  loading.value = true
  try {
    await $fetch(`/api/${cms.value}/users`, {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value,
        partner: id.value || route.params.id || null,
      },
    })

    success.value = true
    // email.value = ''
    // password.value = ''
  } catch (e: any) {
    err.value = true;
    errorReason.value = 2
  } finally {
    loading.value = false
    step.value = step.value = 2;

    track('Sign Up Completed', {
      app: 'Diner',
      partner: typeof id.value === 'string' ? String(id.value) : 'No partner',
    });
  }
}
const router = useRouter();

const step = computed({
  get() {
    const s = Number(route.query.step);
    return isNaN(s) ? 0 : s;
  },
  set(newStep) {
    // push добавляет шаг в историю браузера
    router.push({
      query: {
        ...route.query,
        step: newStep || undefined, // если 0, убираем из URL для чистоты
      },
    });
  }
});

function openAppStore() {
  window.open('https://apps.apple.com/app/id6447677737', '_blank', 'noopener,noreferrer');
  track('App Store Page Opened', {
    app: 'Diner',
    partner: typeof id.value === 'string' ? String(id.value) : 'No partner',
  });
}

function nextStep() {
  if (loading.value) return; // Защита от кликов во время любых сетевых запросов

  if (step.value !== 2) {
    if (step.value === 0) {
      track('Sign Up Started', {
        app: 'Diner',
        partner: typeof id.value === 'string' ? String(id.value) : 'No partner',
      });
      step.value = 1;
    }
  } else {
    openAppStore();
  }
}

function prevStep() {
  step.value = step.value - 1;
}

useHead({
  meta: [
    {
      name: 'theme-color',
      content: computed(() => step.value === 0 ? '#ffffff' : '#F97A19')
    }
  ]
})

const isDev = process.dev
const seeding = ref(false)

async function runSeed() {
  seeding.value = true
  try {
    const res = await $fetch('/api/sanity/seed-partners', { method: 'POST' })

    alert('Готово, бро! 100 партнеров в базе.')
    console.log(res)
  } catch (e) {
    alert('Ошибка, глянь консоль')
    console.error(e)
  } finally {
    seeding.value = false
  }
}

async function runClearSeed() {
  seeding.value = true
  try {
    const res = await $fetch('/api/sanity/clear-partners', { method: 'POST' })

    alert('Готово, бро! 100 партнеров в базе.')
    console.log(res)
  } catch (e) {
    alert('Ошибка, глянь консоль')
    console.error(e)
  } finally {
    seeding.value = false
  }
}

// 2. Управляем цветом фона страницы (для оверскролла сверху и снизу)
// watch(step, (newStep) => {
//   if (process.client) { // Выполняем только в браузере
//     const html = document.documentElement
//     const body = document.body

//     if (newStep === 0) {
//       // Шаг 0: Верх белый (через градиент), низ оранжевый
//       html.style.background = 'linear-gradient(to bottom, #ffffff 50%, #F97A19 50%)'
//       body.style.backgroundColor = 'transparent'
//     } else {
//       // Шаг 1 и далее: Всё оранжевое
//       html.style.background = '#F97A19'
//       body.style.backgroundColor = '#F97A19'
//     }
//   }
// }, { immediate: true })

const isLandscape = ref(false);

// Функция проверки ориентации
const updateOrientation = () => {
  if (process.client) {
    isLandscape.value = window.innerWidth > window.innerHeight;
  }
};

const passwordHidden = ref(true);
const btnRef = ref<HTMLButtonElement | null>(null)
const textRef = ref<HTMLSpanElement | null>(null)
const fontSize = ref<number | null>(null)

const adjustFontSize = async () => {
  await nextTick()
  if (!btnRef.value || !textRef.value) return

  // 1. Сбрасываем кастомный размер, чтобы CSS медиа-запросы применили базу
  fontSize.value = null
  await nextTick()

  // 2. Берем размер, который применил CSS (16, 20 или 34px)
  let currentSize = parseFloat(window.getComputedStyle(textRef.value).fontSize)
  const containerWidth = btnRef.value.clientWidth - 20; // -20 для отступов внутри

  // 3. Уменьшаем, если текст шире кнопки
  while (textRef.value.offsetWidth > containerWidth && currentSize > 8) {
    currentSize -= 1
    fontSize.value = currentSize
    await nextTick() // Ждем перерисовки для точного замера
  }
}

onMounted(() => {
  adjustFontSize()
  updateOrientation();
  window.addEventListener('resize', updateOrientation);
  // На мобилках resize не всегда срабатывает при повороте
  window.addEventListener('orientationchange', updateOrientation);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', adjustFontSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateOrientation);
  window.removeEventListener('orientationchange', updateOrientation);
});
</script>

<template>
  <div class="page">
    <!-- <button 
        :disabled="seeding" 
        @click="runSeed"
        class="seed-btn"
      >
        {{ seeding ? 'Заливаю...' : 'Сгенерить 100 партнеров' }}
      </button>
    <button 
        :disabled="seeding" 
        @click="runClearSeed"
        class="seed-btn"
      >
        {{ seeding ? 'Заливаю...' : 'Удалить партнеров' }}
      </button> -->
    <div class="page__inner">
      <header :class="['page__header', { 'page__header--hidden': step !== 0 }]">
        <div class="page__header-inner">
          <div class="page__logo-container">
            <div v-if="pending" class="page__logo-skeleton">
              <div class="page__logo-skeleton-spinner"></div>
            </div>

            <template v-else-if="data?.logoUrl">
              <img
                v-if="cms === 'contentful'"
                class="page__logo"
                :src="`${data?.logoUrl}?w=200&h=100&fit=fill&f=center`"
                alt=""
                width="72"
                height="72"
              />
              <img
                v-else-if="cms === 'sanity'"
                class="page__logo"
                :src="`${data?.logoUrl}`"
                alt=""
                width="72"
                height="72"
              />
            </template>

            <div v-else class="page__logo page__logo--background"></div>
          </div>

          <div class="page__header-divider"></div>

          <PageLogo class="page__logo" />
        </div>
      </header>

      <section class="page__content">
        <transition name="icons-fade" mode="out-in">
          <svg v-if="step !== 0" class="page__back" @click="prevStep" aria-label="Back" role="button" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M14.6475 2.47263C15.2925 1.83442 16.3328 1.83994 16.971 2.48495L18.3577 3.88644C18.9959 4.53146 18.9904 5.57172 18.3454 6.20993L12.5209 11.973L18.3515 17.8036C18.9931 18.4452 18.9931 19.4855 18.3515 20.1271L16.9574 21.5212C16.3158 22.1628 15.2755 22.1628 14.6339 21.5212L6.5382 13.4255C5.84382 12.7311 5.8078 11.2191 6.509 10.5253L14.6475 2.47263Z" fill="#ad5d20"/>
          </svg>
        </transition>
      
        <div class="page__content-inner">
          <ClientOnly>
            <transition name="slide-up-down-fast" mode="out-in">
              <div v-if="step === 0" key="s0" class="page__title page__title--first" v-html="data?.loc_hero_title ? data?.loc_hero_title : $t('page_1_title')"></div>
              <div v-else-if="step === 1" key="s1" class="page__title page__title--secondary" v-html="data?.loc_signup_title ? data?.loc_signup_title : $t('page_2_title')"></div>
              <div v-else-if="step === 2" key="s2" class="page__title page__title--third" v-html="data?.loc_congrats_title ? data?.loc_congrats_title : $t('page_3_title')"></div>
            </transition>
          </ClientOnly>

          <div class="page__main-area" style="position: relative; width: 100%;">
            <transition name="card-transition" mode="out-in">
              <div v-if="step === 0" key="step0" class="page__step-wrapper">
                <picture v-if="step === 0" class="page__hero-picture">
                  <source 
                    media="(min-width: 768px)" 
                    srcset="@/assets/images/hero-large.webp 1x, @/assets/images/hero-large@2x.webp 2x" 
                    type="image/webp"
                  >
                  <source 
                    media="(min-width: 390px)" 
                    srcset="@/assets/images/hero-medium.webp 1x, @/assets/images/hero-medium@2x.webp 2x" 
                    type="image/webp"
                  >
                  <source 
                    srcset="@/assets/images/hero-small.webp 1x, @/assets/images/hero-small@2x.webp 2x" 
                    type="image/webp"
                  >
                  <img 
                    src="@/assets/images/hero-small.png" 
                    alt="Hero" 
                    class="page__hero-img"
                    fetchpriority="high"
                    width="175"
                    height="175"
                  >
                </picture>
                <ClientOnly>
                  <button class="page__button" @click="nextStep" ontouchstart="" v-fit-text>
                    {{ data?.loc_hero_button ? data?.loc_hero_button : $t('page_1_button') }}
                  </button>
                </ClientOnly>
              </div>

              <div v-else-if="step === 1" key="step1" class="page__card-wrapper">
                <div class="page__card">
                  <div class="page__card-title">{{ data?.loc_signup_card_title ? data?.loc_signup_card_title : $t('instructions_1') }}</div>
                  <div class="page__form">
                    <div class="page__input-group">
                      <label class="page__label" for="email">{{ data?.loc_signup_card_email_label ? data?.loc_signup_card_email_label : $t('page_2_username') }}</label>
                      <input id="email" v-model="emailC" class="page__input" type="email" :placeholder="data?.loc_signup_card_email_placeholder ? data?.loc_signup_card_email_placeholder : $t('page_2_username')" :disabled="loading" autocorrect="off" autocapitalize="none" spellcheck="false" />
                    </div>
                    <div class="page__input-group">
                      <label class="page__label" for="password">{{ data?.loc_signup_card_password_label ? data?.loc_signup_card_password_label : $t('page_2_password') }}</label>
                      <input id="password" v-model="passwordC" class="page__input" :type="passwordHidden ? 'password' : 'text'" :placeholder="data?.loc_signup_card_password_placeholder ? data?.loc_signup_card_password_placeholder : $t('page_2_password')" :disabled="loading" />
                      <PageEye
                        class="page__input-eye"
                        :closed="passwordHidden"
                        :aria-label="passwordHidden ? 'Show password' : 'Hide password'"
                        @click="!loading ? passwordHidden = !passwordHidden : null"
                      />
                    </div>
                    <div class="page__card-button-wrapper">
                      <ClientOnly>
                        <button class="page__card-button" @click="submit" :disabled="loading || email.length === 0 || password.length === 0" ontouchstart="" v-fit-text>
                          <span v-if="loading" class="page__card-button-spinner" aria-hidden="true"></span>
                          <template v-else>{{ data?.loc_signup_card_button ? data?.loc_signup_card_button : $t('page_2_button') }}</template>
                        </button>
                      </ClientOnly>

                      <p v-if="err" class="page__message page__message--error">
                        <template v-if="errorReason === 1">{{ $t('more_apps_account_sign_in_invalid_btn') }}</template>
                        <template v-else>{{ $t('error_something_went_wrong') }}</template>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else-if="step === 2" key="step2" class="page__step-wrapper">
                <picture class="page__gift-picture">
                  <source 
                    media="(min-width: 768px)" 
                    srcset="@/assets/images/gift-large.webp 1x, @/assets/images/gift-large@2x.webp 2x" 
                    type="image/webp"
                  >
                  <source 
                    media="(min-width: 390px)" 
                    srcset="@/assets/images/gift-medium.webp 1x, @/assets/images/gift-medium@2x.webp 2x" 
                    type="image/webp"
                  >
                  <source 
                    srcset="@/assets/images/gift-small.webp 1x, @/assets/images/gift-small@2x.webp 2x" 
                    type="image/webp"
                  >
                  <img 
                    src="@/assets/images/gift-small.png" 
                    alt="Gift" 
                    class="page__gift-img"
                    loading="lazy" 
                    width="175"
                    height="175"
                  >
                </picture>
                <ClientOnly>
                  <button class="page__button" @click="nextStep" ontouchstart=""  v-fit-text>
                    {{ data?.loc_congrats_button ? data?.loc_congrats_button : $t('page_3_button') }}
                  </button>
                </ClientOnly>
              </div>
            </transition>
          </div>

          <div v-if="step !== 0" :class="['page__steps', { 'page__steps--landscape': isLandscape }]">
            <div class="page__steps-track">
              <div
                v-for="(item, index) in ['instructions_1', 'instructions_2', 'instructions_3']"
                :key="index"
                :class="['page__step', { 'page__step--active': step >= index + 1 }]"
              >
                <div class="page__step-circle"></div>
                <div class="page__step-title">{{ data?.[`loc_step_${index + 1}`] ? data?.[`loc_step_${index + 1}`] : $t(item) }}</div>
              </div>
            </div>
          </div>
        </div>

        <transition name="icons-fade" mode="out-in">
          <PageIcons v-if="step === 0" />
        </transition>
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@mixin bg-image($name, $path, $position-size: "no-repeat center / cover") {
  background: url('#{$path}/#{$name}-small.png') #{$position-size};
  background: image-set(
    url('#{$path}/#{$name}-small.webp') type('image/webp') 1x,
    url('#{$path}/#{$name}-small@2x.webp') type('image/webp') 2x,
    url('#{$path}/#{$name}-small.png') type('image/png') 1x,
    url('#{$path}/#{$name}-small@2x.png') type('image/png') 2x
  ) #{$position-size};

  @media (min-width: 390px) and (max-width: 767px) {
    background: url('#{$path}/#{$name}-medium.png') #{$position-size};
    background: image-set(
      url('#{$path}/#{$name}-medium.webp') type('image/webp') 1x,
      url('#{$path}/#{$name}-medium@2x.webp') type('image/webp') 2x,
      url('#{$path}/#{$name}-medium.png') type('image/png') 1x,
      url('#{$path}/#{$name}-medium@2x.png') type('image/png') 2x
    ) #{$position-size};
  }

  @media (min-width: 768px) {
    background: url('#{$path}/#{$name}-large.png') #{$position-size};
    background: image-set(
      url('#{$path}/#{$name}-large.webp') type('image/webp') 1x,
      url('#{$path}/#{$name}-large@2x.webp') type('image/webp') 2x,
      url('#{$path}/#{$name}-large.png') type('image/png') 1x,
      url('#{$path}/#{$name}-large@2x.png') type('image/png') 2x
    ) #{$position-size};
  }
}

.page {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100dvh;
  width: 100%;
  background-color: #F97A19;

  // @media (min-width: 768px) {
  //   justify-content: center;
  // }

  &__inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  &__header {
        // margin: 1rem;
    // border-radius: 4rem;
    // padding: 0 1rem;
    background-color: #fff;
    overflow: hidden;
    width: 100%;
    padding-top: env(safe-area-inset-top);
    // max-width: 400px;
    
    // Используем max-height вместо grid для самой надежной анимации высоты
    // при сохранении фиксированных размеров внутри
    max-height: calc(72px + 20px); // Заведомо больше самой высокой шапки (154px)
    transition: 
      max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);

    @media (min-width: 768px) {
      max-height: calc(114px + 32px); // Заведомо больше самой высокой шапки (154px)
    }
      // opacity 0.3s ease;

    &-inner {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      
      // Фиксированная высота здесь допустима, если родитель анимирует max-height
      // height: 100px;
      transition: transform 0.15s ease;

      @media (min-width: 390px) and (max-width: 767px) {
        // height: 116px;
      }

      @media (min-width: 768px) {
        // height: 154px;
      }
    }

    &--hidden {
      max-height: 0 !important; // Жестко схлопываем родителя
      // opacity: 0;
      pointer-events: none;

      .page__header-inner {
        // transform: translateY(-20px); // Контент плавно уходит вверх
      }
    }

    &-divider {
      width: 2px;
      height: 48px;
      background-color: #000;
    }
  }

  &__logo {
    aspect-ratio: 1 / 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
    margin: 10px 24px;
    object-fit: contain;
    color: #000;
    font-size: 16px;
    line-height: 18px;
    font-weight: 950;

    @media (min-width: 390px) and (max-width: 767px) {
      width: 72px;
      height: 72px;
    }

    @media (min-width: 768px) {
      width: 114px;
      height: 114px;
      margin: 16px 32px;
    }

    &--background {
      @include bg-image('your-logo', '@/assets/images', 'no-repeat center / contain')
    }

    &-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 72px;
      
      @media (min-width: 768px) {
        min-width: 114px;
      }
    }

    &-skeleton {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 72px;
      height: 72px;
      margin: 10px 24px;
      border-radius: 12px;
      background: #fff;
      position: relative;
      overflow: hidden;

      &::after {
        content: "";
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        transform: translateX(-100%);
        background: linear-gradient(
          90deg,
          rgba(255, 255, 255, 0) 0,
          rgba(255, 255, 255, 0.4) 50%,
          rgba(255, 255, 255, 0) 100%
        );
        animation: shimmer 1.5s infinite;
      }

      @media (min-width: 768px) {
        width: 114px;
        height: 114px;
        margin: 16px 32px;
      }

      &-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid #000;
        border-bottom-color: transparent;
        border-radius: 50%;
        display: inline-block;
        box-sizing: border-box;
        animation: rotation 1s linear infinite;
      }

      @keyframes rotation {
        0% {
          transform: rotate(0deg);
        }
        
        100% {
          transform: rotate(360deg);
        }
      }
    }
  }

  &__content {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px 32px 222px 32px;

    @media (min-width: 390px) and (max-width: 767px) {
      padding: 32px 32px 222px 32px;
    }

    @media (min-width: 768px) {
      padding: 32px 32px 222px 32px;
    }

    @media (max-height: 667px) {
      padding: 16px 16px 48px 16px;
    }

    &-inner {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1rem;
      max-width: 300px;
      width: 100%;
      z-index: 2;

      @media (min-width: 390px) and (max-width: 767px) {
        max-width: 320px;
      }

      @media (min-width: 768px) {
        max-width: 448px;
      }

      >:not(:last-child) {
        margin-bottom: 24px;

        @media (min-width: 390px) and (max-width: 767px) {
          margin-bottom: 32px;
        }

        @media (min-width: 768px) {
          margin-bottom: 48px;
        }
      }
    }
  }

  &__title {
    font-size: 24px;
    line-height: 32px;
    font-weight: 950;
    text-align: center;
    // height: 96px;
    // max-width: 300px;
    z-index: 1;

    @media (min-width: 390px) and (max-width: 767px) {
      font-size: 30px;
      line-height: 34px;
      height: auto;
      // max-width: 320px;
    }

    @media (min-width: 768px) {
      font-size: 42px;
      line-height: 48px;
      height: auto;
      // max-width: 448px;
    }

    @media (max-height: 667px) {
      font-size: 23px;
      line-height: 29px;
      height: auto;
      // max-width: 320px;
    }

    &--third {
      font-size: 20px;
      line-height: 32px;
      height: 96px;

      @media (min-width: 390px) and (max-width: 767px) {
        font-size: 23px;
        line-height: 32px;
        height: 96px;
      }

      @media (min-width: 768px) {
        white-space: nowrap;
        font-size: 42px;
        line-height: 48px;
        height: 144px;
      }
    }
  }

  &__hero-picture {
    aspect-ratio: 1 / 1;
    width: 200px;
    height: 200px;
    margin-bottom: 44px;

    // @include bg-image('hero', '@/assets/images', 'no-repeat center / contain');

    @media (min-width: 390px) and (max-width: 767px) {
      margin-bottom: 44px;
    }

    @media (min-width: 768px) {
      width: 300px;
      height: 300px;
      margin-bottom: 36px;
    }

    @media (max-height: 667px) {
      width: 175px;
      height: 175px;
      margin-bottom: 26px;
    }

    img {
      object-fit: contain;
      width: 200px;
      height: 200px;

      @media (min-width: 390px) and (max-width: 767px) {
        margin-bottom: 44px;
      }

      @media (min-width: 768px) {
        width: 300px;
        height: 300px;
      }

      @media (max-height: 667px) {
        width: 175px;
        height: 175px;
      }
    }
  }

  &__gift-picture {
    aspect-ratio: 1 / 1;
    width: 265px;
    height: 265px;
    margin-bottom: 44px;

    // @include bg-image('hero', '@/assets/images', 'no-repeat center / contain');

    @media (min-width: 390px) and (max-width: 767px) {
      width: 300px;
      height: 300px;
      margin-bottom: 44px;
    }

    @media (min-width: 768px) {
      width: 398px;
      height: 360px;
      margin-bottom: 36px;
    }

    @media (max-height: 667px) {
      width: 175px;
      height: 175px;
      margin-bottom: 26px;
    }

    img {
      width: 265px;
      height: 265px;
      object-fit: contain;

      @media (min-width: 390px) and (max-width: 767px) {
        width: 300px;
        height: 300px;
      }

      @media (min-width: 768px) {
        width: 398px;
        height: 360px;
      }

      @media (max-height: 667px) {
        width: 175px;
        height: 175px;
      }
    }
  }

  &__button {
    display: flex;
    height: 80px;
    padding: 8px 16px;
    justify-content: center;
    align-items: center;
    border-radius: 90px;
    
    // Создаем длинный градиент
    background: linear-gradient(180deg, #9C54F5 0%, #700FDF 50%, #4e06a3 100%);
    background-size: 100% 200%; // Увеличиваем высоту фона
    background-position: top; // Начальное положение
    
    color: #FFF;
    font-size: 36px;
    line-height: 48px;
    font-weight: 950;
    width: 285px;
    border: none;
    cursor: pointer;
    
    // Плавный переход
    transition: background-position 0.3s ease, transform 0.1s ease;
    will-change: background-position, transform;

    &:active {
      background-position: bottom; // Смещаем градиент вниз
      transform: scale(0.96); // Эффект нажатия (пружина)
    }

    @media (min-width: 390px) and (max-width: 767px) {
      width: 326px;
    }

    @media (min-width: 768px) {
      width: 368px;
    }
  }

  &__step {
    &-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
  }

  &__main-area {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    background-color: #f5f5ff;
    border-radius: 2rem;
    padding: 18px 16px 24px 16px;
    box-sizing: border-box;
    /* Убираем возможные конфликты с внешними отступами */
    // margin-top: 2rem;
    color: #3D3B4B;

    @media (min-width: 390px) and (max-width: 767px) {
      // width: 326px;
    }

    @media (min-width: 768px) {
      padding: 22px 24px 48px 24px;
    }

    &-wrapper {
      width: 100%;
      margin-top: 107px;

      @media (min-width: 390px) and (max-width: 767px) {
        margin-top: 116px;
      }

      @media (min-width: 768px) {
        margin-top: 133px;
      }

      @media (max-height: 667px) {
        margin-top: 0;
      }
    }

    &::before {
      content: '';
      position: absolute;
      top: -107px;
      width: 120px;
      height: 126px;
      display: block;
      
      @include bg-image('raccoon', '@/assets/images', 'no-repeat center / contain');

      @media (min-width: 390px) and (max-width: 767px) {
        top: -116px;
        width: 130px;
        height: 136px;
        display: block;
      }

      @media (min-width: 768px) {
        top: -133px;
        width: 149px;
        height: 156px;
        display: block;
      }

      @media (max-height: 667px) {
        display: none;
      }
    }

    &-button {
      display: flex;
      height: 44px;
      padding: 8px 16px;
      justify-content: center;
      align-items: center;
      border-radius: 90px;
      
      // Создаем длинный градиент
      background: linear-gradient(180deg, #9C54F5 0%, #700FDF 50%, #4e06a3 100%);
      background-size: 100% 200%; // Увеличиваем высоту фона
      background-position: top; // Начальное положение
      
      color: #FFF;
      font-size: 20px;
      line-height: 24px;
      font-weight: 700;
      width: 100%;
      border: none;
      
      // Плавный переход
      transition: background-position 0.3s ease, transform 0.1s ease;
      will-change: background-position, transform;

      &:active {
        background-position: bottom; // Смещаем градиент вниз
        transform: scale(0.96); // Эффект нажатия (пружина)
      }

      &:disabled {
        background: linear-gradient(180deg, #a978e4 0%, #8539dc 50%, #9169c0 100%);
        color: #caabf0;

        &:active {
          background-position: center;
          transform: none;
        }
      }

      @media (min-width: 390px) and (max-width: 767px) {
        // width: 326px;
      }

      @media (min-width: 768px) {
        font-size: 24px;
        line-height: 32px;
      }

      &-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid #fff;
        border-bottom-color: transparent;
        border-radius: 50%;
        display: inline-block;
        box-sizing: border-box;
        animation: rotation 1s linear infinite;
      }

      @keyframes rotation {
        0% {
          transform: rotate(0deg);
        }
        
        100% {
          transform: rotate(360deg);
        }
      }

      &-wrapper {
        position: relative;
        width: 100%;
      }
    }

    &-title {
      font-size: 18px;
      line-height: 24px;
      font-weight: 700;
      margin-bottom: 16px;
      text-align: center;

      @media (min-width: 390px) and (max-width: 767px) {
        font-size: 18px;
        line-height: 24px;
        margin-bottom: 20px;
      }

      @media (min-width: 768px) {
        font-size: 24px;
        line-height: 32px;
        margin-bottom: 24px;
      }
    }
  }

  &__form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    max-width: 278px;
    width: 100%;

    @media (min-width: 768px) {
      max-width: 340px;
    }
  }

  &__input {
    display: flex;
    padding: 11px 22px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 6px;
    width: 100%;
    border-radius: 28px;
    border: 2px solid #DBD9ED;
    text-align: center;
    color: #3D3B4B;
    text-align: left;
    font-size: 16px;
    line-height: 18px;
    font-weight: 500;
    transition: .25s;
    -webkit-user-select: initial!important;
    -khtml-user-select: initial!important;
    -moz-user-select: initial!important;
    -ms-user-select: initial!important;
    user-select: initial!important;
    -webkit-user-select: text!important;
    -webkit-touch-callout: default!important;
    box-sizing: border-box;

    &:active, &:focus {
      border-color: #FF8D24;
      outline: none;
    }

    &::placeholder {
      color: #928fa3;
    }

    @media (min-width: 390px) and (max-width: 767px) {
      padding: 11px 22px;
      font-size: 16px;
      line-height: 18px;
    }

    @media (min-width: 768px) {
      padding: 13px 26px;
      font-size: 18px;
      line-height: 24px;
    }

    &-group {
      position: relative;

      &:not(:last-child) {
        margin-bottom: 12px;

        @media (min-width: 390px) and (max-width: 767px) {
          margin-bottom: 16px;
        }

        @media (min-width: 768px) {
          margin-bottom: 16px;
        }
      }
    }
  }

  &__label {
    display: block;
    padding: 0 24px;
    margin-bottom: 4px;
    font-size: 14px;
    line-height: 18px;
    font-weight: 700;

    @media (min-width: 390px) and (max-width: 767px) {
      margin-bottom: 12px;
      font-size: 14px;
      line-height: 8px;
    }

    @media (min-width: 768px) {
      padding: 0 28px;
      margin-bottom: 12px;
      font-size: 18px;
      line-height: 24px;
    }
  }

  &__message {
    position: absolute;
    font-weight: 700;
    font-size: 12px;
    line-height: 18px;
    text-align: center;
    max-width: 520px;
    width: 100%;
    margin-top: 2px;

    &--error {
      color: #d11a2a;
    }
  }

  &__back {
    position: fixed;
    left: 12px;
    top: 12px;
    width: 24px;
    height: 24px;
    z-index: 10;

    @media (min-width: 768px) {
      left: 16px;
      top: 16px;
      width: 32px;
      height: 32px;
    }
  }

  &__steps {
    position: fixed;
    bottom: 12px;
    width: 300px;
    background-color: #f97a19;
    padding-top: 12px;
    border-top-left-radius: 32px;
    border-top-right-radius: 32px;
    z-index: -1;

    @media (min-width: 390px) and (max-width: 767px) {
      // bottom: 52px;
      width: 320px;
    }

    @media (min-width: 768px) {
      // bottom: 68px;
      width: 448px;
    }

    &--landscape {
      position: absolute;
    }

    &-track {
      display: flex;
      justify-content: space-between;
      position: relative;
      
      // Линия на фоне
      &::before {
        content: '';
        position: absolute;
        top: 11px; // Центрируем по высоте кружка (30px / 2)
        left: 0;
        right: 0;
        height: 4px;
        background-color: #700FDF; // Фиолетовый цвет линии
        z-index: 1;
        width: calc(100% - 78px);
        left: 39px;

        @media (min-width: 390px) and (max-width: 767px) {
          width: calc(100% - 84.666667px);
          left: 42.3333335px;
        }

        @media (min-width: 768px) {
          top: 13px;
          width: calc(100% - 123.333333px);
          left: 61.6666665px;
        }
      }
    }
  }

  &__step {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: 2;
    flex: 1;

    &-circle {
      width: 22px;
      height: 22px;
      background-color: #FFF; // По умолчанию белый
      border: 4px solid #7A1FE4; // Фиолетовая обводка
      border-radius: 50%;
      box-sizing: border-box;
      transition: background-color 0.3s ease;

      @media (min-width: 768px) {
        width: 26px;
        height: 26px;
      }
    }

    &-title {
      margin-top: 12px;
      color: #3D3B4B; // Или твой цвет текста
      font-size: 16px;
      font-weight: 600;
      text-align: center;
      line-height: 1.2;
      max-width: 120px; // Чтобы текст переносился красиво
    }

    // Состояние активного или пройденного шага
    &--active {
      .page__step-circle {
        background-color: #7A1FE4; // Заливаем фиолетовым
      }
    }
  }
}
</style>
