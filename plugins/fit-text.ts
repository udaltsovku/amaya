export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('fit-text', {
    mounted(el: HTMLElement) {
      const adjust = () => {
        // Замеряем текущие стили
        const style = window.getComputedStyle(el);
        const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
        const availableWidth = el.clientWidth - padding;
        
        // Важно: берем текст именно из кнопки
        const text = el.innerText.trim();
        if (!text) return;

        // Сбрасываем размер шрифта, чтобы вычислить базовый размер из CSS
        el.style.fontSize = '';
        let currentSize = parseFloat(window.getComputedStyle(el).fontSize);

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return;

        const getTextWidth = (size: number) => {
          context.font = `${style.fontWeight} ${size}px ${style.fontFamily}`;
          return context.measureText(text).width;
        };

        let measuredWidth = getTextWidth(currentSize);

        // Если текст шире кнопки, уменьшаем
        if (measuredWidth > availableWidth && availableWidth > 0) {
          while (measuredWidth > availableWidth && currentSize > 6) {
            currentSize -= 0.5;
            measuredWidth = getTextWidth(currentSize);
          }
          el.style.fontSize = `${currentSize}px`;
        }
      };

      // 1. Следим за изменением размера самой кнопки
      const ro = new ResizeObserver(() => adjust());
      ro.observe(el);

      // 2. Следим за изменением текста внутри (если прилетает из i18n или API)
      const mo = new MutationObserver(() => adjust());
      mo.observe(el, { childList: true, characterData: true, subtree: true });

      // Сохраняем для очистки
      (el as any)._fitObservers = { ro, mo };
      
      // Запуск сразу
      setTimeout(adjust, 0);
    },

    // Хук updated сработает, если Vue перерисует компонент
    updated(el: HTMLElement) {
       // Вызываем повторную проверку
       const style = window.getComputedStyle(el);
       // Если инлайновый стиль уже есть, не сбрасываем его сразу, чтобы не моргало
       // Но логика внутри adjust сама разберется
    },

    unmounted(el: HTMLElement) {
      if ((el as any)._fitObservers) {
        (el as any)._fitObservers.ro.disconnect();
        (el as any)._fitObservers.mo.disconnect();
      }
    },

    getSSRProps() {
      return {};
    }
  });
});