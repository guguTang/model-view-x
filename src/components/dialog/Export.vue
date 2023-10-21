<template>
    <div>
        <el-dialog 
        v-model="visible" 
        title="导出模型" width="500px" draggable>
            <!-- <span>
                选择需要导出的文件类型
            </span> -->
            <el-form :model="formData" label-width="120px" label-position="left">
                <el-form-item label="文件类型">
                    <el-select v-model="formData.exportType" placeholder="Select">
                        <el-option
                        v-for="item in exportOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="导出动画" v-show="hasAnimation">
                    <el-switch v-model="formData.withAnimation" />
                </el-form-item>
            </el-form>
            <template #footer>
            <span class="dialog-footer">
                <el-button @click="visible = false">关闭</el-button>
                <el-button type="primary" @click="handleClickExport">
                导出
                </el-button>
            </span>
            </template>
        </el-dialog>
    </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
// import { EventType, GlobalBUS } from '../../engine/bus';
import { TXEngine } from '@/engine/wrapper';
import { ModelType } from '@/engine/folder/file';
const exportOptions = [{
    value: 'stl_text',
    isBinary: false,
    modelType: ModelType.STL,
    suffix: '.stl',
    label: 'Stereolithography Text (.stl)',
}, {
    value: 'stl_binary',
    isBinary: true,
    modelType: ModelType.STL,
    suffix: '.stl',
    label: 'Stereolithography Binary (.stl)',
}, {
    value: 'gltf_text',
    isBinary: false,
    modelType: ModelType.GLTF,
    suffix: '.gltf',
    label: 'glTF Text (.gltf)',
}, {
    value: 'gltf_binary',
    isBinary: true,
    modelType: ModelType.GLTF,
    suffix: '.glb',
    label: 'glTF Binary (.glb)',
}];

export default defineComponent({
    name: 'Export',
    props: {

    },
    expose: ['show'],
    data() {
        return {
            visible: false,
            exportOptions,
            exportValue: 'stl_text',
            formData: {
                exportType: 'stl_text',
                withAnimation: true,
            }
        };
    },
    computed: {
        hasAnimation() {
            return ['gltf_text', 'gltf_binary'].indexOf(this.formData.exportType) !== -1;
        }
    },
    methods: {
        show(mark: boolean) {
            this.visible = mark;
        },
        async handleClickExport() {
            const opt = this.exportOptions.find(it => it.value === this.formData.exportType);
            if (opt) {
                const data = await TXEngine.Export(opt?.modelType, {
                    isBinary: opt.isBinary,
                    withAnimation: this.formData.withAnimation,
                });
                if (data) {
                    const filename = `output${opt.suffix}`;
                    const link = document.createElement('a');
                    link.style.display = 'none';
                    document.body.appendChild(link);
                    link.href = URL.createObjectURL(data);
                    link.download = filename;
                    link.click();
                    document.body.removeChild(link);
                }
            }
            // console.error(data);
            this.visible = false;
            // GlobalBUS.Emit(EventType.OpenFromUrl, {
            //     name: EventType.OpenFromUrl,
            //     id: EventType.OpenFromUrl,
            //     value: this.url,
            // })
        }
    },
});
</script>