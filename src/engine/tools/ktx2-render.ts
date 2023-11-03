/**
 * @type {string}
 * @private
 */
const vertexShaderSource_ = [
	'attribute vec4 vert;',
	'varying vec2 v_texCoord;',
	'void main() {',
	'  gl_Position = vec4(vert.xy, 0.0, 1.0);',
	'  v_texCoord = vert.zw;',
	'}',
].join('\n');

/**
 * @type {string}
 * @private '  gl_FragColor = texture2D(texSampler, v_texCoord);',
 */
const fragmentShaderSource_ = [
	'precision highp float;',
	'uniform sampler2D texSampler;',
	'uniform vec4 control;',
	'varying vec2 v_texCoord;',
	'void main() {',
	'  vec4 c;',
	'  c = texture2D(texSampler, v_texCoord);',
	'  if (control.x > 0.0)',
	'  {',
	'   	c.w = 1.0;',
	'  }',
	'	 else if (control.y > 0.0)',
	'	 {',
	'   	c.rgb = c.aaa; c.w = 1.0;',
	'  }',
	'  gl_FragColor = c;',
	'}',
].join('\n');
// ASTC format, from:
// https://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_astc
const COMPRESSED_RGBA_ASTC_4x4_KHR = 0x93b0;
// DXT formats, from:
// http://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_s3tc/
const COMPRESSED_RGB_S3TC_DXT1_EXT = 0x83f0;
// const COMPRESSED_RGBA_S3TC_DXT1_EXT = 0x83f1;
const COMPRESSED_RGBA_S3TC_DXT3_EXT = 0x83f2;
// const COMPRESSED_RGBA_S3TC_DXT5_EXT = 0x83f3;
// BC7 format, from:
// https://www.khronos.org/registry/webgl/extensions/EXT_texture_compression_bptc/
const COMPRESSED_RGBA_BPTC_UNORM = 0x8e8c;
// ETC format, from:
// https://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_etc1/
const COMPRESSED_RGB_ETC1_WEBGL = 0x8d64;
// PVRTC format, from:
// https://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_pvrtc/
const COMPRESSED_RGB_PVRTC_4BPPV1_IMG = 0x8c00;
const COMPRESSED_RGBA_PVRTC_4BPPV1_IMG = 0x8c02;
const uint8Format = [
	COMPRESSED_RGBA_ASTC_4x4_KHR, 
	COMPRESSED_RGB_S3TC_DXT1_EXT,
	COMPRESSED_RGBA_S3TC_DXT3_EXT,
	COMPRESSED_RGBA_BPTC_UNORM,
	COMPRESSED_RGB_ETC1_WEBGL,
	COMPRESSED_RGB_PVRTC_4BPPV1_IMG,
	COMPRESSED_RGBA_PVRTC_4BPPV1_IMG,
];
export class KTX2Renderer {
	private gl_: WebGLRenderingContext;
	private program_: WebGLProgram | null;
	private vertexShader_: WebGLShader | null;
	private fragmentShader_: WebGLShader | null;
	private quadVertexBuffer_: WebGLBuffer | null;
	private uniformLocations_: any;
	private attribLocations_: any;
	private textures: Array<WebGLTexture>;
	constructor(gl: WebGLRenderingContext) {
		console.log('KTX2Renderer');
		this.textures = [];
		/**
		 * The GL context.
		 * @type {WebGLRenderingContext}
		 * @private
		 */
		this.gl_ = gl;
		this.getSupport();
		/**
		 * The WebGLProgram.
		 * @type {WebGLProgram}
		 * @private
		 */
		this.program_ = gl.createProgram();
		if (!this.program_) {
			throw('webgl create program error');
		}
		/**
		 * @type {WebGLShader}
		 * @private
		 */
		this.vertexShader_ = this.compileShader_(
			vertexShaderSource_,
			gl.VERTEX_SHADER
		);
		if (!this.vertexShader_) {
			throw('webgl compileShader error');
		}

		/**
		 * @type {WebGLShader}
		 * @private
		 */
		this.fragmentShader_ = this.compileShader_(
			fragmentShaderSource_,
			gl.FRAGMENT_SHADER
		);
		if (!this.fragmentShader_) {
			throw('webgl compileShader error');
		}

		/**
		 * Cached uniform locations.
		 * @type {Object.<string, WebGLUniformLocation>}
		 * @private
		 */
		this.uniformLocations_ = {};

		/**
		 * Cached attribute locations.
		 * @type {Object.<string, WebGLActiveInfo>}
		 * @private
		 */
		this.attribLocations_ = {};

		/**
		 * A vertex buffer containing a single quad with xy coordinates from [-1,-1]
		 * to [1,1] and uv coordinates from [0,0] to [1,1].
		 * @private
		 */
		this.quadVertexBuffer_ = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.quadVertexBuffer_);
		const vertices = new Float32Array([
			-1.0, -1.0, 0.0, 1.0, +1.0, -1.0, 1.0, 1.0, -1.0, +1.0, 0.0, 0.0, 1.0, +1.0, 1.0,
			0.0,
		]);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

		// init shaders
		gl.attachShader(this.program_, this.vertexShader_);
		gl.attachShader(this.program_, this.fragmentShader_);
		gl.bindAttribLocation(this.program_, 0, 'vert');
		gl.linkProgram(this.program_);
		gl.useProgram(this.program_);
		gl.enableVertexAttribArray(0);

		gl.enable(gl.DEPTH_TEST);
		gl.disable(gl.CULL_FACE);

		let count: number = gl.getProgramParameter(this.program_, gl.ACTIVE_UNIFORMS) as number;
		for (let i = 0; i < count; i++) {
			const info = gl.getActiveUniform(this.program_, i);
			const result = gl.getUniformLocation(this.program_, info!.name);
			this.uniformLocations_[info!.name] = result;
		}

		count = gl.getProgramParameter(this.program_, gl.ACTIVE_ATTRIBUTES) as number;
		for (let i = 0; i < count; i++) {
			const info = gl.getActiveAttrib(this.program_, i);
			const result = gl.getAttribLocation(this.program_, info!.name);
			this.attribLocations_[info!.name] = result;
		}
	}

	public clean() {
		const gl = this.gl_;
		this.textures.forEach(it => gl.deleteTexture(it));
		gl.deleteShader(this.vertexShader_);
		gl.deleteShader(this.fragmentShader_);
		gl.deleteBuffer(this.quadVertexBuffer_);
		gl.getExtension('WEBGL_lose_context')?.loseContext();	
	}

	private getSupport() {
		/*const astcSupported = !!*/this.gl_.getExtension('WEBGL_compressed_texture_astc');
		/*const etcSupported = !!*/this.gl_.getExtension('WEBGL_compressed_texture_etc1');
		/*const dxtSupported = !!*/this.gl_.getExtension('WEBGL_compressed_texture_s3tc');
		/*const pvrtcSupported = !!*/this.gl_.getExtension('WEBGL_compressed_texture_pvrtc') || /*!!*/this.gl_.getExtension('WEBKIT_WEBGL_compressed_texture_pvrtc');
		/*const bc7Supported = !!*/this.gl_.getExtension('EXT_texture_compression_bptc');
	}

	/**
	 * Compiles a GLSL shader and returns a WebGLShader.
	 * @param {string} shaderSource The shader source code string.
	 * @param {number} type Either VERTEX_SHADER or FRAGMENT_SHADER.
	 * @return {WebGLShader} The new WebGLShader.
	 * @private
	 */
	private compileShader_(shaderSource: string, type: number): WebGLShader | null {
		const gl = this.gl_;
		const shader = gl.createShader(type);
		if (shader) {
			gl.shaderSource(shader, shaderSource);
			gl.compileShader(shader);
		}
		return shader;
	}

	public createCompressedTexture (data: ArrayBufferView, width: number, height: number, format: number): WebGLTexture | null {
		const gl = this.gl_;
		const tex = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, tex);
		gl.compressedTexImage2D(gl.TEXTURE_2D, 0, format, width, height, 0, data);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		//gl.generateMipmap(gl.TEXTURE_2D)
		gl.bindTexture(gl.TEXTURE_2D, null);
		if (tex) this.textures.push(tex);
		return tex;
	};

	public drawTexture (texture: WebGLTexture, width: number, height: number, mode: number): void {
		const gl = this.gl_;
		// draw scene
		gl.clearColor(0, 0, 0, 1);
		gl.clearDepth(1.0);
		gl.viewport(0, 0, width, height);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
	
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.uniform1i(this.uniformLocations_.texSampler, 0);
	
		let x = 0.0;
		let y = 0.0;
		if (mode == 1) x = 1.0;
		else if (mode == 2) y = 1.0;
	
		gl.uniform4f(this.uniformLocations_.control, x, y, 0.0, 0.0);
	
		gl.enableVertexAttribArray(this.attribLocations_.vert);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.quadVertexBuffer_);
		gl.vertexAttribPointer(this.attribLocations_.vert, 4, gl.FLOAT, false, 0, 0);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	}

	public draw(data: ArrayBuffer, width: number, height: number, format: number): boolean {
		let tex: WebGLTexture | null = null;
		if (uint8Format.indexOf(format) !== -1) {
			const buffer = new Uint8Array(data);
			tex = this.createCompressedTexture(buffer, width, height, format);
		} else {
			let dstTex = new Uint16Array(width * height);
			const dataView = new DataView(data);
			// Convert the array of bytes to an array of uint16's.
			let pix = 0;
			for (let y = 0; y < height; y++)
				for (let x = 0; x < width; x++, pix++)
					dstTex[pix] = dataView.getUint8(2 * pix + 0) | (dataView.getUint8(2 * pix + 1) << 8);
			tex = this.createRgb565Texture(dstTex, width, height);
		}
		if (!tex) {
			return false;
		}
		this.drawTexture(tex, width, height, 0);
		this.gl_.deleteTexture(tex);
		return true;
	}

	public createRgb565Texture (rgb565Data: ArrayBufferView, width: number, height: number): WebGLTexture | null {
		const gl = this.gl_;
		const tex = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, tex);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGB,
			width,
			height,
			0,
			gl.RGB,
			gl.UNSIGNED_SHORT_5_6_5,
			rgb565Data
		);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		//gl.generateMipmap(gl.TEXTURE_2D)
		gl.bindTexture(gl.TEXTURE_2D, null);
		if (tex) this.textures.push(tex);
		return tex;
	}

	public createDxtTexture (dxtData: ArrayBufferView, width: number, height: number, format: number): WebGLTexture | null {
		const gl = this.gl_;
		const tex = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, tex);
		gl.compressedTexImage2D(gl.TEXTURE_2D, 0, format, width, height, 0, dxtData);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		//gl.generateMipmap(gl.TEXTURE_2D)
		gl.bindTexture(gl.TEXTURE_2D, null);
		if (tex) this.textures.push(tex);
		return tex;
	}
}




