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
						.setTitle("Tag all Notes in this Folder")
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
			const noteContent = await this.app.vault.read(note as TFile);
			const regex = /^---\ntags:\s*\[(.*?)\]\n---$/gm;
			const regexResult = regex.exec(noteContent);
			const trimmedTags = tags.map(tag => tag.trim()); // Trim leading and trailing whitespaces

			let newNoteContent = "";
			if (noteContent.contains("---\ntags: []\n---")) {
				newNoteContent = noteContent.replace("---\ntags: []\n---", `---\ntags: [${trimmedTags.join(",")}]\n---`);
			}
			else if (regexResult && regexResult[1]) {
				const oldTags = regexResult[1].split(",").map(tag => tag.trim()).filter(tag => !trimmedTags.includes(tag)); // Trim existing tags and remove new tags that are already present
				const newTags = [...new Set([...oldTags, ...trimmedTags])];
				newNoteContent = noteContent.replace(regex, `---\ntags: [${newTags.join(",")}]\n---`);
			}
			else { // No tags yet, no frontmatter yet
				newNoteContent = `---\ntags: [${trimmedTags.join(",")}]\n---\n\n${noteContent}`;
			}

			await this.app.vault.modify(note as TFile, newNoteContent);
			counter[0]++;
		}
  }
}

