<template>
    <div class="toolbar">
        <div @click="handleClickOpenFromLocal">
            <el-tooltip :content="btnOpenFromLocal.name" effect="light">
                <div :class="btnOpenFromLocal.selected?'button selected':'button'">
                    <el-icon :size="btnSize">
                        <i-home-open/>
                    </el-icon>
                </div>
            </el-tooltip>
        </div>
        <div @click="handleClickOpenFromURL">
            <el-tooltip :content="btnOpenFromUrl.name" effect="light">
                <div :class="btnOpenFromUrl.selected?'button selected':'button'">
                    <el-icon :size="btnSize">
                        <i-home-open_url/>
                    </el-icon>
                </div>
            </el-tooltip>
        </div>
        <div @click="handleClickOpenFromUinoModelID">
            <el-tooltip :content="btnOpenFromUrl.name" effect="light">
                <div :class="btnOpenFromUrl.selected?'button selected':'button'">
                    <el-icon :size="btnSize">
                        <i-home-feedback/>
                    </el-icon>
                </div>
            </el-tooltip>
        </div>
        <div v-show="alreayLoadOnce">
            <div @click="handleClickExport">
                <el-tooltip :content="btnExport.name" effect="light">
                    <div :class="btnExport.selected?'button selected':'button'">
                        <el-icon :size="btnSize"><i-home-export/></el-icon>
                    </div>
                </el-tooltip>
            </div>
            <div class="separator"></div>
            <div @click="handleClickShowGlobalCoordinates">
                <el-tooltip :content="btnShowGlobalCoordinates.name" effect="light">
                    <div :class="btnShowGlobalCoordinates.selected?'button selected':'button'">
                        <el-icon :size="btnSize"><i-home-coordinates/></el-icon>
                    </div>
                </el-tooltip>
            </div>
            <div @click="handleClickAutoRotate">
                <el-tooltip :content="btnAutoRotate.name" effect="light">
                    <div :class="btnAutoRotate.selected?'button selected':'button'">
                        <el-icon :size="btnSize"><i-home-autorotate/></el-icon>
                    </div>
                </el-tooltip>
            </div>
            <div class="separator"></div>
            <div @click="handleClickShowWireframe">
                <el-tooltip :content="btnShowWireframe.name" effect="light">
                    <div :class="btnShowWireframe.selected?'button selected':'button'">
                        <el-icon :size="btnSize"><i-home-wireframe/></el-icon>
                    </div>
                </el-tooltip>
            </div>
            <div @click="handleClickShowBoundingbox">
                <el-tooltip :content="btnShowBoundingbox.name" effect="light">
                    <div :class="btnShowBoundingbox.selected?'button selected':'button'">
                        <el-icon :size="btnSize"><i-home-boundbox/></el-icon>
                    </div>
                </el-tooltip>
            </div>
            <div @click="handleClickShowNormal">
                <el-tooltip :content="btnShowNormal.name" effect="light">
                    <div :class="btnShowNormal.selected?'button selected':'button'">
                        <el-icon :size="btnSize"><i-home-normal/></el-icon>
                    </div>
                </el-tooltip>
            </div>

            <div class="separator"></div>
        </div>
        <OpenFromURL ref="openFromURL" />
        <OpenFromLocal ref="openFromLocal" />
        <Export ref="exportDialog" />
    </div>
</template>
<script lang="ts">
import { ElCol, ElRow, ElMessageBox, ElMessage } from 'element-plus';
import OpenFromURL from './dialog/OpenFromURL.vue';
import OpenFromLocal from './dialog/OpenFromLocal.vue';
import Export from './dialog/Export.vue';
import { defineComponent, ref } from "vue";
import { EventType, GlobalBUS } from '../engine/bus';
import { TXEngine } from '@/engine/wrapper';
// import { ModelType } from '@/engine/folder/file';
const openFromURL = ref<InstanceType<typeof OpenFromURL> | null>(null);
const openFromLocal = ref<InstanceType<typeof OpenFromLocal> | null>(null);
const exportDialog = ref<InstanceType<typeof Export> | null>(null);
interface IBtnState {
    name: string;
    selected: boolean;

}
export default defineComponent({
    name: 'ToolBar',
    components: {
        ElCol, ElRow
    },
    props: {
        alreayLoadOnce: {
            type: Boolean,
            default: true,
        }
    },
    data() {
        return {
            btnSize: 18,
            btnOpenFromUrl: {
                name: '打开URL模型文件',
                selected: false,
            } as IBtnState,
            btnOpenFromLocal: {
                name: '打开本地模型文件',
                selected: false,
            } as IBtnState,
            btnExport: {
                name: '导出',
                selected: false,
            } as IBtnState,
            btnShowWireframe: {
                name: '线框',
                selected: false,
            } as IBtnState,
            btnShowBoundingbox: {
                name: '包围盒',
                selected: false,
            } as IBtnState,
            btnShowNormal: {
                name: '法线',
                selected: false,                
            } as IBtnState,
            btnShowGlobalCoordinates: {
                name: '辅助坐标系',
                selected: true,
            } as IBtnState,
            btnAutoRotate: {
                name: '自动旋转',
                selected: false,
            } as IBtnState,
        };
    },
    created() {
        GlobalBUS.Off(EventType.ViewTreeModelNodeChange, this.refreshBtnStateForNodeChange);
        GlobalBUS.On(EventType.ViewTreeModelNodeChange, this.refreshBtnStateForNodeChange);

        GlobalBUS.Off(EventType.LoadSceneDone, this.refreshBtnStateForNodeChange);
        GlobalBUS.On(EventType.LoadSceneDone, this.refreshBtnStateForNodeChange);
    },
    methods: {
        handleClickShowWireframe() {
            const btn: IBtnState = this.btnShowWireframe;
            const mark = !btn.selected;
            if (TXEngine.ShowSelectedWireframe(mark)) {
                btn.selected = mark;
            }
        },
        handleClickShowBoundingbox() {
            const btn: IBtnState = this.btnShowBoundingbox;
            const mark = !btn.selected;
            if (TXEngine.ShowSelectedBoundingbox(mark)) {
                btn.selected = mark;
            }
        },
        handleClickShowNormal() {
            const btn: IBtnState = this.btnShowNormal;
            const mark = !btn.selected;
            if (TXEngine.ShowSelectedNormal(mark)) {
                btn.selected = mark;
            }
        },
        refreshBtnStateForNodeChange() {
            const selectedNode = TXEngine.GetSelectedNode(true);
            if (selectedNode != null) {
                const { wireframe, normal, boundingbox } = selectedNode.effectState;
                this.btnShowBoundingbox.selected = boundingbox;
                this.btnShowNormal.selected = normal;
                this.btnShowWireframe.selected = wireframe;
            }
        },
        handleClickShowGlobalCoordinates() {
            const btn: IBtnState = this.btnShowGlobalCoordinates;
            const mark = !btn.selected;
            if (TXEngine.ShowMinAxes(mark)) {
                btn.selected = mark;
            }
        },
        handleClickAutoRotate() {
            const btn: IBtnState = this.btnAutoRotate;
            const mark = !btn.selected;
            if (TXEngine.AutoRotate(mark)) {
                btn.selected = mark;
            }
        },
        async handleClickExport() {
            exportDialog.value?.show(true);
        },
        handleClickOpenFromUinoModelID() {
            ElMessageBox.prompt('请输入模型ID', '模型ID', {
                confirmButtonText: '加载',
                cancelButtonText: '关闭',
                // inputPattern:/[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/,
                // inputErrorMessage: 'Invalid Email',
            }).then(async ({value}) => {
                const response: Response = await fetch(`https://model.3dmomoda.com/models/${value}/0/gltf/index.json`);
                if (response.status == 404) {
                    ElMessage({
                        type: 'error',
                        message: `加载失败:资源不存在`,
                    })
                } else if (response.status == 200) {
                    const jsonData = await response.json();
                    console.log(jsonData);
                    if (jsonData.gltfFiles?.length > 0) {
                        const entryFile = jsonData.gltfFiles[0];
                        GlobalBUS.Emit(EventType.OpenFromUrl, {
                            id: '',
                            name: '',
                            value: `https://model.3dmomoda.com/models/${value}/0/gltf/${entryFile}`,
                        });
                    }
                }
            }).catch(() => {
                // ElMessage({
                //     type: 'info',
                //     message: 'Input canceled',
                // })
            });
        },
        handleClickOpenFromURL() {
            // console.log(openFromURL.value);
            openFromURL.value?.show(true);
        },
        handleClickOpenFromLocal() {
            openFromLocal.value?.open();
        },
    },
    setup() {
        return {
            openFromURL,
            openFromLocal,
            exportDialog,
        };
    }
});
</script>
<style lang="less" scoped>
.toolbar {
    background-color: #f5f5f5;
    height: 100%;
    // overflow: auto;
}

.toolbar .separator {
    background: #cccccc;
    width: 1px;
    height: 28px;
    margin: 7px 8px;
    float: left;
}

.button {
    float: left;
	cursor: pointer;
	padding: 11px 10px 5px 10px;;
}

.button:hover {
    background: #c9e5f8;
}

.button.selected {
    background: #e1e1e1;
}
</style>