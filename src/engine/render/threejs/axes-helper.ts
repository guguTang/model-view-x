import * as THREE from 'three';
export class THREEAxesHelper {
    private _axesScene: THREE.Scene;
    private _axesCorner: THREE.AxesHelper;
    private _axesEl: HTMLElement;
    private _axesCamera: THREE.PerspectiveCamera;
    private _axesRenderer: THREE.WebGLRenderer;
    private _hostCamera: THREE.Camera;
    private _isShow: boolean;
    constructor(el: HTMLElement, hostCamera: THREE.Camera) {
        this._isShow = true;
        this._axesEl = el;
        this._hostCamera = hostCamera;
        const {clientWidth, clientHeight} = this._axesEl;
        this._axesScene = new THREE.Scene();
        this._axesCamera = new THREE.PerspectiveCamera( 50, clientWidth / clientHeight, 0.1, 10 );
        this._axesScene.add(this._axesCamera);

        this._axesRenderer = new THREE.WebGLRenderer({ alpha: true });
        this._axesRenderer.setPixelRatio(window.devicePixelRatio);
        this._axesRenderer.setSize(this._axesEl.clientWidth, this._axesEl.clientHeight);

        this._axesCamera.up = this._hostCamera.up;

        this._axesCorner = new THREE.AxesHelper(5);
        this._axesScene.add(this._axesCorner);
        this._axesEl.appendChild(this._axesRenderer.domElement);
    }

    // public get Camera(): THREE.Camera {
    //     return this._axesCamera;
    // }

    public Show(mark: boolean): boolean {
        this._isShow = mark;
        if (mark === false) {
            this._axesRenderer.clear();
        }
        return true;
    }

    public SetCameraPositon(pos: THREE.Vector3) {
        this._axesCamera.position.copy(pos);
    }

    public UpdateWhenLoadModel(size: number) {
        this._axesCamera.position.copy(this._hostCamera.position);
        this._axesCamera.lookAt(this._axesScene.position);
        this._axesCamera.near = size / 100;
        this._axesCamera.far = size * 100;
        this._axesCamera.updateProjectionMatrix();
        this._axesCorner.scale.set(size, size, size);
    }

    public OnUpdate() {
        if (this._isShow) {
            this._axesCamera.position.copy(this._hostCamera.position);
            this._axesCamera.lookAt(this._axesScene.position);
            this._axesRenderer.render(this._axesScene, this._axesCamera);
        }
    }

    public OnResize() {
        this._axesCamera.aspect = this._axesEl.clientWidth / this._axesEl.clientHeight;
        this._axesCamera.updateProjectionMatrix();
        this._axesRenderer.setSize(this._axesEl.clientWidth, this._axesEl.clientHeight);
    }
}