const Loop = {
  clock: new THREE.Clock(),
  start(){
    const tick = () => {
      requestAnimationFrame(tick);
      const dt = this.clock.getDelta();
      ENGINE.update(dt);
      ENGINE.render();
    };
    tick();
  }
};

