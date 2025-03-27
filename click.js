AFRAME.registerComponent('clickable', {
  init: function () {
    this.el.addEventListener('click', function () {
      alert('Clicked');
    });
  }
});
