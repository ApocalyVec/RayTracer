# Simple Ray Tracer
## User inputs
* Use number 1~3 to switch between scenes.
    * 1 for Image 1
    * 2 for Image 2
    * 3 for Image 3
###Extra
* Use the Sphere shininess slider to change sphere and Sphere shininess.
* Use the Sphere shininess slider to change sphere and Sphere shininess.
* Use the reflection slider to change the number of reflections.
* Use the light source sliders to change the properties of the light source. 
Changeable properties: 
    * position (x, y, z)
        * Suggested light source position for scene 1: -20, 20, 20
        * Suggested light source position for scene 2: 0, 0, 175
        * Suggested light source position for scene 3: 0, 40, 40

    * intensity: requires soft shadow togggled on
    * radius: requires soft shadow togggled on
* Use the s key to toggle soft shadow
## Notes:
* light intensity and light radius only work in soft shadow mode.
* the white sphere, if visible, is the light source

## Structure:
The program implements WebGL in making a simple ray tracer. The ray traceing logic is handled in the fragment shader.

User inputs are handled by main.js and parsed into the fshader as uniform variables.

The reflect uses accumulated color to pick up and accumulate color values of intersected objects throughout
a given number of reflections.

The soft shadow takes an approximate approach. Where it checks the tangent with the light radius and center, offset by an random small angle.
With antialias, the resulting effect is pretty acceptable
## Limitation
The antialiasing for softshadow is 90 percent implemented. Current implementation has jagged soft shadow because it's missing
 antialiasing. As seen main.js, the ping-pong frame buffer reads and writes to two separate texture maps. In the way, the 
 last frame image is always perserved and can be further processed to remove alias. 
 
 In the fragment shader.main, the color is obtain by adding the last frame's color from the frame buffer to the main ray, which 
 is jittered at a random small angle to provide the antialiasing effect. 
in the ping-pong frame buffer.

