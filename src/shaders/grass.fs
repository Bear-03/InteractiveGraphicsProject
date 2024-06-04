precision mediump float;

uniform vec3 u_colorBottom;
uniform vec3 u_colorTop;

varying vec2 v_uv;

void main() {
    gl_FragColor = vec4(mix(u_colorBottom, u_colorTop, v_uv.y), 1.0);
}