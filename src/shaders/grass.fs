precision mediump float;

#define SHININESS_COLOR vec3(0.1, 1.0, 0.1)
#define SHININESS_INTENSITY 2.0

#define HEIGHT_TRANSPARENCY_RELATION 5.0

uniform vec3 u_color_base;
uniform vec3 u_color_tip;

varying vec2 v_uv;
varying float v_displacement;

void main() {
    // The valleys should will brighter for a more natural effect
    vec3 shininess = SHININESS_COLOR * SHININESS_INTENSITY * v_displacement;
    vec3 diffuse = mix(u_color_base, u_color_tip, v_uv.y);
    float alpha = min(HEIGHT_TRANSPARENCY_RELATION * v_uv.y, 1.0);

    // TODO: Maybe base gradient based on length(position - blade origin) rather than height
    csm_DiffuseColor = vec4(diffuse + shininess, alpha);
}