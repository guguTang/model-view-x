<template>
    <el-tooltip :content="tip" :effect="tooltipEffect">
        <div :class="selected?'button selected':'button'">
            <svg-icon :name="name" :size="size">
            </svg-icon>
        </div>
    </el-tooltip>
    
</template>
<script lang="ts">
import { defineComponent } from "vue";
// import { EventType, GlobalBUS } from "../engine/bus";
export default defineComponent({
    name: 'SvgButton',
    props: {
        size: Number,
        selected: Boolean,
        name: String,
        tip: String,
    },
    methods: {
    },
    mounted() {
        
    },
    data() {
        return {
            tooltipEffect: 'light'
        }
    },
    beforeMount() {
        this.tooltipEffect = 'light';
    },
    setup() {
    }
});
</script>
<style lang="less">
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

/*
.el-popper.is-customized {
  padding: 6px 12px;
  background: linear-gradient(90deg, rgb(159, 229, 151), rgb(204, 229, 129));
}

.el-popper.is-customized .el-popper__arrow::before {
  background: linear-gradient(45deg, #b2e68d, #bce689);
  right: 0;
}
*/
</style>