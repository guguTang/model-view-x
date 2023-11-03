<template>
    <div>
        <canvas class="map-canvas" ref="mapCanvas"></canvas>
        <canvas class="map-canvas" ref="mapCanvasCompress"></canvas>
        <el-collapse v-model="activeMaterialNames">
            <el-collapse-item v-for="(val) in materials" :title="`材质(${val.name})`" :name="val.name">
                <template #title>
                    <span :title="val.name" class="material-title">{{ val.name }}</span>
                    <!-- <el-icon class="header-icon">
                        <info-filled />
                    </el-icon> -->
                </template>
                <el-collapse v-model="activeSubNames"  style="padding-right: 8px;">
                    <!-- basic begin -->
                    <el-collapse-item name="basic">
                        <template #title>
                            <span class="sub-material-title" title="Basic（基础）">Basic（基础）</span>
                        </template>
                        <el-form
                            label-position="left"
                            label-width="80px"
                            style="max-width: 460px"
                            size="small"
                            :model="val"
                        >
                            <el-form-item label="名称">
                                <el-text>{{ val.name }}</el-text>
                            </el-form-item>

                            <el-form-item label="类型">
                                <el-text>{{ val.typeStr }}</el-text>
                            </el-form-item>

                            <el-form-item>
                                <template #label>
                                    <SubTitleLabel title="颜色" tip="Base Color"/>
                                </template>
                                <el-color-picker v-model="val.baseColor" color-format="hex" />
                            </el-form-item>

                            <el-form-item>
                                <template #label>
                                    <SubTitleLabel title="透明" tip="Opacity"/>
                                </template>
                                <el-input-number v-model="val.opacity" :precision="3" :min="0" :max="1" :step="0.1" controls-position="right"/>
                            </el-form-item>
                            <!-- diffuse贴图信息 begin -->
                            <el-divider content-position="left" border-style="dashed">漫反射贴图</el-divider>
                            <TextureItem :texture="val.map" tip="Diffuse Map" title="贴图"/>
                            <!-- diffuse贴图信息 end -->
                        </el-form>
                    </el-collapse-item>
                    <!-- basic end -->

                    <!-- physical begin -->
                    <el-collapse-item name="physical" v-if="val.typeStr === 'Physical'">
                        <template #title>
                            <span class="sub-material-title" title="Physical（物理）">Physical（物理）</span>
                        </template>
                        <el-form
                            label-position="left"
                            label-width="80px"
                            style="max-width: 460px"
                            size="small"
                            :model="val"
                        >
                            <el-form-item>
                                <template #label>
                                    <SubTitleLabel title="金属度" tip="Metalness"/>
                                </template>
                                <el-input-number v-model="val.metalness" :precision="3" :min="0" :max="1" :step="0.1" />
                            </el-form-item>

                            <el-form-item>
                                <template #label>
                                    <SubTitleLabel title="粗糙度" tip="Roughness"/>
                                </template>
                                <el-input-number v-model="val.roughness" :precision="3" :min="0" :max="1" :step="0.1" controls-position="right"/>
                            </el-form-item>
                            <el-divider content-position="left" border-style="dashed">金属度贴图</el-divider>
                            <TextureItem :texture="val.metalnessMap" tip="Metalness Map" title="贴图"/>
                            <el-divider content-position="left" border-style="dashed">粗糙度贴图</el-divider>
                            <TextureItem :texture="val.roughnessMap" tip="Roughness Map" title="贴图"/>
                        </el-form>
                    </el-collapse-item>
                    <!-- physical end -->

                    <!-- phong begin -->
                    <el-collapse-item name="phong" v-if="val.typeStr === 'Phong'">
                        <template #title>
                            <span class="sub-material-title" title="Phong">Phong</span>
                        </template>
                        <el-form
                            label-position="left"
                            label-width="80px"
                            style="max-width: 460px"
                            size="small"
                            :model="val"
                        >
                            <el-form-item>
                                <template #label>
                                    <SubTitleLabel title="环境颜色" tip="Ambient Color"/>
                                </template>
                                <el-color-picker v-model="val.ambientColor" color-format="hex" />
                            </el-form-item>

                            <el-form-item>
                                <template #label>
                                    <SubTitleLabel title="镜面颜色" tip="Specular Color"/>
                                </template>
                                <el-color-picker v-model="val.specularColor" color-format="hex" />
                            </el-form-item>

                            <el-form-item>
                                <template #label>
                                    <SubTitleLabel title="亮度" tip="Shininess"/>
                                </template>
                                <el-input-number v-model="val.shininess" :precision="3" :min="0" :max="1" :step="0.1" />
                            </el-form-item>
                        </el-form>
                    </el-collapse-item>
                    <!-- phong end -->

                    <!-- ambient occ begin -->
                    <el-collapse-item name="ambient_occlusion">
                        <template #title>
                            <span class="sub-material-title" title="Ambient Occlusion（环境光遮挡）">Ambient Occlusion（环境光遮挡）</span>
                        </template>
                        <el-form
                            label-position="left"
                            label-width="80px"
                            style="max-width: 460px"
                            size="small"
                            :model="val"
                        >
                            <el-form-item>
                                <template #label>
                                    <SubTitleLabel title="强度" tip="Ambient Occlusion Map Intensity"/>
                                </template>
                                <el-input-number v-model="val.aoMapIntensity" :precision="3" :min="0" :max="1" :step="0.1" controls-position="right"/>
                            </el-form-item>
                            <el-divider content-position="left" border-style="dashed">环境光遮挡贴图</el-divider>
                            <TextureItem :texture="val.aoMap" tip="Ambient Occlusion Map" title="贴图"/>
                        </el-form>
                    </el-collapse-item>
                    <!-- ambient occ end -->

                    <!-- emissive begin -->
                    <el-collapse-item name="emissive">
                        <template #title>
                            <span class="sub-material-title" title="Emissive（自发光）">Emissive（自发光）</span>
                        </template>
                        <el-form
                            label-position="left"
                            label-width="80px"
                            style="max-width: 460px"
                            size="small"
                            :model="val"
                        >
                        <el-form-item>
                            <template #label>
                                <SubTitleLabel title="强度" tip="Emissive Intensity"/>
                            </template>
                            <el-input-number v-model="val.emissiveIntensity" :precision="3" :min="0" :max="1" :step="0.1" controls-position="right"/>
                        </el-form-item>
                        <el-form-item>
                            <template #label>
                                <SubTitleLabel title="颜色" tip="Emissive Color Factor"/>
                            </template>
                            <el-color-picker v-model="val.emissiveColor" color-format="hex" />
                        </el-form-item>
                        <el-divider content-position="left" border-style="dashed">自发光贴图</el-divider>
                        <TextureItem :texture="val.emissiveMap" tip="Emissive Map" title="贴图"/>
                        </el-form>
                    </el-collapse-item>
                    <!-- emissive end -->
                </el-collapse>
            </el-collapse-item>
        </el-collapse>
    </div>
</template>
<script lang="ts">
import { GlobalBUS, EventType } from '@/engine/bus';
import { TXEngine } from '@/engine/wrapper';
import { defineComponent, ref, Ref } from 'vue';
// import MapImage from './model-info-material-layout/MapImage.vue';
import SubTitleLabel from './model-info-material-layout/SubTitleLabel.vue';
import TextureItem from './model-info-material-layout/TextureItem.vue';
import * as TX from '@/engine/model/material/index';
import { KTX2Renderer } from '@/engine/tools/ktx2-render';
import { RGBColorToHexString } from '@/engine/model/color';
import { MaterialUnion, TextureWrapper } from '@/types/material';
const mapCanvas: Ref<HTMLCanvasElement | null> = ref(null);
const mapCanvasCompress: Ref<HTMLCanvasElement | null> = ref(null);
export default defineComponent({
    name: 'ModelInfoMaterialLayout',
    components: {
        // MapImage,
        SubTitleLabel,
        TextureItem,
    },
    data() {
        return {
            activeMaterialNames: [] as Array<string>,
            activeSubNames: ['basic', 'physical', 'phong'],
            materials: [] as Array<MaterialUnion>,
        }
    },
    created() {
        // GlobalBUS.Off(EventType.LoadSceneDone, this.handleLoadSceneDone);
        // GlobalBUS.On(EventType.LoadSceneDone, this.handleLoadSceneDone);

        GlobalBUS.Off(EventType.ViewTreeModelNodeChange, this.handleNodeSelectedChange);
        GlobalBUS.On(EventType.ViewTreeModelNodeChange, this.handleNodeSelectedChange);
    },
    mounted() {
        this.handleNodeSelectedChange();
    },
    methods: {
        handleNodeSelectedChange() {
            const selectedNode = TXEngine.GetSelectedNode(false);
            let materials: Array<TX.MaterialBase> = [];
            if (selectedNode) {
                materials = TXEngine.GetMaterialInfo(selectedNode.id);
            }
            this.materials = (materials as Array<TX.MaterialFace>).map(this.convertToUnionMaterial);
            this.activeMaterialNames = this.materials.map(it => it.name);
        },
        convertToUnionMaterial(mat: TX.MaterialFace): MaterialUnion {
            let rv: MaterialUnion = {
                name: mat.name,
                type: mat.type,
                typeStr: 'Unknown',
                baseColor: RGBColorToHexString(mat.color, true),
                opacity: mat.opacity,
            };
            rv.map = this.convertToTextureWrapper(mat.diffuseMap);
            rv.aoMap = this.convertToTextureWrapper(mat.aoMap);
            rv.aoMapIntensity = mat.aoMapIntensity;
            rv.emissiveColor = RGBColorToHexString(mat.emissive, true);
            rv.emissiveMap = this.convertToTextureWrapper(mat.emissiveMap);
            rv.emissiveIntensity = mat.emissiveIntensity;
            switch(mat.type) {
                case TX.MaterialType.Phong: {
                    const tmpMat = mat as TX.MaterialPhong;
                    rv.typeStr = 'Phong';
                    rv.ambientColor = RGBColorToHexString(tmpMat.ambient, true);
                    rv.specularColor = RGBColorToHexString(tmpMat.specular, true);
                    rv.shininess = tmpMat.shininess;
                    break;
                }
                case TX.MaterialType.Physical: {
                    const tmpMat = mat as TX.MaterialPhysical;
                    rv.typeStr = 'Physical';
                    rv.metalness = tmpMat.metalness;
                    rv.roughness = tmpMat.roughness;
                    rv.metalnessMap = this.convertToTextureWrapper(tmpMat.metalnessMap);
                    rv.roughnessMap = this.convertToTextureWrapper(tmpMat.roughnessMap);
                    break;
                }
                case TX.MaterialType.Basic: {
                    rv.typeStr = 'Basic';
                    break;
                }
            }
            // console.error(rv);
            return rv;
        },
        convertImageDataToBase64(texture: TX.Texture): string {
            if (texture.buffer) {
                if (texture.buffer instanceof HTMLImageElement) {
                    return texture.buffer.src;
                }

                if (texture.buffer instanceof ImageBitmap) {
                    if (mapCanvas && mapCanvas.value) {
                        mapCanvas.value.width = texture.width;
                        mapCanvas.value.height = texture.height;
                        mapCanvas.value.style.width = texture.width + 'px';
                        mapCanvas.value.style.height = texture.height + 'px';
                        const ctx: CanvasRenderingContext2D | null = mapCanvas.value.getContext('2d');
                        if (ctx) {
                            ctx.reset();
                            ctx.drawImage(texture.buffer, 0, 0, texture.width, texture.height);
                            return mapCanvas.value.toDataURL('image/png');
                        }
                    }
                }
                if (texture.buffer instanceof Uint8Array && texture.mimeType === 'image/ktx2') {
                    if (mapCanvasCompress && mapCanvasCompress.value) {
                        mapCanvasCompress.value.width = texture.width;
                        mapCanvasCompress.value.height = texture.height;
                        mapCanvasCompress.value.style.width = texture.width + 'px';
                        mapCanvasCompress.value.style.height = texture.height + 'px';
                        const ctx: WebGLRenderingContext | null = mapCanvasCompress.value.getContext('webgl', {
                            alpha: true,
                            antialias: true,
                        });
                        if (ctx) {
                            const ktx2Render = new KTX2Renderer(ctx);
                            const { buffer, width, height } = texture;
                            const format = texture.getExtra('format') as number;
                            let base64String: string = '';
                            if (ktx2Render.draw(buffer, width, height, format) === true) {
                                base64String = mapCanvasCompress.value.toDataURL();
                            }
                            // ktx2Render.clean();
                            return base64String;
                        }
                    }
                }
            }
            if (mapCanvas && mapCanvas.value) {
                mapCanvas.value.width = texture.width;
                mapCanvas.value.height = texture.height;
                mapCanvas.value.style.width = texture.width + 'px';
                mapCanvas.value.style.height = texture.height + 'px';
                
            }
            return '';
        },
        convertToTextureWrapper(texture: TX.Texture | null): TextureWrapper | undefined {
            if (texture) {
                return {
                    origin: texture,
                    base64: this.convertImageDataToBase64(texture),
                };
            }
            return undefined;
        }
    },
    setup() {
        return {
            mapCanvas,
            mapCanvasCompress
        };
    },
})
</script>
<style lang="less" scoped>
.material-title {
    font-size: 15px;
    font-weight: bold;
    color: rgb(255, 81, 0);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.sub-material-title {
    font-size: 12px;
    font-weight: bold;
    color: rgb(211, 126, 66);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.sub-tip-icon {
    margin-left: 6px;
    cursor: pointer;
}

.sub-tip-icon:hover {
    color: orange;
}

.map-canvas {
    display: none;
    position: absolute;
    top: 0px;
    left: 0px;
    width: 0px;
    height: 0px;
    z-index: 3000;
    background-color: transparent;
}
</style>