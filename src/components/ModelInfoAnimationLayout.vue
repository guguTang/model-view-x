<template>
    <div class="content">
        <el-row class="row">
            <el-col :span="8">名称：</el-col>
            <el-col :span="16">
                <el-select 
                v-model="curAnimationName"
                @change="handleAnimationChange"
                :clearable="true"
                no-data-text="无动画"
                :placeholder="animations.length > 0 ? '选择动画':'无动画'"
                size="default">
                    <el-option
                    v-for="item in animations"
                    :key="item.name"
                    :label="item.name"
                    :value="item.name"
                    />
                </el-select>
            </el-col>
        </el-row>
        <div v-if="curAnimation">
            <el-row class="row">
                <el-col :span="8">速度：</el-col>
                <el-col :span="16">
                    <el-input-number
                    v-model="curAnimation.speed"
                    :min="1"
                    :max="10"
                    :precision="2"
                    :step="0.1"
                    @change="handleAnimationSpeedChange" />
                </el-col>
            </el-row>
            <el-row class="row">
                <el-col :span="8">模式：</el-col>
                <el-col :span="16">
                    <el-select 
                    v-model="curAnimation.loop"
                    @change="handleAnimationLoopChange"
                    :clearable="true"
                    placeholder="选择动画"
                    size="default">
                        <el-option
                        v-for="item in loopModeMap"
                        :key="item.val"
                        :label="item.label"
                        :value="item.val"
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
    speed: number;
};

interface AnimationLoopModeInfo {
    val: AnimationPlayMode;
    label: string;
};

export default defineComponent({
    name: 'ModelInfoAnimationLayout',
    data() {
        return {
            curAnimation: undefined as AnimationState | undefined,
            curAnimationName: '',
            animations: [] as Array<AnimationState>,
            loopModeMap: [{
                val: 'once',
                label: '一次'
            }, {
                val: 'repeat',
                label: '重复'
            }, {
                val: 'pingpong',
                label: 'pingpong'
            }] as Array<AnimationLoopModeInfo>, 
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
            this.curAnimation = undefined;
            this.refreshInfo();
        },
        refreshInfo() {
            if (this.animations.length === 0) {
                const names = TXEngine.GetAnimationNames();
                console.warn(names);
                this.animations = names.map(it => {
                    return {
                        name: it,
                        loop: 'once',
                        isPlay: false,
                        speed: 1.0,
                    };
                });
            }
        },
        handleAnimationChange(val: string | null) {
            this.curAnimation = this.animations.find(it => it.name === val);
        },
        handleAnimationLoopChange(val: AnimationPlayMode) {
            console.error(val);
            this.playCurrent();
        },
        handlePlayStateChange() {
            this.playCurrent();
        },
        handleAnimationSpeedChange() {
            this.playCurrent();
        },
        playCurrent() {
            if (this.curAnimation) {
                TXEngine.PlayAnimationWithName(
                    this.curAnimation.name, this.curAnimation.isPlay, 
                    this.curAnimation.speed, this.curAnimation.loop);
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
