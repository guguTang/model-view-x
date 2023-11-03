
<template>
    <div class="view">
        <div class="container" ref="container"></div>
        <div class="axes" ref="axes"></div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref } from "vue";
import { GlobalBUS, EventType, IEventBandData } from "../engine/bus/index";
import { Render } from "../engine/render/render";
import { ElLoading, ElMessage } from "element-plus";
import { TXEngine } from "../engine/wrapper";
import Folder from "@/engine/folder/folder";
import { LoaderType } from "@/engine/render/loader/loader";
let renderer: Render | null;
const container: Ref<any> = ref(null);
const axes: Ref<any> = ref(null);

export default defineComponent({
    name: 'View3D',
    props: {
        
    },
    methods: {
        async loadRenderer() {
            renderer =  TXEngine.CreateRenderer(container.value, axes.value);
            if (!renderer) {
                throw new Error('init renderer failed');
            }
            renderer.Start();
            TXEngine.AddSingleClickEventToBUS();
        },
        addEventListener() {
            // 从url打开模型
            GlobalBUS.On(EventType.OpenFromUrl, async (ev: IEventBandData) => {
                if (ev.value) {
                    const loadingIns = ElLoading.service({
                        text: '加载中',
                        // target: container.value,
                        fullscreen: false,
                        lock: true,
                    });
                    const loadUrl: string = ev.value as string;
                    const rv = await TXEngine.Load({
                        type: LoaderType.URL,
                        url: loadUrl,
                    }).catch(e => {
                        ElMessage.error(e.toString());
                    });
                    loadingIns.close();
                    if (rv === false) {
                        ElMessage.error('加载模型失败!');
                    } else {
                        // TXEngine.Render?.PlayAllAnimation();
                    }
                } else {
                    ElMessage.error('URL不能为空!');
                }
            });

            // 从本地打开模型
            GlobalBUS.On(EventType.OpenFromLocal, async (ev: IEventBandData) => {
                if (ev.value) {
                    const fileIns: Folder = ev.value as Folder;
                    if (fileIns.Verify() === false) {
                        ElMessage.error('加载模型失败，请检查上传文件是否合法!');
                        return;
                    }
                    const loadingIns = ElLoading.service({
                        text: '加载中',
                        fullscreen: false,
                        lock: true,
                    });
                    // const rv = await TXEngine.Load({
                    //     type: LoaderType.Folder,
                    //     folder: fileIns,
                    // }).catch(e => {
                    //     ElMessage.error(e.toString());
                    // });
                    const rv = await TXEngine.Load({
                        type: LoaderType.Folder,
                        folder: fileIns,
                    });
                    loadingIns.close();
                    if (rv === false) {
                        ElMessage.error('加载模型失败!');
                    } else {
                        // TXEngine.Render?.PlayAllAnimation();
                    }
                } else {
                    ElMessage.error('加载模型失败，没有文件!');
                }
            });
        }
    },
    async created() {
        this.addEventListener();
    },
    async mounted() {
    },
    setup() {
        return {
            container,
            axes,
        };
    }
});
</script>

<style lang="less" scoped>
.view {
    position: relative;
    height: 100%;
    width: 100%;
}

.container {
    width: 100%;
    height: 100%;
}

.axes {
    width: 100px;
    height: 100px;
    margin: 0px;
    padding-left: 10px;
    position: absolute;
    left: 0px;
    bottom: 0px;
    z-index: 10;
    pointer-events: none;
}
</style>