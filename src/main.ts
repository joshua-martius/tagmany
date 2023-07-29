import { Plugin, TFile, TFolder } from 'obsidian';
import { EnterTagsModal } from './EnterTagsModal';

export default class TagManyPlugin extends Plugin {
	settings: TagManyPlugin;

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
									await this.addTagsToNotes(tags.split(","), folder, includeSubfolders);
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
			if(note.name.endsWith(".canvas")) continue; // ignore canvas files for now
			if (note instanceof TFolder) {
				if (includeSubfolders) await this.addTagsToNotes(tags, note, true, counter);
				continue;
			}
			
			this.app.fileManager.processFrontMatter(note as TFile, (frontmatter) => {
				frontmatter.tags = [...new Set([...frontmatter.tags, ...tags])];
			})
			
			counter[0]++;
		}
  }
}

