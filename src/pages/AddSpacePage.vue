<template>
  <div class="add-space-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-decoration"></div>
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">
            {{ route.query?.id ? '修改空间' : '创建空间' }} - {{ SPACE_TYPE_MAP[spaceType] }}
          </h1>
          <p class="page-subtitle">
            {{ route.query?.id ? '编辑现有空间信息' : '创建新的空间来管理您的图片资源' }}
          </p>
        </div>
      </div>
    </div>

    <!-- 表单区域 -->
    <div class="form-section">
      <div class="form-container">
        <a-form
          name="spaceForm"
          layout="vertical"
          :model="spaceForm"
          @finish="handleSubmit"
          class="space-form"
        >
          <!-- 空间名称 -->
          <div class="form-group">
            <a-form-item name="spaceName" label="空间名称" class="form-item">
              <a-input
                v-model:value="spaceForm.spaceName"
                placeholder="请输入空间名称"
                allow-clear
                class="form-input"
                size="large"
              />
            </a-form-item>
          </div>

          <!-- 空间级别 -->
          <div class="form-group">
            <a-form-item name="spaceLevel" label="空间级别" class="form-item">
              <a-select
                v-model:value="spaceForm.spaceLevel"
                :options="SPACE_LEVEL_OPTIONS"
                placeholder="请选择空间级别"
                allow-clear
                class="form-select"
                size="large"
              />
            </a-form-item>
          </div>

          <!-- 空间级别介绍卡片 -->
          <div class="info-section">
            <div class="info-card">
              <div class="card-header">
                <h3 class="card-title">空间级别介绍</h3>
              </div>
              <div class="card-content">
                <div class="notice-text">
                  <span class="notice-icon">💡</span>
                  目前仅支持开通普通版，如需升级空间，请联系
                  <a href="https://github.com/zhemu6" target="_blank" class="contact-link">
                    管理员
                  </a>
                  。
                </div>
                <div class="level-list">
                  <div
                    v-for="spaceLevel in spaceLevelList"
                    :key="spaceLevel.value"
                    class="level-item"
                  >
                    <div class="level-badge">{{ spaceLevel.text }}</div>
                    <div class="level-details">
                      <span class="detail-item">
                        <span class="detail-label">存储大小：</span>
                        <span class="detail-value">{{ formatSize(spaceLevel.maxSize) }}</span>
                      </span>
                      <span class="detail-item">
                        <span class="detail-label">图片数量：</span>
                        <span class="detail-value">{{ spaceLevel.maxCount }} 张</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 提交按钮 -->
          <div class="submit-section">
            <a-button
              type="primary"
              html-type="submit"
              :loading="loading"
              class="submit-btn"
              size="large"
            >
              <span v-if="!loading">
                {{ route.query?.id ? '保存修改' : '创建空间' }}
              </span>
              <span v-else>
                {{ route.query?.id ? '保存中...' : '创建中...' }}
              </span>
            </a-button>
          </div>
        </a-form>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { formatSize } from '@/utils'

import {
  addSpaceUsingPost,
  editSpaceUsingPost,
  getSpaceVoByIdUsingGet,
  listSpaceLevelUsingGet,
  updateSpaceUsingPost,
} from '@/api/spaceController'
import { message } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'
import { SPACE_LEVEL_OPTIONS, SPACE_TYPE_ENUM, SPACE_TYPE_MAP } from '@/constants/space'

const loading = ref(false)
const router = useRouter()

const uploadType = ref<'file' | 'url'>('file')

const space = ref<API.SpaceVO>()

const onSuccess = (newSpace: API.SpaceVO) => {
  space.value = newSpace
  spaceForm.spaceName = newSpace.spaceName
}

const spaceForm = reactive<API.SpaceAddRequest | API.SpaceEditRequest>({})
/**
 * 表单提交
 * @param values 输入的值
 */
const handleSubmit = async (values: any) => {
  // 现在提交的时候 我们有两个接口 一个是创建 一个是管理员修改
  // 如果spaceId存在
  loading.value = true
  const spaceId = space.value?.id
  let res
  try {
    // 如果spaceId存在 那么就是更新接口
    if (spaceId) {
      res = await updateSpaceUsingPost({
        id: spaceId,
        ...spaceForm,
      })
    } else {
      // 创建
      res = await addSpaceUsingPost({
        ...spaceForm,
        spaceType: spaceType.value,
      })
    }

    if (res.data.code === 0 && res.data.data) {
      message.success('操作成功！')
      // todo 这里在修改或者是保存后的 跳转到空间详情页的功能尚未开发 在里面通过看板展示我们的空间内部的照片 空间内的容量使用情况
      router.push({
        path: `/space/${res.data.data}`,
      })
    } else {
      message.error('操作 ' + res.data.message)
    }
  } catch (e: any) {
    message.error(`创建失败 ${e.message}`)
  }

  loading.value = false
}
// 获取空间级别信息 包含他的名称、大小
const spaceLevelList = ref<API.SpaceLevel[]>([])
const fetchSpaceLevelList = async () => {
  const res = await listSpaceLevelUsingGet()
  if (res.data.code === 0 && res.data.data) {
    spaceLevelList.value = res.data.data
  } else {
    message.error('获取空间级别失败，' + res.data.message)
  }
}

onMounted(() => {
  getOldSpaceInfo()
  fetchSpaceLevelList()
})

const route = useRoute()
// 从路径地址中获取是创建私有空间还是团队空间
const spaceType = computed(() => {
  // 如果路径中有type字段 就是创建实际type空间
  if (route.query?.type) {
    return Number(route.query.type)
  } else {
    // 否则就默认是创建私有空间
    return SPACE_TYPE_ENUM.PRIVATE
  }
})

// 获取旧的空间的信息
const getOldSpaceInfo = async () => {
  // 获取到id
  // const id = Number(route.query?.id)
  const id = route.query?.id as string // ✅ 保留为 string

  console.log(id)
  if (id) {
    const res = await getSpaceVoByIdUsingGet({
      id: id,
    })
    console.log(res)
    if (res.data.code === 0 && res.data.data) {
      const data = res.data.data
      console.log(data)
      space.value = data
      spaceForm.spaceName = data.spaceName
      spaceForm.spaceLevel = data.spaceLevel
    }
  }
}
</script>
<style scoped>
.add-space-page {
  padding: 16px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

/* 页面头部样式 */
.page-header {
  position: relative;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(102, 126, 234, 0.1);
  backdrop-filter: blur(10px);
  overflow: hidden;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.header-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  flex-direction: column;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  font-size: 14px;
  color: #8c8c8c;
  margin: 0;
}

/* 表单区域样式 */
.form-section {
  max-width: 800px;
  margin: 0 auto;
}

.form-container {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(102, 126, 234, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.form-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.space-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 表单组样式 */
.form-group {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(102, 126, 234, 0.05);
  transition: all 0.3s ease;
}

.form-group:hover {
  background: rgba(255, 255, 255, 0.5);
  border-color: rgba(102, 126, 234, 0.1);
}

.form-item {
  margin-bottom: 0;
}

.form-item :deep(.ant-form-item-label > label) {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.form-input,
.form-select {
  border-radius: 8px;
  border: 1px solid rgba(102, 126, 234, 0.2);
  transition: all 0.3s ease;
}

.form-input:hover,
.form-select:hover {
  border-color: rgba(102, 126, 234, 0.4);
}

.form-input:focus,
.form-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.form-select :deep(.ant-select-selector) {
  border-radius: 8px;
  border: 1px solid rgba(102, 126, 234, 0.2);
  transition: all 0.3s ease;
}

.form-select :deep(.ant-select-selector):hover {
  border-color: rgba(102, 126, 234, 0.4);
}

.form-select :deep(.ant-select-focused .ant-select-selector) {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

/* 信息卡片样式 */
.info-section {
  margin: 24px 0;
}

.info-card {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%);
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.info-card:hover {
  border-color: rgba(102, 126, 234, 0.2);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.card-header {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  padding: 16px 20px;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.card-content {
  padding: 20px;
}

.notice-text {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.2);
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #856404;
}

.notice-icon {
  font-size: 16px;
}

.contact-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.contact-link:hover {
  color: #764ba2;
  text-decoration: underline;
}

.level-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.level-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  border: 1px solid rgba(102, 126, 234, 0.05);
  transition: all 0.3s ease;
}

.level-item:hover {
  background: rgba(255, 255, 255, 0.8);
  border-color: rgba(102, 126, 234, 0.1);
  transform: translateX(4px);
}

.level-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  min-width: 80px;
  text-align: center;
}

.level-details {
  display: flex;
  gap: 24px;
  flex: 1;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}

.detail-label {
  color: #666;
  font-weight: 500;
}

.detail-value {
  color: #333;
  font-weight: 600;
}

/* 提交按钮样式 */
.submit-section {
  margin-top: 32px;
  text-align: center;
}

.submit-btn {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.submit-btn:active {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .add-space-page {
    padding: 12px;
  }

  .page-header {
    padding: 20px;
    margin-bottom: 20px;
  }

  .page-title {
    font-size: 20px;
  }

  .form-container {
    padding: 24px;
  }

  .form-group {
    padding: 16px;
  }

  .level-details {
    flex-direction: column;
    gap: 8px;
  }

  .level-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .level-badge {
    align-self: flex-start;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 16px;
  }

  .page-title {
    font-size: 18px;
  }

  .form-container {
    padding: 20px;
  }

  .card-content {
    padding: 16px;
  }

  .notice-text {
    padding: 10px 12px;
    font-size: 13px;
  }

  .submit-btn {
    height: 44px;
    font-size: 15px;
  }
}
</style>
