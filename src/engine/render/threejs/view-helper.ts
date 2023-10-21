import { ViewHelper as ViewHelperBase } from 'three/examples/jsm/helpers/ViewHelper';
import * as THREE from 'three';

class ViewHelper extends ViewHelperBase {
    constructor(camera: THREE.Camera, container: HTMLElement) {
        super(camera, container);
    }
}

export class THREEViewHelper {
    private _renderer: THREE.WebGLRenderer;
    private _viewHeler: ViewHelper;
    private _isShow: boolean;
    constructor(camera: THREE.Camera, container: HTMLElement, renderer: THREE.WebGLRenderer) {
        this._isShow = true;
        this._renderer = renderer;
        this._renderer.autoClear = false;
        this._viewHeler = new ViewHelper(camera, container);
    }

    public Show(mark: boolean): boolean {
        this._isShow = mark;
        if (mark === false) {
            // this._axesRenderer.clear();
        }
        return true;
    }

    public OnUpdate(dt: number) {
        if (this._isShow === false) return;
        if (this._viewHeler.animating === true ) {
			this._viewHeler.update(dt);
		}
        this._viewHeler.render(this._renderer);
    }
}