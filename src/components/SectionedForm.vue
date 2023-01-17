<!-- SectionedForm: A multi-section form for creating and editing data -->
<template>
  <q-list
    bordered
    class="rounded-borders"
  >
    <q-expansion-item
      v-for="(item, id) in sections" :key="id"
      :name="id" :label="item.title"
      :caption="item.subtitle"
      :icon="item.icon"
      :header-class="formInputs[id] ? '' : 'text-red'"
    >
      <q-form
        :ref="(el) => forms[id] = el as QForm"
        @submit.prevent greedy
      >
        <slot :name="`section-${id}`"></slot>
      </q-form>
    </q-expansion-item>
    <q-item>
      <q-btn-group>
        <q-btn v-if="!hideExitBtn" flat :label="$t('general.abort')" @click="_exit"/>
        <q-btn :disable="!Object.values(formInputs).every(b => b)" color="primary" :label="finishBtnText" @click="trySubmit"/>
      </q-btn-group>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import { QForm } from 'quasar'
import { computed, ref } from 'vue'

type Section = {title: string, icon: string, subtitle?: string}

const props = defineProps<{
  title: string,
  finishBtnText: string,
  sections: Record<string, Section>,
  hideExitBtn?: true,
  onSubmit?:() => boolean,
  onExit?:() => void,
}>()

const forms = ref<Record<string, QForm>>({})

/* Iterates all 'validateable' components of each step's form
 * and checks each for errors */
const formInputs = computed<Record<string, boolean>>(() => {
  const inputs: Record<string, boolean> = {}
  for (const k in forms.value) {
    const f = forms.value[k]
    const inputRefs = f?.getValidationComponents()
    if (inputRefs) inputs[k] = inputRefs.every((inputRef) => !inputRef.hasError)
  }
  return inputs
})

async function validate () {
  return (await Promise.all(Object.values(forms.value).map(f => f.validate()))).every((b) => b)
}

async function trySubmit () {
  if (await validate()) {
    // Validation ok, try to submit form
    // If onSubmit() returns false, cancel the event
    if (!props.onSubmit || props.onSubmit()) {
      _exit()
    }
  }
}

function _exit () {
  if (props.onExit) props.onExit()
}

</script>
