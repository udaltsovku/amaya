<template>
  <div class="page__icons-wrapper">
    <div class="page__icons">
      <div
        v-for="(item) in ['banana', 'pizza', 'burger', 'donut', 'cake', 'apple']"
        :key="item"
        :class="['page__icon', `page__icon--${item}`]"
      ></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@mixin size($size, $top: 0, $left: 0) {
  width: $size;
  height: $size;
  margin-top: $top;
  margin-left: $left;

  @media (min-width: 390px) and (max-width: 767px) {
    width: $size * 1.0417;
    height: $size * 1.0417;
    margin-top: $top * 1.0417;
    margin-left: $left * 1.0417;
  }

  @media (min-width: 768px) {
    width: $size * 1.25;
    height: $size * 1.25;
    margin-top: $top * 1.25;
    margin-left: $left * 1.25;
  }
}

@keyframes icon-float {
  0%   { transform: translate3d(0, 0, 0); }
  50%  { transform: translate3d(0, var(--float-y, -6px), 0); }
  100% { transform: translate3d(0, 0, 0); }
}

@media (prefers-reduced-motion: reduce) {
  .page__icon {
    animation: none !important;
  }
}

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
  &__icons {
    position: absolute;
    width: 100%;
    height: 100%;

    &-wrapper {
      position: fixed;
      width: 100%;
      height: 100%;
      z-index: 1;
      max-width: calc(300px + 40px);

      @media (min-width: 390px) and (max-width: 767px) {
        max-width: calc(320px + 40px);
      }

      @media (min-width: 768px) {
        max-width: calc(448px + 64px);
      }
    }

    &-top,
    &-bottom {
      display: contents; // Игнорируем контейнеры, чтобы позиционировать иконки напрямую
    }
  }

  &__icon {
    position: absolute;
    display: block;
    // will-change: transform;
    // animation-name: icon-float;
    // animation-duration: var(--float-dur, 1s);
    // animation-timing-function: ease-in-out;
    // animation-iteration-count: infinite;
    // animation-direction: alternate;
    // animation-delay: var(--float-delay, 0s);

    $apps: (
      banana: 'banana',
      pizza: 'pizza',
      burger: 'burger',
      donut: 'donut',
      cake: 'cake',
      apple: 'apple',
    );

    @each $name, $file in $apps {
      &--#{$name} {
        @include bg-image(#{$file}, '@/assets/images', 'no-repeat center / contain');
      }
    }
    
    &--banana {
      @include size(60px);
      right: 16px;
      top: 121px;
      z-index: 1;

      --float-y: -4px;
      --float-dur: 5.5s;
      --float-delay: -1.2s;

      @media (min-width: 768px) {
        right: 16px;
        top: 154px;
      }
    }
    
    &--burger {
      @include size(80px);
      right: 72px;
      top: 461px;
      z-index: 1;

      --float-y: -5px;
      --float-dur: 6.5s;
      --float-delay: -1.2s;

      @media (min-width: 768px) {
        right: 32px;
        top: 600px;
      }
    }
    
    &--donut {
      @include size(72px);
      right: -16px;
      top: 264px;
      z-index: 1;

      --float-y: -3px;
      --float-dur: 5.6s;
      --float-delay: -1.2s;

      @media (min-width: 768px) {
        right: -36px;
        top: 354px;
      }
    }
    
    &--cake {
      @include size(61px);
      left: 32px;
      top: 429px;
      z-index: 1;

      --float-y: -4px;
      --float-dur: 5.25s;
      --float-delay: -1.2s;

      @media (min-width: 768px) {
        left: -32px;
        top: 532px;
      }
    }
    
    &--pizza {
      @include size(75px);
      left: -16px;
      top: 188px;
      z-index: 1;

      --float-y: -4px;
      --float-dur: 6.5s;
      --float-delay: -1.2s;

      @media (min-width: 768px) {
        left: -16px;
        top: 220px;
      }
    }
    
    &--apple {
      @include size(60px);
      left: 180px;
      top: 608px;
      z-index: 1;

      --float-y: -4px;
      --float-dur: 5.25s;
      --float-delay: -1.2s;

      @media (min-width: 768px) {
        left: 132px;
        top: 700px;
      }
    }
  }
}
</style>
