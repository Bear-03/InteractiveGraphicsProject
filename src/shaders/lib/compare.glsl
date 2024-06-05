#define PRECISION 0.0001

bool is_eq_approx(vec3 a, vec3 b) {
    return length(a - b) <= PRECISION;
}

bool is_eq_approx(float a, float b) {
    return a - b <= PRECISION;
}