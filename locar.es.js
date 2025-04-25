var W = (a) => {
  throw TypeError(a);
};
var S = (a, t, e) => t.has(a) || W("Cannot " + e);
var n = (a, t, e) => (S(a, t, "read from private field"), e ? e.call(a) : t.get(a)), m = (a, t, e) => t.has(a) ? W("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(a) : t.set(a, e), u = (a, t, e, i) => (S(a, t, "write to private field"), i ? i.call(a, e) : t.set(a, e), e), p = (a, t, e) => (S(a, t, "access private method"), e);
var q = (a, t, e, i) => ({
  set _(r) {
    u(a, t, r, e);
  },
  get _() {
    return n(a, t, i);
  }
});
import * as b from "three";
import { Vector3 as Z, Euler as N, Quaternion as _, EventDispatcher as B, MathUtils as C } from "three";
var E, U, G, X, Q;
class K {
  /**
   * Create a SphMercProjection.
   */
  constructor() {
    m(this, E);
    this.EARTH = 4007501668e-2, this.HALF_EARTH = 2003750834e-2;
  }
  /**
   * Project a longitude and latitude into Spherical Mercator.
   * @param {number} lon - the longitude.
   * @param {number} lat - the latitude.
   * @return {Array} Two-member array containing easting and northing.
   */
  project(t, e) {
    return [p(this, E, U).call(this, t), p(this, E, G).call(this, e)];
  }
  /**
   * Unproject a Spherical Mercator easting and northing.
   * @param {Array} projected - Two-member array containing easting and northing
   * @return {Array} Two-member array containing longitude and latitude 
   */
  unproject(t) {
    return [p(this, E, X).call(this, t[0]), p(this, E, Q).call(this, t[1])];
  }
  /**
   * Return the projection's ID.
   * @return {string} The value "epsg:3857".
   */
  getID() {
    return "epsg:3857";
  }
}
E = new WeakSet(), U = function(t) {
  return t / 180 * this.HALF_EARTH;
}, G = function(t) {
  var e = Math.log(Math.tan((90 + t) * Math.PI / 360)) / (Math.PI / 180);
  return e * this.HALF_EARTH / 180;
}, X = function(t) {
  return t / this.HALF_EARTH * 180;
}, Q = function(t) {
  var e = t / this.HALF_EARTH * 180;
  return e = 180 / Math.PI * (2 * Math.atan(Math.exp(e * Math.PI / 180)) - Math.PI / 2), e;
};
var I, O, P, x, H, A, y, D, T, M, f, F, V, j, Y;
class st {
  /**
   * @param {THREE.Scene} scene - The Three.js scene to use.
   * @param {THREE.Camera} camera - The Three.js camera to use. Should usually 
   * be a THREE.PerspectiveCamera.
   * @param {Object} options - Initialisation options for the GPS; see
   * setGpsOptions() below.
   * @param {Object} serverLogger - an object which can optionally log GPS position to a server for debugging. null by default, so no logging will be done. This object should implement a sendData() method to send data (2nd arg) to a given endpoint (1st arg). Please see source code for details. Ensure you comply with privacy laws (GDPR or equivalent) if implementing this.
   */
  constructor(t, e, i = {}, r = null) {
    m(this, f);
    m(this, I);
    m(this, O);
    m(this, P);
    m(this, x);
    m(this, H);
    m(this, A);
    m(this, y);
    m(this, D);
    m(this, T);
    m(this, M);
    this.scene = t, this.camera = e, u(this, I, new K()), u(this, O, {}), u(this, P, null), u(this, x, 0), u(this, H, 100), u(this, A, null), this.setGpsOptions(i), u(this, y, null), u(this, D, 0), u(this, T, 0), u(this, M, r);
  }
  /**
   * Set the projection to use.
   * @param {Object} any object which includes a project() method 
   * taking longitude and latitude as arguments and returning an array 
   * containing easting and northing.
   */
  setProjection(t) {
    u(this, I, t);
  }
  /**
   * Set the GPS options.
   * @param {Object} object containing gpsMinDistance and/or gpsMinAccuracy
   * properties. The former specifies the number of metres which the device
   * must move to process a new GPS reading, and the latter specifies the 
   * minimum accuracy, in metres, for a GPS reading to be counted.
   */
  setGpsOptions(t = {}) {
    t.gpsMinDistance !== void 0 && u(this, x, t.gpsMinDistance), t.gpsMinAccuracy !== void 0 && u(this, H, t.gpsMinAccuracy);
  }
  /**
   * Start the GPS on a real device
   * @return {boolean} code indicating whether the GPS was started successfully.
   * GPS errors can be handled by handling the gpserror event.
   */
  async startGps() {
    if (n(this, M)) {
      const e = await (await n(this, M).sendData("/gps/start", {
        gpsMinDistance: n(this, x),
        gpsMinAccuracy: n(this, H)
      })).json();
      u(this, T, e.session);
    }
    return n(this, A) === null ? (u(this, A, navigator.geolocation.watchPosition(
      (t) => {
        p(this, f, j).call(this, t);
      },
      (t) => {
        n(this, O).gpserror ? n(this, O).gpserror(t.code) : alert(`GPS error: code ${t.code}`);
      },
      {
        enableHighAccuracy: !0
      }
    )), !0) : !1;
  }
  /**
   * Stop the GPS on a real device
   * @return {boolean} true if the GPS was stopped, false if it could not be
   * stopped (i.e. it was never started).
   */
  stopGps() {
    return n(this, A) !== null ? (navigator.geolocation.clearWatch(n(this, A)), u(this, A, null), !0) : !1;
  }
  /**
   * Send a fake GPS signal. Useful for testing on a desktop or laptop.
   * @param {number} lon - The longitude.
   * @param {number} lat - The latitude.
   * @param {number} elev - The elevation in metres. (optional, set to null
   * for no elevation).
   * @param {number} acc - The accuracy of the GPS reading in metres. May be
   * ignored if lower than the specified minimum accuracy.
   */
  fakeGps(t, e, i = null, r = 0) {
    i !== null && this.setElevation(i), p(this, f, j).call(this, {
      coords: {
        longitude: t,
        latitude: e,
        accuracy: r
      }
    });
  }
  /**
   * Convert longitude and latitude to three.js/WebGL world coordinates.
   * Uses the specified projection, and negates the northing (in typical
   * projections, northings increase northwards, but in the WebGL coordinate
   * system, we face negative z if the camera is at the origin with default
   * rotation).
   * @param {number} lon - The longitude.
   * @param {number} lat - The latitude.
   * @return {Array} a two member array containing the WebGL x and z coordinates
   */
  lonLatToWorldCoords(t, e) {
    const i = n(this, I).project(t, e);
    if (n(this, y))
      i[0] -= n(this, y)[0], i[1] -= n(this, y)[1];
    else
      throw "No initial position determined";
    return [i[0], -i[1]];
  }
  /**
   * Add a new AR object at a given latitude, longitude and elevation.
   * @param {THREE.Mesh} object the object
   * @param {number} lon - the longitude.
   * @param {number} lat - the latitude.
   * @param {number} elev - the elevation in metres 
   * (if not specified, 0 is assigned)
   * @param {Object} properties - properties describing the object (for example,
   * the contents of the GeoJSON properties field).
   */
  add(t, e, i, r, h = {}) {
    var g;
    t.properties = h, p(this, f, F).call(this, t, e, i, r), this.scene.add(t), (g = n(this, M)) == null || g.sendData("/object/new", {
      position: t.position,
      x: t.position.x,
      z: t.position.z,
      session: n(this, T),
      properties: h
    });
  }
  /**
   * Set the elevation (y coordinate) of the camera.
   * @param {number} elev - the elevation in metres.
   */
  setElevation(t) {
    this.camera.position.y = t;
  }
  /**
   * Add an event handler.
   * Currently-understood events: "gpsupdate" and "gpserror".
   * The former fires when a GPS update is received, and is passed the
   * standard Geolocation API position object, along with the distance moved
   * since the last GPS update in metres.
   * The latter fires when a GPS error is generated, and is passed the
   * standard Geolocation API numerical error code.
   * @param {string} eventName - the event to handle.
   * @param {Function} eventHandler - the event handler function.
   * @listens LocationBased#gpsupdate
   * @listens LocationBased#gpserror
   */
  on(t, e) {
    n(this, O)[t] = e;
  }
}
I = new WeakMap(), O = new WeakMap(), P = new WeakMap(), x = new WeakMap(), H = new WeakMap(), A = new WeakMap(), y = new WeakMap(), D = new WeakMap(), T = new WeakMap(), M = new WeakMap(), f = new WeakSet(), F = function(t, e, i, r) {
  const h = this.lonLatToWorldCoords(e, i);
  r !== void 0 && (t.position.y = r), [t.position.x, t.position.z] = h;
}, V = function(t, e) {
  u(this, y, n(this, I).project(t, e));
}, j = function(t) {
  var i, r, h;
  let e = Number.MAX_VALUE;
  q(this, D)._++, (i = n(this, M)) == null || i.sendData("/gps/new", {
    gpsCount: n(this, D),
    lat: t.coords.latitude,
    lon: t.coords.longitude,
    acc: t.coords.accuracy,
    session: n(this, T)
  }), t.coords.accuracy <= n(this, H) && (n(this, P) === null ? u(this, P, {
    latitude: t.coords.latitude,
    longitude: t.coords.longitude
  }) : e = p(this, f, Y).call(this, n(this, P), t.coords), e >= n(this, x) && (n(this, P).longitude = t.coords.longitude, n(this, P).latitude = t.coords.latitude, n(this, y) || (p(this, f, V).call(this, t.coords.longitude, t.coords.latitude), (r = n(this, M)) == null || r.sendData("/worldorigin/new", {
    gpsCount: n(this, D),
    lat: t.coords.latitude,
    lon: t.coords.longitude,
    session: n(this, T),
    initialPosition: n(this, y)
  })), p(this, f, F).call(this, this.camera, t.coords.longitude, t.coords.latitude), (h = n(this, M)) == null || h.sendData("/gps/accepted", {
    gpsCount: n(this, D),
    cameraX: this.camera.position.x,
    cameraZ: this.camera.position.z,
    session: n(this, T),
    distMoved: e
  }), n(this, O).gpsupdate && n(this, O).gpsupdate(t, e)));
}, /**
 * Calculate haversine distance between two lat/lon pairs.
 *
 * Taken from original A-Frame AR.js location-based components
 */
Y = function(t, e) {
  const i = b.MathUtils.degToRad(e.longitude - t.longitude), r = b.MathUtils.degToRad(e.latitude - t.latitude), h = Math.sin(r / 2) * Math.sin(r / 2) + Math.cos(b.MathUtils.degToRad(t.latitude)) * Math.cos(b.MathUtils.degToRad(e.latitude)) * (Math.sin(i / 2) * Math.sin(i / 2));
  return 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)) * 6371e3;
};
class ot {
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
  constructor(t = {}, e) {
    this.sceneWebcam = new b.Scene();
    let i;
    if (e ? i = document.querySelector(e) : (i = document.createElement("video"), i.setAttribute("autoplay", !0), i.setAttribute("playsinline", !0), i.style.display = "none", document.body.appendChild(i)), this.texture = new b.VideoTexture(i), navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const r = {
        video: {
          width: { ideal: t.idealWidth || 1280 },
          height: { ideal: t.idealHeight || 720 },
          facingMode: "environment"
        }
      };
      navigator.mediaDevices.getUserMedia(r).then((h) => {
        i.addEventListener("loadedmetadata", () => {
          var g;
          i.setAttribute("width", i.videoWidth), i.setAttribute("height", i.videoHeight), i.play(), (g = t.onVideoStarted) == null || g.call(this, this.texture);
        }), i.srcObject = h;
      }).catch((h) => {
        setTimeout(() => {
          alert(
            `Webcam Error
Name: ` + h.name + `
Message: ` + h.message
          );
        }, 1e3);
      });
    } else
      setTimeout(() => {
        alert("sorry - media devices API not supported");
      }, 1e3);
  }
  /**
   * Free up the memory associated with the webcam.
   * Should be called when your application closes.
   */
  dispose() {
    this.texture.dispose();
  }
}
const k = navigator.userAgent.match(/iPhone|iPad|iPod/i) || /Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints != null && navigator.maxTouchPoints > 1, $ = new Z(0, 0, 1), z = new N(), J = new _(), tt = new _(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)), et = { type: "change" };
class at extends B {
  /**
   * Create an instance of DeviceOrientationControls.
   * @param {Object} object - the object to attach the controls to
   * (usually your Three.js camera)
   */
  constructor(t) {
    super(), window.isSecureContext === !1 && console.error(
      "THREE.DeviceOrientationControls: DeviceOrientationEvent is only available in secure contexts (https)"
    );
    const e = this, i = 1e-6, r = new _();
    this.object = t, this.object.rotation.reorder("YXZ"), this.enabled = !0, this.deviceOrientation = null, this.screenOrientation = 0, this.alphaOffset = 0, this.initialOffset = null, this.TWO_PI = 2 * Math.PI, this.HALF_PI = 0.5 * Math.PI, this.orientationChangeEventName = "ondeviceorientationabsolute" in window ? "deviceorientationabsolute" : "deviceorientation", this.smoothingFactor = 1;
    const h = function({
      alpha: s,
      beta: c,
      gamma: d,
      webkitCompassHeading: o
    }) {
      if (k) {
        const l = 360 - o;
        e.alphaOffset = C.degToRad(l - s), e.deviceOrientation = { alpha: s, beta: c, gamma: d, webkitCompassHeading: o };
      } else
        s < 0 && (s += 360), e.deviceOrientation = { alpha: s, beta: c, gamma: d };
      window.dispatchEvent(
        new CustomEvent("camera-rotation-change", {
          detail: { cameraRotation: t.rotation }
        })
      );
    }, g = function() {
      e.screenOrientation = window.orientation || 0;
    }, L = function(s, c, d, o, l) {
      z.set(d, c, -o, "YXZ"), s.setFromEuler(z), s.multiply(tt), s.multiply(J.setFromAxisAngle($, -l));
    };
    this.connect = function() {
      g(), window.DeviceOrientationEvent !== void 0 && typeof window.DeviceOrientationEvent.requestPermission == "function" ? window.DeviceOrientationEvent.requestPermission().then((s) => {
        s === "granted" && (window.addEventListener(
          "orientationchange",
          g
        ), window.addEventListener(
          e.orientationChangeEventName,
          h
        ));
      }).catch(function(s) {
        console.error(
          "THREE.DeviceOrientationControls: Unable to use DeviceOrientation API:",
          s
        );
      }) : (window.addEventListener(
        "orientationchange",
        g
      ), window.addEventListener(
        e.orientationChangeEventName,
        h
      )), e.enabled = !0;
    }, this.disconnect = function() {
      window.removeEventListener(
        "orientationchange",
        g
      ), window.removeEventListener(
        e.orientationChangeEventName,
        h
      ), e.enabled = !1, e.initialOffset = !1, e.deviceOrientation = null;
    }, this.update = function({ theta: s = 0 } = { theta: 0 }) {
      if (e.enabled === !1) return;
      const c = e.deviceOrientation;
      if (c) {
        let d = c.alpha ? C.degToRad(c.alpha) + e.alphaOffset : 0, o = c.beta ? C.degToRad(c.beta) : 0, l = c.gamma ? C.degToRad(c.gamma) : 0;
        const R = e.screenOrientation ? C.degToRad(e.screenOrientation) : 0;
        if (k) {
          const v = new _();
          L(v, d, o, l, R);
          const w = new N().setFromQuaternion(
            v,
            "YXZ"
          );
          console.log(w.x, w.y, w.z), w.y = C.degToRad(
            360 - c.webkitCompassHeading
          ), v.setFromEuler(w), e.object.quaternion.copy(v);
        } else {
          if (this.smoothingFactor < 1) {
            if (this.lastOrientation) {
              const v = this.smoothingFactor;
              d = this._getSmoothedAngle(
                d,
                this.lastOrientation.alpha,
                v
              ), o = this._getSmoothedAngle(
                o + Math.PI,
                this.lastOrientation.beta,
                v
              ), l = this._getSmoothedAngle(
                l + this.HALF_PI,
                this.lastOrientation.gamma,
                v,
                Math.PI
              );
            } else
              o += Math.PI, l += this.HALF_PI;
            this.lastOrientation = {
              alpha: d,
              beta: o,
              gamma: l
            };
          }
          L(
            e.object.quaternion,
            d + s,
            this.smoothingFactor < 1 ? o - Math.PI : o,
            this.smoothingFactor < 1 ? l - this.HALF_PI : l,
            R
          );
        }
        8 * (1 - r.dot(e.object.quaternion)) > i && (r.copy(e.object.quaternion), e.dispatchEvent(et));
      }
    }, this._orderAngle = function(s, c, d = this.TWO_PI) {
      return c > s && Math.abs(c - s) < d / 2 || s > c && Math.abs(c - s) > d / 2 ? { left: s, right: c } : { left: c, right: s };
    }, this._getSmoothedAngle = function(s, c, d, o = this.TWO_PI) {
      const l = this._orderAngle(s, c, o), R = l.left, v = l.right;
      l.left = 0, l.right -= R, l.right < 0 && (l.right += o);
      let w = v == c ? (1 - d) * l.right + d * l.left : d * l.right + (1 - d) * l.left;
      return w += R, w >= o && (w -= o), w;
    }, this.updateAlphaOffset = function() {
      e.initialOffset = !1;
    }, this.dispose = function() {
      e.disconnect();
    }, this.getAlpha = function() {
      const { deviceOrientation: s } = e;
      return s && s.alpha ? C.degToRad(s.alpha) + e.alphaOffset : 0;
    }, this.getBeta = function() {
      const { deviceOrientation: s } = e;
      return s && s.beta ? C.degToRad(s.beta) : 0;
    }, window.DeviceOrientationEvent !== void 0 && typeof window.DeviceOrientationEvent.requestPermission == "function" ? this.initPermissionDialog() : this.connect();
  }
  // Provide gesture before initialising device orientation controls
  // From PR #659 on the main AR.js repo
  // Thanks to @ma2yama
  initPermissionDialog() {
    const t = document.createElement("div"), e = document.createElement("div"), i = document.createElement("div"), r = document.createElement("div");
    document.body.appendChild(t);
    const h = {
      display: "flex",
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      zIndex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "center",
      alignItems: "center"
    }, g = {
      backgroundColor: "white",
      padding: "6px",
      borderRadius: "3px",
      width: "36rem",
      height: "24rem"
    }, L = {
      width: "100%",
      height: "70%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }, s = {
      display: "inline-flex",
      width: "100%",
      height: "30%",
      justifyContent: "center",
      alignItems: "center"
    };
    for (let o in h)
      t.style[o] = h[o];
    for (let o in g)
      e.style[o] = g[o];
    for (let o in L)
      i.style[o] = L[o];
    for (let o in s)
      r.style[o] = s[o];
    t.appendChild(e), e.appendChild(i), e.appendChild(r), i.innerHTML = '<div style="font-size: 24pt; margin: 1rem;">This immersive website requires access to your device motion sensors.</div>';
    const c = () => {
      this.connect(), t.style.display = "none";
    }, d = document.createElement("button");
    d.addEventListener("click", c), d.style.width = "50%", d.style.height = "80%", d.style.fontSize = "20pt", d.appendChild(document.createTextNode("OK")), r.appendChild(d), document.body.appendChild(t);
  }
}
class rt {
  /**
   * Create a ClickHandler.
   * @param {THREE.WebGLRenderer} - The Three.js renderer on which the click
   * events will be handled.
   */
  constructor(t) {
    this.raycaster = new b.Raycaster(), this.normalisedMousePosition = new b.Vector2(null, null), t.domElement.addEventListener("click", (e) => {
      this.normalisedMousePosition.set(
        e.clientX / t.domElement.clientWidth * 2 - 1,
        -(e.clientY / t.domElement.clientHeight * 2) + 1
      );
    });
  }
  /**
   * Cast a ray into the scene to detect objects.
   * @param {THREE.Camera} - The active Three.js camera, from which the ray
   * will be cast.
   * @param {THREE.Scene} - The active Three.js scene, which the ray will be
   * cast into.
   * @return {Array} - array of all intersected objects.
   */
  raycast(t, e) {
    if (this.normalisedMousePosition.x !== null && this.normalisedMousePosition.y !== null) {
      this.raycaster.setFromCamera(this.normalisedMousePosition, t);
      const i = this.raycaster.intersectObjects(e.children, !1);
      return this.normalisedMousePosition.set(null, null), i;
    }
    return [];
  }
}
const ct = "0.0.10-noaframe-1";
export {
  rt as ClickHandler,
  at as DeviceOrientationControls,
  st as LocationBased,
  K as SphMercProjection,
  ot as Webcam,
  ct as version
};
