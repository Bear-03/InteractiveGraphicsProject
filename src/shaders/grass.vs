// Based on: https://youtu.be/usdwhhZWIJ4?si=FhwX-wJgk24E05mo

#define PI 3.1415926535897932384626433832795
#define UP vec3(0, 0, 1)

// Multiplicator of the values outputted by the noise pattern,
// i.e. how much difference between hills and valleys of grass
#define WIND_STRENGTH 4.0
// How fast the noise pattern moves
#define WIND_SPEED 0.5
 // In which direction the pattern moves
#define WIND_DIRECTION normalize(vec2(-1.0, 1.0))
// How zoomed in the pattern is
#define WIND_DENSITY 0.5

uniform float u_time;

varying float v_height;

float worley(vec2 position);

// Source: https://math.stackexchange.com/a/4306149
vec3 rotate_towards(vec3 vec, vec3 target, float angle) {
    vec3 normalized_this = normalize(vec);
    vec3 normalized_target = normalize(target);
    float new_angle = acos(dot(normalized_this, normalized_target)) - angle;

    // Unit vector in the plane of this and target and perpendicular to target
    vec3 perp = cross(normalize(cross(normalized_target, normalized_this)), normalized_target);

    return length(vec) * (cos(new_angle) * normalized_target + sin(new_angle) * perp);
}

void main() {
    v_height = position.z;

    float offset_angle = v_height * WIND_STRENGTH * worley(WIND_DENSITY * position.xy + WIND_SPEED * u_time * WIND_DIRECTION);
    // We could just add the offset to the vertex position
    // but that results in stretching
    // old_pos = vec3(0, 0, v_height)
    vec3 offset_vec = rotate_towards(vec3(0, 0, v_height), vec3(WIND_DIRECTION, 0), offset_angle);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position + offset_vec, 1.0);
}
