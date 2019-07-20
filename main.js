
let program;
let sceneNum;

let canvas;

let sphereShininessSlider;
let planeShininessSlider;
let numBouncesSlider;
let lightIntensitySlider;
let lightRadiusSlider;

let lightXSlider;
let lightYSlider;
let lightZSlider;

let time0;

let gl;
let aPositionLocation;
let texcoordLocation;
let textureLocation;
let positionBuffer;

let texcoordBuffer;
let fb1; //framebuffer
let fb2;

let targetTexture1;
let targetTexture2;

let isSoftShadow;

function main()
{
    activeFb = 1;
    isSoftShadow = 0.0;

    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');
    sphereShininessSlider = document.getElementById('sphereShininessSlider');
    planeShininessSlider = document.getElementById('planeShininessSlider');
    numBouncesSlider = document.getElementById('numBouncesSlider');

    lightXSlider = document.getElementById('lightXSlider');
    lightYSlider = document.getElementById('lightYSlider');
    lightZSlider = document.getElementById('lightZSlider');


    lightIntensitySlider = document.getElementById('lightIntensitySlider');
    lightRadiusSlider = document.getElementById('lightRadiusSlider');

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

    // bind buffers
    aPositionLocation = gl.getAttribLocation(program, "aPosition");
    texcoordLocation = gl.getAttribLocation(program, "a_texcoord");
    textureLocation = gl.getUniformLocation(program, "u_texture");

    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            -1,1,0,
            1,1,0,
            -1,-1,0,
            1,-1,0]),
        gl.STATIC_DRAW
    );

    // create the first texture to render to
    {
        targetTexture1 = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, targetTexture1);

        // define the texture image to which we render the canvas
        const level = 0;
        const internalFormat = gl.RGBA;
        const border = 0;
        const format = gl.RGBA;
        // const type = gl.UNSIGNED_BYTE;
        const data = null;
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
            canvas.width, canvas.height, border,
            format, gl.UNSIGNED_BYTE, data);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }

    // create the second texture to render to
    {
        targetTexture2 = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, targetTexture2);

        // define the texture image to which we render the canvas
        const level = 0;
        const internalFormat = gl.RGBA;
        const border = 0;
        const format = gl.RGBA;
        // const type = gl.UNSIGNED_BYTE;
        const data = null;
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
            canvas.width, canvas.height, border,
            format, gl.UNSIGNED_BYTE, data);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }


    // Create and bind the first framebuffer
    {    fb1 = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb1);
        // attach the texture as the first color attachment
        const attachmentPoint = gl.COLOR_ATTACHMENT0;
        const level = 0;
        gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, targetTexture1, level); // buffer frame to the targetTexture1 we just created
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
            console.log('Buffer Incomplete!');
            throw('Buffer Incomplete!');
        }
    }

    // Create and bind the second framebuffer
    {    fb2 = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb2);
        // attach the texture as the first color attachment
        const attachmentPoint = gl.COLOR_ATTACHMENT0;
        const level = 0;
        gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, targetTexture2, level); // buffer frame to the targetTexture1 we just created
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
            console.log('Buffer Incomplete!');
            throw('Buffer Incomplete!');
        }
    }


    // user inputs
    sceneNum = 3.0;
    gl.uniform1f(gl.getUniformLocation(program, "sceneNum"), sceneNum);

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
        if (e.key === 's') {
            if (isSoftShadow === 1.0) {
                isSoftShadow = 0.0;
            }
            else{
                isSoftShadow = 1.0;
            }
        }
    });

    // gl.enable(gl.SAMPLE_COVERAGE);
    // gl.sampleCoverage(0.5, false);

    time0 = (new Date()).getTime() / 1000;
    gl.uniform1i(textureLocation, 0);


////////////////////////////////
    {
        gl.useProgram(program);

        // deal with the position buffer
        gl.enableVertexAttribArray(aPositionLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        {
            let size = 3;          // 3 components per iteration
            let type = gl.FLOAT;   // the data is 32bit floats
            let normalize = false; // don't normalize the data
            let stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
            let offset = 0;        // start at the beginning of the buffer
            gl.vertexAttribPointer(
                aPositionLocation, size, type, normalize, stride, offset);
        }

        gl.uniform1i(textureLocation, 0);

    }

    ////////////////////////////////




    requestAnimationFrame(drawScene);
}

let lastSceneNum = 0.0;

function drawScene() {
    {
        // process user inputs
        gl.uniform1f(gl.getUniformLocation(program, "sceneNum"), sceneNum);
        gl.uTime = gl.getUniformLocation(program, "uTime");
        gl.uniform1f(gl.uTime, (new Date()).getTime() / 1000 - time0);
        gl.uniform1f(gl.getUniformLocation(program, "f_isSoftShadow"), isSoftShadow);

        gl.uniform1f(gl.getUniformLocation(program, "vSphereShininess"), parseFloat(sphereShininessSlider.value));
        gl.uniform1f(gl.getUniformLocation(program, "vPlaneShininess"), parseFloat(planeShininessSlider.value));
        gl.uniform1f(gl.getUniformLocation(program, "vNumBounces"), parseFloat(numBouncesSlider.value));

        if (sceneNum != lastSceneNum) {
            if (sceneNum === 1.0) {
                console.log('Scene Just changed, resetting light position');

                lightXSlider.value = toString(-2.0 * 100);
                lightYSlider.value = toString(2.0 * 100);
                lightZSlider.value = toString(2.0 * 100);
            }
            else if (sceneNum === 2.0) {
                console.log('Scene Just changed, resetting light position');

                lightXSlider.value = toString(0.0 * 100);
                lightYSlider.value = toString(0.0 * 100);
                lightZSlider.value = toString(1.75 * 100);
                // light[0].position = vec3(0.0, 0.0, 1.75);

            }
            else if (sceneNum === 3.0) {
                console.log('Scene Just changed, resetting light position');

                lightXSlider.value = toString(0.0 * 100);
                lightYSlider.value = toString(40);
                lightZSlider.value = toString(.4 * 100);
                // light[0].position = vec3(0.0, .4, 0.4);
            }
            console.log( lightXSlider.value);
            console.log( lightYSlider.value);
            console.log( lightZSlider.value);
        }

        gl.uniform1f(gl.getUniformLocation(program, "f_lightX"), parseFloat(lightXSlider.value)/100.0);
        gl.uniform1f(gl.getUniformLocation(program, "f_lightY"), parseFloat(lightYSlider.value)/100.0);
        gl.uniform1f(gl.getUniformLocation(program, "f_lightZ"), parseFloat(lightZSlider.value)/100.0);

        gl.uniform1f(gl.getUniformLocation(program, "f_lightIntensity"), parseFloat(lightIntensitySlider.value));
        gl.uniform1f(gl.getUniformLocation(program, "f_lightRadius"), parseFloat(lightRadiusSlider.value)/1000.0);

    }
    {
        gl.useProgram(program);

        // render to our targetTexture1 by binding the framebuffer
        // ping-pong buffer
        if (activeFb === 1) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, fb1);
        }
        else if(activeFb === 2) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, fb2);
        }
        else {
            throw ('Wrong active buffer, this should never happen')
        }
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, canvas.width, canvas.height);
        // clear the color buffer
        gl.clearColor(0, 0, 0, 1);
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    {
        gl.useProgram(program);

        //render to the canvas
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        if (activeFb === 1) {
            gl.bindTexture(gl.TEXTURE_2D, targetTexture2);
            activeFb = 2;
        }
        else if(activeFb === 2) {
            gl.bindTexture(gl.TEXTURE_2D, targetTexture1);
            activeFb = 2;
        }
        else {
            throw ('Wrong active buffer, this should never happen')
        }

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.clearColor(0, 0, 0, 1);
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        // draw();
    }

    lastSceneNum = sceneNum;
    requestAnimationFrame(drawScene);

}

// function render() {
//
//
//     gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
//
//     gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
//     requestAnimationFrame(render);
// }

