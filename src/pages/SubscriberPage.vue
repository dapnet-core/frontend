<template>
  <q-page padding>
    <SubsTable
      :title="$t('pagetitle.subscribers.overview')"
      :cols="columns"
      unique-row-key="_id"
      :load-data-function="loadData"
      :actions="actions"
    >
      <template #cell-pager="props">
        <q-chip
          v-for="(item, key) in props.value" :key="key"
          :icon="item.img" :label="item.ric" size="1em"
          :color="item.bgColor" :text-color="item.textColor"
        >
          <q-tooltip>
            <!-- TODO: Localize -->
            Name: {{item.name}}
            <br/>
            Type: {{item.type}}
            <br/>
            {{item.enabled ? 'Enabled' : 'Disabled'}}
          </q-tooltip>
        </q-chip>
      </template>
      <template #cell-thirdparty="props">
        <q-chip
          v-for="(item, key) in props.value" :key="key"
          :label="item.text" size="1em"
          :color="item.bgColor" :text-color="item.textColor"
        >
          <q-badge v-if="item.badge > 1" color="primary" floating>{{item.badge}}</q-badge>
          <q-tooltip v-if="item.data">
            <span v-for="(i, k) in item.data" :key="k">{{i}}<br/></span>
          </q-tooltip>
        </q-chip>
      </template>
      <template #cell-owner="props">
        <q-chip
          v-for="(item, key) in props.value" :key="key"
          :label="item" size="1em"
          color="grey" text-color="white"
        />
      </template>
      <template #cell-group="props">
        <q-chip
          v-for="(item, key) in props.value" :key="key"
          :label="item" size="1em"
          color="grey" text-color="white"
        />
      </template>
      <template #cell-actions="props">
        <q-btn-group unelevated>
          <q-btn color="info" icon="mdi-pencil-outline" dense size="1em" @click="handleEdit(props.value)">
            <q-tooltip>{{$t('table.actionbuttons.edit')}}</q-tooltip>
          </q-btn>
          <q-btn color="negative" icon="mdi-delete-outline" dense size="1em" @click="handleDelete(props.value)">
            <q-tooltip>{{$t('table.actionbuttons.delete')}}</q-tooltip>
          </q-btn>
          <!-- TODO: Missing mail in row type -->
          <!-- <q-btn color="secondary" icon="mdi-email-fast-outline" :href="`mailto:${props.row.mail}`"/> -->
        </q-btn-group>
      </template>
    </SubsTable>
  </q-page>
</template>

<script setup lang="ts">
import { computed, toRaw } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Column, useGenericTable } from 'src/components/GenericDataTable'
import { SubscriberRowType, Pager, Subscribers } from 'src/api/api_routes'
import { getJson } from 'src/api/fetch'
import iconQuix from 'assets/pager/quix.png'
import iconSkyper from 'assets/pager/skyper.png'
import iconAlphapoc from 'assets/pager/alphapoc.png'
import iconSwissphone from 'assets/pager/swissphone.png'
import { ExtractComputed } from 'src/misc'

const { t } = useI18n({ useScope: 'global' })

// Shorthand, T being the data type of the field function
type FCol<T> = Column<SubscriberRowType, (row: SubscriberRowType) => T, T>

const columns = computed(() => ({
  name: {
    label: t('general.name'),
    align: 'left',
    field: '_id',
    sortable: true
  } as Column<SubscriberRowType, '_id'>,
  description: {
    label: t('general.description'),
    align: 'left',
    field: 'description',
    sortable: true
  } as Column<SubscriberRowType, 'description'>,
  pager: {
    label: t('general.pagers'),
    align: 'left',
    field: (row) => row.pagers.map(displayPager)
  } as FCol<(Pager & {img: string, bgColor: string, textColor: string})[]>,
  thirdparty: {
    align: 'left',
    label: t('general.thirdpartyservices'),
    field: (row) => Object.entries(row.thirdparty).map(([key, val]) => displayThirdparty(key, toRaw(val)))
  } as FCol<{bgColor: string; text: string; textColor: string; badge: number; data: string[]}[]>,
  owner: {
    label: t('general.owner'),
    align: 'center',
    field: 'owners'
  } as Column<SubscriberRowType, 'owners'>,
  group: {
    label: t('general.subscriber_groups'),
    align: 'center',
    field: 'groups'
  } as Column<SubscriberRowType, 'groups'>,
  actions: {
    label: t('general.actions'),
    align: 'center',
    field: '_id'
  } as Column<SubscriberRowType, '_id'>
}))

const SubsTable = useGenericTable<SubscriberRowType, ExtractComputed<typeof columns>>()

const actions = computed(() => ([
  { color: 'primary', icon: 'mdi-plus', tooltip: t('subscribers.overview.addsubscriber'), handler: handleAdd }
]))

function loadData () {
  return getJson<Subscribers>('subscribers').then((resp) => resp.rows)
}

function displayPager (pager: Pager) {
  if (pager.type === 'alphapoc') {
    return {
      bgColor: 'green',
      textColor: 'white',
      img: `img:${iconAlphapoc}`,
      ...pager
    }
  } else if (pager.type === 'skyper') {
    return {
      bgColor: 'red',
      textColor: 'white',
      img: `img:${iconSkyper}`,
      ...pager
    }
  } else if (pager.type === 'swissphone') {
    return {
      bgColor: 'grey',
      textColor: 'white',
      img: `img:${iconSwissphone}`,
      ...pager
    }
  } else if (pager.type === 'quix') {
    return {
      bgColor: 'purple',
      textColor: 'white',
      img: `img:${iconQuix}`,
      ...pager
    }
  }

  console.warn(`Unknown pager type "${pager.type}"`, pager)
  return {
    bgColor: 'red',
    textColor: 'white',
    img: 'mdi-alert-circle',
    ...pager
  }
}

const router = useRouter()

function handleDelete (id: SubscriberRowType['_id']) {
  console.log('Delete ' + id)
}

function handleEdit (id: SubscriberRowType['_id']) {
  router.push({ path: '/subscribers/edit/' + id })
}

function handleAdd () {
  router.push('/subscribers/new')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const displayThirdparty = (name: string, input: any[]) => {
  const badge = input.length
  const data = input.map((v) => v.toString())

  if (name === 'aprs') {
    return {
      bgColor: 'deep-orange',
      text: 'APRS',
      textColor: 'white',
      badge,
      data
    }
  } else if (name === 'brandmeister') {
    return {
      bgColor: 'purple',
      text: 'Brandmeister',
      textColor: 'white',
      badge,
      data
    }
  } else if (name === 'ipsc2') {
    return {
      bgColor: 'purple',
      text: 'IPCS2',
      textColor: 'white',
      badge,
      data
    }
  } else if (name === 'email') {
    return {
      bgColor: 'amber',
      text: 'Email',
      textColor: 'black',
      badge,
      data
    }
  }

  return {
    bgColor: 'red',
    textColor: 'white',
    text: name,
    badge,
    data
  }
}
</script>
