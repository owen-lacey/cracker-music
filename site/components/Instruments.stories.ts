import type { Meta, StoryObj } from "@storybook/svelte-vite";
import { INSTRUMENT_KINDS } from "../../src/player";
import Instruments from "./Instruments.svelte";

const meta = {
	title: "Instruments",
	component: Instruments,
	argTypes: {
		kind: { control: "select", options: INSTRUMENT_KINDS }
	}
} satisfies Meta<typeof Instruments>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Bells: Story = { args: { kind: "bell" } };

export const Whistles: Story = { args: { kind: "whistle" } };

export const Xylophones: Story = { args: { kind: "xylophone" } };
