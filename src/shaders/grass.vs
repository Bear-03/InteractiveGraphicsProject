// Based on: https://youtu.be/usdwhhZWIJ4?si=FhwX-wJgk24E05mo

#define PI 3.1415926535897932384626433832795
#define UP vec3(0, 0, 1)

// Multiplicator of the values outputted by the noise pattern,
// i.e. how much difference between hills and valleys of grass
#define WIND_STRENGTH 1.0
// How fast the noise pattern moves
#define WIND_SPEED 0.5
 // In which direction the pattern moves
#define WIND_DIRECTION normalize(vec2(1.0, 1.0))
// How zoomed in the pattern is
#define WIND_DENSITY 0.2

// How much spatial influence moves the blades
#define SPATIAL_INFLUENCE_STRENGTH 0.7
// How far spatial influence goes
#define SPATIAL_INFLUENCE_MAX_DISTANCE 1.0
// Max spatial objects to handle
#define MAX_SPATIALS 10

#define MAX_TURN_ANGLE PI / 2.0

struct Spatial {
    vec3 center;
    float radius;
};

attribute vec3 a_blade_origin;

uniform float u_time;
uniform Spatial u_spatials[MAX_SPATIALS];
uniform int u_spatials_len;

varying float v_displacement;
varying vec2 v_uv;
varying vec3 v_blade_origin;

float worley(vec2 position);
float map_range(float value, float in_min, float in_max, float out_min, float out_max);
bool equal_approx(float a, float b);

float angle_between(vec3 a, vec3 b) {
    return acos(dot(a, b) / (length(a) * length(b)));
}

// Source: https://math.stackexchange.com/a/4306149
vec3 rotate_towards(vec3 vec, vec3 target, float angle) {
    vec3 normalized_this = normalize(vec);
    vec3 normalized_target = normalize(target);
    float new_angle = angle_between(vec, target) - angle;

    // Unit vector in the plane of this and target and perpendicular to target
    vec3 perp = cross(normalize(cross(normalized_target, normalized_this)), normalized_target);

    return length(vec) * (cos(new_angle) * normalized_target + sin(new_angle) * perp);
}

// Returns the direction and amount the vertex should move because of wind
vec3 wind_influence(vec3 height, vec3 original_height) {
    float angle = WIND_STRENGTH * worley(WIND_DENSITY * a_blade_origin.xy + WIND_SPEED * u_time * -WIND_DIRECTION);
    return rotate_towards(height, vec3(WIND_DIRECTION, 0), angle);
}

vec3 spatial_influence(vec3 height) {
    for (int i = 0; i < MAX_SPATIALS; i++) {
        if (i >= u_spatials_len) {
            break;
        }

        Spatial spatial = u_spatials[i];

        vec3 influence_dir = a_blade_origin - spatial.center;

        float t = clamp( //
        SPATIAL_INFLUENCE_STRENGTH * map_range(length(influence_dir), spatial.radius, spatial.radius + SPATIAL_INFLUENCE_MAX_DISTANCE, 1.0, 0.0), //
        0.0, //
        1.0 //
        );
        float angle = mix(0.0, MAX_TURN_ANGLE, t);

        height = rotate_towards(height, influence_dir, angle);
    }

    return height;
}

void main() {
    v_uv = uv;
    v_blade_origin = a_blade_origin;

    // We could just add the offset to the vertex position
    // but that results in stretching
    vec3 height = vec3(0.0, 0.0, position.z);

    vec3 new_height = height;
    new_height = spatial_influence(new_height);
    new_height = wind_influence(new_height, height);
    v_displacement = length(new_height - height);

    vec3 new_pos = vec3(position.xy, 0.0) + new_height;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(new_pos, 1.0);
}
