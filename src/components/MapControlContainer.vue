<!-- Cheap workaround till https://github.com/MelihAltintas/vue3-openlayers/issues/102 is resolved -->
<template>
  <div ref="mountpoint" :style="props" class="ol-unselectable ol-control ol-uncollapsible">
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
import Map from 'ol/Map'

const props = defineProps<{
  top?: string
  right?: string
  bottom?: string
  left?: string
}>()

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const map: Map = inject('map')!
const mountpoint = ref<HTMLElement | null>(null)

const control = computed(() => new Control({
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
