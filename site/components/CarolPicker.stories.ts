import type { Meta, StoryObj } from "@storybook/svelte-vite";
import CarolPicker from "./CarolPicker.svelte";

const meta = {
	title: "CarolPicker",
	component: CarolPicker
} satisfies Meta<typeof CarolPicker>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
