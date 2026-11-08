import type { Meta, StoryObj } from "@storybook/svelte-vite";
import { carols } from "../../src/carols";
import CarolTally from "./CarolTally.svelte";

const meta = {
	title: "CarolTally",
	component: CarolTally,
	argTypes: {
		slug: {
			control: "select",
			options: carols.map((carol) => carol.slug),
			labels: Object.fromEntries(
				carols.map((carol) => [carol.slug, carol.title])
			)
		}
	}
} satisfies Meta<typeof CarolTally>;

export default meta;

type Story = StoryObj<typeof meta>;

export const JingleBells: Story = {
	args: { slug: "jingle-bells" }
};
