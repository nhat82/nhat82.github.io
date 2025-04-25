# Updates

- `0.0.11` (2025-04-19) - separated out A-Frame API into own package `locar-aframe` for greater modularity.
 
- `0.0.10` (2025-04-18) - added A-Frame components: `locar-webcam`, `locar-camera` and `locar-entity-place`, with the latter two more or less equivalent to the original AR.js `gps-new-camera` and `gps-new-entity-place` components but with some parameter changes.

- `0.0.9` (2025-04-12) - revised webcam API (**breaking change**). Now uses `LocAR.Webcam` rather than `LocAR.WebcamRenderer`. Different approach setting the `background` of the scene directly to the `THREE.VideoTexture` from the webcam. Docs and tutorial have been updated to match. This is an attempt to tackle the "stretched camera feed" issue from the main repo (#498).

- `0.0.8` (2025-03-24) - added iPad 13+ detection (issue #660 from [main AR.js repo](https://github.com/AR-js-org/AR.js)).

- `0.0.7` (2025-03-23) - added iOS enhancements and bugfixes from [main AR.js repo](https://github.com/AR-js-org/AR.js) including issues/PRs #657 and #659.
