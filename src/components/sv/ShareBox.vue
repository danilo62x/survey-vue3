<template>
  <!-- Link público, código de leitura e trecho para incorporar. -->
  <div class="grid gap-5 lg:grid-cols-3">
    <div class="surface-card rounded-2xl border p-5 md:p-6 lg:col-span-2">
      <h3 class="text-base font-semibold text-heading">{{ t('share.linkTitle') }}</h3>
      <p class="mt-1 text-sm text-muted">{{ t('share.linkDesc') }}</p>

      <div class="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          readonly
          :value="link"
          :aria-label="t('share.linkTitle')"
          class="focus-ring min-w-0 flex-1 rounded-lg border border-themed bg-gray-50 px-3.5 py-2.5 text-sm text-body dark:bg-gray-900/40"
        />
        <button
          type="button"
          class="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white transition hover:bg-brand-600"
          @click="copy(link, 'link')"
        >
          <IconBase :name="copied === 'link' ? 'check' : 'copy'" :size="16" />
          {{ copied === 'link' ? t('share.copiedShort') : t('common.copy') }}
        </button>
      </div>

      <h3 class="mt-8 text-base font-semibold text-heading">{{ t('share.embedTitle') }}</h3>
      <p class="mt-1 text-sm text-muted">{{ t('share.embedDesc') }}</p>
      <textarea
        readonly
        :rows="3"
        :value="embed"
        :aria-label="t('share.embedTitle')"
        class="focus-ring mt-4 w-full resize-none rounded-lg border border-themed bg-gray-50 px-3.5 py-2.5 font-mono text-xs text-body dark:bg-gray-900/40"
      />
      <button
        type="button"
        class="mt-3 inline-flex h-10 items-center gap-2 rounded-lg border border-themed px-4 text-sm font-medium text-body transition hover:bg-gray-50 dark:hover:bg-gray-800"
        @click="copy(embed, 'embed')"
      >
        <IconBase :name="copied === 'embed' ? 'check' : 'code'" :size="16" />
        {{ copied === 'embed' ? t('share.copiedShort') : t('share.copyEmbed') }}
      </button>
    </div>

    <div class="surface-card flex flex-col items-center rounded-2xl border p-5 text-center md:p-6">
      <h3 class="text-base font-semibold text-heading">{{ t('share.qrTitle') }}</h3>
      <p class="mt-1 text-sm text-muted">{{ t('share.qrDesc') }}</p>
      <div class="mt-5">
        <QrCode :value="link" />
      </div>
      <a
        :href="link"
        target="_blank"
        rel="noreferrer"
        class="mt-5 inline-flex h-10 items-center gap-2 rounded-lg border border-themed px-4 text-sm font-medium text-body transition hover:bg-gray-50 dark:hover:bg-gray-800"
      >
        <IconBase name="external-link" :size="16" />
        {{ t('share.openForm') }}
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Survey } from '@/data/types'
import { useUiStore } from '@/stores/ui'
import IconBase from '@/components/ui/IconBase.vue'
import QrCode from './QrCode.vue'

const props = defineProps<{ survey: Survey }>()

const { t } = useI18n()
const ui = useUiStore()
const copied = ref<string | null>(null)

const origin = typeof window !== 'undefined' ? window.location.origin : 'https://sondagem.app'
const link = computed(() => `${origin}/f/${props.survey.slug}`)
const embed = computed(
  () => `<iframe src="${link.value}" width="100%" height="640" frameborder="0" title="${props.survey.title}"></iframe>`
)

async function copy(text: string, key: string) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    // Navegador sem permissão de área de transferência: seguimos com o aviso.
  }
  copied.value = key
  ui.notifySuccess(t('share.copied'))
  setTimeout(() => (copied.value = null), 2000)
}
</script>
