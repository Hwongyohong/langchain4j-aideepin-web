<script setup lang='ts'>
import type { DataTableColumns } from 'naive-ui'
import { computed, h, reactive, ref, watch } from 'vue'
import { NButton, NDataTable, NInput, NInputGroup, NList, NListItem, NModal, NSelect, NSpace, NThing, useMessage } from 'naive-ui'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useAuthStore } from '@/store'
import { t } from '@/locales'
import api from '@/api'

interface Props {
  visible: boolean
}
interface Emit {
  (e: 'update:visible', visible: boolean): void
}
const props = defineProps<Props>()
const emit = defineEmits<Emit>()
const authStore = useAuthStore()
const token = ref<string>(authStore.token)
const message = useMessage()
const show = computed({
  get: () => props.visible,
  set: (visible: boolean) => emit('update:visible', visible),
})
const loading = ref(false)
const showModal = ref(false)
const searchValue = ref<string>('')
// 移动端自适应相关
const { isMobile } = useBasicLayout()
const userList = ref<User.UserInfo[]>([])
const currUser = ref<User.UserConfig>({})
const paginationReactive = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
})
// Modal模式，根据不同模式渲染不同的Modal内容
const modalMode = ref('')

const updateUser = async () => {
  message.success(t('common.editSuccess'))
  await api.userSave(currUser.value)
  const respData = await api.searchUsers<PageResponse>(1, 20)
  setResp(1, respData.data)
  showModal.value = !showModal.value
}

const changeShowModal = async (uuid: string) => {
  const resp = await api.editUser(uuid)
  currUser.value = resp.data as User.UserConfig
  showModal.value = !showModal.value
  modalMode.value = 'modify'
}
interface StatusDescriptions {
  [key: string]: string // 添加索引签名

}
const userStatusDescriptions: StatusDescriptions = {
  WAIT_CONFIRM: '待验证',
  NORMAL: '正常',
  FREEZE: '冻结',
}

const userLevelDescriptions: StatusDescriptions = {
  0: '普通',
  1: '高级',
}

// 移动端自适应相关
const renderTemplate = () => {
  return userList.value.map((item: User.UserInfo) => {
    const statusDescription = userStatusDescriptions[item.userStatus] || '未知状态'
    const levelDescription = userLevelDescriptions[item.userLevel] || '未知级别'

    return {
      uuid: item.uuid,
      name: item.name,
      userStatus: statusDescription,
      activeTime: item.activeTime,
      userLevel: levelDescription,
    }
  })
}

// table相关
const createColumns = (): DataTableColumns<User.UserInfo> => {
  return [
    {
      title: t('control.userName'),
      key: 'name',
    },
    {
      title: t('control.userLevel'),
      key: 'userLevel',
    },
    {
      title: t('control.userStatus'),
      key: 'userStatus',
    },
    {
      title: t('control.activeTime'),
      key: 'activeTime',
    },

    {
      title: t('common.action'),
      key: 'actions',
      width: 100,
      align: 'center',
      render(row) {
        return h('div', { class: 'flex items-center flex-col gap-2' }, {
          default: () => [h(
            NButton,
            {
              tertiary: true,
              size: 'small',
              type: 'info',
              onClick: () => changeShowModal(row.uuid),
            },
            { default: () => t('common.edit') },
          ),
          ],
        })
      },
    },
  ]
}

const columns = createColumns()

const dataSource = computed(() => {
  return renderTemplate()
})

async function handlePageChange(currentPage: number) {
  loading.value = true
  const resp = await api.searchPrompts<PageResponse>(currentPage, paginationReactive.pageSize, searchValue.value)
  setResp(currentPage, resp.data)
  loading.value = false
}

async function search(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    clickSearch()
  }
}

async function clickSearch() {
  const resp = await api.searchUsers<PageResponse>(1, paginationReactive.pageSize, searchValue.value)
  setResp(1, resp.data)
}

async function initPrompts() {
  const resp = await api.searchUsers<PageResponse>(1, paginationReactive.pageSize)
  setResp(1, resp.data)
}

function setResp(currentPage: number, data: PageResponse) {
  userList.value = data.records
  paginationReactive.page = currentPage
  paginationReactive.itemCount = data.total
}

watch(
  () => token,
  () => {
    if (token.value)
      initPrompts()
  },
  { immediate: true },
)
</script>

<template>
  <NModal v-model:show="show" style="width: 90%; max-width: 900px;" preset="card">
    <div class="space-y-4">
      <div class="flex gap-3 mb-4" :class="[isMobile ? 'flex-col' : 'flex-row justify-between']">
        <div class="flex items-center">
          <NInputGroup>
            <NInput v-model:value="searchValue" style="width: 100%" @keyup="search" />
            <NButton ghost @click="clickSearch">
              搜索
            </NButton>
          </NInputGroup>
        </div>
      </div>
      <NDataTable
        v-if="!isMobile" remote :loading="loading" :max-height="400" :columns="columns" :data="dataSource"
        :pagination="paginationReactive" :bordered="false" @update:page="handlePageChange"
      />
      <NList v-if="isMobile" style="max-height: 400px; overflow-y: auto;">
        <NListItem v-for="(item, index) of dataSource" :key="index">
          <NThing :title="item.name" :description="item.userStatus" />
          <template #suffix>
            <div class="flex flex-col items-center gap-2">
              <NButton tertiary size="small" type="info">
                {{ t('common.edit') }}
              </NButton>
            </div>
          </template>
        </NListItem>
      </NList>
    </div>
  </NModal>

  <NModal v-model:show="showModal" style="width: 90%; max-width: 600px;" preset="card">
    <NSpace v-if="modalMode === 'add' || modalMode === 'modify'" vertical>
      {{ t('control.userName') }}
      <NInput v-model:value="currUser.name" />
      {{ t('control.userLevel') }}
      <NSelect
        v-model:value="currUser.userLevel"
        :options="[
          { label: '普通', value: 0 },
          { label: '高级', value: 1 },
        ]"
      />

      {{ t('control.userStatus') }}
      <NSelect
        v-model:value="currUser.userStatus"
        :options="[
          { label: '待验证', value: 'WAIT_CONFIRM' },
          { label: '正常', value: 'NORMAL' },
          { label: '冻结', value: 'FREEZE' },
        ]"
      />

      {{ t('control.dayTokenLimit') }}
      <NInput v-model:value="currUser.quotaByTokenDaily" />
      {{ t('control.monthTokenLimit') }}
      <NInput v-model:value="currUser.quotaByTokenMonthly" />

      <NButton
        block type="primary"
        @click="() => { updateUser() }"
      >
        {{ t('common.confirm') }}
      </NButton>
    </NSpace>
  </NModal>
</template>
