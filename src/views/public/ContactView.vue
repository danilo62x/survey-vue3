<template>
  <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
    <header class="max-w-2xl">
      <p class="text-sm font-semibold tracking-wider text-brand-500 uppercase">{{ t('contact.eyebrow') }}</p>
      <h1 class="mt-2 text-title-sm font-bold text-heading sm:text-title-md">{{ t('contact.title') }}</h1>
      <p class="mt-3 text-muted">{{ t('contact.subtitle') }}</p>
    </header>

    <div class="mt-10 grid gap-8 lg:grid-cols-5">
      <div class="lg:col-span-3">
        <div class="surface-card rounded-2xl border p-6 shadow-theme-sm md:p-8">
          <form class="space-y-5" @submit="onSubmit">
            <div class="grid gap-5 sm:grid-cols-2">
              <FormField name="name" :label="t('contact.form.name')" placeholder="Ana Martins" />
              <FormField name="email" :label="t('contact.form.email')" type="email" placeholder="ana@empresa.com" />
            </div>
            <FormField
              name="subject"
              as="select"
              :label="t('contact.form.subject')"
              :hint="t('contact.form.subjectHint')"
            >
              <option value="">{{ t('contact.form.subjectPlaceholder') }}</option>
              <option v-for="subject in SUBJECTS" :key="subject" :value="subject">
                {{ t(`contact.subjects.${subject}`) }}
              </option>
            </FormField>
            <FormField
              name="message"
              as="textarea"
              :label="t('contact.form.message')"
              :rows="5"
              :placeholder="t('contact.form.messagePlaceholder')"
              :hint="t('contact.form.messageHint')"
            />
            <button
              type="submit"
              :disabled="isSubmitting"
              class="inline-flex h-12 items-center gap-2 rounded-xl bg-brand-500 px-6 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-60"
            >
              {{ t('contact.form.submit') }}
              <IconBase name="arrow-right" :size="18" />
            </button>
          </form>
        </div>
      </div>

      <aside class="space-y-4 lg:col-span-2">
        <div v-for="c in CHANNELS" :key="c.labelKey" class="surface-card flex gap-4 rounded-2xl border p-5">
          <span
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/15"
          >
            <IconBase :name="c.icon" :size="20" />
          </span>
          <div class="min-w-0">
            <p class="text-xs tracking-wider text-muted uppercase">{{ t(c.labelKey) }}</p>
            <p class="mt-1 text-sm font-medium break-words text-heading">{{ c.value }}</p>
          </div>
        </div>

        <div class="rounded-2xl border border-dashed border-themed p-5">
          <p class="text-sm font-semibold text-heading">{{ t('contact.tipTitle') }}</p>
          <p class="mt-2 text-sm text-muted">{{ t('contact.tipDesc') }}</p>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/yup'
import * as Yup from 'yup'
import IconBase from '@/components/ui/IconBase.vue'
import FormField from '@/components/ui/FormField.vue'
import { usePageTitle } from '@/composables/usePageTitle'
import { useUiStore } from '@/stores/ui'

const CHANNELS = [
  { icon: 'mail', labelKey: 'contact.channels.email', value: 'contato@sondagem.com' },
  { icon: 'message-circle', labelKey: 'contact.channels.chat', value: 'Seg a sex, 9h às 18h' },
  { icon: 'clock', labelKey: 'contact.channels.sla', value: 'Resposta em até 1 dia útil' },
  { icon: 'globe', labelKey: 'contact.channels.status', value: 'status.sondagem.com' },
]

const SUBJECTS = ['demo', 'plan', 'support', 'other'] as const

const { t } = useI18n()
usePageTitle(() => t('contact.title'))

const ui = useUiStore()

const schema = computed(() =>
  toTypedSchema(
    Yup.object({
      name: Yup.string().required(t('validation.required')),
      email: Yup.string().email(t('validation.email')).required(t('validation.required')),
      subject: Yup.string(),
      message: Yup.string()
        .min(10, t('validation.minChars', { count: 10 }))
        .required(t('validation.required')),
    })
  )
)

const { handleSubmit, isSubmitting, resetForm } = useForm({
  validationSchema: schema,
  initialValues: { name: '', email: '', subject: '', message: '' },
})

const onSubmit = handleSubmit(() => {
  ui.notifySuccess(t('contact.success'))
  resetForm()
})
</script>
