import type { Carol, Sheet } from "../../src/carols";

interface CarolListProps {
	carols: Carol[];
	saved: Record<string, Sheet>;
	selected: Carol;
	onSelect: (carol: Carol) => void;
}

export function CarolList({
	carols,
	saved,
	selected,
	onSelect
}: CarolListProps) {
	const done = carols.filter((carol) => saved[carol.slug]).length;
	return (
		<nav className="flex w-80 shrink-0 flex-col border-r border-gray-200 bg-gray-50">
			<p className="border-b border-gray-200 p-3 text-sm text-gray-600">
				{done} / {carols.length} transcribed
			</p>
			<ul className="overflow-y-auto">
				{carols.map((carol) => (
					<li key={carol.slug}>
						<button
							type="button"
							onClick={() => onSelect(carol)}
							className={`flex w-full gap-2 px-3 py-1.5 text-left text-sm hover:bg-gray-100 ${
								carol.slug === selected.slug ? "bg-blue-100" : ""
							}`}
						>
							<span className="w-4 text-green-600">
								{saved[carol.slug] ? "✓" : ""}
							</span>
							<span>
								{carol.title}
								{carol.tune && (
									<span className="text-gray-500"> ({carol.tune})</span>
								)}
							</span>
						</button>
					</li>
				))}
			</ul>
		</nav>
	);
}
