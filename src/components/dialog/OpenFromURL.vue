<template>
    <div>
        <el-dialog 
        v-model="visible" 
        title="打开远端模型" width="50%" draggable>
            <!-- <span>输入远程URL模型文件</span> -->
            <el-input
                v-model="url"
                :rows="4"
                type="textarea"
                placeholder="请输入URL"
            />
            <template #footer>
            <span class="dialog-footer">
                <el-button @click="visible = false">关闭</el-button>
                <el-button type="primary" @click="handleClickOpenFromURL">
                打开
                </el-button>
            </span>
            </template>
        </el-dialog>
    </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { EventType, GlobalBUS } from '../../engine/bus';
/* const dialogForOpenFromURL = {
    title: '打开远端模型',
                message: '输入远程URL模型文件',
                visible: false,
            };
const show = (mark: boolean): void => {
    dialogForOpenFromURL.visible = mark;
};
defineExpose({show});
 */
export default defineComponent({
    name: 'OpenFromURL',
    props: {

    },
    expose: ['show'],
    data() {
        return {
            visible: false,
            url: '',
        };
    },
    methods: {
        show(mark: boolean) {
            this.visible = mark;
        },
        handleClickOpenFromURL() {
            console.log(this.url);
            this.visible = false;
            GlobalBUS.Emit(EventType.OpenFromUrl, {
                name: EventType.OpenFromUrl,
                id: EventType.OpenFromUrl,
                value: this.url,
            });
        },
        // callbackForOpenFromURL(ev: IEventBandDataForButton) {
        //     console.log(ev);
        // }
    },
});
</script>