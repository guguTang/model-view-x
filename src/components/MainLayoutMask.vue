<template>
    <div class="main">
        <div class="mask" ref="dragContent">
            <div class="sample-content">
                <div>
                    <span style="font-size: 42px;">模型在线预览</span>
                </div>
                <div style="margin-top: 12px;">
                    <span style="font-size: 30px;">拖拽或打开模型进行预览</span>
                </div>
                <el-divider content-position="right">下列是示例模型，可点击预览</el-divider>
                <el-row v-for="(val) in sampleList" :gutter="4" style="margin-top: 12px;" :key="val">
                    <el-col v-for="(cur) in val" :span="Math.ceil(24/val.length)" :key="cur">
                        <el-tag type="success" size="large" style="cursor: pointer;" @click="handleClickSample(cur)">
                            {{ cur.text }}
                        </el-tag>
                    </el-col>
                </el-row>
            </div>
        </div>
    </div>
    
</template>
<script lang="ts">
import { EventType, GlobalBUS } from "@/engine/bus";
import { defineComponent, ref } from "vue";
import Folder from "@/engine/folder/folder";
import FolderLocal from "@/engine/folder/folder-local";
import FolderZip from "@/engine/folder/folder-zip";
const dragContent = ref<HTMLElement>();
export default defineComponent({
    name: 'MainLayoutMask',
    data() {
        return {
            sampleList: [
                [{
                    text: 'GLTF (Text)',
                    url: 'resource/models/gltf/text/index.gltf',
                },
                {
                    text: 'GLTF (Binary)',
                    url: 'resource/models/gltf/glb/LittlestTokyo.glb',
                },
                {
                    text: 'GLTF (KTX2)',
                    url: 'resource/models/gltf/ktx2/coffeemat.glb',
                },
                {
                    text: 'GLTF (Draco)',
                    url: 'resource/models/gltf/draco/index.gltf',
                }],
                [{
                    text: 'STL',
                    url: 'resource/models/slotted_disk.stl',
                },
                {
                    text: 'FBX',
                    url: 'resource/models/Samba Dancing.fbx',
                }, 
                {
                    text: 'OBJ',
                    url: 'resource/models/obj/male02.obj',
                }, 
                {
                    text: 'DAE',
                    url: 'resource/models/dae/elf/elf.dae',
                }],
                [{
                    text: 'IFC',
                    url: 'resource/models/ifc/test.ifc',
                },
                {
                    text: 'IFC（官方）',
                    url: 'resource/models/ifc/rac_advanced_sample_project.ifc',
                }]
            ],
        };
    },
    computed: {
    },
    mounted() {
        this.initFileDrag();
    },
    methods: {
        async handleClickSample(val: any) {
            GlobalBUS.Emit(EventType.OpenFromUrl, {
                name: EventType.OpenFromUrl,
                id: EventType.OpenFromUrl,
                value: `${window.location.origin}/${val.url}`,
            });
        },
        initFileDrag() {
            const dragDom = dragContent.value;
            if (dragDom) {
                dragDom.addEventListener("dragenter", () => {
                    dragDom.style.borderColor = "rgb(255, 238, 0)";
                });

                dragDom.addEventListener("dragleave", () => {
                    dragDom.style.borderColor = "rgb(0, 0, 0)";
                });

                dragDom.addEventListener("dragover", (event) => {
                    event.preventDefault();
                });

                dragDom.addEventListener("drop", (event: any) => {
                    event.preventDefault();
                    dragDom.style.borderColor = "rgb(0, 0, 0)";
                    const files = event.dataTransfer.files;
                    if (files) {
                        this.handleFiles(files);
                    }
                });
            }
        },
        async handleFiles(fileList: FileList) {
            let folderIns: Folder | null = null;
            if (fileList.length > 0) {
                if (fileList.length === 1) {
                    const fileZip = fileList[0];
                    if (fileZip.type === 'application/x-zip-compressed' || fileZip.type === 'application/zip') {
                        folderIns = new FolderZip(fileZip);
                    } else {
                        folderIns = new FolderLocal(fileList);
                    }
                } else {
                    folderIns = new FolderLocal(fileList);
                }
                
            }
            if (folderIns) {
                await folderIns.Init();
                GlobalBUS.Emit(EventType.OpenFromLocal, {
                    id: EventType.OpenFromLocal,
                    name: EventType.OpenFromLocal,
                    value: folderIns,
                });
            }
        }
    },
    setup() {
        return {
            dragContent,
        };
    }
});
</script>
<style lang="less" scoped>
.main {
    height: @tx-main-content-height;
}

.mask {
    height: calc(@tx-main-content-height - 20px);
    width: calc(100% - 20px);
    margin: 6px;
    border-style: dashed;
    border-width: 2px;
    border-color: rgb(0, 0, 0);
}

.mask .sample-content {
    top: 192px;
    position: relative;
    margin: 0 auto;
    width: 50%;
    max-width: 80%;
    // text-align: center;
}
</style>