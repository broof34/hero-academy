/* Hero Academy iframe and touch adapter, 2026. GPL-3.0-only. */
'use strict';

const academyEmbedded = parent !== window;
const academyPlayfield = document.getElementById('playfield');
const academyTouchKeys = new Set();
const academyPulseKeys = new Set();
let academyPaused = academyEmbedded;
let academyMuted = academyEmbedded;
let academyVolume = academyEmbedded ? 0 : 1;
let academyBlood = !academyEmbedded;
let academyReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let academyWake, academyStop;
let academyLoaded = false;
const academyPointers = new Map();

document.getElementById('standalone-source').hidden = academyEmbedded;
document.body.classList.toggle('embedded', academyEmbedded);

if (navigator.maxTouchPoints > 0) document.body.classList.add('touch');

function academyReport(type) {
    if (academyEmbedded) parent.postMessage({type}, '*');
}

function academyClearControls() {
    academyPointers.clear();
    academyTouchKeys.clear();
    academyPulseKeys.clear();
    for (const button of document.querySelectorAll('#touch button'))
        button.setAttribute('aria-pressed', 'false');
    if (typeof clearInput === 'function') clearInput();
}

function academyReleasePointer(id) {
    const button = academyPointers.get(id);
    if (!button) return;
    academyPointers.delete(id);
    if ([...academyPointers.values()].includes(button)) return;
    academyTouchKeys.delete(Number(button.dataset.key));
    button.setAttribute('aria-pressed', 'false');
}

for (const button of document.querySelectorAll('#touch button')) {
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', event => {
        // Keyboard and assistive technology activate native buttons with a click.
        if (event.detail !== 0 || academyPaused || !academyLoaded) return;
        academyPulseKeys.add(Number(button.dataset.key));
        isUsingGamepad = 0;
        hadInput = 1;
        academyUnlockAudio();
    });
    button.addEventListener('pointerdown', event => {
        if (academyPaused || !academyLoaded || event.button !== 0) return;
        event.preventDefault();
        button.setPointerCapture(event.pointerId);
        academyPointers.set(event.pointerId, button);
        academyTouchKeys.add(Number(button.dataset.key));
        academyPulseKeys.add(Number(button.dataset.key));
        button.setAttribute('aria-pressed', 'true');
        isUsingGamepad = 0;
        hadInput = 1;
        mainCanvas.focus({preventScroll:true});
        academyUnlockAudio();
    });
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture'])
        button.addEventListener(type, event => academyReleasePointer(event.pointerId));
}

document.getElementById('restart').addEventListener('click', () => {
    if (academyPaused || !academyLoaded) return;
    academyClearControls();
    resetGame();
    mainCanvas.focus({preventScroll:true});
});

addEventListener('message', ({source, data}) => {
    if (!academyEmbedded || source !== parent || data?.type !== 'academy:settings') return;
    const wasPaused = academyPaused;
    academyPaused = data.paused === true;
    academyMuted = data.muted !== false;
    academyVolume = Number.isFinite(data.effectsVolume) ? Math.max(0, Math.min(1, data.effectsVolume)) : 0;
    academyBlood = data.spaceHuggersBlood === true;
    academyReducedMotion = data.reducedMotion === true || matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (academyPaused && !wasPaused) {
        academyClearControls();
        academyStop?.();
    } else if (!academyPaused && wasPaused) {
        academyWake?.();
    }
    if (academyLoaded) academyUpdateAudio();
});

addEventListener('blur', academyClearControls);
document.addEventListener('visibilitychange', () => {
    if (document.hidden) academyClearControls();
});
addEventListener('pagehide', () => {
    academyStop?.();
    academyClearControls();
    if (academyLoaded) academyCloseAudio();
});
addEventListener('pageshow', event => {
    if (event.persisted && !academyPaused) academyWake?.();
});
addEventListener('error', () => academyReport('academy:error'));
