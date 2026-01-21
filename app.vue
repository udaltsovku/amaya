<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';

const config = useRuntimeConfig();

useHead({
  title: config.public.appTitle
});

const isLandscape = ref(false);

const forceScrollTop = () => {
  if (!process.client) return;

  // 1. Сбрасываем скролл всеми доступными способами
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  // 2. Делаем микро-задержку, чтобы DOM успел "отдуплиться"
  setTimeout(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // мгновенно, без плавания
    });
  }, 50); 
};

// Функция проверки ориентации
const updateOrientation = () => {
  if (process.client) {
    forceScrollTop()
    isLandscape.value = window.innerWidth > window.innerHeight;
    
    // Прячем клавиатуру, если она была открыта (часто ломает верстку при повороте)
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    // Принудительный скролл вверх для пересчета 100dvh/vh
    window.scrollTo(0, 0);
  }
};

// Следим за изменением переменной и вешаем стили на body
watch(isLandscape, (newValue) => {
  if (process.client) {
    const html = document.documentElement;
    const body = document.body;
    
    if (newValue) {
      // LANDSCAPE: разрешаем скролл
      html.style.height = 'auto';
      html.style.overflowY = 'auto';
      
      body.style.height = 'auto';
      body.style.overflowY = 'auto';
      body.style.position = 'relative'; // на всякий случай для нормального скролла
    } else {
      // PORTRAIT: фиксируем экран
      html.style.height = '100dvh';
      html.style.overflow = 'hidden';
      
      body.style.height = '100dvh';
      body.style.overflow = 'hidden';
      
      // Сбрасываем скролл вверх при возврате в портрет
      window.scrollTo(0, 0);
    }
  }
}, { immediate: true });


onMounted(() => {
  updateOrientation();
  window.addEventListener('resize', updateOrientation);
  // На мобилках resize не всегда срабатывает при повороте
  window.addEventListener('orientationchange', updateOrientation);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateOrientation);
  window.removeEventListener('orientationchange', updateOrientation);
});
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style lang="scss">
// @import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap');

* {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -webkit-user-drag: none;
  user-drag: none;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  touch-action: manipulation;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

body,
html {
  margin: 0;
  padding: 0;
  font-family: "Nunito", sans-serif;
  color: #fff;

  /* Фиксируем высоту на весь экран */
  // height: 100vh; 
  // height: 100dvh; 
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  // overflow: hidden; /* Запрещаем скролл всему приложению */
}

html {
  /* Сверху белый (для шапки Safari), снизу оранжевый (для всего остального) */
  // background: linear-gradient(
  //   to bottom, 
  //   #ffffff 0%, 
  //   #ffffff 50%, 
  //   #F97A19 50%, 
  //   #F97A19 100%
  // );
  // background-repeat: no-repeat;
  // background-color: #F97A19; /* Запасной цвет для низа */
  background-color: #F97A19 !important;
}

body {
  margin: 0;
  padding: 0;
  /* Body должен быть прозрачным или оранжевым, 
     чтобы не перекрывать градиент html сверху */
     background-color: #F97A19;
}

html, body {
  overscroll-behavior-x: none;
}

.page-wrapper {
  /* Весь контент лежит здесь */
  background-color: #F97A19;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

button {
  display: inline-block;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  font: inherit;
  text-align: inherit;
  color: inherit;
  box-shadow: none;
  text-transform: none;
  cursor: default;

  &:focus,
  &:hover,
  &:active,
  &:visited,
  &:disabled {
    outline: none;
  }
}

input {
  -webkit-appearance: none; // Убирает системные стили iOS
  appearance: none;
}

.slide-up-down-fast-enter-active,
.slide-up-down-fast-leave-active {
  transition: transform .15s ease, opacity .15s ease;
}

/* ENTER */
.slide-up-down-fast-enter-from {
  transform: translateY(20px);
  opacity: 0;
}

.slide-up-down-fast-enter-to {
  transform: translateY(0);
  opacity: 1;
}

/* LEAVE */
.slide-up-down-fast-leave-from {
  transform: translateY(0);
  opacity: 1;
}

.slide-up-down-fast-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

/* Новая плавная анимация для карточки */
.card-transition-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); // Эффект небольшой пружины
}

.card-transition-leave-active {
  transition: all 0.2s ease-in;
  position: absolute; // Чтобы старый контент не толкал новый
  // width: 100%;
}

.card-transition-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(30px); // Появляется чуть меньше и снизу
}

.card-transition-leave-to {
  opacity: 0;
  transform: scale(1.05); // Старый контент чуть увеличивается и исчезает
}

/* Новая анимация специально для появления иконок */
.icons-fade-enter-active {
  /* transition-delay: 0.4s;  <-- Если нужен делей перед появлением */
  transition: 
    opacity 0.8s ease-out, 
    transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.icons-fade-leave-active {
  transition: opacity 0.3s ease-in, transform 0.3s ease-in;
}

.icons-fade-enter-from {
  opacity: 0;
  // Появляются снизу (размах 50px) и чуть уменьшенными
  transform: translateY(50px) scale(0.9); 
}

.icons-fade-leave-to {
  opacity: 0;
  transform: scale(1.1); // При уходе чуть увеличиваются
}
</style>