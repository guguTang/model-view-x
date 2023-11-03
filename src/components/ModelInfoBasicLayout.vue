<template>
    <div class="content">
        <el-form
            label-position="left"
            label-width="100px"
            style="max-width: 460px;margin-top: 12px"
        >
            <el-form-item label="顶点">
                <el-text>{{ totalVertices }}</el-text>
            </el-form-item>
            <el-form-item label="三角面">
                <el-text>{{ totalTriangles }}</el-text>
            </el-form-item>
            <el-form-item label="顶点">
                <el-text>{{ totalVertices }}</el-text>
            </el-form-item>
            <el-form-item label="包围合(X)">
                <el-text>{{ boundingBox[0] }}</el-text>
            </el-form-item>
            <el-form-item label="包围合(Y)">
                <el-text>{{ boundingBox[1] }}</el-text>
            </el-form-item>
            <el-form-item label="包围合(Z)">
                <el-text>{{ boundingBox[2] }}</el-text>
            </el-form-item>
            <el-form-item label="Mesh">
                <el-tag size="small">{{ isMesh }}</el-tag>
            </el-form-item>
        </el-form>
        <!-- <el-descriptions
            direction="horizontal"
            :column="1"
            size="default"
            border
        >
            <el-descriptions-item label="顶点"> {{ totalVertices }}</el-descriptions-item>
            <el-descriptions-item label="三角面">{{ totalTriangles }}</el-descriptions-item>
            <el-descriptions-item label="包围合(X)">{{ boundingBox[0] }}</el-descriptions-item>
            <el-descriptions-item label="包围合(Y)">{{ boundingBox[1] }}</el-descriptions-item>
            <el-descriptions-item label="包围合(Z)">{{ boundingBox[2] }}</el-descriptions-item>
            <el-descriptions-item label="Mesh">
                <el-tag size="small">{{ isMesh }}</el-tag>
            </el-descriptions-item>
        </el-descriptions> -->
    </div>
</template>

<script lang="ts">
import { GlobalBUS, EventType } from '@/engine/bus';
import { INodeSimpleInfo } from '@/engine/render/info-struct';
import { TXEngine } from '@/engine/wrapper';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'ModelInfoBasicLayout',
    data() {
        return {
            totalTriangles: 0,
            totalVertices: 0,
            boundingBox: [0, 0, 0],
            isMesh: false,
        };
    },
    created() {
        GlobalBUS.Off(EventType.ViewTreeModelNodeChange, this.refreshInfo);
        GlobalBUS.On(EventType.ViewTreeModelNodeChange, this.refreshInfo);

        GlobalBUS.Off(EventType.LoadSceneDone, this.refreshInfo);
        GlobalBUS.On(EventType.LoadSceneDone, this.refreshInfo);
        this.refreshInfo();
    },
    methods: {
        // handleLoadSceneDone(ev: IEventBandData) {
        //     if (ev.value as boolean !== true) {
        //         return;
        //     }
        //     this.refreshInfo();
        // },
        refreshInfo() {
            const selectedNode = TXEngine.GetSelectedNode(true);
            let totalTriangles = 0;
            let totalVertices = 0;
            let boundingBox = [0, 0, 0];
            let isMesh = false;
            if (selectedNode) {
                const recursion = (curNode: INodeSimpleInfo) => {
                    totalTriangles += curNode.triangles;
                    totalVertices += curNode.vertices;
                    curNode.children.forEach(recursion);
                }
                recursion(selectedNode);
                boundingBox = selectedNode.boundingBox.toArray().map(it => parseFloat(it.toFixed(2)));
                isMesh = selectedNode.isMesh;
            }
            this.totalTriangles = totalTriangles;
            this.totalVertices = totalVertices;
            this.boundingBox = boundingBox;
            this.isMesh = isMesh;
        },
    },
    setup() {
        
    },
})
</script>
<style lang="less" scoped>
.content {
    overflow-x: auto;
    // margin-top: 12px;
}
</style>
