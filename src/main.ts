import { Plugin, TFile, TFolder } from 'obsidian';
import { EnterTagsModal } from './EnterTagsModal';

function normalizeTags(input: string): string[] {
  const normalized = input
    .split(',')
    .map((tag) => tag.trim().replace(/^#+/, '').trim())
    .filter((tag) => tag.length > 0);

  return [...new Set(normalized)];
}


export default class TagManyPlugin extends Plugin {
	async onload() {
		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, folder) => {
				if (!(folder instanceof TFolder)) return;
				menu.addItem((item) => {
					item
						.setTitle("Tag all notes in this folder")
						.setIcon("tags")
						.onClick(async () => {
							new EnterTagsModal(this.app, async (tags, includeSubfolders) => {
								const normalizedTags = normalizeTags(tags);
								if (normalizedTags.length > 0) {
									await this.addTagsToNotes(normalizedTags, folder, includeSubfolders);
								}
							}).open();
						});
				});
			})
		);
	}

	onunload(): void {

	}

	async addTagsToNotes(tags: string[], folder: TFolder, includeSubfolders: boolean, counter: number[] = [0]) {
		for (const note of folder.children) {
			if (note instanceof TFolder) {
				if (includeSubfolders) await this.addTagsToNotes(tags, note, true, counter);
				continue;
			}

			this.app.fileManager.processFrontMatter(note as TFile, (frontmatter) => {
				const existingTags = Array.isArray(frontmatter.tags) ? frontmatter.tags : [];
				frontmatter.tags = [...new Set([...existingTags, ...tags].map((tag) => tag.replace(/^#+/, '').trim()).filter(Boolean))];
			});

			counter[0]++;
		}
	}
}

