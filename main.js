// TODO extra: dynamically change the number of bounces
// TODO extra: implement animation

let program;
let sceneNum;

let sphereShininessSlider;
let planeShininessSlider;
let numBouncesSlider;

function main()
{
    // Retrieve <canvas> element
    let canvas = document.getElementById('webgl');
    sphereShininessSlider = document.getElementById('sphereShininessSlider');
    planeShininessSlider = document.getElementById('planeShininessSlider');
    numBouncesSlider = document.getElementById('numBouncesSlider');

    // Get the rendering context for WebGL
    gl = WebGLUtils.setupWebGL(canvas, undefined);
    if (!gl)
    {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    program = initShaders(gl, "vshader", "fshader");
    gl.useProgram(program);

    gl.viewport( 0, 0, canvas.width, canvas.height );

    // Set clear color
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let buffer = gl.createBuffer();


    // Create a square as a strip of two triangles.
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            -1,1,
            0,1,
            1,0,
            -1,-1,
            0,1,
            -1,0]),
        gl.STATIC_DRAW
    );

    gl.aPosition = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(gl.aPosition);
    gl.vertexAttribPointer(gl.aPosition, 3, gl.FLOAT, false, 0, 0);

    // user inputs
    sceneNum = 3.0;

    gl.uniform1f(gl.getUniformLocation(program, "sceneNum"), sceneNum);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    window.addEventListener("keypress", function(e) {
        if (e.key === '1') {
            sceneNum = 1.0;
        }
        if (e.key === '2') {
            sceneNum = 2.0;

        }
        if (e.key === '3') {
            sceneNum = 3.0;
        }
    });

    render();
}

function render() {
    // process user inputs
    gl.uniform1f(gl.getUniformLocation(program, "sceneNum"), sceneNum);

    gl.uniform1f(gl.getUniformLocation(program, "vSphereShininess"), parseFloat(sphereShininessSlider.value));
    gl.uniform1f(gl.getUniformLocation(program, "vPlaneShininess"), parseFloat(planeShininessSlider.value));

    gl.uniform1f(gl.getUniformLocation(program, "vNumBounces"), parseFloat(numBouncesSlider.value));


    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
}