export var Shaders;
(function (Shaders) {
    Shaders.circleShader = `
        float ringWidth = 0.45;
        vec3 outerColor = vec3(1.0,1.0,0.7);
        uniform vec4 innerColor;

        varying vec2 vTextureCoord; //The coordinates of the current pixel
        uniform sampler2D uSampler; //The image data
        uniform vec2 resolution; // Screen res.

        vec4 outline(float width, vec2 tc, vec3 outerColor, vec4 innerColor) {
            vec4 t = innerColor;
            tc -= 0.5;
            // tc.x *= resolution.x / resolution.y;

            float grad = length(tc);
            float circle = smoothstep(0.5, 0.49, grad);
            float ring = circle - smoothstep(width, width-0.005, grad);

            t = (t * (circle - ring));
            t.rgb += (ring * outerColor);

            return t;
        }

        void main( )
        {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);

            return;

            vec2 uv = vTextureCoord;

            vec4 t = outline(ringWidth, uv, outerColor, innerColor);

            gl_FragColor = t;
        }
    `;
})(Shaders || (Shaders = {}));
