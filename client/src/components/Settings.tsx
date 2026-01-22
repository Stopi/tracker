import {useState} from "react";
import {toast} from "sonner";
import {api} from "@/lib/api.tsx";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {useApi} from "@/lib/swr";

type SettingsData = {
	flag_1: string;
	flag_2: string;
	flag_3: string;
	flag_4: string;
	flag_5: string;
	flag_6: string;
	flag_7: string;
	flag_8: string;
};

const defaultFlags: SettingsData = {
	flag_1: "",
	flag_2: "",
	flag_3: "",
	flag_4: "",
	flag_5: "",
	flag_6: "",
	flag_7: "",
	flag_8: "",
};

/**
 * Settings page for configuring custom flag labels.
 * Flags are user-defined labels for tracking episode states (e.g., Watched, Downloaded).
 */
export default function Settings() {
	const [isSaving, setIsSaving] = useState(false);

	const { data, isLoading, mutate } = useApi<SettingsData>(
		"/settings",
		() => api.settings.$get()
	);

	const flags = data ?? defaultFlags;

	/** Updates local form state immediately (optimistic UI) */
	function updateFlag(key: keyof SettingsData, value: string) {
		mutate(
			(currentData) => {
				if (!currentData) return { ...defaultFlags, [key]: value };
				return { ...currentData, [key]: value };
			},
			false
		);
	}

	/** Persists flag labels to server */
	async function handleSave() {
		setIsSaving(true);

		try {
			const res = await api.settings.$patch({ json: flags });
			if (res.ok) {
				toast.success("Settings saved successfully");
			} else {
				toast.error("Failed to save settings");
			}
		} catch (err) {
			toast.error("Failed to save settings");
			console.error(err);
		} finally {
			setIsSaving(false);
		}
	}

	if (isLoading) {
		return (
			<div className="flex-1 overflow-y-auto p-6">
				<p className="text-muted-foreground">Loading settings...</p>
			</div>
		);
	}

	return (
		<div className="flex-1 overflow-y-auto p-6">
			<div className="max-w-2xl">
				<Card>
					<CardHeader>
						<CardTitle>Flags Labels</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{Object.keys(flags).map((key) => (
							<div key={key} className="flex items-center gap-4">
								<label className="w-20 text-sm font-medium capitalize">
									{key.replace("_", " ")}
								</label>
								<Input
									value={flags[key as keyof SettingsData] ?? ""}
									onChange={(e) =>
										updateFlag(key as keyof SettingsData, e.target.value)
									}
									placeholder="< unused >"
								/>
							</div>
						))}

						<div className="pt-4 flex items-center gap-4">
							<Button onClick={handleSave} disabled={isSaving}>
								{isSaving ? "Saving..." : "Save"}
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
