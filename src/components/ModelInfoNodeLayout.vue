<template>
    <div>
        <el-row class="tools">
            <el-col :span="24">
                <div class="item" @click="handleExpandTree">
                    <el-tooltip content="展开" effect="light">
                        <div class="button">
                            <el-icon :size="18">
                                <i-home-expand/>
                            </el-icon>
                        </div>
                    </el-tooltip>
                </div>
                <div class="item" @click="handleCollapseTree">
                    <el-tooltip content="收起" effect="light">
                        <div class="button">
                            <el-icon :size="18">
                                <i-home-collapse/>
                            </el-icon>
                        </div>
                    </el-tooltip>
                </div>
            </el-col>
        </el-row>
        <el-row class="search">
            <el-col :span="24">
                <el-input :clearable="true" v-model="filterText" placeholder="节点名称" />
            </el-col>
        </el-row>
        <el-row class="tree">
            <el-col :span="24">
                <el-tree
                    ref="treeRef"
                    :data="nodeData"
                    :props="defaultProps"
                    :expand-on-click-node="false"
                    :highlight-current="true"
                    :filter-node-method="filterNode"
                    node-key="id"
                    @current-change="handleNodeChange"
                >
                    <template #default="{ node, data }">
                        <div class="custom-tree-node" :title="node.label">
                            <span class="label" :style="{color: data.isMesh?'red':'black'}">{{ node.label }}</span>
                            <span @click.stop="">
                                <a @click="locateNode(data)">
                                    <el-icon :size="14"><i-home-fit/></el-icon>
                                </a>
                                <a style="margin-left: 8px" @click="showNode(data)">
                                    <el-icon :size="14">
                                        <i-home-visible v-show="data.visible"/>
                                        <i-home-hidden v-show="!data.visible"/>
                                    </el-icon>
                                </a>
                            </span>
                        </div>
                    </template>
                </el-tree>
            </el-col>
        </el-row>
    </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';
import { ElTree } from 'element-plus';
// import type Node from 'element-plus/es/components/tree/src/model/node';
import { EventType, GlobalBUS, IEventBandDataForSingleClickOnView3D, IEventBandData } from '../engine/bus';
import { TXEngine } from '../engine/wrapper';
import { INodeSimpleInfo } from '../engine/render/info-struct';
interface Tree {
  id: number;
  label: string;
  visible: boolean;
  isMesh: boolean;
  children?: Array<Tree>;
};

const data: Tree[] = [];
const dataFlat: Tree[] = [];
const dataMap: Map<number, Tree> = new Map<number, Tree>();
const treeRef = ref<InstanceType<typeof ElTree>>();
export default defineComponent({
    name: 'ModelInfoNodeLayout',
    data() {
        return {
            nodeData: data, // 原始tree
            nodeDataFlat: dataFlat, // 打平的tree
            nodeDataMap: dataMap, // objectid => nodedata  映射
            defaultProps: {
                children: 'children',
                label: 'label',
            },
            filterText: '',
        }
    },
    watch: {
        filterText: (val: string) => {
            treeRef.value!.filter(val);
        }
    },
    created() {
        GlobalBUS.Off(EventType.LoadSceneDone, this.handleLoadSceneDone);
        GlobalBUS.On(EventType.LoadSceneDone, this.handleLoadSceneDone);
        
        GlobalBUS.Off(EventType.SingleClickOnView3D, this.handleSingleClickOnView3D);
        GlobalBUS.On(EventType.SingleClickOnView3D, this.handleSingleClickOnView3D);

        this.refreshNodeTree();
    },
    methods: {
        handleLoadSceneDone(ev: IEventBandData) {
            if (ev.value === false) {
                console.error('LoadSceneDone Failed');
                return;
            }
            this.refreshNodeTree();
        },
        refreshNodeTree() {
            const nodeTree = TXEngine.NodeSimpleTree;
            this.nodeData = [];
            if (nodeTree && nodeTree.length > 0) {
                this.nodeData = this.engineNodeTree2ViewNodeTree(nodeTree);
                this.saveNodeTreeRedundancy();
                console.warn('tree node refresh');
            }
        },
        handleSingleClickOnView3D(data: IEventBandDataForSingleClickOnView3D) {
            // TXEngine.SelectNodeWithID(data.objectID);
            const nodeData = this.nodeDataMap.get(data.objectID!);
            let beSelectNodeID: any = undefined;
            if (nodeData) {
                beSelectNodeID = nodeData.id;
            }
            treeRef.value?.setCurrentKey(beSelectNodeID);
            // treeRef.value?.setCurrentKey(beSelectedKey, true);
        },
        engineNodeTree2ViewNodeTree(nodeTree: Array<INodeSimpleInfo>): Array<Tree> {
            const func = (node: INodeSimpleInfo) => {
                return node.children.map(it => {
                    const nodeForView: Tree = {
                        id: it.id,
                        label: it.name,
                        visible: true,
                        isMesh: it.isMesh,
                        children: func(it),
                    };
                    return nodeForView;
                });
            };
            nodeTree = nodeTree[0].children;
            return nodeTree.map(it => {
                return {
                    id: it.id,
                    label: it.name,
                    visible: true,
                    isMesh: it.isMesh,
                    children: func(it),
                };
            });
        },
        saveNodeTreeRedundancy() {
            this.nodeDataFlat = [];
            this.nodeDataMap = new Map<number, Tree>();
            const recursion = (curData: Array<Tree>) => {
                curData.forEach((it) => {
                    this.nodeDataFlat.push(it);
                    this.nodeDataMap.set(it.id, it);
                    if (it.children) {
                        recursion(it.children);
                    }
                });
            };
            recursion(this.nodeData);
        },
        showNode(data: Tree) {
            const mark = !data.visible;
            if (TXEngine.ShowNodeWithID(data.id, mark) === true) {
                this.setVisible(data, mark);
            }
        },
        setVisible(data: Tree, mark: boolean) {
            data.visible = mark;
            data.children?.forEach((it: Tree) => {
                this.setVisible(it, mark);
            })
        },
        handleNodeChange(data: Tree) {
            let selectNodeID: number | null = null;
            if (data && data.id) {
                selectNodeID = data.id;
            }
            TXEngine.SelectNodeWithID(selectNodeID);
            GlobalBUS.Emit(EventType.ViewTreeModelNodeChange, {
                name: EventType.ViewTreeModelNodeChange,
                id: EventType.ViewTreeModelNodeChange,
                value: selectNodeID,
            });
        },
        locateNode(data: Tree) {
            TXEngine.FitNodeWithID(data.id);
        },
        filterNode(value: string, data: Tree) {
            if (!value) return true
            return data.label.includes(value)
        },
        handleExpandTree() {
            for (const key in treeRef.value?.store.nodesMap) {
                treeRef.value?.store.nodesMap[key].expand();
            }
        },
        handleCollapseTree() {
            for (const key in treeRef.value?.store.nodesMap) {
                treeRef.value?.store.nodesMap[key].collapse();
            }
        }
    },
    setup() {
        return {
            treeRef,
        };
    },
})
</script>

<style lang="less" scoped>
.search {
    margin-top: 8px;
}

.tree {
    margin-top: 8px;
    overflow-x: auto;
    overflow-y: auto;
    width: 230px;
    height: calc(100vh - 240px);
    user-select: none;
}

.custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
//   padding-right: 8px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}

.custom-tree-node .label {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    padding-right: 4px;
}

.tools {
    height: 40px;
    border-bottom: 1px solid @tx-border-color;
}

.tools .item {
    // margin-top: 2px;
    // margin-bottom: 2px;
}

.button {
    float: left;
	cursor: pointer;
	padding: 10px;
}

.button:hover {
    background: #c9e5f8;
}

.button.selected {
    background: #e1e1e1;
}
</style>
