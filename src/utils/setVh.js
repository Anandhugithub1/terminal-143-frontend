// Dynamically set a --vh CSS variable to account for mobile browser UI (keyboard)
function setVh() {
  try {
    const set = () => {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    };
    set();
    window.addEventListener('resize', set);
  } catch (e) {
    // noop in non-browser environments
  }
}

// Run immediately when imported
setVh();

export default setVh;
