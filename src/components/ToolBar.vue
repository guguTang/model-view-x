<template>
    <div class="toolbar">
        <div @click="handleClickOpenFromLocal">
            <SvgButton 
            :name="btnOpenFromLocal.iconName" 
            :size="btnSize" 
            :tip="btnOpenFromLocal.name"
            :selected="false"/>
        </div>
        <div @click="handleClickOpenFromURL">
            <SvgButton 
            :name="btnOpenFromUrl.iconName" 
            :size="btnSize" 
            :tip="btnOpenFromUrl.name"
            :selected="btnOpenFromUrl.selected"/>
        </div>
        <div class="separator"></div>
        <!-- <div @click="handleClickCoordinates">
            <SvgButton name="coordinates" :size="btnSize" :selected="btnState.coordinates.selected" />
        </div> -->
        <div v-for="(item) in btnViewAuxiliaryState" :key="item.name" @click="handleClickViewAuxiliary(item)">
            <SvgButton 
            :name="item.iconName" 
            :size="btnSize" 
            :selected="item.selected"
            :tip="item.name"
            />
        </div>
        <div class="separator"></div>
        <SvgButton name="open" :size="btnSize" :selected="false"/>
        <SvgButton name="open" :size="btnSize" :selected="false"/>

        <OpenFromURL ref="openFromURL"/>
        <OpenFromLocal ref="openFromLocal" />
    </div>
</template>
<script lang="ts">
import { ElCol, ElRow } from 'element-plus';
import OpenFromURL from './dialog/OpenFromURL.vue';
import OpenFromLocal from './dialog/OpenFromLocal.vue';
import SvgButton from './SvgButton.vue';
import { defineComponent, ref } from "vue";
import { EventType, GlobalBUS, IEventBandDataForButton, ViewAuxiliaryType } from '../engine/bus';
const openFromURL = ref<InstanceType<typeof OpenFromURL> | null>(null);
const openFromLocal = ref<InstanceType<typeof OpenFromLocal> | null>(null);
export default defineComponent({
    name: 'ToolBar',
    components: {
        SvgButton,
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
    // height: 38px;
    overflow: auto;
}

.toolbar .separator {
    background: #cccccc;
    width: 1px;
    height: 28px;
    margin: 9px 8px;
    float: left;
}
</style>