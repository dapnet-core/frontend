<!-- SectionedForm: A multi-section form for creating and editing data -->
<!-- Middle ground between using steps and just rendering the form in full -->
<!-- See https://ux.stackexchange.com/questions/95422/keep-long-form-or-separate-into-multiple-steps -->
<!-- One form per section, so we can assign errors to each section specifically -->
<template>
  <q-list
    bordered
    class="rounded-borders"
  >
    <q-item-label v-if="title" class="q-pt-md q-pl-md text-h5">{{ title }}</q-item-label>
    <q-item v-if="!!slots['section-default']">
      <q-item-section>
        <q-form
          :ref="(el) => forms['section-default'] = el as QForm"
          @submit.prevent greedy
        >
          <slot :name="`section-default`"></slot>
        </q-form>
      </q-item-section>
    </q-item>
    <q-separator/>
    <template v-for="(item, id) in sections" :key="id">
      <q-expansion-item
        :name="id" :label="item.title"
        :caption="item.subtitle"
        :icon="item.icon"
        :header-class="formInputs[id] ? '' : 'text-red animated headShake'"
      >
        <q-form
          :ref="(el) => forms[id] = el as QForm"
          @submit.prevent greedy
          class="q-px-md"
        >
          <slot :name="`section-${id}`"></slot>
        </q-form>
      </q-expansion-item>
      <q-separator/>
    </template>
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
import { computed, ref, useSlots } from 'vue'

type Section = {title: string, icon: string, subtitle?: string}

const slots = useSlots()
const props = defineProps<{
  title?: string,
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
