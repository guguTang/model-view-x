<template>
    <div class="light-content">
        <el-collapse v-model="activeNames" @change="handleChange">
            <el-collapse-item title="环境光" name="ambientLight">
                <el-form
                    label-position="left"
                    label-width="50px"
                    style="max-width: 460px"
                    :model="lights"
                >
                    <el-form-item label="强度">
                        <el-slider v-model="lights.ambient.intensity" :min="0" :max="20" :step="0.1"
                        @input="handleAmbientChangeIntensity"
                         input-size="small" :show-input="true" />
                    </el-form-item>
                    <el-form-item label="颜色">
                        <el-color-picker
                        @active-change="handleAmbientChangeColor"
                        v-model="lights.ambient.color" color-format="hex" />
                    </el-form-item>
                </el-form>
            </el-collapse-item>

            <el-collapse-item title="方向光" name="directLight">
                <el-form
                    label-position="left"
                    label-width="50px"
                    style="max-width: 460px"
                    :model="lights"
                >
                    <el-form-item label="强度">
                        <el-slider v-model="lights.direct.intensity" :min="0" :max="20" :step="0.1"
                        @input="handleDirectChangeIntensity" 
                        input-size="small" :show-input="true" />
                    </el-form-item>
                    <el-form-item label="颜色">
                        <el-color-picker
                        @active-change="handleDirectChangeColor"
                        v-model="lights.direct.color" color-format="hex" />
                    </el-form-item>
                </el-form>
            </el-collapse-item>
        </el-collapse>
    </div>
</template>
<script lang="ts">
import { DefaultRenderState } from "@/engine/render/state";
import { TXEngine } from '@/engine/wrapper';
import { defineComponent } from "vue";
// const lightState: RenderLightState = DefaultRenderState.lights;
export default defineComponent({
    name: 'LightLayout',
    data() {
        return {
            activeNames: ['ambientLight', 'directLight'] as Array<string>,
            lights: DefaultRenderState.lights,
        };
    },
    methods: {
        handleChange(val: Array<string>) {
            console.warn(val);
        },
        handleAmbientChangeIntensity(val: number) {
            this.lights.ambient.intensity = val;
            TXEngine.UpdateLight(this.lights.ambient);
        },
        handleAmbientChangeColor(val: string) {
            this.lights.ambient.color = val;
            TXEngine.UpdateLight(this.lights.ambient);
        },
        handleDirectChangeIntensity(val: number) {
            this.lights.direct.intensity = val;
            TXEngine.UpdateLight(this.lights.direct);
        },
        handleDirectChangeColor(val: string) {
            this.lights.direct.color = val;
            TXEngine.UpdateLight(this.lights.direct);
        },
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