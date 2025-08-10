<template>
  <div id="pictureRankPage">
    <!-- 顶部横幅区域 -->
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">📊 图片排行榜</h1>
        <p class="hero-subtitle">发现最受欢迎的精彩作品</p>
      </div>
    </div>
    <!-- 标签页切换区域 -->
    <div class="tabs-section">
      <div class="tabs-container">
        <div class="tab-buttons">
          <button :class="{ active: type === 'day' }" @click="changeType('day')" class="tab-button">
            <span class="tab-icon">🌟</span>
            <span>日榜</span>
          </button>
          <button
            :class="{ active: type === 'week' }"
            @click="changeType('week')"
            class="tab-button"
          >
            <span class="tab-icon">🔥</span>
            <span>周榜</span>
          </button>
          <button
            :class="{ active: type === 'month' }"
            @click="changeType('month')"
            class="tab-button"
          >
            <span class="tab-icon">👑</span>
            <span>月榜</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 排行榜内容区域 -->
    <div class="ranking-section">
      <RankingList :rankList="rankList" :type="type" :loading="loading" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import RankingList from '@/components/RankingList.vue'
import { rankPictureUsingGet } from '@/api/pictureController'
import { message } from 'ant-design-vue'

const type = ref('day')
const rankList = ref([])
const loading = ref(false)

const fetchRankList = async (rankType) => {
  loading.value = true
  try {
    const res = await rankPictureUsingGet({ type: rankType })
    if (res.data.code === 0 && res.data.data) {
      rankList.value = res.data.data
    } else {
      message.error('获取数据失败，' + res.data.message)
    }
  } catch {
    message.error('接口请求失败')
  } finally {
    loading.value = false
  }
}

const changeType = (newType) => {
  if (type.value === newType) return
  type.value = newType
  fetchRankList(newType)
}

onMounted(() => {
  fetchRankList(type.value)
})
</script>

<style scoped>
#pictureRankPage {
  min-height: 100vh;
  background: #f8fafc;
}

/* 顶部横幅区域 */
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60px 0 50px;
  text-align: center;
  color: white;
  margin-bottom: 30px;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.hero-title {
  font-size: 2.8rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: white;
}

.hero-subtitle {
  font-size: 1.1rem;
  margin-bottom: 0;
  opacity: 0.9;
  font-weight: 400;
}

/* 标签页区域 */
.tabs-section {
  max-width: 1200px;
  margin: 0 auto 30px;
  padding: 0 20px;
}

.tabs-container {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
}

.tab-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  font-weight: 600;
  border: 2px solid #e5e7eb;
  background: white;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-size: 15px;
  color: #6b7280;
  min-width: 120px;
  justify-content: center;
}

.tab-button:hover:not(.active) {
  border-color: #667eea;
  color: #667eea;
  background: #f8f9ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.tab-button.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-color: #667eea;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.tab-icon {
  font-size: 18px;
  line-height: 1;
}

/* 排行榜内容区域 */
.ranking-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 60px;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .hero-title {
    font-size: 2.5rem;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .tabs-section {
    padding: 0 16px;
  }

  .ranking-section {
    padding: 0 16px 60px;
  }

  .tab-button {
    min-width: 100px;
    padding: 10px 16px;
    font-size: 14px;
  }
}

@media (max-width: 576px) {
  .hero-section {
    padding: 40px 0 30px;
  }

  .hero-title {
    font-size: 1.8rem;
  }

  .tabs-container {
    padding: 16px;
  }

  .tab-buttons {
    gap: 8px;
  }

  .tab-button {
    flex: 1;
    min-width: auto;
  }
}
</style>
