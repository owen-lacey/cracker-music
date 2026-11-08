import type { Meta, StoryObj } from "@storybook/svelte-vite";
import jingleBells from "../../data/carols/jingle-bells.json";
import rudolph from "../../data/carols/rudolph-the-red-nosed-reindeer.json";
import { parseMelody } from "../../src/melody";
import MelodyTrack from "./MelodyTrack.svelte";

const meta = {
	title: "MelodyTrack",
	component: MelodyTrack
} satisfies Meta<typeof MelodyTrack>;

export default meta;

type Story = StoryObj<typeof meta>;

export const JingleBells: Story = {
	args: {
		title: jingleBells.title,
		slots: parseMelody(jingleBells.melody),
		tempo: 50,
		swing: false
	}
};

export const Rudolph: Story = {
	args: {
		title: rudolph.title,
		slots: parseMelody(rudolph.melody),
		tempo: 50,
		swing: true
	}
};
