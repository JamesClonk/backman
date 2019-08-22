import throttle from "lodash-es/throttle";
export class ItunesAutocomplete {
    constructor() {
        this.artists = [];
        this.loading = false;
        this.onChange = throttle(this.fetch, 500);
    }
    fetch(keyword) {
        if (keyword.length < 3) {
            return;
        }
        this.loading = true;
        fetch(`https://itunes.apple.com/search?term=${encodeURI(keyword)}&entity=musicArtist&limit=10`, {
            method: "post"
        })
            .then((payload) => payload.json())
            .then((payload) => this.artists = payload.results.map((result) => result.artistName))
            .then(() => this.loading = false);
    }
    render() {
        return (h("sdx-select", { label: "Your favourite artist on iTunes", placeholder: "Search artists...", changeCallback: (selection) => this.onChange(selection[0]), keyboardBehavior: "autocomplete", filterFunction: () => true, loading: this.loading }, this.artists.map((artist) => h("sdx-select-option", null, artist))));
    }
    static get is() { return "sdx-itunes-autocomplete"; }
    static get encapsulation() { return "shadow"; }
    static get properties() { return {
        "artists": {
            "state": true
        },
        "loading": {
            "state": true
        }
    }; }
}
