// Generates a random vector with components in range [0, 1) associated to a seed value 
vec2 rand(vec2 seed) {
    // The magic numbers are just arbitrary to simulate pseudorandomness
    return fract(sin(vec2( //
    dot(seed, vec2(127.32, 231.4)), //
    dot(seed, vec2(12.3, 146.3)) //
    )) * 231.23);
}

// Generates a noise value [0, 1] for a given position
float worley(vec2 position) {
    float min_dist = 1.0; // Start as max possible dist

    vec2 this_cell = floor(position); // Position of cell to which position belongs
    vec2 this_pos_in_cell = fract(position); // Position within the cell [0, 1]

    // Check adjacent cells and this ones (3x3 grid)
    for (int x = -1; x <= 1; x++) {
        for (int y = -1; y <= 1; y++) {
            vec2 checking_cell = vec2(x, y); // Relative to this_cell
            float dist_to_position = length(checking_cell + rand(this_cell + checking_cell) - this_pos_in_cell);
            min_dist = min(min_dist, dist_to_position);
        }
    }

    return min_dist;
}