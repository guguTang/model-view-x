
<template>
    <div class="">
        <!-- <el-container>
            <el-header name="header">Header</el-header>
            <el-main>
                <el-button type="success">Success</el-button>
            </el-main>
            <el-footer name="footer">
                I am Footer
            </el-footer>
        </el-container> -->

        <el-row>
            <el-col :span="24">
                <div class="header">3D Model Viewer</div>
            </el-col>
        </el-row>

        <el-row>
            <el-col :span="24">
                <div class="tools">
                    <ToolBar />
                </div>
            </el-col>
        </el-row>

        <el-row style="margin-top: 10px;">
            <el-col :span="24">
                <!-- <el-aside width="200px" class="only_full_width" style="overflow: auto;float: left;" ref="leftLayout">
                    <LeftLayout />
                </el-aside>
                <el-main class="view3d" ref="view3dLayout">
                    <View3D ref="view3dComp"/>

                </el-main> -->
            <!-- <el-col :span="4" class="only_full_width" style="overflow: auto"> -->
                <div class="left-layout" ref="leftLayout">
                    <LeftLayout />
                </div>
            <!-- </el-col> -->
            <!-- <el-col :span="15"> -->
                <div class="view3d" ref="view3dLayout">
                    <View3D ref="view3dComp"/>
                </div>
                <div class="right-layout" ref="rightLayout">
                    <RightLayout />
                </div>
            <!-- </el-col> -->
            </el-col>
        </el-row>
    </div>
</template>
  
<script lang="ts">
import { ElContainer, ElHeader, ElMain, ElFooter, ElButton, ElCol, ElRow } from 'element-plus';
import ToolBar from './ToolBar.vue';
import LeftLayout from './LeftLayout.vue';
import RightLayout from './RightLayout.vue';
import View3D from './View3D.vue';

import { defineComponent, ref } from "vue";
import { EventType, GlobalBUS } from '../engine/bus';
import { TXEngine } from '../engine/wrapper';
import { LoaderType } from '@/engine/render/loader/loader';

const view3dLayout = ref<HTMLElement>();
const view3dComp = ref<InstanceType <typeof View3D>>();
const leftLayout = ref<HTMLElement>();
const rightLayout = ref<HTMLElement>();
export default defineComponent({
    name: 'MainLayout',
    components: {
        ToolBar, LeftLayout, RightLayout,
        ElContainer, ElHeader, ElMain, ElFooter, ElButton, ElCol, ElRow},
    props: {
        
    },
    data() {
        return {
            view3dWidth: '0px',
        }
    },
    methods: {
        resize() {
            if (leftLayout.value && view3dLayout.value) {
                const leftLayoutWidth: number = leftLayout.value?.clientWidth;
                const rightLayoutWidth: number = rightLayout.value?.clientWidth!;
                view3dLayout.value.style.width = `${window.innerWidth - leftLayoutWidth - rightLayoutWidth - 20}px`;
                // this.view3dWidth = `${window.innerWidth - leftLayout.value?.clientWidth -10}px`;
                // console.log(this.view3dWidth);
            }
        }
    },
    created() {
        window.onresize = () => {
            this.resize();
        }
        GlobalBUS.On(EventType.RendererStart, () => {
            window.dispatchEvent(new Event('resize'));
        });
    },
    mounted() {
        window.dispatchEvent(new Event('resize'));
        view3dComp.value?.loadRenderer();
        this.$nextTick(async () => {
            await TXEngine.Load({
                type: LoaderType.URL,
                // url: 'http://127.0.0.1:8080/test-data/gltf/1/index.gltf',
                url: 'https://model.3dmomoda.com/models/a86795d65e544341b4d3b6d0f46cffb7/0/gltf/index.gltf',
            });
            // const myEvent = new Event('resize');
            // window.dispatchEvent(myEvent);
            // var ev = document.createEvent('Event');
            // ev.initEvent('resize', true, true);window.dispatchEvent(ev)
        })
    },
      
    setup() {
        return {
            leftLayout,
            rightLayout,
            view3dLayout,
            view3dComp,
        };
    },
});
</script>
  
<style lang="less" scoped>
.header {
    background-color: rgb(255, 255, 255);
    font-size: larger;
    padding: 10px 0px;
    font-weight: 600;
}

[name="footer"] {
    background-color: green;
}
.view3d {
    float: left;
}

.left-layout {
    float: left;
}
.right-layout {
    float: left;
}

@media (max-width: 800px) {
  .left-layout {
	  display: none;
  }
}

</style>