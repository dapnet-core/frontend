<template>
  <q-item clickable v-ripple>
    <q-item-section avatar>
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      {{ title }}
    </q-item-section>

    <!-- TODO: Loading animation for count -->
    <q-item-section side v-if="count">
      <q-badge color="primary" :label="count" />
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  icon: string
  count?: number
}>()
</script>
