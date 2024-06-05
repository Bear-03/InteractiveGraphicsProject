// Based on: https://youtu.be/usdwhhZWIJ4?si=FhwX-wJgk24E05mo

#define PI 3.1415926535897932384626433832795
#define UP vec3(0, 0, 1)

// Multiplicator of the values outputted by the noise pattern,
// i.e. how much difference between hills and valleys of grass
#define WIND_STRENGTH 2.0
// How fast the noise pattern moves
#define WIND_SPEED 0.5
 // In which direction the pattern moves
#define WIND_DIRECTION normalize(vec2(1.0, 1.0))
// How zoomed in the pattern is
#define WIND_DENSITY 0.3

#define SPATIAL_INFLUENCE_STRENGTH 1.0
#define MAX_SPATIAL_INFLUENCE_DISTANCE 1.2
#define MAX_SPATIAL_INFLUENCE_ANGLE PI / 2.0
#define MAX_SPATIALS 10

struct Spatial {
    vec3 position;
    float radius;
};

uniform float u_time;
uniform Spatial u_spatials[MAX_SPATIALS];
uniform int u_spatials_len;

varying float v_height;
varying float v_influence_magnitude;

float worley(vec2 position);
float map_range(float value, float in_min, float in_max, float out_min, float out_max);

// Source: https://math.stackexchange.com/a/4306149
vec3 rotate_towards(vec3 vec, vec3 target, float angle) {
    vec3 normalized_this = normalize(vec);
    vec3 normalized_target = normalize(target);
    float new_angle = acos(dot(normalized_this, normalized_target)) - angle;

    // Unit vector in the plane of this and target and perpendicular to target
    vec3 perp = cross(normalize(cross(normalized_target, normalized_this)), normalized_target);

    return length(vec) * (cos(new_angle) * normalized_target + sin(new_angle) * perp);
}

// Returns the direction and amount the vertex should move because of wind
vec3 calculate_wind_influence() {
    float influence_angle = v_height * WIND_STRENGTH * worley(WIND_DENSITY * position.xy + WIND_SPEED * u_time * -WIND_DIRECTION);
    vec3 rotated = rotate_towards(UP, vec3(WIND_DIRECTION, 0), min(influence_angle, PI / 2.0));
    return rotated - UP;
}

vec3 calculate_spatial_influence() {
    vec3 influence = vec3(0.0);

    for (int i = 0; i < MAX_SPATIALS; i++) {
        if (i >= u_spatials_len) {
            break;
        }

        Spatial spatial = u_spatials[i];
        // Spatial position needs to have the y and z swapped because
        // of the change in coordinate system from threejs to webgl
        vec3 distance = position - spatial.position.xzy;
        vec2 influence_dir = distance.xy;

        float angle;
        // Cases go from furthest to closest
        float t = clamp(map_range(length(distance), spatial.radius, MAX_SPATIAL_INFLUENCE_DISTANCE, 1.0, 0.0), 0.0, 1.0);
        angle = smoothstep(0.0, MAX_SPATIAL_INFLUENCE_ANGLE, t);

        vec3 rotated = rotate_towards(UP, vec3(influence_dir, 0.0), angle);
        influence += rotated - UP;
    }

    return SPATIAL_INFLUENCE_STRENGTH * influence;
}

void main() {
    v_height = position.z;

    // We could just add the offset to the vertex position
    // but that results in stretching

    // Offset angles
    vec3 influence;
    influence += calculate_wind_influence();
    influence += calculate_spatial_influence();
    influence *= v_height;

    v_influence_magnitude = length(influence);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position + influence, 1.0);
}
