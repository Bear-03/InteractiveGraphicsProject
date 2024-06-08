// Based on: https://youtu.be/usdwhhZWIJ4?si=FhwX-wJgk24E05mo

#define M_PI 3.1415926535897932384626433832795
#define UP vec3(0, 0, 1)

// Max spatial objects to handle
#define MAX_SPATIALS 10
#define MAX_TURN_ANGLE M_PI / 2.0 - 0.2

struct Spatial {
    vec3 center;
    float radius;
};

attribute vec3 a_blade_origin;

// Multiplicator of the values outputted by the noise pattern,
// i.e. how much difference between hills and valleys of grass
uniform float u_wind_strength;
// How fast the noise pattern moves
uniform float u_wind_speed;
// In which direction the pattern moves
uniform vec2 u_wind_direction;
// How zoomed in the pattern is
uniform float u_wind_density;

// How much spatial influence moves the blades
uniform float u_spatial_strength;
// How far spatial influence goes
uniform float u_spatial_max_distance;


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
vec3 wind_influence(vec3 height) {
    float angle = u_wind_strength * worley(u_wind_density * a_blade_origin.xy + u_wind_speed * u_time * -u_wind_direction);
    return rotate_towards(height, vec3(u_wind_direction, 0), min(angle, MAX_TURN_ANGLE));
}

vec3 spatial_influence(vec3 height) {
    for (int i = 0; i < MAX_SPATIALS; i++) {
        if (i >= u_spatials_len) {
            break;
        }

        Spatial spatial = u_spatials[i];

        vec3 influence_dir = a_blade_origin - spatial.center;

        float t = clamp( //
        u_spatial_strength * map_range(length(influence_dir), spatial.radius, spatial.radius + u_spatial_max_distance, 1.0, 0.0), //
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
    vec3 height = vec3(0.0, 0.0, pow(position.z, 2.0));

    vec3 new_height = height;
    new_height = spatial_influence(new_height);
    new_height = wind_influence(new_height);
    v_displacement = length(new_height - height) / position.z;

    csm_Position = vec3(position.xy, 0.0) + new_height;
}
