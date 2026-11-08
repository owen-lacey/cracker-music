import type { Meta, StoryObj } from "@storybook/svelte-vite";
import InstrumentSwitcher from "./InstrumentSwitcher.svelte";

const meta = {
	title: "InstrumentSwitcher",
	component: InstrumentSwitcher,
	args: { pinned: true }
} satisfies Meta<typeof InstrumentSwitcher>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
