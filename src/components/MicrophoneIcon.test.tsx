import { render } from "@testing-library/react";
import MicrophoneIcon from "./MicrophoneIcon";

it("uses only the supplied microphone geometry and inherits the player color", () => {
  const { container } = render(<MicrophoneIcon />);
  const icon = container.querySelector("svg");
  expect(icon).toHaveAttribute("class", "mini-player-mic");
  expect(icon).toHaveAttribute("aria-hidden", "true");
  expect(icon).toHaveAttribute("focusable", "false");
  expect(icon.querySelector("rect")).toHaveAttribute("fill", "currentColor");
  expect(icon.querySelector('rect[x="0"]')).toBeNull();
  expect(icon.querySelector("style, script, animate, foreignObject")).toBeNull();
});
