<template>
    <div class="light-content">
        <el-collapse v-model="activeNames" @change="handleChange">
            <el-collapse-item title="环境光" name="ambientLight">
                <el-form
                    label-position="left"
                    label-width="50px"
                    style="max-width: 460px"
                    :model="fromData"
                >
                    <el-form-item label="强度">
                        <!-- <el-input v-model="fromData.ambientLight.intensity" /> -->
                        <el-slider v-model="fromData.ambientLight.intensity" :min="0" :max="10" :step="0.1" 
                         input-size="small" :show-input="true" />
                    </el-form-item>
                    <el-form-item label="颜色">
                        <!-- <el-input v-model="fromData.ambientLight.color" /> -->
                        <el-color-picker v-model="fromData.ambientLight.color" color-format="hex" />
                    </el-form-item>
                </el-form>
            </el-collapse-item>

            <el-collapse-item title="方向光" name="directLight">
                <el-form
                    label-position="left"
                    label-width="50px"
                    style="max-width: 460px"
                    :model="fromData"
                >
                    <el-form-item label="强度">
                        <!-- <el-input v-model="fromData.ambientLight.intensity" /> -->
                        <el-slider v-model="fromData.directLight.intensity" :min="0" :max="10" :step="0.1" 
                         input-size="small" :show-input="true" />
                    </el-form-item>
                    <el-form-item label="颜色">
                        <!-- <el-input v-model="fromData.ambientLight.color" /> -->
                        <el-color-picker v-model="fromData.directLight.color" color-format="hex" />
                    </el-form-item>
                </el-form>
            </el-collapse-item>
        </el-collapse>
    </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: 'LightLayout',
    data() {
        return {
            activeNames: ['ambientLight', 'directLight'] as Array<string>,
            fromData: {
                ambientLight: {
                    intensity: 0.1,
                    color: '#ffffff',
                },
                directLight: {
                    intensity: 0.1,
                    color: '#ffffff',
                },
                pointLight: {

                },
                spotLight: {
                    
                }
            },
        };
    },
    methods: {
        handleChange(val: Array<string>) {
            console.warn(val);
        }
    },
    setup() {
        return {
        }
    }
});
</script>
<style lang="less" scoped>
.light-content {
    overflow-x: auto;
    margin-top: 12px;
    height: 100%;
}
</style>

<style>
.el-slider__input {
    width: 45% !important;
}
</style>