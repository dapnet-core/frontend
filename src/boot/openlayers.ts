import { defineBoot } from '#q-app/wrappers'
import OpenLayersMap from 'vue3-openlayers'
import 'vue3-openlayers/dist/vue3-openlayers.css'

export default defineBoot(({ app }) => {
  // TODO: Make this optional; Only used on MapComponent.
  app.use(OpenLayersMap)
})
