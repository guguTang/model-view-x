<template>
    <div>
        <el-row>
                <div v-show="activeIndex !== ''" style="margin-left: 10px; margin-right: 10px;">
                    <ModelInfoLayout width="230px" :selected="activeIndex" ref="modelInfoLayout"/>
                </div>
                <el-menu
                :default-active="activeIndex"
                class="el-menu-vertical-demo"
                :collapse="isCollapse"
                @select="handleSelect"
                @open="handleOpen"
                @close="handleClose"
                >
                    <el-menu-item index="basic">
                        <el-icon><svg-icon name="details" :size="22"></svg-icon></el-icon>
                        <template #title>基本信息</template>
                    </el-menu-item>
                    <el-menu-item index="setting">
                        <el-icon><svg-icon name="settings" :size="22" color="red"></svg-icon></el-icon>
                        <template #title>设置</template>
                    </el-menu-item>
                </el-menu>
            <!-- </el-col> -->
            <!-- <el-col :span="20"> -->
                <!-- <div style="width: 230px;">sdfsdfds</div> -->
                
            <!-- </el-col> -->
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
<style scoped>
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 800px;
}

.el-menu {
    border-left: solid 1px var(--el-menu-border-color);
    border-right: none;
}
</style>