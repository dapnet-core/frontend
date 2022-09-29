<template>
  <q-page padding>
    <SubsTable
      :title="$t('pagetitle.subscribers.overview')"
      :cols="columns"
      unique-row-key="_id"
      :load-data-function="() => getJson<Subscribers>('subscribers').then((resp) => resp.rows)"
    >
      <template #cell-pager="props">
        <q-chip v-for="(item, key) in props.value" :key="key" :icon="item.img" :label="item.ric" :color="item.bgColor" :text-color="item.textColor">
          <q-tooltip>
            {{item.name}}
            <br/>
            Type: {{item.type}}
            <br/>
            {{item.enabled ? 'Enabled' : 'Disabled'}}
          </q-tooltip>
        </q-chip>
      </template>
      <template #cell-thirdparty="props">
        <q-chip v-for="(item, key) in props.value" :key="key" :label="item.text" :color="item.bgColor" :text-color="item.textColor">
          <q-badge color="primary" floating>{{item.badge}}</q-badge>
          <q-tooltip v-if="item.data">
            <span v-for="(i, k) in item.data" :key="k">{{i}}<br/></span>
          </q-tooltip>
        </q-chip>
      </template>
      <template #cell-owner="props">
        <q-chip v-for="(item, key) in props.value" :key="key" :label="item" color="grey" text-color="white" />
      </template>
      <template #cell-group="props">
        <q-chip v-for="(item, key) in props.value" :key="key" :label="item" color="grey" text-color="white" />
      </template>
    </SubsTable>
  </q-page>
</template>

<script setup lang="ts">
import { computed, toRaw } from 'vue'
import { useI18n } from 'vue-i18n'
import { Column, useGenericTable } from 'src/components/GenericDataTable'
import { SubscriberRowType, Pager, Subscribers } from 'src/api/api_routes'
import { getJson } from 'src/api/fetch'
import iconQuix from 'assets/pager/quix.png'
import iconSkyper from 'assets/pager/skyper.png'
import iconAlphapoc from 'assets/pager/alphapoc.png'
import iconSwissphone from 'assets/pager/swissphone.png'

const { t } = useI18n({ useScope: 'global' })

// TODO: Should be able to infer field type if https://github.com/microsoft/TypeScript/issues/24085 is resolved
type Columns = {
  name: Column<SubscriberRowType, '_id'>
  description: Column<SubscriberRowType, 'description'>
  pager: Column<SubscriberRowType, (row: SubscriberRowType) => (Pager & {img: string, bgColor: string, textColor: string})[]>
  thirdparty: Column<SubscriberRowType, (row: SubscriberRowType) => {
    bgColor: string;
    text: string;
    textColor: string;
    badge: number;
    data: string[];
}[]>
  owner: Column<SubscriberRowType, 'owners'>
  group: Column<SubscriberRowType, 'groups'>
}

const columns = computed<Columns>(() => ({
  name: {
    label: t('general.name'),
    align: 'left',
    field: '_id',
    sortable: true
  },
  description: {
    label: t('general.description'),
    align: 'left',
    field: 'description',
    sortable: true
  },
  pager: {
    label: t('general.pagers'),
    align: 'left',
    field: (row) => row.pagers.map(convertPager)
  },
  thirdparty: {
    align: 'left',
    label: t('general.thirdpartyservices'),
    field: (row) => Object.entries(row.thirdparty).map(([key, val]) => convertThirdparty(key, toRaw(val)))
  },
  owner: {
    label: t('general.owner'),
    align: 'center',
    field: 'owners'
  },
  group: {
    label: t('general.subscriber_groups'),
    align: 'center',
    field: 'groups'
  }
}))

const SubsTable = useGenericTable<SubscriberRowType, Columns>()

function convertPager (pager: Pager) {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const convertThirdparty = (name: string, data: any[]) => {
  let tmp
  if (name === 'aprs') {
    tmp = {
      bgColor: 'deep-orange',
      text: 'APRS',
      textColor: 'white'
    }
  } else if (name === 'brandmeister') {
    tmp = {
      bgColor: 'purple',
      text: 'Brandmeister',
      textColor: 'white'
    }
  } else if (name === 'ipsc2') {
    tmp = {
      bgColor: 'purple',
      text: 'IPCS2',
      textColor: 'white'
    }
  } else if (name === 'email') {
    tmp = {
      bgColor: 'amber',
      text: 'Email',
      textColor: 'black'
    }
  }
  return {
    bgColor: 'red',
    textColor: 'white',
    text: name,
    badge: 1,
    data: data.map((v) => v.toString()),
    ...tmp
  }
}
</script>
