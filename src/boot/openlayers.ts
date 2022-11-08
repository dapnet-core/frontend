import { boot } from 'quasar/wrappers'
import OpenLayersMap from 'vue3-openlayers'
import 'vue3-openlayers/dist/vue3-openlayers.css'

export default boot(({ app }) => {
  // TODO: Make this optional; Only used on MapComponent.
  app.use(OpenLayersMap)
})
