import ImporterBase from './import-base';
import DataTransfer from '../data/transfer';
import { ReadLines, ParametersFromLine, NameFromLine } from './import-utils';

export class ImporterOBJ extends ImporterBase {
    // private globalVertices: any;
    // private globalVertexColors: any;
    // private globalNormals: any;
    // private globalUvs: any;

    // private currentMeshConverter: any;
    private currentMaterial: any;
    // private currentMaterialIndex: any;
    // private meshNameToConverter: any;
    private materialNameToIndex: any;

    private _mtlLibsName: Array<string> = [];
    constructor() {
        super();
    }

    CanImportExtension (extension: string) {
        return extension === 'obj';
    }

    public get mtlLibsName(): Array<string> {
        return this._mtlLibsName;
    }

    public ClearContent() {
        // this.globalVertices = null;
        // this.globalVertexColors = null;
        // this.globalNormals = null;
        // this.globalUvs = null;

        // this.currentMeshConverter = null;
        this.currentMaterial = null;
        // this.currentMaterialIndex = null;

        // this.meshNameToConverter = null;
        this.materialNameToIndex = null;
    }

    public ResetContent() {
        // this.globalVertices = [];
        // this.globalVertexColors = [];
        // this.globalNormals = [];
        // this.globalUvs = [];

        // this.currentMeshConverter = null;
        this.currentMaterial = null;
        // this.currentMaterialIndex = null;

        // this.meshNameToConverter = new Map ();
        this.materialNameToIndex = new Map ();
    }

    public ImportContent(buffer: ArrayBuffer): boolean {
        const textContent = DataTransfer.ArrayBuffer2Utf8String(buffer);
        ReadLines (textContent, (line) => {
            if(!this.WasError ()) {
                this.ProcessLine (line);
            }
        });
        return true;
    }

    private ProcessLine(line: string) {
        if(line[0] === '#') {
            return;
        }

        let parameters = ParametersFromLine(line, '#');
        if(parameters.length === 0) {
            return;
        }

        let keyword = parameters[0].toLowerCase();
        parameters.shift ();

        if (this.ProcessMeshParameter(keyword, parameters, line)) {
            return;
        }

        if (this.ProcessMaterialParameter(keyword, parameters, line)) {
            return;
        }
    }

    private ProcessMeshParameter(keyword: string, parameters: Array<string>, line: string): boolean {
        if (keyword === 'g' || keyword === 'o') {
            if (parameters.length === 0) {
                return true;
            }
            let name = NameFromLine(line, keyword.length, '#');
            this.AddNewMesh(name);
            return true;
        } else if (keyword === 'v') {
            if (parameters.length < 3) {
                return true;
            }
            /*
            this.globalVertices.push (new Coord3D (
                parseFloat (parameters[0]),
                parseFloat (parameters[1]),
                parseFloat (parameters[2])
            ));
            if (parameters.length >= 6) {
                this.globalVertexColors.push (CreateColor(parameters[3], parameters[4], parameters[5]));
            }
            */
            return true;
        } else if (keyword === 'vn') {
            if (parameters.length < 3) {
                return true;
            }
            /*
            this.globalNormals.push (new Coord3D (
                parseFloat (parameters[0]),
                parseFloat (parameters[1]),
                parseFloat (parameters[2])
            ));
            */
            return true;
        } else if (keyword === 'vt') {
            if (parameters.length < 2) {
                return true;
            }
            /*
            this.globalUvs.push (new Coord2D (
                parseFloat (parameters[0]),
                parseFloat (parameters[1])
            ));
            */
            return true;
        } else if (keyword === 'f') {
            if (parameters.length < 3) {
                return true;
            }
            this.ProcessFace(parameters);
            return true;
        }
        return false;
    }

    private ProcessMaterialParameter(keyword: string, parameters: Array<string>, line: string): boolean {
        /*
        function ExtractTextureParameters(parameters: Array<string>) {
            let textureParameters = new Map ();
            let lastParameter = null;
            for (let i = 0; i < parameters.length - 1; i++) {
                let parameter = parameters[i];
                if (parameter.startsWith ('-')) {
                    lastParameter = parameter;
                    textureParameters.set (lastParameter, []);
                    continue;
                }
                if (lastParameter !== null) {
                    textureParameters.get (lastParameter).push (parameter);
                }
            }
            return textureParameters;
        }
        */

        /*
        function CreateTexture(parameters: Array<string>, callbacks: any) {
            let texture = new TextureMap ();
            let textureName = parameters[parameters.length - 1];
            let textureBuffer = callbacks.getFileBuffer (textureName);
            texture.name = textureName;
            texture.buffer = textureBuffer;

            let textureParameters = ExtractTextureParameters (parameters);
            if (textureParameters.has ('-o')) {
                let offsetParameters = textureParameters.get ('-o');
                if (offsetParameters.length > 0) {
                    texture.offset.x = parseFloat (offsetParameters[0]);
                }
                if (offsetParameters.length > 1) {
                    texture.offset.y = parseFloat (offsetParameters[1]);
                }
            }

            if (textureParameters.has ('-s')) {
                let scaleParameters = textureParameters.get ('-s');
                if (scaleParameters.length > 0) {
                    texture.scale.x = parseFloat (scaleParameters[0]);
                }
                if (scaleParameters.length > 1) {
                    texture.scale.y = parseFloat (scaleParameters[1]);
                }
            }

            return texture;
        }
        */

        if (keyword === 'newmtl') {
            if (parameters.length === 0) {
                return true;
            }
            /*
            let material = new PhongMaterial();
            let materialName = NameFromLine(line, keyword.length, '#');
            let materialIndex = this.model.AddMaterial(material);
            material.name = materialName;
            this.currentMaterial = material;
            this.materialNameToIndex.set (materialName, materialIndex);
            */
            return true;
        } else if (keyword === 'usemtl') {
            if (parameters.length === 0) {
                return true;
            }

            let materialName = NameFromLine (line, keyword.length, '#');
            if (this.materialNameToIndex.has (materialName)) {
                // this.currentMaterialIndex = this.materialNameToIndex.get(materialName);
            }
            return true;
        } else if (keyword === 'mtllib') {
            if (parameters.length === 0) {
                return true;
            }
            let fileName = NameFromLine(line, keyword.length, '#');
            this._mtlLibsName.push(fileName);
            // console.error(fileName);
            /*
            let fileBuffer = this.callbacks.getFileBuffer(fileName);
            if (fileBuffer !== null) {
                let textContent = ArrayBufferToUtf8String (fileBuffer);
                ReadLines(textContent, (line) => {
                    if (!this.WasError ()) {
                        this.ProcessLine(line);
                    }
                });
            }
            */
            return true;
        } else if (keyword === 'map_kd') {
            if (this.currentMaterial === null || parameters.length === 0) {
                return true;
            }
            /*
            this.currentMaterial.diffuseMap = CreateTexture (parameters, this.callbacks);
            UpdateMaterialTransparency (this.currentMaterial);
            */
            return true;
        } else if (keyword === 'map_ks') {
            if (this.currentMaterial === null || parameters.length === 0) {
                return true;
            }
            // this.currentMaterial.specularMap = CreateTexture (parameters, this.callbacks);
            return true;
        } else if (keyword === 'map_bump' || keyword === 'bump') {
            if (this.currentMaterial === null || parameters.length === 0) {
                return true;
            }
            // this.currentMaterial.bumpMap = CreateTexture (parameters, this.callbacks);
            return true;
        } else if (keyword === 'ka') {
            if (this.currentMaterial === null || parameters.length < 3) {
                return true;
            }
            // this.currentMaterial.ambient = CreateColor (parameters[0], parameters[1], parameters[2]);
            return true;
        } else if (keyword === 'kd') {
            if (this.currentMaterial === null || parameters.length < 3) {
                return true;
            }
            // this.currentMaterial.color = CreateColor (parameters[0], parameters[1], parameters[2]);
            return true;
        } else if (keyword === 'ks') {
            if (this.currentMaterial === null || parameters.length < 3) {
                return true;
            }
            // this.currentMaterial.specular = CreateColor (parameters[0], parameters[1], parameters[2]);
            return true;
        } else if (keyword === 'ns') {
            if (this.currentMaterial === null || parameters.length < 1) {
                return true;
            }
            this.currentMaterial.shininess = parseFloat (parameters[0]) / 1000.0;
            return true;
        } else if (keyword === 'tr') {
            if (this.currentMaterial === null || parameters.length < 1) {
                return true;
            }
            this.currentMaterial.opacity = 1.0 - parseFloat (parameters[0]);
            // UpdateMaterialTransparency (this.currentMaterial);
            return true;
        } else if (keyword === 'd') {
            if (this.currentMaterial === null || parameters.length < 1) {
                return true;
            }
            this.currentMaterial.opacity = parseFloat (parameters[0]);
            // UpdateMaterialTransparency (this.currentMaterial);
            return true;
        }
        return false;
    }

    private AddNewMesh(name: string) {
        console.log(name);
    }

    private ProcessFace(parameters?: Array<string>) {
        console.log(parameters);
    }
}