import type { Meta, StoryObj } from "@storybook/svelte-vite";
import { fn } from "storybook/test";
import { INSTRUMENT_KINDS } from "../../src/player";
import Instrument from "./Instrument.svelte";
import Magnify from "./Magnify.svelte";

const meta = {
	title: "Instrument",
	component: Instrument,
	decorators: [() => ({ Component: Magnify })],
	parameters: { layout: "centered" },
	args: { onring: fn() },
	argTypes: {
		kind: { control: "select", options: INSTRUMENT_KINDS },
		number: { control: { type: "range", min: 1, max: 8, step: 1 } }
	}
} satisfies Meta<typeof Instrument>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Bell: Story = { args: { kind: "bell", number: 1 } };

export const Whistle: Story = { args: { kind: "whistle", number: 1 } };

export const Xylophone: Story = { args: { kind: "xylophone", number: 1 } };
