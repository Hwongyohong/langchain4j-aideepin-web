<script setup lang='ts'>
import { computed, onMounted, ref, watch } from 'vue'
import { NModal, NTabPane, NTabs } from 'naive-ui'
// import General from './General.vue'
import Users from './Users.vue'

import api from '@/api'
import { SvgIcon } from '@/components/common'

interface Props {
  visible: boolean
}

interface Emit {
  (e: 'update:visible', visible: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()
const active = ref('Users')
const loading = ref(false)
const userConfig = ref<User.Config>({})

const show = computed({
  get() {
    return props.visible
  },
  set(visible: boolean) {
    emit('update:visible', visible)
  },
})

watch(
  active,
  (val) => {
    if (val === 'Quota')
      fetchConfig()
  },
)

async function fetchConfig() {
  try {
    loading.value = true
    const { data } = await api.fetchUserConfig<User.Config>()
    userConfig.value = data
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchConfig()
})
</script>

<template>
  <NModal v-model:show="show" :auto-focus="false" preset="card" style="width: 95%; max-width: 640px">
    <div>
      <NTabs v-model:value="active" type="line" animated>
        <NTabPane name="Users" tab="Users">
          <template #tab>
            <SvgIcon class="text-lg" icon="ri:file-user-line" />
            <span class="ml-2">{{ $t('control.users') }}</span>
          </template>
          <div class="min-h-[200px]">
            <Users  visible/>
          </div>
        </NTabPane>
        <NTabPane name="Quota" tab="Quota">
          <template #tab>
            <SvgIcon class="text-lg" icon="eos-icons:quota-outlined" />
            <span class="ml-2">{{ $t('control.models') }}</span>
          </template>
          <!--          <Quota :user-config="userConfig" @reloadConfig="fetchConfig" /> -->
        </NTabPane>
      </NTabs>
    </div>
  </NModal>
</template>
