precision mediump float;

#define UP vec3(0.0, 0.0, 1.0)

#define SHININESS_COLOR vec3(0.5, 1, 0.5)
#define SHININESS_INTENSITY 0.5

#define HEIGHT_TRANSPARENCY_RELATION 5.0

uniform vec3 u_colorBottom;
uniform vec3 u_colorTop;

varying vec2 v_uv;
varying float v_displacement;

void main() {
    // The valleys should will brighter for a more natural effect
    vec3 shininess = SHININESS_COLOR * SHININESS_INTENSITY * v_displacement;
    vec3 diffuse = mix(u_colorBottom, u_colorTop, v_uv.y);
    float alpha = min(HEIGHT_TRANSPARENCY_RELATION * v_uv.y, 1.0);

    // TODO: Maybe base gradient based on length(position - blade origin) rather than height
    gl_FragColor = vec4(diffuse + shininess, alpha);
}