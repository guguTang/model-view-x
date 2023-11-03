<template>
    <span>
        {{ title }}
    </span>
    <el-tooltip
        :content="tip"
    >
        <div class="sub-tip-icon">
            <el-icon><MoreFilled /></el-icon>
        </div>
    </el-tooltip>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
    name: 'SubTitleLabel',
    props: {
        title: {
            type: String,
            default: '',
        },
        tip: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
        }
    },
    created() {
    },
    mounted() {
    },
    methods: {

    },
    setup() {
        return {
        };
    },
})
</script>
<style lang="less" scoped>
.sub-tip-icon {
    margin-left: 6px;
    cursor: pointer;
}

.sub-tip-icon:hover {
    color: orange;
}
</style>