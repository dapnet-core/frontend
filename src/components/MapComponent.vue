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
    <!-- <ol-zoom-control /> TODO: Move to bottom right. Waits on https://github.com/MelihAltintas/vue3-openlayers/issues/101 -->
    <ol-attribution-control />
    <ControlContainer top="0.5em" left="0.5em">
      <slot name="marker-info" v-if="selected" :marker="selected.marker" :index="selected.key" />
    </ControlContainer>

    <ol-tile-layer>
      <ol-source-osm />
    </ol-tile-layer>

    <!-- TODO: Support <ol-animated-clusterlayer> for marker clustering -->

    <ol-vector-layer>
      <ol-source-vector ref="source">
        <ol-feature v-for="(marker, key) in markers" :key="key"> <!-- TODO: WHY CANT I SET :properties="{'id': key}" and use that to reference the selection?? -->
          <ol-geom-point :coordinates="transformCoords(marker.coordinates)" />
            <ol-style>
              <ol-style-icon :src="marker.icon" :scale="1"></ol-style-icon>
            </ol-style>
            <ol-interaction-select @select="featureSelected">
              <ol-style>
                  <ol-style-icon :src="marker.icon" :scale="1.25"></ol-style-icon>
              </ol-style>
            </ol-interaction-select>
        </ol-feature>
      </ol-source-vector>
    </ol-vector-layer>
  </ol-map>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { fromLonLat } from 'ol/proj'
import { Coordinate } from 'ol/coordinate'
import ControlContainer from 'components/MapControlContainer.vue'

export type Marker = {
  coordinates: [number, number]
  icon: string
}

const props = defineProps<{
  height: string // TODO: specify so only CSS lengths are allowed?
  markers?: Marker[]
  center: [number, number]
}>()

const center = ref(transformCoords(props.center))
const zoom = ref(8)
const rotation = ref(0)
const selected = ref<{marker: Marker, key: number} | null>(null)
const map = ref<HTMLElement | null>(null) // Reference to map DOM element

const featureSelected = (event: any) => {
  // TODO: Hack till I manage to figure out why I can't set the feature properties. Will set selected to the right stuff then
  console.log(event)
  selected.value = event.selected.length > 0 ? { marker: { coordinates: [0, 0], icon: '' }, key: 0 } : null
}

/**
 * Converts the given coordinates to EPSG:3857 if they use the EPSG:4326 projection
 */
function transformCoords (coords: [number, number]): [number, number] {
  return fromLonLat(coords as Coordinate) as [number, number]
}

// TODO: Use https://vueuse.org/core/useresizeobserver to resize map on component resize
</script>
