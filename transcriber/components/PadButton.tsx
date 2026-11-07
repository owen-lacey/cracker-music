import type { ReactNode } from "react";

interface PadButtonProps {
	onPress: () => void;
	active?: boolean;
	children: ReactNode;
}

/** A button that never takes focus, so keyboard shortcuts keep working after a click. */
export function PadButton({
	onPress,
	active = false,
	children
}: PadButtonProps) {
	return (
		<button
			type="button"
			onMouseDown={(event) => event.preventDefault()}
			onClick={onPress}
			className={`min-w-12 rounded border px-3 py-2 font-mono ${
				active
					? "border-blue-600 bg-blue-600 text-white"
					: "border-gray-300 bg-white hover:bg-gray-100"
			}`}
		>
			{children}
		</button>
	);
}
