import { Plugin, TFile, TFolder } from 'obsidian';
import { EnterTagsModal } from 'EnterTagsModal';

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
							new EnterTagsModal(this.app, async (result) => {
								if (result) {
									await this.addTagsToNotes(result.split(","), folder);
								}
							}).open();
						});
				});
			})
		);
	}

	async addTagsToNotes(tags: string[], folder: TFolder) {
		for (const note of folder.children) {
			if (note instanceof TFolder) continue;
			const noteContent = await this.app.vault.read(note as TFile);
			const regex = /^---\ntags:\s*\[(.*?)\]\n---$/gm;
			const regexResult = regex.exec(noteContent);
			if (regexResult && regexResult[1]) {
				const oldTags = regexResult[1].split(",");
				const newTags = [...new Set([...oldTags, ...tags])];
				const newNoteContent = noteContent.replace(regex, `---\ntags: [${newTags.join(",")}]\n---`);
				await this.app.vault.modify(note as TFile, newNoteContent);
			} else {
				const newNoteContent = `---\ntags: [${tags.join(",")}]\n---\n\n${noteContent}`;
				await this.app.vault.modify(note as TFile, newNoteContent);
			}
			new Notification("TagMany", { body: `Added tags to ${folder.children.length} notes!` });
		}
	}
}

