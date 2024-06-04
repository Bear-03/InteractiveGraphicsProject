// Based on: https://youtu.be/usdwhhZWIJ4?si=FhwX-wJgk24E05mo

uniform float u_time;

varying vec2 v_uv;

#define WIND_STRENGTH 1.0
#define WIND_SPEED 0.0001
#define WIND_DIRECTION normalize(vec2(-1.0, 1.0))
#define WIND_DENSITY 1.0

// Generates a random vector with components of range [0, 1) associated to a position
vec2 rand2(vec2 position) {
    // The magic numbers are just arbitrary to simulate pseudorandomness

    return fract(sin(vec2( //
    dot(position, vec2(127.32, 231.4)), //
    dot(position, vec2(12.3, 146.3)) //
    )) * 231.23);
}

// Generates a noise value for a given position
float worley(vec2 position) {
    float min_dist = 1.0; // Start as max possible dist

    vec2 this_cell = floor(position); // Position of cell to which position belongs
    vec2 this_pos_in_cell = fract(position); // Position within the cell [0, 1]

    // Check adjacent cells and this ones (3x3 grid)
    for (int x = -1; x <= 1; x++) {
        for (int y = -1; y <= 1; y++) {
            vec2 checking_cell = vec2(x, y); // Relative to this_cell
            float dist_to_position = length(checking_cell + rand2(this_cell + checking_cell) - this_pos_in_cell);
            min_dist = min(min_dist, dist_to_position);
        }
    }

    return min_dist;
}

/*void main() {
    gl_FragColor = vec4(WIND_STRENGTH * vec3(worley(WIND_DENSITY * v_uv + WIND_SPEED * u_time * WIND_DIRECTION)), 1.0);
}*/

void main() {
    v_uv = position.xz;

    vec3 offset = WIND_STRENGTH * v_uv.y * worley(WIND_DENSITY * v_uv + WIND_SPEED * u_time * WIND_DIRECTION) * vec3(-WIND_DIRECTION, 0.0);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position + offset, 1.0);
}
