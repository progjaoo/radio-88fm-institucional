// Geometry adapted from the user-supplied SVG; original retained in docs/design/references.
// Inherit the player's color animation instead of importing the source's background and styles.
export default function MicrophoneIcon() {
  return (
    <svg className="mini-player-mic" viewBox="20 12 60 76" fill="none" aria-hidden="true" focusable="false">
      <rect x="37" y="16" width="26" height="42" rx="13" fill="currentColor" />
      <g stroke="white" strokeWidth="2.5">
        <path d="M37 30h26M37 38h26M37 46h26" />
      </g>
      <g stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M28 46v4a22 22 0 0 0 44 0v-4" />
        <path d="M50 72v10M38 84h24" />
      </g>
    </svg>
  );
}
