<template>
    <el-form-item>
        <template #label>
            <SubTitleLabel :title="title" :tip="tip"/>
        </template>
        <MapImage :imageData="texture ? texture.base64 : ''" width="100px"/>
    </el-form-item>
    <div v-if="texture">
        <el-form-item label="名称">
            <el-text>{{ texture.origin.name }}</el-text>
        </el-form-item>
        <el-form-item label="大小">
            <el-text>{{ `${texture.origin.width} x ${texture.origin.height}` }}</el-text>
        </el-form-item>
        <el-form-item label="偏移X">
            <el-input-number v-model="texture.origin.offset.x" :step="0.1" controls-position="right"/>
                <!-- <el-col :span="10">
                    <el-form-item>
                        <el-input-number v-model="texture.origin.offset.x" :step="0.1" controls-position="right"/>
                    </el-form-item>
                </el-col>
                <el-col :span="4"></el-col>
                <el-col :span="10">
                    <el-form-item>
                        <el-input-number v-model="texture.origin.offset.x" :step="0.1" controls-position="right"/>
                    </el-form-item>
                </el-col> -->
        </el-form-item>
        <el-form-item label="偏移Y">
            <el-input-number v-model="texture.origin.offset.y" :step="0.1" controls-position="right"/>
        </el-form-item>
        <el-form-item label="缩放X">
            <el-input-number v-model="texture.origin.scale.x" :step="0.1" controls-position="right"/>
        </el-form-item>
        <el-form-item label="偏移Y">
            <el-input-number v-model="texture.origin.scale.y" :step="0.1" controls-position="right"/>
        </el-form-item>
        <el-form-item label="旋转">
            <el-input-number v-model="texture.origin.rotation" :step="0.1" controls-position="right"/>
        </el-form-item>
    </div>
    
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import MapImage from '@/components/model-info-material-layout/MapImage.vue';
export default defineComponent({
    name: 'TextureItem',
    components: {
        MapImage,
    },
    props: {
        texture: {
            type: Object,
        },
        tip: {
            type: String,
            default: 'Texture Map',
        },
        title: {
            type: String,
            default: '图片',
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
</style>