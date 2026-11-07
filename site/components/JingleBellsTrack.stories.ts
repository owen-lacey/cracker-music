import type { Meta, StoryObj } from "@storybook/svelte-vite";
import JingleBellsTrack from "./JingleBellsTrack.svelte";

const meta = {
	title: "JingleBellsTrack",
	component: JingleBellsTrack
} satisfies Meta<typeof JingleBellsTrack>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
