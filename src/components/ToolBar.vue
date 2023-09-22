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
        <div class="separator"></div>
        <div v-for="(item) in btnViewAuxiliaryState" :key="item.name" @click="handleClickViewAuxiliary(item)">
            <el-tooltip :content="item.name" effect="light">
                <div :class="item.selected?'button selected':'button'">
                    <el-icon v-if="item.iconName === 'coordinates'" :size="btnSize"><i-home-coordinates/></el-icon>
                    <el-icon v-else-if="item.iconName === 'autorotate'" :size="btnSize"><i-home-autorotate/></el-icon>
                    <el-icon v-else-if="item.iconName === 'wireframe'" :size="btnSize"><i-home-wireframe/></el-icon>
                    <el-icon v-else-if="item.iconName === 'boundbox'" :size="btnSize"><i-home-boundbox/></el-icon>
                    <el-icon v-else :size="btnSize"><i-home-coordinates/></el-icon>
                </div>
            </el-tooltip>
        </div>
        <div class="separator"></div>
        <div @click="testOpenGltf('gltf')">
            <el-tooltip content="gltf" effect="light">
                <div class="button">
                    <el-icon :size="btnSize">
                        <i-home-open/>
                    </el-icon>
                </div>
            </el-tooltip>
        </div>
        <div @click="testOpenGltf('obj')">
            <el-tooltip content="obj" effect="light">
                <div class="button">
                    <el-icon :size="btnSize">
                        <i-home-open/>
                    </el-icon>
                </div>
            </el-tooltip>
        </div>
        <div @click="testOpenGltf('fbx')">
            <el-tooltip content="fbx" effect="light">
                <div class="button">
                    <el-icon :size="btnSize">
                        <i-home-open/>
                    </el-icon>
                </div>
            </el-tooltip>
        </div>
        <div @click="testOpenGltf('dae')">
            <el-tooltip content="dae" effect="light">
                <div class="button">
                    <el-icon :size="btnSize">
                        <i-home-open/>
                    </el-icon>
                </div>
            </el-tooltip>
        </div>
        <OpenFromURL ref="openFromURL" />
        <OpenFromLocal ref="openFromLocal" />
    </div>
</template>
<script lang="ts">
import { ElCol, ElRow, ElMessageBox, ElMessage } from 'element-plus';
import OpenFromURL from './dialog/OpenFromURL.vue';
import OpenFromLocal from './dialog/OpenFromLocal.vue';
import { defineComponent, ref } from "vue";
import { EventType, GlobalBUS, IEventBandDataForButton, ViewAuxiliaryType } from '../engine/bus';
import { LoaderType } from '@/engine/render/loader/loader';
import { TXEngine } from '@/engine/wrapper';
const openFromURL = ref<InstanceType<typeof OpenFromURL> | null>(null);
const openFromLocal = ref<InstanceType<typeof OpenFromLocal> | null>(null);
export default defineComponent({
    name: 'ToolBar',
    components: {
        ElCol, ElRow
    },
    data() {
        return {
            btnSize: 18,
            btnOpenFromUrl: {
                name: '打开URL模型文件',
                iconName: 'open_url',
                selected: false,
            },
            btnOpenFromLocal: {
                name: '打开本地模型文件',
                iconName: 'open',
                selected: false,
            },
            btnViewAuxiliaryState: [
                {
                    name: '显示辅助坐标系',
                    id: ViewAuxiliaryType.ShowCoordinates,
                    iconName: 'coordinates',
                    selected: true,
                },
                {
                    name: '自动旋转',
                    id: ViewAuxiliaryType.AutoRotate,
                    iconName: 'autorotate',
                    selected: false,
                },
                {
                    name: '显示线框',
                    id: ViewAuxiliaryType.ShowWireframe,
                    iconName: 'wireframe',
                    selected: false,
                },
                {
                    name: '显示包围盒',
                    id: ViewAuxiliaryType.ShowBoundBox,
                    iconName: 'boundbox',
                    selected: false,
                }
            ],
        };
    },
    created() {
        GlobalBUS.Off(EventType.ButtonChangeCallback, this.handleCallback);
        GlobalBUS.On(EventType.ButtonChangeCallback, this.handleCallback);
    },
    methods: {
        async testOpenGltf(str: string) {
            const modelMap = new Map<string, string>();
            modelMap.set('fbx', 'https://threejs.org/examples/models/fbx/Samba%20Dancing.fbx');
            modelMap.set('gltf', 'https://threejs.org/examples/models/gltf/IridescentDishWithOlives.glb');
            modelMap.set('obj', 'https://threejs.org/examples/models/obj/male02/male02.obj');
            modelMap.set('dae', 'https://threejs.org/examples/models/collada/abb_irb52_7_120.dae');
            const uri = modelMap.get(str);
            if (uri) {
                await TXEngine.Load({
                    type: LoaderType.URL,
                    url: uri,
                });
            }
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
        handleClickViewAuxiliary(item: any) {
            const ev: IEventBandDataForButton = {
                name: item.name,
                id: item.id,
                selected: item.selected,
            }
            GlobalBUS.Emit(EventType.ButtonChange, ev);
        },
        handleCallback(ev: IEventBandDataForButton) {
            switch(ev.id) {
                case ViewAuxiliaryType.AutoRotate:
                case ViewAuxiliaryType.ShowBoundBox:
                case ViewAuxiliaryType.ShowCoordinates:
                case ViewAuxiliaryType.ShowWireframe: {
                    this.callbackForViewAuxiliary(ev);
                    break;
                }
            }
            
        },
        callbackForViewAuxiliary(ev: IEventBandDataForButton) {
            const it: any = this.btnViewAuxiliaryState.find((item) => item.id === ev.id);
            if (it) {
                it.selected = ev.selected;
            }
        },
        callbackForOpenFromURL(ev: IEventBandDataForButton) {
            console.log(ev);
        }
    },
    setup() {
        return {
            openFromURL,
            openFromLocal,
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