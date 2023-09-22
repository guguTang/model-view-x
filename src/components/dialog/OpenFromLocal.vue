<template>
    <div>
        <input type="file" ref="fileIns" multiple @change="handleChange" hidden/>
    </div>
</template>
<script lang="ts">
import { EventType, GlobalBUS } from "@/engine/bus";
import Folder from "@/engine/folder/folder";
import FolderLocal from "@/engine/folder/folder-local";
import FolderZip from "@/engine/folder/folder-zip";
import { defineComponent, ref } from "vue";
// import { EventType, GlobalBUS, IEventBandDataForButton } from '../../engine/bus';
const fileIns = ref<InstanceType<typeof HTMLInputElement>>();
export default defineComponent({
    name: 'OpenFromLocal',
    props: {

    },
    expose: ['open'],
    data() {
        return {
        };
    },
    methods: {
        open() {
            fileIns.value?.dispatchEvent(new MouseEvent('click'));
        },
        async handleChange(event: any) {
            const fileList: FileList  = event.target.files;
            let folderIns: Folder | null = null;
            if (fileList.length > 0) {
                if (fileList.length === 1) {
                    const fileZip = fileList[0];
                    if (fileZip.type === 'application/x-zip-compressed' || fileZip.type === 'application/zip') {
                        folderIns = new FolderZip(fileZip);
                    } else {
                        folderIns = new FolderLocal(fileList);
                    }
                } else {
                    folderIns = new FolderLocal(fileList);
                }
                
            }
            if (folderIns) {
                await folderIns.Init();
                event.target.value = null;
                GlobalBUS.Emit(EventType.OpenFromLocal, {
                    id: EventType.OpenFromLocal,
                    name: EventType.OpenFromLocal,
                    value: folderIns,
                });
            }
        },
    },
    setup() {
        return {
            fileIns,
        };
    }
});
</script>