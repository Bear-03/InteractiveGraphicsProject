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
#define WIND_DENSITY 0.3
// How much wind influences the grass when there is also spatial influence
#define WIND_INFLUENCE_WHEN_SPATIAL_INFLUENCE 0.1

// How much spatial influence moves the blades
#define SPATIAL_INFLUENCE_STRENGTH 1.0
// How far spatial influence goes
#define SPATIAL_INFLUENCE_MAX_DISTANCE 1.2
// Max spatial objects to handle
#define MAX_SPATIALS 10

#define MAX_TURN_ANGLE PI / 2.0

struct Spatial {
    vec3 bottom;
    float radius;
};

struct Influence {
    vec3 blade_direction;
    vec3 displacement; // |blade_direction - UP|
};

attribute vec3 a_blade_origin;

uniform float u_time;
uniform Spatial u_spatials[MAX_SPATIALS];
uniform int u_spatials_len;

varying float v_height;
varying float v_influence_magnitude;
varying vec3 v_blade_origin;

float worley(vec2 position);
float map_range(float value, float in_min, float in_max, float out_min, float out_max);
bool equal_approx(vec2 a, vec2 b);
bool equal_approx(float a, float b);

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
Influence wind_influence(Influence influence) {
    // Wind should not be applied if the grass is suffering spatial influence
    // because grass that is "stepped on" does not move too much
    float wind_multiplier = 1.0;
    if (equal_approx(length(influence.displacement), 0.0)) {
        wind_multiplier = 1.0;
    } else {
        wind_multiplier = WIND_INFLUENCE_WHEN_SPATIAL_INFLUENCE / length(influence.displacement);
    }

    float angle = v_height * WIND_STRENGTH * worley(WIND_DENSITY * a_blade_origin.xy + WIND_SPEED * u_time * -WIND_DIRECTION);
    vec3 new_blade_direction = rotate_towards(UP, vec3(WIND_DIRECTION, 0), min(angle, MAX_TURN_ANGLE));
    vec3 blade_direction = normalize(influence.blade_direction + new_blade_direction);
    return Influence(blade_direction, blade_direction - UP);
}


Influence spatial_influence(Influence influence) {
    vec3 new_blade_direction = vec3(0.0);

    for (int i = 0; i < MAX_SPATIALS; i++) {
        if (i >= u_spatials_len) {
            break;
        }

        Spatial spatial = u_spatials[i];
        // Spatial position needs to have the y and z swapped because
        // of the change in coordinate system from threejs to webgl
        vec3 distance = position - spatial.bottom;
        vec2 influence_dir = distance.xy;

        // Cases go from furthest to closest
        float t = clamp(v_height * SPATIAL_INFLUENCE_STRENGTH * map_range(length(distance), spatial.radius, SPATIAL_INFLUENCE_MAX_DISTANCE, 1.0, 0.0), 0.0, 1.0);
        float angle = mix(0.0, MAX_TURN_ANGLE, t);

        new_blade_direction += rotate_towards(UP, vec3(influence_dir, 0.0), angle);
    }

    vec3 blade_direction = normalize(influence.blade_direction + new_blade_direction);
    return Influence(blade_direction, blade_direction - UP);
}

void main() {
    v_height = uv.y;
    v_blade_origin = a_blade_origin;

    // We could just add the offset to the vertex position
    // but that results in stretching

    Influence influence = Influence(UP, vec3(0.0)); // Start with no influence at all
    influence = spatial_influence(influence);
    influence = wind_influence(influence);
    v_influence_magnitude = length(influence.displacement);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position + influence.displacement, 1.0);
}
