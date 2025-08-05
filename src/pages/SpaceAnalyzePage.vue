<template>
  <div id="spaceAnalyzePage">
    <h2>
      空间图库分析 -
      <span v-if="queryAll"> 全部空间 </span>
      <span v-else-if="queryPublic"> 公共图库 </span>
      <span v-else>
        <a :href="`/space/${spaceId}`" target="_blank">id：{{ spaceId }}</a>
      </span>
    </h2>
    <a-row :gutter="[16, 16]">
      <!-- 空间使用分析 -->
      <a-col :xs="24" :md="12">
        <SpaceUsageAnalyze :spaceId="spaceId" :queryAll="queryAll" :queryPublic="queryPublic" />
      </a-col>
      <!-- 空间分类分析 -->
      <a-col :xs="24" :md="12">
        <SpaceCategoryAnalyze :spaceId="spaceId" :queryAll="queryAll" :queryPublic="queryPublic" />
      </a-col>
      <!-- 标签分析 -->
      <a-col :xs="24" :md="12">
        <SpaceTagAnalyze :spaceId="spaceId" :queryAll="queryAll" :queryPublic="queryPublic" />
      </a-col>
      <!-- 图片大小分段分析 -->
      <a-col :xs="24" :md="12">
        <SpaceSizeAnalyze :spaceId="spaceId" :queryAll="queryAll" :queryPublic="queryPublic" />
      </a-col>
      <!-- 用户上传行为分析 -->
      <a-col :xs="24" :md="12">
        <SpaceUserAnalyze :spaceId="spaceId" :queryAll="queryAll" :queryPublic="queryPublic" />
      </a-col>
      <!-- 空间使用排行分析 -->
      <a-col :xs="24" :md="12">
        <SpaceRankAnalyze
          v-if="isAdmin"
          :spaceId="spaceId"
          :queryAll="queryAll"
          :queryPublic="queryPublic"
        />
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, reactive, ref, watch } from 'vue'
import { deletePictureUsingPost, getPictureVoByIdUsingGet } from '@/api/pictureController'
import { likePictureUsingPost } from '@/api/pictureLikeController'
import { favoritePictureUsingPost } from '@/api/pictureFavoriteController'
import {
  addPictureCommentUsingPost,
  deletePictureCommentUsingPost,
  listPictureCommentVoByPageUsingPost,
} from '@/api/pictureCommentController'
import { message } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'
import { formatSize, downloadImage, toHexColor } from '@/utils'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import { useLoginUserStore } from '@/stores/userLoginUserStore'

import SpaceUsageAnalyze from '@/components/analyze/SpaceUsageAnalyze.vue'
import SpaceCategoryAnalyze from '@/components/analyze/SpaceCategoryAnalyze.vue'
import SpaceTagAnalyze from '@/components/analyze/SpaceTagAnalyze.vue'
import SpaceSizeAnalyze from '@/components/analyze/SpaceSizeAnalyze.vue'
import SpaceUserAnalyze from '@/components/analyze/SpaceUserAnalyze.vue'
import SpaceRankAnalyze from '@/components/analyze/SpaceRankAnalyze.vue'

const route = useRoute()

// 空间 id
const spaceId = computed(() => {
  return route.query?.spaceId as string
})

// 是否查询所有空间
const queryAll = computed(() => {
  return !!route.query?.queryAll
})

// 是否查询公共空间
const queryPublic = computed(() => {
  return !!route.query?.queryPublic
})

const loginUserStore = useLoginUserStore()
const loginUser = loginUserStore.loginUser

const isAdmin = computed(() => {
  return loginUser.userRole === 'admin'
})
</script>

<style scoped>
#spaceAnalyzePage {
  min-height: 100vh;
  background: #f8fafc;
  padding: 24px;
}
</style>
