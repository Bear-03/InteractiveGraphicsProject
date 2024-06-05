precision mediump float;

#define SHININESS_COLOR vec3(0.5, 1, 0.5)
#define SHININESS_INTENSITY 0.5

#define HEIGHT_TRANSPARENCY_RELATION 5.0

uniform vec3 u_colorBottom;
uniform vec3 u_colorTop;

varying float v_height;
varying float v_offset_magnitude;


void main() {
    // The valleys should will brighter for a more natural effect
    vec3 shininess = SHININESS_COLOR * SHININESS_INTENSITY * v_offset_magnitude;
    vec3 diffuse = mix(u_colorBottom, u_colorTop, v_height);

    gl_FragColor = vec4(diffuse + shininess, min(HEIGHT_TRANSPARENCY_RELATION * v_height, 1.0));
}