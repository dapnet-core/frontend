<template>
  <q-item clickable v-ripple>
    <q-item-section avatar>
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <div>
        {{ title }}
        <q-icon v-if="external" name="mdi-open-in-new" color="primary" />
      </div>
    </q-item-section>

    <q-item-section side v-if="count !== undefined">
      <q-badge color="primary" :label="count" />
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  icon: string
  count?: number
  external?: boolean
}>()
</script>
