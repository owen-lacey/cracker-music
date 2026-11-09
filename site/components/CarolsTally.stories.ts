import type { Meta, StoryObj } from "@storybook/svelte-vite";
import CarolsTally from "./CarolsTally.svelte";

const meta = {
	title: "CarolsTally",
	component: CarolsTally
} satisfies Meta<typeof CarolsTally>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
