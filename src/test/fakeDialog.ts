// jsdom has <dialog> but not its methods, so tests that open one call this
// first. It does the part the tests need: open/close the dialog and fire the
// "close" event, like a browser does.
export function fakeDialog() {
    HTMLDialogElement.prototype.showModal = function () {
        this.open = true;
    };
    HTMLDialogElement.prototype.close = function () {
        this.open = false;
        this.dispatchEvent(new Event('close'));
    };
}