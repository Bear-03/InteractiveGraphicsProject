precision mediump float;

#define UP vec3(0.0, 0.0, 1.0)

#define SHININESS_COLOR vec3(0.5, 1, 0.5)
#define SHININESS_INTENSITY 0.5

#define HEIGHT_TRANSPARENCY_RELATION 5.0

uniform vec3 u_colorBottom;
uniform vec3 u_colorTop;

varying float v_height;
varying float v_influence_magnitude;
varying vec3 v_blade_origin;
varying vec3 v_position;

vec3 position_facing_camera() {
    // We wanna treat all pixels equal, regardless of height
    vec3 origin_relative_position = v_position - v_blade_origin;
    // We remove the z because we don't care about facing the camera height-wise either, it will look weird
    vec2 camera_dir_flat = normalize(cameraPosition - v_position).xy;

    // For the blade to look in the direction of the camera, the edges have to be
    // perpendicular to both the cam vector and the up vector
    // NOTE: This vector will always have z = 0 so we get xy
    vec2 new_dir = cross(vec3(camera_dir_flat, 0.0), UP).xy;

    // We keep the height from the original position, we care about rotation of the vertex
    vec3 new_origin_relative_position = vec3(length(origin_relative_position.xy) * new_dir, origin_relative_position.z);

    return new_origin_relative_position - origin_relative_position;
}


void main() {
    // The valleys should will brighter for a more natural effect
    vec3 shininess = SHININESS_COLOR * SHININESS_INTENSITY * v_influence_magnitude;
    vec3 diffuse = mix(u_colorBottom, u_colorTop, v_height);

    // TODO: Maybe base gradient based on length(position - blade origin) rather than height
    gl_FragColor = vec4(diffuse + shininess, min(HEIGHT_TRANSPARENCY_RELATION * v_height, 1.0));
}