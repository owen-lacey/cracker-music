import type { Meta, StoryObj } from "@storybook/svelte-vite";
import CarolSelect from "./CarolSelect.svelte";

const meta = {
	title: "CarolSelect",
	component: CarolSelect
} satisfies Meta<typeof CarolSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: { slug: null, placeholder: "Pick a carol…", playable: true }
};

export const Picked: Story = {
	args: {
		slug: "joy-to-the-world",
		placeholder: "Pick a carol…",
		playable: true
	}
};

export const Clearable: Story = {
	args: { slug: null, placeholder: "Highlight carol", clearable: true }
};
