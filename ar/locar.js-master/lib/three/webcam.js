import * as THREE from "three";

/** Class to setup the webcam. */
class Webcam {
  /**
   * Create a Webcam.
   * @param options {Object} - options to use for initialising the camera. 
   * Currently idealWidth and idealHeight properties are understood as well as 
   * onVideoStarted(), a *required* callback which runs when the camera has
   * been initialised. 
   * This takes a THREE.VideoTexture as an argument which can be used to set 
   * the background of your three.js scene within a callback.
   * @param {string} videoElementSelector - selector to obtain the HTML video 
   * element to render the webcam feed. If a falsy value (e.g. null or 
   * undefined), a video element will be created.
   */
 constructor(options={}, videoElementSelector) {
    this.sceneWebcam = new THREE.Scene();
    let video;
    if (!videoElementSelector) {
      video = document.createElement("video");
      video.setAttribute("autoplay", true);
      video.setAttribute("playsinline", true);
      video.style.display = "none";
      document.body.appendChild(video);
    } else {
      video = document.querySelector(videoElementSelector);
    }
    this.texture = new THREE.VideoTexture(video);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const constraints = {
        video: {
          width: { ideal: options.idealWidth || 1280 },
          height: { ideal: options.idealHeight || 720 },
          facingMode: "environment",
        },
      };
      navigator.mediaDevices.getUserMedia(constraints).then ( stream => {
        video.addEventListener('loadedmetadata', () => {
          video.setAttribute('width', video.videoWidth);
          video.setAttribute('height', video.videoHeight);
          video.play();
          options.onVideoStarted?.call(this, this.texture);
        });
        video.srcObject = stream;
      })
      .catch(e => {
        setTimeout(() => {
          alert(
            "Webcam Error\nName: " + e.name + "\nMessage: " + e.message
          );
        }, 1000)
      })
    } else {
      setTimeout(() => {
          alert("sorry - media devices API not supported");
        }, 1000);
    }
  }

  /**
   * Free up the memory associated with the webcam.
   * Should be called when your application closes.
   */
  dispose() {
    this.texture.dispose();
  }
}

export default Webcam;
