<script lang="ts">
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import Icon from "@iconify/svelte";
import { getDefaultHue, getHue, setHue } from "@utils/setting-utils";

let hue = getHue();
const defaultHue = getDefaultHue();
const presets = [
	{ name: "Ocean", hue: 200, colors: ["#38bdf8", "#0f766e"] },
	{ name: "Sakura", hue: 345, colors: ["#fb7185", "#c084fc"] },
	{ name: "Forest", hue: 145, colors: ["#22c55e", "#84cc16"] },
	{ name: "Mono", hue: 255, colors: ["#94a3b8", "#475569"] },
];

function resetHue() {
	hue = getDefaultHue();
}

function applyPreset(nextHue: number) {
	hue = nextHue;
}

$: if (hue || hue === 0) {
	setHue(hue);
}
</script>

<div id="display-setting" class="float-panel float-panel-closed absolute transition-all w-80 right-4 px-4 py-4">
    <div class="flex flex-row gap-2 mb-3 items-center justify-between">
        <div class="flex gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-100 transition relative ml-3
            before:w-1 before:h-4 before:rounded-md before:bg-[var(--primary)]
            before:absolute before:-left-3 before:top-[0.33rem]"
        >
            {i18n(I18nKey.themeColor)}
            <button aria-label="Reset to Default" class="btn-regular w-7 h-7 rounded-md  active:scale-90 will-change-transform"
                    class:opacity-0={hue === defaultHue} class:pointer-events-none={hue === defaultHue} on:click={resetHue}>
                <div class="text-[var(--btn-content)]">
                    <Icon icon="fa6-solid:arrow-rotate-left" class="text-[0.875rem]"></Icon>
                </div>
            </button>
        </div>
        <div class="flex gap-1">
            <div id="hueValue" class="transition bg-[var(--btn-regular-bg)] w-10 h-7 rounded-md flex justify-center
            font-bold text-sm items-center text-[var(--btn-content)]">
                {hue}
            </div>
        </div>
    </div>
    <div class="w-full h-6 px-1 bg-[oklch(0.80_0.10_0)] dark:bg-[oklch(0.70_0.10_0)] rounded select-none">
        <input aria-label={i18n(I18nKey.themeColor)} type="range" min="0" max="360" bind:value={hue}
               class="slider" id="colorSlider" step="5" style="width: 100%">
    </div>
    <div class="mt-4">
        <div class="text-xs font-bold uppercase text-black/40 dark:text-white/40 mb-2">Presets</div>
        <div class="grid grid-cols-2 gap-2">
            {#each presets as preset}
                <button
                    class="preset-btn"
                    class:active={Number(hue) === preset.hue}
                    aria-label={`Use ${preset.name} theme`}
                    on:click={() => applyPreset(preset.hue)}
                >
                    <span class="swatches">
                        <span style={`background: ${preset.colors[0]}`}></span>
                        <span style={`background: ${preset.colors[1]}`}></span>
                    </span>
                    <span>{preset.name}</span>
                </button>
            {/each}
        </div>
    </div>
</div>


<style lang="stylus">
    #display-setting
      input[type="range"]
        -webkit-appearance none
        height 1.5rem
        background-image var(--color-selection-bar)
        transition background-image 0.15s ease-in-out

        /* Input Thumb */
        &::-webkit-slider-thumb
          -webkit-appearance none
          height 1rem
          width 0.5rem
          border-radius 0.125rem
          background rgba(255, 255, 255, 0.7)
          box-shadow none
          &:hover
            background rgba(255, 255, 255, 0.8)
          &:active
            background rgba(255, 255, 255, 0.6)

        &::-moz-range-thumb
          -webkit-appearance none
          height 1rem
          width 0.5rem
          border-radius 0.125rem
          border-width 0
          background rgba(255, 255, 255, 0.7)
          box-shadow none
          &:hover
            background rgba(255, 255, 255, 0.8)
          &:active
            background rgba(255, 255, 255, 0.6)

        &::-ms-thumb
          -webkit-appearance none
          height 1rem
          width 0.5rem
          border-radius 0.125rem
          background rgba(255, 255, 255, 0.7)
          box-shadow none
          &:hover
            background rgba(255, 255, 255, 0.8)
          &:active
            background rgba(255, 255, 255, 0.6)

    .preset-btn
      display flex
      align-items center
      gap 0.5rem
      height 2.5rem
      border 1px solid var(--card-border)
      border-radius 0.75rem
      background var(--btn-regular-bg)
      color rgba(0, 0, 0, 0.68)
      padding 0 0.65rem
      font-weight 700
      transition transform 160ms ease, background 160ms ease, border-color 160ms ease

      &:hover,
      &.active
        border-color var(--primary)
        background var(--btn-regular-bg-hover)
        transform translateY(-1px)

    :global(.dark) .preset-btn
      color rgba(255, 255, 255, 0.72)

    .swatches
      display flex
      align-items center

      span
        width 0.9rem
        height 0.9rem
        border-radius 999px
        border 2px solid rgba(255, 255, 255, 0.82)
        box-shadow 0 2px 8px rgba(0, 0, 0, 0.18)

      span + span
        margin-left -0.35rem
</style>
