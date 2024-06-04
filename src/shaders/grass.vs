// Based on: https://youtu.be/usdwhhZWIJ4?si=FhwX-wJgk24E05mo

uniform float u_time;

varying float v_height;

#define WIND_STRENGTH 1.0 // Multiplicator of the values outputted by the noise pattern
#define WIND_SPEED 1.0 // How fast the noise pattern moves
#define WIND_DIRECTION normalize(vec2(-1.0, 1.0)) // In which direction the pattern moves
#define WIND_DENSITY 0.5 // How zoomed the pattern is

float worley(vec2 position);

void main() {
    v_height = position.z;

    float noise = WIND_STRENGTH * worley(WIND_DENSITY * position.xy + WIND_SPEED * u_time * WIND_DIRECTION);
    vec3 offset = position.z * noise * vec3(-WIND_DIRECTION, 0.0);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position + offset, 1.0);
}
