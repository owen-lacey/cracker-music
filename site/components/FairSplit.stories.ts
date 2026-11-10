import type { Meta, StoryObj } from "@storybook/svelte-vite";
import FairSplit from "./FairSplit.svelte";

const meta = {
	title: "FairSplit",
	component: FairSplit
} satisfies Meta<typeof FairSplit>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
