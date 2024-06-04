precision mediump float;

uniform vec3 u_colorBottom;
uniform vec3 u_colorTop;

varying float v_height;

void main() {
    gl_FragColor = vec4(mix(u_colorBottom, u_colorTop, v_height), 1.0);
}