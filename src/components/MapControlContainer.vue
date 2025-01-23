<!-- Cheap workaround till https://github.com/MelihAltintas/vue3-openlayers/issues/102 is resolved -->
<template>
  <div ref="mountpoint" class="ol-unselectable ol-control ol-uncollapsible">
    <slot />
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  inject,
  onMounted,
  onUnmounted,
  watch,
  computed
} from 'vue'
import Control from 'ol/control/Control'
import type Map from 'ol/Map'

const map: Map = inject('map')!
const mountpoint = ref<HTMLElement | null>(null)

const control = computed(() => new Control({
  element: mountpoint.value!
}))

watch(control, (newVal, oldVal) => {
  if (map.removeControl) {
    map.removeControl(oldVal)
    map.addControl(newVal)
    map.changed()
  }
})

onMounted(() => {
  map.addControl(control.value)
  map.changed()
})

onUnmounted(() => {
  if (map.removeControl) {
    map.removeControl(control.value)
  }
  map.changed()
})
</script>
