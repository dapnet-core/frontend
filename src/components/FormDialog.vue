<!-- FormDialog: A multi step dialog for creating and editing data -->
<!-- Instead of having one huge page or dialog, split it up into multiple 'steps' -->
<!-- Each 'step' has its own slot, state and metadata -->
<!-- Slots are wrapped in Q-Form, so only put inputs inside -->

<template>
  <q-dialog
    v-model="showDialog"
    transition-show="slide-down" transition-hide="slide-up"
  >
    <q-stepper
      v-model="step"
      header-nav
      color="primary"
      animated
      keep-alive
    >
      <q-step
        v-for="(item, id) in steps" :key="id"
        :name="id" :title="item.title"
        :caption="item.subtitle"
        :icon="item.icon"
        :error-icon="item.icon"
        :done="state[id] === 'done'"
        :error="state[id] === 'error'"
      >
        <q-form
          :ref="(el: QForm) => forms[id] = el"
          @validation-error="() => state[id] = 'error'"
          @validation-success="() => state[id] = 'done'"
          @submit.prevent greedy
        >
          <slot :name="`step-${id}`"></slot>
        </q-form>

        <q-separator />
        <q-stepper-navigation class="right-nav">
          <q-btn-group>
            <q-btn v-if="!hideExitBtn" flat :label="$t('general.abort')" @click="close" />
            <q-btn :disable="!validForm" color="primary" :label="finishBtnText" @click="trySubmit"/>
          </q-btn-group>
        </q-stepper-navigation>
      </q-step>
    </q-stepper>
  </q-dialog>
</template>

<script setup lang="ts">
import { QForm } from 'quasar'
import { computed, ref, watch } from 'vue'

type State = 'none' | 'done' | 'error'
type Step = {title: string, icon: string, subtitle?: string}

const props = defineProps<{
  modelValue: boolean, // Used for v-model directive
  title: string,
  finishBtnText: string,
  steps: Record<string, Step>,
  hideExitBtn?: true,
  onSubmit?:() => boolean,
  onExit?:() => void,
}>()

/* FormDialog uses 'v-model' for visibility control
 * to forward this to the internal Q-Dialog, we use a computed
 * property with setter and an update event
 *
 * See https://stackoverflow.com/q/71562592
 */
// eslint-disable-next-line func-call-spacing
const emit = defineEmits<{
  (e: 'update:modelValue', newValue: boolean): void // Used for v-model directive
}>()
const showDialog = computed({
  get () { return props.modelValue },
  set (newValue) { emit('update:modelValue', newValue) }
})

const stepList = computed(() => Object.keys(props.steps))
const step = ref(stepList.value[0])
const state = ref<Record<string, State>>({})
const forms = ref<Record<string, QForm>>({})

/* Check all steps for errors, is true if there are none */
const validForm = computed(() => Object.values(state.value).every(s => s !== 'error'))

/* Iterates all 'validateable' components of each step's form
 * and checks each for errors */
const formInputs = computed(() => {
  const inputs: Record<string, boolean> = {}
  for (const k in forms.value) {
    const f = forms.value[k]
    const inputRefs = f?.getValidationComponents()
    if (inputRefs) inputs[k] = inputRefs.every((inputRef) => !inputRef.hasError)
  }
  return inputs
})

/* Watches all form elements for errors and propagates them */
watch(formInputs, (inputs) => {
  for (const form in inputs) {
    state.value[form] = inputs[form] ? 'done' : 'error'
  }
})

async function trySubmit () {
  for (const key in forms.value) {
    // This calls 'validation-error' or 'validation-success'
    await forms.value[key].validate(step.value !== key)
  }
  if (validForm.value) {
    // Validation ok, try to submit form
    // If onSubmit() returns false, cancel the event
    if (!props.onSubmit || props.onSubmit()) {
      _closeDialogInternal()
    }
  }
}

function close () {
  if (props.onExit) props.onExit()
  _closeDialogInternal()
}

function _closeDialogInternal () {
  showDialog.value = false
}
</script>

<style>
.right-nav {
  display: flex;
  flex-flow: row-reverse;
}
</style>
