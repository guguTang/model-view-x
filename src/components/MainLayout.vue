<template>
    <div>
        <el-row>
            <div ref="rowHeader" style="width: 100vw">
                <el-col :span="24">
                    <div class="header">Model Viewer</div>
                </el-col>
            </div>
        </el-row>

        <el-row>
            <div ref="rowTools" style="width: 100vw">
                <el-col :span="24">
                    <div class="tools"><ToolBar :alreayLoadOnce="alreayLoadOnce"/></div>
                </el-col>
            </div>
        </el-row>

        <el-row>
            <el-col :span="24">
                <div v-show="alreayLoadOnce === true" class="main-body">
                    <div class="left-layout" ref="leftLayout" :style="{width: leftLayoutWidth+'px'}">
                        <LeftLayout />
                    </div>
                    <div class="splitter" ref="leftSplitter"></div>
                    <div class="view3d" ref="view3dLayout">
                        <View3D ref="view3dComp"/>
                    </div>
                    <div class="splitter" ref="rightSplitter"></div>
                    <div class="right-layout" ref="rightLayout" :style="{width: rightLayoutWidth+'px'}">
                        <RightLayout />
                    </div>
                </div>

                <MainLayoutMask v-show="alreayLoadOnce === false"/>
            </el-col>
        </el-row>
    </div>
</template>
  
<script lang="ts">
import { ElCol, ElRow } from 'element-plus';
import ToolBar from './ToolBar.vue';
import LeftLayout from './LeftLayout.vue';
import RightLayout from './RightLayout.vue';
import View3D from './View3D.vue';
import MainLayoutMask from './MainLayoutMask.vue';

import { defineComponent, ref } from "vue";

import { EventType, GlobalBUS, IEventBandData } from '../engine/bus';
import { TXEngine } from '../engine/wrapper';
// import { LoaderType } from '@/engine/render/loader/loader';

const view3dLayout = ref<HTMLElement>();
const view3dComp = ref<InstanceType <typeof View3D>>();
const leftLayout = ref<HTMLElement>();
const rightLayout = ref<HTMLElement>();
const rowHeader = ref<HTMLElement>();
const rowTools = ref<HTMLElement>();
const leftSplitter = ref<HTMLElement>();
const rightSplitter = ref<HTMLElement>();
export default defineComponent({
    name: 'MainLayout',
    components: {
        ToolBar, LeftLayout, RightLayout, MainLayoutMask,
        ElCol, ElRow},
    props: {
        
    },
    data() {
        return {
            view3dWidth: '0px',
            leftLayoutWidth: 294,
            rightLayoutWidth: 300,
            alreayLoadOnce: false,
        }
    },
    methods: {
        resize() {
            if (leftLayout.value && view3dLayout.value) {
                const leftLayoutWidth: number = leftLayout.value?.clientWidth;
                const rightLayoutWidth: number = rightLayout.value?.clientWidth!;
                const leftSplitterWidth: number = leftSplitter.value?.clientWidth!;
                const rightSplitterWidth: number = rightSplitter.value?.clientWidth!;
                view3dLayout.value.style.width = `${window.innerWidth - leftLayoutWidth - rightLayoutWidth - leftSplitterWidth - rightSplitterWidth}px`;
                const headerHeight: number = rowHeader.value?.clientHeight!;
                const toolsHeight: number = rowTools.value?.clientHeight!;
                const diffHeight: number = headerHeight + toolsHeight;
                // console.error(diffHeight);
                view3dLayout.value.style.height = `calc(100vh - ${diffHeight}px)`;
                // this.view3dWidth = `${window.innerWidth - leftLayout.value?.clientWidth -10}px`;
                // console.log(this.view3dWidth);
                TXEngine.Render?.OnResize();
            }
        },
        initSplitterDragEvent() {
            const leftSplitterDom = leftSplitter.value;
            const rightSplitterDom = rightSplitter.value;
            let leftDragging = false;
            let rightDragging = false;
            let num1 = 0;
            let num2 = 0;
            let baseWidth = this.leftLayoutWidth;
            if (leftSplitterDom && rightSplitterDom) {
                leftSplitterDom.onmousedown = (ev) => {
                    leftDragging = true;
                    num1 = ev.pageX;
                    baseWidth = this.leftLayoutWidth;
                };
                rightSplitterDom.onmousedown = (ev) => {
                    rightDragging = true;
                    num1 = ev.pageX;
                    baseWidth = this.rightLayoutWidth;
                };
                document.onmousemove = (ev) => {
                    if (leftDragging === true) {
                        num2 = ev.pageX;
                        const diff = num2 - num1;
                        const finalWidth = baseWidth + diff;
                        if (finalWidth < 294) {
                            return;
                        }
                        this.leftLayoutWidth = finalWidth;
                        this.$nextTick(()=>{this.resize()});
                    }
                    if (rightDragging === true) {
                        num2 = ev.pageX;
                        const diff = num2 - num1;
                        const finalWidth = baseWidth - diff;
                        if (finalWidth < 300) {
                            return;
                        }
                        this.rightLayoutWidth = finalWidth;
                        this.$nextTick(()=>{this.resize()});
                    }
                };
                document.onmouseup = () => {
                    leftDragging = false;
                    rightDragging = false;
                };
            }
        }
    },
    created() {
        window.onresize = () => {
            this.resize();
        }
        GlobalBUS.On(EventType.RendererStart, () => {
            this.resize();
            // window.dispatchEvent(new Event('resize'));
        });

        const setFirstLoad = (data: IEventBandData) => {
            const rv = data.value as boolean;
            if (rv === true) {
                this.alreayLoadOnce = true;
                GlobalBUS.Off(EventType.LoadSceneDone, setFirstLoad);
                this.$nextTick(() => {
                    this.resize();
                });
            }
        }
        GlobalBUS.On(EventType.LoadSceneDone, setFirstLoad);
    },
    mounted() {
        window.dispatchEvent(new Event('resize'));
        view3dComp.value?.loadRenderer();
        this.$nextTick(async () => {
            // await TXEngine.Load({
            //     type: LoaderType.URL,
            //     url: 'https://threejs.org/examples/models/gltf/AVIFTest/forest_house.glb',
            // });
        });
        this.initSplitterDragEvent();
    },
      
    setup() {
        return {
            leftLayout,
            rightLayout,
            leftSplitter,
            rightSplitter,
            view3dLayout,
            view3dComp,
            rowHeader,
            rowTools,
        };
    },
});
</script>
  
<style lang="less" scoped>
.header {
    background-color: rgb(255, 255, 255);
    font-size: larger;
    padding-top: @tx-header-padding;
    padding-bottom: @tx-header-padding;
    padding-left: 12px;
    height: @tx-header-height - @tx-header-padding * 2;
    font-weight: 600;
}

.tools {
    height: @tx-tools-height;
}

.main-body {
    height: @tx-main-content-height;
}

.splitter {
    width: 6px;
    float: left;
    // cursor: col-resize;// w-resize;
    height: @tx-main-content-height;
}

.splitter:hover {
    cursor: col-resize;
}

[name="footer"] {
    background-color: green;
}
.view3d {
    float: left;
}

.left-layout {
    float: left;
    // width: 294px;
    // width: 500px;
}
.right-layout {
    float: left;
    // width: 294px;
}

@media (max-width: 800px) {
  .left-layout {
	  display: none;
  }
}

</style>