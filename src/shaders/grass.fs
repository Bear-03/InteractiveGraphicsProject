precision mediump float;

uniform vec3 u_color_base;
uniform vec3 u_color_tip;
uniform float u_transparent_proportion;
uniform vec3 u_shine_color;
uniform float u_shine_intensity;

varying vec2 v_uv;
varying float v_displacement;

void main() {
    // The valleys should will brighter for a more natural effect
    vec3 shininess = u_shine_intensity * v_displacement * u_shine_color;
    vec3 diffuse = mix(u_color_base, u_color_tip, v_uv.y);
    float alpha = mix(0.0, 1.0, v_uv.y / u_transparent_proportion);

    // TODO: Maybe base gradient based on length(position - blade origin) rather than height
    csm_DiffuseColor = vec4(diffuse + shininess, alpha);
}