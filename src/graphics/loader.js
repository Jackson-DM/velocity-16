/**
 * Sprite Loader for Velocity-16
 * Implements the ChatGPT 32x32 Hard SNES Spec
 */

export async function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    });
}

/**
 * Loads a horizontal sprite strip and splits it into individual frames.
 * Spec: 32x32 per frame, 9 frames total.
 */
export async function loadCarSprite(url) {
    const img = await loadImage(url);
    const frameW = 32;
    const frameH = 32;
    const count = 9;
    const frames = [];

    for (let i = 0; i < count; i++) {
        const canvas = document.createElement('canvas');
        canvas.width = frameW;
        canvas.height = frameH;
        const ctx = canvas.getContext('2d');
        
        // Disable image smoothing for that crisp SNK/SNES look
        ctx.imageSmoothingEnabled = false;

        ctx.drawImage(
            img,
            i * frameW, 0, frameW, frameH, // Source
            0, 0, frameW, frameH            // Destination
        );
        frames.push(canvas);
    }

    return { 
        frames, 
        frameW, 
        frameH, 
        count,
        pivotX: 16,
        pivotY: 28 // Anchored to the track as per spec
    };
}
