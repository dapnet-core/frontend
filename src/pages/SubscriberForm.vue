<!-- TODO: Just mockup right now, no validation or data submittion -->
<!-- TODO: Make custom form components for Input, SingelSelection, MultiSelection to cut down on code repetition -->

<template>
  <q-page padding>
    <SectionedForm
      :finish-btn-text="$t('general.submit')" :title="props.editId ? $t('subscribers.editsubscriber') : $t('subscribers.newsubscriber')"
      :sections="sections"
      :on-exit="onExit"
    >
      <template #section-default>
        <div class="row">
          <q-input
            v-model="data._id"
            :label="$t('subscribers.new.subscriber.title')"
            :hint="$t('subscribers.new.subscriber.help')"
            :rules="[ val => val && val.length > 0 || $t('subscribers.new.subscriber.error')]"
            :loading="loading" :disable="loading"
            class="col-md-4 col-12 q-px-xs q-mb-sm"
          >
            <template #prepend>
              <q-icon name="mdi-tag-text-outline" />
            </template>
          </q-input>
          <q-input
            v-model="data.description"
            :label="$t('subscribers.new.description.title')"
            :hint="$t('subscribers.new.description.help')"
            :rules="[ val => val && val.length > 0 ]"
            :loading="loading" :disable="loading"
            class="col-md-8 col-12 q-px-xs q-mb-sm"
          >
            <template #prepend>
              <q-icon name="mdi-file-document-outline" />
            </template>
          </q-input>
          <q-select
            v-model="data.groups"
            :label="$t('general.subscriber_groups')"
            :hint="$t('subscribers.new.subscriber_groups.help')"
            :options="groupOptions"
            :loading="!groups || loading" :disable="!groups || loading"
            @input-value="(val) => groupSearch = val"
            multiple use-chips use-input
            class="col-lg-6 col-12 q-px-xs"
          >
            <template #prepend>
              <q-icon name="mdi-account-multiple" />
            </template>
          </q-select>
          <q-select
            v-model="data.owners"
            :label="$t('general.owners')"
            :hint="$t('subscribers.new.owner.help')"
            :options="ownerOptions"
            :loading="!owners || loading" :disable="!owners || loading"
            @input-value="(val) => ownerSearch = val"
            multiple use-chips use-input
            class="col-lg-6 col-12 q-px-xs"
          >
            <template #prepend>
              <q-icon name="mdi-card-account-details-outline" />
            </template>
            <template #no-option="scope">
              <div class="q-pa">
                No owners found for query "{{ scope.inputValue }}"
              </div>
            </template>
          </q-select>
        </div>
      </template>
      <template #section-pagers>
        <q-list bordered separator class="q-mb-sm">
          <!-- TODO: Show pagers -->
          <q-item class="q-px-xs q-pt-none q-pb-md wrap">
            <q-select
              v-model="newPager.type"
              :label="$t('subscribers.new.pager.type.title')"
              :hint="$t('subscribers.new.pager.type.help')"
              :options="['AlphaPoc', 'Birdy', 'Skyper', 'Swissphone', 'Quix']"
              class="col-3 q-px-xs"
            >
              <template #prepend>
                <q-icon name="mdi-card-account-details-outline" />
              </template>
            </q-select>
            <q-input
              v-model="newPager.ric"
              :label="$t('subscribers.new.pager.ric.title')"
              :hint="$t('subscribers.new.pager.ric.help')"
              type="number"
              :rules="[ val => val > 0 ]"
              class="col-2 q-px-xs"
            >
              <template #prepend>
                <q-icon name="mdi-file-document-outline" />
              </template>
            </q-input>
            <q-select
              v-model="newPager.function"
              :label="$t('subscribers.new.pager.function.title')"
              :hint="$t('subscribers.new.pager.function.help')"
              :options="[{index: 0, label: '0/A'}, {index: 1, label: '1/B'}, {index: 2, label: '2/C'}, {index: 3, label: '3/D'}]"
              option-value="index"
              option-label="label"
              class="col-2 q-px-xs"
            >
              <template #prepend>
                <q-icon name="mdi-card-account-details-outline" />
              </template>
            </q-select>
            <q-input
              v-model="newPager.name"
              :label="$t('subscribers.new.pager.name.title')"
              :hint="$t('subscribers.new.pager.name.help')"
              :rules="[ val => val && val.length > 0 ]"
              class="col-grow q-px-xs"
            >
              <template #prepend>
                <q-icon name="mdi-tag-text-outline" />
              </template>
            </q-input>
            <div class="flex q-px-xs items-center">
              <q-checkbox left-label v-model="newPager.enabled" label="Enabled" />
              <q-btn dense icon="mdi-delete-outline" color="red" size="0.75em" />
            </div>
          </q-item>
          <q-item class="q-px-xs">
            <q-btn class="full-width" label="Add new pager" color="green" />
          </q-item>
        </q-list>
      </template>
      <template #section-external>
        <div class="row q-pb-sm">
          <q-select
            v-model="data.thirdparty.aprs"
            :label="$t('subscribers.new.aprs.title')"
            :hint="$t('subscribers.new.aprs.help')"
            multiple use-chips use-input
            :loading="loading" :disable="loading"
            class="col-lg-6 col-12 q-px-xs"
          >
            <template #prepend>
              <q-icon name="mdi-crosshairs-gps" />
            </template>
          </q-select>
          <q-select
            v-model="data.thirdparty.brandmeister"
            :label="$t('subscribers.new.brandmeister.title')"
            :hint="$t('subscribers.new.brandmeister.help')"
            multiple use-chips use-input
            :loading="loading" :disable="loading"
            class="col-lg-6 col-12 q-px-xs"
          >
            <template #prepend>
              <q-icon name="mdi-radio-handheld" />
            </template>
          </q-select>
          <q-select
            v-model="data.thirdparty.ipsc2"
            :label="$t('subscribers.new.ipsc2.title')"
            :hint="$t('subscribers.new.ipsc2.help')"
            multiple use-chips use-input
            :loading="loading" :disable="loading"
            class="col-lg-6 col-12 q-px-xs"
          >
            <template #prepend>
              <q-icon name="mdi-radio-handheld" />
            </template>
          </q-select>
          <q-select
            v-model="data.thirdparty.email"
            :label="$t('subscribers.new.email.title')"
            :hint="$t('subscribers.new.email.help')"
            multiple use-chips use-input
            :loading="loading" :disable="loading"
            class="col-lg-6 col-12 q-px-xs"
          >
            <template #prepend>
              <q-icon name="mdi-email" />
            </template>
          </q-select>
        </div>
      </template>
    </SectionedForm>
  </q-page>
</template>
<script setup lang="ts">
import { QSelect, QInput, QIcon } from 'quasar'
import type { SubscriberRowType, Pager, SubscriberShow } from 'src/api/api_routes'
import { getJson } from 'src/api/fetch'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import SectionedForm from '../components/SectionedForm.vue'

const props = defineProps<{
  editId?: SubscriberRowType['_id']
}>()

const loading = ref<boolean>(false)
function loadSubscriber (subscriber: SubscriberRowType['_id'] | undefined): SubscriberRowType {
  if (subscriber) {
    loading.value = true
    getJson<SubscriberShow>(`subscribers/${subscriber}`)
      .then(row => { data.value = row; loading.value = false })
      // TODO: Show error if loading fails
      .catch(reason => { console.log("Failed to load data!", reason) })
  }

  return {
    _id: '',
    _rev: '',
    description: '',
    groups: [],
    owners: [],
    pagers: [],
    thirdparty: {
      aprs: [],
      brandmeister: [],
      email: [],
      ipsc2: []
    }
  }
}

//
// async function loadUserNames (): Promise<string[]> {
//  loading.value = true
//  const response = await getJson<UserNames>('users/_usernames')
//  const resultArray = Object.keys(response).map(function (userNamedIndex) { const user = persons[userNamedIndex] })
//  console.log(typeof response)
//  loading.value = false
//  return { resultArray }
// }

const data = ref<SubscriberRowType>(loadSubscriber(props.editId))

const newPager = ref<Partial<Pager>>({ enabled: true })
const groups = ref<string[] | null>(['Test1', 'Test2', 'Test3'])
const groupSearch = ref<string>('')
const owners = ref<string[] | null>(['Test1', 'Test2', 'Test3']) // ref<Promise<string[]> | null>(loadUserNames())
const ownerSearch = ref<string>('')

const groupOptions = computed<string[]>(() => {
  if (!groups.value) return []
  if (!groupSearch.value) return groups.value
  const needle = groupSearch.value.toLocaleLowerCase()
  return groups.value.filter(v => v.toLocaleLowerCase().indexOf(needle) > -1)
})

const ownerOptions = computed<string[]>(() => {
  if (!owners.value) return []
  if (!ownerSearch.value) return owners.value
  const needle = ownerSearch.value.toLocaleLowerCase()
  return owners.value.filter(v => v.toLocaleLowerCase().indexOf(needle) > -1)
})

// TODO: Localize
const sections = computed(() => ({
  pagers: { title: 'Pagers', icon: 'mdi-id-card', subtitle: data.value.pagers.length > 0 ? `${data.value.pagers.length} pagers configured` : 'No pagers configured' },
  external: { title: 'Thirdparty', icon: 'mdi-cube-send', subtitle: 'APRS, Brandmeister, IPCS2, Email' }
}))

const router = useRouter()
const onExit = () => {
  router.back()
}
</script>
