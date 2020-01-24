export type ResultRandom = Pony; // /api/v1/pony/random

export interface ResultTags { // /api/v1/tags
    tags: string[];
}

export interface ResultID { // /api/v1/pony/id/<id>
    approved: boolean; // true if the pony is approved, false otherwise.
    pony: Pony;
}

export interface ResultTagName { // /api/v1/tag/<name>
    name: string;                // The primary name of the tag.
    aliases: string[];           // The aliases of the tag.
    stemmed: string;             // The stemmed version of the tag, used for stemmed searches.
    stemmed_aliases: string[];   // The stemmed aliases of the tag, used for stemmed searches.
}
export interface Pony {
    id: number;               // The ID of the pony, as a 53-bit integer.
    derpiId: number | null;   // The ID of the pony on Derpibooru, if known.
    tags: string[];           // An array of tags applied to the image.
    sourceURL: string | null; // The original source of the image, if known.

    height: number;           // The height of the image, in pixels.
    width: number;            // The width of the image, in pixels.
    aspectRatio: number;      // Width divided by height.
    mimeType: string;         // The mime-type of the image; generally one of "image/jpeg", "image/png" or "image/gif"
    originalFormat: string;   // The original extension of the image; generally one of "jpg", "png" or "gif".
    representations: {
        full: string;         // URL pointing to the image as originally uploaded, which may be any size.
        tall: string;         // URL to an image that fits in a 1024x4096 box.
        large: string;        // URL to an image that fits in a 1280x1024 box.
        medium: string;       // URL to an image that fits in an 800x600 box.
        small: string;        // URL to an image that fits in a 320x240 box.
        thumb: string;        // URL to an image that fits in a 250x250 box.
        thumbSmall: string;   // URL to an image that fits in a 150x150 box.
        thumbTiny: string;    // URL to an image that fits in a 50x50 box.
    };
}
