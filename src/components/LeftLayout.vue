<template>
    <div style="height: 100%;width: 100%;">
        <el-row>
            <!-- <el-col :span="4"> -->
                <el-menu
                :default-active="activeIndex"
                :collapse="isCollapse"
                class="menu"
                @select="handleSelect"
                @open="handleOpen"
                @close="handleClose"
                >
                    <el-menu-item index="node">
                        <el-icon :size="22"><i-home-node /></el-icon>
                        <template #title>节点</template>
                    </el-menu-item>
                    <el-menu-item index="animation">
                        <el-icon :size="22"><i-home-animation /></el-icon>
                        <template #title>动画</template>
                    </el-menu-item>
                    <!-- <el-menu-item index="material">
                        <el-icon :size="22"><i-home-materials /></el-icon>
                        <template #title>材质</template>
                    </el-menu-item> -->
                    <!-- <el-menu-item index="2">
                        <el-icon><setting /></el-icon>
                        <template #title>Navigator Four</template>
                    </el-menu-item> -->
                </el-menu>
            <!-- </el-col> -->
            <!-- <el-col :span="20"> -->
                <!-- <div style="width: 230px;">sdfsdfds</div> -->
                <div v-show="activeIndex !== ''" class="info-layout">
                    <ModelInfoLayout :selected="activeIndex" ref="modelInfoLayout"/>
                </div>
            <!-- </el-col> -->
        </el-row>
    </div>
</template>
<script lang="ts">
import { defineComponent, ref, Ref } from "vue";
import ModelInfoLayout from "./ModelInfoLayout.vue";
const modelInfoLayout: Ref<InstanceType <typeof ModelInfoLayout> | null> = ref(null);
export default defineComponent({
    name: 'LeftLayout',
    data() {
        return {
            isCollapse: true,
            activeIndex: 'node',
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
            modelInfoLayout
        };
    }
});
</script>
<style lang="less" scoped>
.menu {
    // border-left: solid 1px var(--el-menu-border-color);
    // border-right: none;
    width: 50px;
}
.info-layout {
    margin-left: 10px;
    margin-right: 6px;
    width: calc(100% - 70px);
    height: calc(~"100vh - @{tx-header-height} - @{tx-header-padding} - @{tx-tools-height} - @{tx-body-margin-top}");
}
</style>