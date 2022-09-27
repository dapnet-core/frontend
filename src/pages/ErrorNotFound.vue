<template>
  <div class="fullscreen bg-gradient text-white text-center q-pa-md flex flex-center">
    <div>
      <div style="font-size: 30vh">
        404
      </div>

      <div class="text-h2" style="opacity:.4">
        {{ $t('rest.errors.404.text') }}
      </div>

      <q-btn
        class="q-mt-xl"
        color="white"
        text-color="secondary"
        unelevated
        to="/"
        icon="mdi-arrow-left"
        :label="$t('navigation.home')"
        no-caps
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
  .bg-gradient{
    background: $primary;
    background: linear-gradient(to bottom right, $primary, $secondary);
  }
</style>
