import { Plugin, TFile, TFolder } from 'obsidian';
import { EnterTagsModal } from './EnterTagsModal';

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
								if (tags) {
									const tagArray = tags.split(",");
									await this.addTagsToNotes(tagArray, folder, includeSubfolders);
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
				// If its a folder and subfolders are to be included, recurse into subfolders
				if (includeSubfolders) await this.addTagsToNotes(tags, note, true, counter);
				continue;
			}

			// Add tags to frontmatter
			this.app.fileManager.processFrontMatter(note as TFile, (frontmatter) => {
				if(!frontmatter.tags) frontmatter.tags = new Set(tags);
				else frontmatter.tags = [...new Set([...frontmatter.tags, ...tags])];
			})

			// Update counter
			counter[0]++;
		}
	}
}

