<template>
    <div :style="{width: width}" class="model-info-content">
        <span class="title">
            {{ currentTitle }}
        </span>
        <div class="content">
            <KeepAlive>
                <component :is="currentView"></component>
            </KeepAlive>
            <!-- <ModelInfoNodeLayout v-show="selected==='node'"/>
            <ModelInfoBasicLayout v-if="selected==='basic'"/> -->
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import ModelInfoBasicLayout from './ModelInfoBasicLayout.vue';
import ModelInfoNodeLayout from './ModelInfoNodeLayout.vue';
import ModelInfoAnimationLayout from './ModelInfoAnimationLayout.vue';
import ModelInfoMaterialLayout from './ModelInfoMaterialLayout.vue';
import LightLayout from './LightLayout.vue';
import SettingLayout from './SettingLayout.vue';
const itemInfo: Map<string, any> = new Map<string, any>();
itemInfo.set('node', {title: '节点'});
itemInfo.set('animation', {title: '动画'});

itemInfo.set('basic', {title: '基本信息'});
itemInfo.set('light', {title: '灯光'});
itemInfo.set('material', {title: '材质'});
itemInfo.set('setting', {title: '设置'});
export default defineComponent({
    name: 'ModelInfoLayout',
    props: {
        width: {
            type: String,
            require: true,
        },
        selected: {
            type: String,
            default: 0,
            require: true,
        },
    },
    data() {
        return {
            currentSelected: '',
        }
    },
    created() {
        this.currentSelected = this.selected;
    },
    methods: {
        changeView(select: string) {
            this.currentSelected = select;
        },
    },
    components: {
        ModelInfoBasicLayout,
        ModelInfoNodeLayout,
        ModelInfoAnimationLayout,
        ModelInfoMaterialLayout,
        SettingLayout,
        LightLayout,
    },
    computed: {
        currentView() {
            // console.error(this.currentSelected);
            switch(this.currentSelected) {
                case 'node': {
                    return 'ModelInfoNodeLayout';
                }
                case 'basic': {
                    return 'ModelInfoBasicLayout';
                }
                case 'setting': {
                    return 'SettingLayout';
                }
                case 'animation': {
                    return 'ModelInfoAnimationLayout';
                }
                case 'material': {
                    return 'ModelInfoMaterialLayout';
                }
                case 'light': {
                    return 'LightLayout';
                }
                default: {
                    console.error(this.currentSelected);
                    return '';
                }
            }
        },
        currentTitle() {
            if (itemInfo.has(this.currentSelected)) {
                return itemInfo.get(this.currentSelected).title;
            }
            return '';
        }
    },
    setup() {
    },
});
</script>

<style lang="less" scoped>
.title {
    font-weight: @tx-title-font-weight;
    white-space: nowrap;
    text-overflow: ellipsis;
    padding: 10px 10px 10px 0px;
    border-bottom: 1px solid @tx-border-color;
    color: @tx-title-color;
    display: block;
}

.model-info-content {
    height: 100%;
}

.content {
    height: 100% - 20px;
}
</style>
