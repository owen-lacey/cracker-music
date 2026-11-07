import type { Meta, StoryObj } from "@storybook/svelte-vite";
import InstrumentPicker from "./InstrumentPicker.svelte";

const meta = {
	title: "InstrumentPicker",
	component: InstrumentPicker
} satisfies Meta<typeof InstrumentPicker>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
