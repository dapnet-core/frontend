<template>
  <q-page padding class="row justify-evenly">
    <div class="column full-width">
      <h2>Nett hier.</h2>
      <h4>Aber waren sie schonmal in Baden-Württemberg?</h4>
      <Map height="600px" :center="[6, 50]"
          :markers="[{ coordinates: [6, 51], icon }]">
          <template #marker-info>
            testsignal
            <br>
            Usage: WIDERANGE
            <br>
            Transmission Power (W): 1
            <br>
            Height (m): 15
            <br>
            Timeslot: 0123456789ABCDEF
            <br>
            Owner: me

          </template>
      </Map>
    </div>

  </q-page>
</template>

<script setup lang="ts">
import Map from 'components/MapComponent.vue'
import icon from 'assets/markers/marker-transmitter-personal-online.png'

</script>
