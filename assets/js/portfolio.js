(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var shapes = Array.prototype.slice.call(document.querySelectorAll(".shape"));
  if (shapes.length === 0) return;

  var dragState = new Map();
  var container = document.querySelector(".shapes");
  shapes.forEach(function (shape) {
    var speed = 6 + Math.random() * 10;
    var angle = Math.random() * Math.PI * 2;
    dragState.set(shape, {
      x: 0,
      y: 0,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      dragging: false,
      pointerId: null,
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
      baseLeft: 0,
      baseTop: 0
    });
  });

  function updateBounds() {
    if (!container) return;
    var cWidth = container.clientWidth;
    var cHeight = container.clientHeight;
    shapes.forEach(function (shape) {
      var state = dragState.get(shape);
      if (!state) return;
      state.baseLeft = shape.offsetLeft;
      state.baseTop = shape.offsetTop;
      var sWidth = shape.offsetWidth;
      var sHeight = shape.offsetHeight;
      state.minX = -state.baseLeft;
      state.maxX = cWidth - sWidth - state.baseLeft;
      state.minY = -state.baseTop;
      state.maxY = cHeight - sHeight - state.baseTop;
    });
  }

  updateBounds();
  window.addEventListener("resize", updateBounds);

  function onPointerDown(event) {
    var shape = event.currentTarget;
    var state = dragState.get(shape);
    if (!state) return;
    state.dragging = true;
    state.pointerId = event.pointerId;
    state.startX = event.clientX;
    state.startY = event.clientY;
    state.baseX = state.x;
    state.baseY = state.y;
    shape.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event) {
    var shape = event.currentTarget;
    var state = dragState.get(shape);
    if (!state || !state.dragging || state.pointerId !== event.pointerId) return;
    event.preventDefault();
    state.x = state.baseX + (event.clientX - state.startX);
    state.y = state.baseY + (event.clientY - state.startY);
    state.x = Math.min(state.maxX, Math.max(state.minX, state.x));
    state.y = Math.min(state.maxY, Math.max(state.minY, state.y));
  }

  function onPointerUp(event) {
    var shape = event.currentTarget;
    var state = dragState.get(shape);
    if (!state || state.pointerId !== event.pointerId) return;
    state.dragging = false;
    state.pointerId = null;
  }

  shapes.forEach(function (shape) {
    shape.addEventListener("pointerdown", onPointerDown);
    shape.addEventListener("pointermove", onPointerMove);
    shape.addEventListener("pointerup", onPointerUp);
    shape.addEventListener("pointercancel", onPointerUp);
  });

  if (reduce) return;

  var last = null;
  function animate(timestamp) {
    if (last === null) last = timestamp;
    var dt = (timestamp - last) / 1000;
    last = timestamp;
    shapes.forEach(function (shape, idx) {
      var state = dragState.get(shape);
      if (!state) return;
      if (!state.dragging) {
        state.x += state.vx * dt;
        state.y += state.vy * dt;
        if (state.x < state.minX || state.x > state.maxX) {
          state.vx *= -1;
          state.x = Math.min(state.maxX, Math.max(state.minX, state.x));
        }
        if (state.y < state.minY || state.y > state.maxY) {
          state.vy *= -1;
          state.y = Math.min(state.maxY, Math.max(state.minY, state.y));
        }
      }
      var x = state.x;
      var y = state.y;
      shape.style.transform = "translate(" + x.toFixed(2) + "px, " + y.toFixed(2) + "px)";
    });
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
})();
