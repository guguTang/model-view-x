<template>
    <div class="image-container">
        <el-image
        :src="imageData"
        :preview-src-list="[imageData]"
        fit="cover"
        >
            <template #error>
                <div class="image-slot">
                    <el-icon><PictureFilled /></el-icon>
                </div>
            </template>
        </el-image>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
    name: 'MapImage',
    props: {
        imageData: {
            type: String,
            default: '',
        },
        width: {
            type: String,
            default: '100%',
        },
        height: {
            type: String,
            default: '100%',
        }
    },
    data() {
        return {
        }
    },
    created() {
    },
    mounted() {
    },
    methods: {

    },
    setup() {
        return {
        };
    },
})
</script>
<style lang="less" scoped>
.image-container {
    width: var(--width);
    height: var(--height);
}

.image-container .el-image {
//   max-width: 300px;
//   max-height: 200px;
  width: 100%;
}

.image-container .image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 60px;
}

.image-container .image-slot .el-icon {
  font-size: 60px;
  width: 100%
}
</style>