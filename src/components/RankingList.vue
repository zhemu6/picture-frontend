<template>
  <div id="rank-list">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <a-spin size="large" tip="正在加载排行榜数据...">
        <div class="loading-placeholder"></div>
      </a-spin>
    </div>

    <!-- 排行榜内容 -->
    <div v-else>
      <div class="rank-header">
        <h2 class="rank-title">{{ title }}</h2>
        <div class="rank-subtitle">
          <span class="update-time">实时更新</span>
          <span class="total-count">共 {{ rankList.length }} 张作品</span>
        </div>
      </div>

      <div v-if="rankList && rankList.length > 0" class="rank-container">
        <!-- 前三名特殊展示 -->
        <div class="top-three">
          <div
            v-for="(item, index) in rankList.slice(0, 3)"
            :key="item.pictureId"
            :class="['top-item', `rank-${index + 1}`]"
            @click="handlePictureClick(item)"
          >
            <div class="medal">
              <span class="medal-icon">{{ getMedalIcon(index + 1) }}</span>
              <span class="rank-number">#{{ item.rankNum }}</span>
            </div>
            <div class="top-thumbnail">
              <img :src="item.thumbnailUrl || item.url" :alt="item.name" />
              <div class="overlay">
                <div class="stats">
                  <span class="like-count">
                    <HeartFilled />
                    {{ formatNumber(item.likeCount) }}
                  </span>
                </div>
              </div>
            </div>
            <div class="top-info">
              <h3 class="top-name">{{ item.name }}</h3>
              <p class="top-category">{{ item.category || '未分类' }}</p>
            </div>
          </div>
        </div>

        <!-- 其他排名 -->
        <div v-if="rankList.length > 3" class="other-ranks">
          <h3 class="section-title">其他排名</h3>
          <div class="rank-items">
            <div
              v-for="item in rankList.slice(3)"
              :key="item.pictureId"
              class="rank-item"
              @click="handlePictureClick(item)"
            >
              <div class="rank-badge">
                <span class="rank-num">#{{ item.rankNum }}</span>
              </div>

              <div class="thumbnail">
                <img :src="item.thumbnailUrl || item.url" :alt="item.name" />
              </div>

              <div class="info">
                <h4 class="name">{{ item.name }}</h4>
                <p class="introduction" v-if="item.introduction">{{ item.introduction }}</p>
                <div class="meta-info">
                  <span class="category">{{ item.category || '未分类' }}</span>
                  <span class="tags" v-if="item.tags && item.tags.length">
                    {{ item.tags.slice(0, 2).join(', ') }}
                    <span v-if="item.tags.length > 2">...</span>
                  </span>
                </div>
                <div class="stats-row">
                  <span class="like-count">
                    <HeartFilled />
                    {{ formatNumber(item.likeCount) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <div class="empty-icon">📊</div>
        <h3 class="empty-title">暂无排行榜数据</h3>
        <p class="empty-description">当前时间段内还没有足够的数据生成排行榜</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue'
import { HeartFilled } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'

interface Props {
  rankList: Array<API.PictureRankVO>
  type: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const router = useRouter()

const title = computed(() => {
  switch (props.type) {
    case 'day':
      return '🌟 每日最佳照片榜'
    case 'week':
      return '🔥 每周最佳照片榜'
    case 'month':
      return '👑 每月最佳照片榜'
    default:
      return '📊 最佳照片榜'
  }
})

const getMedalIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return '🥇'
    case 2:
      return '🥈'
    case 3:
      return '🥉'
    default:
      return '🏆'
  }
}

const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

const handlePictureClick = (item: API.PictureRankVO) => {
  router.push(`/picture/${item.pictureId}`)
}
</script>

<style scoped>
#rank-list {
  width: 100%;
}

/* 加载状态 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.loading-placeholder {
  width: 100%;
  height: 200px;
}

/* 排行榜头部 */
.rank-header {
  text-align: center;
  margin-bottom: 30px;
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.rank-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.rank-subtitle {
  display: flex;
  justify-content: center;
  gap: 20px;
  font-size: 14px;
  color: #6b7280;
}

.update-time {
  color: #10b981;
  font-weight: 500;
}

.total-count {
  color: #667eea;
  font-weight: 500;
}

/* 前三名特殊展示 */
.top-three {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.top-item {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.top-item:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.top-item.rank-1 {
  border: 2px solid #ffd700;
  background: linear-gradient(135deg, #fff9e6, #ffffff);
}

.top-item.rank-2 {
  border: 2px solid #c0c0c0;
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
}

.top-item.rank-3 {
  border: 2px solid #cd7f32;
  background: linear-gradient(135deg, #fdf6f0, #ffffff);
}

.medal {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
}

.medal-icon {
  font-size: 24px;
}

.rank-number {
  font-size: 18px;
  font-weight: 700;
  color: #667eea;
}

.top-thumbnail {
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
}

.top-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.top-item:hover .top-thumbnail img {
  transform: scale(1.05);
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.7) 100%);
  display: flex;
  align-items: flex-end;
  padding: 16px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.top-item:hover .overlay {
  opacity: 1;
}

.stats {
  color: white;
  font-weight: 600;
}

.like-count {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}

.top-info {
  text-align: center;
}

.top-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #1f2937;
}

.top-category {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

/* 其他排名 */
.other-ranks {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: #1f2937;
  border-bottom: 2px solid #f3f4f6;
  padding-bottom: 12px;
}

.rank-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rank-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: 12px;
  background: #f8fafc;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid #e5e7eb;
}

.rank-item:hover {
  background: white;
  transform: translateX(8px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.rank-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  margin-right: 16px;
  flex-shrink: 0;
}

.rank-num {
  font-size: 16px;
  font-weight: 700;
  color: white;
}

.thumbnail {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 16px;
  flex-shrink: 0;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.rank-item:hover .thumbnail img {
  transform: scale(1.1);
}

.info {
  flex: 1;
  min-width: 0;
}

.name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #1f2937;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.introduction {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta-info {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 12px;
}

.category {
  background: #e0e7ff;
  color: #3730a3;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.tags {
  background: #f0fdf4;
  color: #166534;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.stats-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stats-row .like-count {
  color: #ef4444;
  font-weight: 600;
  font-size: 14px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.empty-description {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .rank-title {
    font-size: 1.5rem;
  }

  .rank-subtitle {
    flex-direction: column;
    gap: 8px;
  }

  .top-three {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .top-thumbnail {
    height: 160px;
  }

  .rank-item {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .rank-badge {
    margin-right: 0;
    margin-bottom: 8px;
  }

  .thumbnail {
    margin-right: 0;
    margin-bottom: 8px;
  }

  .info {
    width: 100%;
  }

  .name,
  .introduction {
    white-space: normal;
  }

  .meta-info {
    justify-content: center;
  }
}

@media (max-width: 576px) {
  .rank-header {
    padding: 16px;
  }

  .other-ranks {
    padding: 16px;
  }

  .top-item {
    padding: 16px;
  }

  .top-thumbnail {
    height: 140px;
  }
}
</style>
