#define PRECISION 0.0001

bool equal_approx(vec2 a, vec2 b) {
    return length(a - b) <= PRECISION;
}

bool equal_approx(vec3 a, vec3 b) {
    return length(a - b) <= PRECISION;
}

bool equal_approx(float a, float b) {
    return a - b <= PRECISION;
}