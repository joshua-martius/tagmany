import { App, Modal, Setting } from 'obsidian';

export class EnterTagsModal extends Modal {
    tags: string;
    includeSubfolders: boolean;
    onSubmit: (tags: string, includeSubfolders: boolean) => void;

    constructor(app: App, onSubmit: (tags: string, includeSubfolders: boolean) => void) {
        super(app);
        this.onSubmit = onSubmit;
    }

    onOpen() {
        const { contentEl } = this;

        contentEl.createEl("h2", { text: "What tags do you want to add to the Notes?" });

        new Setting(contentEl)
            .setName("Tags (separate with commas)")
            .addText((text) =>
                text.onChange((value) => {
                    this.tags = value
                }));

        new Setting(contentEl)
            .setName("Include Subfolders?")
            .addToggle((toggle) =>
                toggle.onChange((value) => {
                    this.includeSubfolders = value
                }));

        new Setting(contentEl)
            .addButton((btn) =>
                btn
                    .setButtonText("Submit")
                    .setCta()
                    .onClick(() => {
                        this.close();
                        this.onSubmit(this.tags, this.includeSubfolders);
                    }));
    }

    onClose() {
        let { contentEl } = this;
        contentEl.empty();
    }
}