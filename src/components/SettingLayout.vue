<template>
    <div>
        <el-row class="row">
            <el-col :span="spanLabel">
                双面：
            </el-col>
            <el-col :span="spanContent">
                <el-switch v-model="doubleSide" @change="handleDoubleSideChange" />
            </el-col>
        </el-row>

        <el-row class="row">
            <el-col :span="spanLabel">
                背景颜色：
            </el-col>
            <el-col :span="spanContent">
                <el-color-picker 
                    :show-alpha="false"
                    :disabled="skybox !== 'none'"
                    v-model="color" color-format="hex" :predefine="predefineColors" 
                    @change="handleColorChange" 
                    @active-change="handleColorActiveChange"/>
            </el-col>
        </el-row>
        <el-row class="row">
            <el-col :span="spanLabel">
                参照网格：
            </el-col>
            <el-col :span="spanContent">
                <el-switch v-model="grid" @change="handleGridChange"/>
            </el-col>
        </el-row>
        <el-row class="row">
            <el-col :span="spanLabel">
                天空盒：
            </el-col>
            <el-col :span="spanContent">
                <el-select v-model="skybox" placeholder="选择天空盒" @change="handleSkyBoxChange">
                    <el-option
                    v-for="item in skyOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                    />
                </el-select>
            </el-col>
        </el-row>
    </div>
</template>

<script lang="ts">
import { EnvironmentType } from '@/engine/render/info-struct';
import { TXEngine } from '@/engine/wrapper';
import { ElMessage } from 'element-plus';
import { defineComponent } from 'vue';
interface SkyOptionsItem {
    label: string;
    value: EnvironmentType,
    key: EnvironmentType,
};

const skyOptions: Array<SkyOptionsItem> = [{
    key: 'none',
    value: 'none',
    label: '无',
}, {
    key: 'room',
    value: 'room',
    label: '室内',
}, {
    key: 'footprint-court',
    value: 'footprint-court',
    label: '广场',
}, {
    key: 'venice-sunset',
    value: 'venice-sunset',
    label: '威尼斯日落',
}];

export default defineComponent({
    name: 'SettingLayout',
    data() {
        return {
            spanLabel: 15,
            spanContent: 9,
            doubleSide: false,
            skybox: 'none' as EnvironmentType,
            grid: false,
            color: '#FFFFFF',
            predefineColors: [
                '#FFFFFF',
                '#E3E3E3',
                '#C9C9C9',
                '#898989',
                '#5F5F5F',
                '#494949',
                '#383838',
                '#000000',
            ]
        }
    },
    created() {
        if (TXEngine.Render) {
            this.color = TXEngine.GetBackgroundColor();
            this.doubleSide = TXEngine.IsDoubleSide();
            this.grid = TXEngine.IsGridShow();
            this.skybox = TXEngine.GetEnvironment();
        }
        // if (TXEngine.HasContent()) {
            
        // }
    },
    methods: {
        handleColorChange(val: string) {
            this.color = val;
            TXEngine.SetBackgroundColor(val);
        },
        handleColorActiveChange(val: string) {
            TXEngine.SetBackgroundColor(val);
        },
        handleDoubleSideChange(val: boolean) {
            TXEngine.SetDoubleSide(val);
        },
        handleGridChange(val: boolean) {
            TXEngine.ShowGrid(val);
        },
        async handleSkyBoxChange(val: EnvironmentType) {
            const msgHandler = ElMessage({
                duration: 0,
                message: '更换天空盒中',
                type: 'info',
            });
            const rv = await TXEngine.SetEnvironment(val);
            msgHandler.close();
            if (rv !== true) {
                ElMessage({
                    duration: 3000,
                    message: '更换天空盒失败',
                    type: 'error',
                });
            } else {
                ElMessage({
                    duration: 2000,
                    message: '更换天空盒完成',
                    type: 'success',
                });
            }
        }
    },
    setup() {
        return {skyOptions};
    },
});
</script>
<style lang="less" scoped>
.row {
    margin-top: 12px;
}
</style>