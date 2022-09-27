<template>
  <ol-map :load-tiles-while-animating="true" :load-tiles-while-interacting="true" :style="`height: ${height}; width: 100%;`" ref="map">
    <!-- Workaround: Map looks distorted with 'EPSG:4326' projection, so 'EPSG:3857' is used internally. Requires coordinate transformation.
         TODO: Switch to 'EPSG:4326' and remove transformation if issue above is fixed. -->
    <ol-view
      ref="view" :center="center" :rotation="rotation"
      :zoom="zoom" projection="EPSG:3857"
    />
    <ol-fullscreen-control />
    <ol-scaleline-control />
    <ol-zoom-control />
    <ol-attribution-control />
    <ControlContainer v-if="selected" class="data-container">
      <slot name="marker-info" :marker="selected.marker" :index="selected.key" />
    </ControlContainer>

    <ol-tile-layer>
      <ol-source-osm />
    </ol-tile-layer>

    <!-- TODO: Support <ol-animated-clusterlayer> for marker clustering -->

    <ol-vector-layer>
      <ol-source-vector ref="source">
        <ol-feature v-for="(marker, key) in markers" :key="key" :properties="{key, marker}">
          <ol-geom-point :coordinates="transformCoords(marker.coordinates)" />
          <ol-style>
            <ol-style-icon :src="marker.icon" :scale="1" />
          </ol-style>
        </ol-feature>
      </ol-source-vector>
    </ol-vector-layer>

    <ol-interaction-select @select="featureSelected">
      <ol-style>
        <ol-style-icon v-if="selected" :src="selected.marker.icon" :scale="1.25" />
      </ol-style>
    </ol-interaction-select>
  </ol-map>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { fromLonLat } from 'ol/proj'
import { Coordinate } from 'ol/coordinate'
import { SelectEvent } from 'ol/interaction/Select'
import ControlContainer from 'components/MapControlContainer.vue'

export type Marker = {
  coordinates: [number, number]
  icon: string
}

const props = defineProps<{
  height: string
  markers?: Marker[]
  center: [number, number]
}>()

const center = ref(transformCoords(props.center))
const zoom = ref(8)
const rotation = ref(0)
const selected = ref<{marker: Marker, key: number} | null>(null)
const map = ref<HTMLElement | null>(null) // Reference to map DOM element

const featureSelected = (event: SelectEvent) => {
  // TODO: Center map on selected marker
  selected.value = event.selected.length > 0 ? { marker: event.selected[0].get('marker'), key: event.selected[0].get('key') } : null
}

/**
 * Converts the given coordinates to EPSG:3857 from EPSG:4326 projection
 */
function transformCoords (coords: [number, number]): [number, number] {
  return fromLonLat(coords as Coordinate) as [number, number]
}
</script>

<style lang="scss" scoped>
  .data-container{
    padding: 0.5em 0.25em 0.25em 0.5em;
    border-radius: 0 0 0.5em 0;
    background-color: $transparent-light;
  }

  body.body--dark .data-container{
    background-color: $transparent-dark;
  }
</style>

<!-- TODO: Workaround, waits on https://github.com/MelihAltintas/vue3-openlayers/issues/101 -->
<style>
  div.ol-zoom.ol-unselectable.ol-control {
    right: 0.5em;
    bottom: 2em;
    left: unset;
    top: unset;
  }
</style>
