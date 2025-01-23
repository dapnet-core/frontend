import { onMounted, onUnmounted, ref } from 'vue'

/**
 * Composable for managing the transmitter telemetry WebSocket
 *
 * Returns reactive data and functions to (un)subscribe transmitters
 */
export default function telemetryWS () {
  // Live telemetry of currently visible transmitter
  const data = ref<Record<string, unknown>>({})
  let telemetryWS: WebSocket | undefined

  onMounted(() => {
    // WebSockets don't support relative URL by default, see https://github.com/whatwg/websockets/issues/20#issuecomment-900850326
    const url = new URL(process.env.apiServer + '/telemetry/', location.href)
    url.protocol = 'ws'

    telemetryWS = new WebSocket(url)
    telemetryWS.addEventListener('message', (ev) => {
      let msg
      try {
        msg = JSON.parse(ev.data)
      } catch (err) {
        console.error('Invalid telemetry data!', ev.data, err)
        return
      }

      // TODO: Document types for telemetry messages and use them
      switch (msg._type) {
        case 'subscription': {
          // Ignore 'subscription' updates
          break
        }
        default: {
          console.warn('Unknown telemetry message type: ', msg)
          // TODO: Handle data
        }
      }
    })
    telemetryWS.addEventListener('open', () => {
      console.log('Telemetry connection established')
    })
    telemetryWS.addEventListener('close', () => {
      console.log('Telemetry connection closed')
    })
    // TODO: Attempt to reconnect if closed unnaturally
  })

  onUnmounted(() => {
    telemetryWS?.close()
  })

  const subscribeT = (ids: string[]) => {
    telemetryWS?.send(JSON.stringify({
      subscribe_transmitters: ids
    }))
  }

  const unsubscribeT = (ids: string[]) => {
    telemetryWS?.send(JSON.stringify({
      unsubscribe_transmitters: ids
    }))
  }

  return {
    telemetryData: data,
    subscribeTransmitters: subscribeT,
    unsubscribeTransmitters: unsubscribeT
  }
}
