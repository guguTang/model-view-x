<template>
    <div class="content">
        <el-row class="row">
            <el-col :span="8">名称：</el-col>
            <el-col :span="16">
                <el-select 
                v-model="curAnimation"
                @change="handleAnimationChange"
                :clearable="true"
                placeholder="选择动画"
                size="small">
                    <el-option
                    v-for="item in animations"
                    :key="item.name"
                    :label="item.name"
                    :value="item"
                    />
                </el-select>
            </el-col>
        </el-row>
        <div v-if="curAnimation">
            <el-row class="row">
                <el-col :span="8">模式：</el-col>
                <el-col :span="16">
                    <el-select 
                    v-model="curAnimation"
                    @change="handleAnimationChange"
                    :clearable="true"
                    placeholder="选择动画"
                    size="small">
                        <el-option
                        v-for="item in animations"
                        :key="item.name"
                        :label="item.name"
                        :value="item"
                        />
                    </el-select>
                </el-col>
            </el-row>
            <el-row class="row">
                <el-col :span="8">播放：</el-col>
                <el-col :span="16">
                    <el-switch v-model="curAnimation.isPlay" @change="handlePlayStateChange" />
                </el-col>
            </el-row>
        </div>
        
    </div>
</template>

<script lang="ts">
import { GlobalBUS, EventType, IEventBandData } from '@/engine/bus';
import { AnimationPlayMode } from '@/engine/render/info-struct';
// import { INodeSimpleInfo } from '@/engine/render/info-struct';
import { TXEngine } from '@/engine/wrapper';
import { defineComponent } from 'vue';

interface AnimationState {
    name: string;
    loop: AnimationPlayMode;
    isPlay: boolean;
}
export default defineComponent({
    name: 'ModelInfoAnimationLayout',
    data() {
        return {
            curAnimation: null as AnimationState | null,
            animations: [] as Array<AnimationState>,
        };
    },
    created() {
        // GlobalBUS.Off(EventType.ViewTreeModelNodeChange, this.refreshInfo);
        // GlobalBUS.On(EventType.ViewTreeModelNodeChange, this.refreshInfo);

        GlobalBUS.Off(EventType.LoadSceneDone, this.handleLoadSceneDone);
        GlobalBUS.On(EventType.LoadSceneDone, this.handleLoadSceneDone);
        this.refreshInfo();
    },
    methods: {
        handleLoadSceneDone(ev: IEventBandData) {
            if (ev.value as boolean !== true) {
                return;
            }
            this.animations = [];
            this.refreshInfo();
        },
        refreshInfo() {
            if (this.animations.length === 0) {
                const names = TXEngine.GetAnimationNames();
                this.animations = names.map(it => {
                    return {
                        name: it,
                        loop: 'once',
                        isPlay: false,
                    };
                });
                console.warn(this.animations);
            }
        },
        handleAnimationChange(val: AnimationState | null) {
            console.error(val);
        },
        handlePlayStateChange() {
            if (this.curAnimation) {
                TXEngine.PlayAnimationWithName(this.curAnimation.name, this.curAnimation.isPlay, this.curAnimation.loop);
            }
        }
    },
    setup() {
        
    },
})
</script>
<style lang="less" scoped>
.content {
    overflow-x: auto;
    margin-top: 0px;
}

.row {
    margin-top: 12px;
}
</style>
