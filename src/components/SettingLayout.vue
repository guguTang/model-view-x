<template>
    <div>
        <el-row class="row">
            <el-col :span="18">
                双面：
            </el-col>
            <el-col  :span="6">
                <el-switch v-model="doubleSide" @change="handleDoubleSideChange" />
            </el-col>
        </el-row>

        <el-row class="row">
            <el-col :span="18">
                背景颜色：
            </el-col>
            <el-col  :span="6">
                <el-color-picker 
                    :show-alpha="false"
                    v-model="color" color-format="hex" :predefine="predefineColors" 
                    @change="handleColorChange" 
                    @active-change="handleColorActiveChange"/>
            </el-col>
        </el-row>

        <el-row class="row">
            <el-col :span="18">
                天空盒：
            </el-col>
            <el-col  :span="6">
                <el-switch v-model="skybox" />
            </el-col>
        </el-row>
    </div>
</template>

<script lang="ts">
import { TXEngine } from '@/engine/wrapper';
import { defineComponent } from 'vue';
export default defineComponent({
    name: 'SettingLayout',
    data() {
        return {
            doubleSide: false,
            skybox: false,
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
        }
    },
    setup() {
        
    },
});
</script>
<style lang="less" scoped>
.row {
    margin-top: 12px;
}
</style>