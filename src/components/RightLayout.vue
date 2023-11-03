<template>
    <div class="content">
        <el-row>
            <div v-show="activeIndex !== ''" class="info-layout">
                <ModelInfoLayout :selected="activeIndex" ref="modelInfoLayout"/>
            </div>
            <el-menu
            :default-active="activeIndex"
            class="menu"
            :collapse="isCollapse"
            @select="handleSelect"
            @open="handleOpen"
            @close="handleClose"
            >
                <el-menu-item index="basic">
                    <el-icon :size="22"><i-home-details /></el-icon>
                    <template #title>基本信息</template>
                </el-menu-item>
                <el-menu-item index="material">
                    <el-icon :size="22"><i-home-materials /></el-icon>
                    <template #title>材质</template>
                </el-menu-item>
                <el-menu-item index="light">
                    <el-icon :size="22"><i-home-light_mode /></el-icon>
                    <template #title>灯光</template>
                </el-menu-item>
                <el-menu-item index="setting">
                    <el-icon :size="22"><i-home-settings /></el-icon>
                    <template #title>设置</template>
                </el-menu-item>
            </el-menu>
        </el-row>
        
    </div>
</template>
<script lang="ts">
import { defineComponent, ref, Ref } from "vue";
import ModelInfoLayout from "./ModelInfoLayout.vue";
const modelInfoLayout: Ref<InstanceType <typeof ModelInfoLayout> | null> = ref(null);
export default defineComponent({
    name: 'RightLayout',
    data() {
        return {
            isCollapse: true,
            activeIndex: 'basic',
        };
    },
    methods: {
        handleOpen(key: string, keyPath: string[]) {
            console.log(key, keyPath)
        },
        handleClose(key: string, keyPath: string[]) {
            console.log(key, keyPath)
        },
        handleSelect(key: string) {
            this.activeIndex = key;
            modelInfoLayout.value?.changeView(this.activeIndex);
        }
    },
    setup() {
        return {
            modelInfoLayout,
        }
    }
});
</script>
<style lang="less" scoped>
.content {
    user-select: none;
}

.menu {
    border-left: solid 1px var(--el-menu-border-color);
    border-right: none;
    width: 50px;
}

.info-layout {
    margin-left: 10px;
    margin-right: 10px;
    width: calc(100% - 70px);
    height: calc(~"100vh - @{tx-header-height} - @{tx-header-padding} - @{tx-tools-height} - @{tx-body-margin-top}");
}
</style>