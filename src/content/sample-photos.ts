import type { Photo } from "@/lib/photos"

/**
 * Placeholder frames shown until real photos are synced to the bucket
 * (generated gradients, clearly non-photographic). Mirrors SAMPLE_POSTS:
 * the UI flags this state with the `.sample` chip.
 */
export const SAMPLE_PHOTOS: Photo[] = [
  {
    src: "/photos/sample-01.jpg",
    width: 1200,
    height: 800,
    alt: "Placeholder frame — landscape",
    blurDataURL:
      "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAIAAwDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAQF/8QAFxABAQEBAAAAAAAAAAAAAAAAAAIDIf/EABUBAQEAAAAAAAAAAAAAAAAAAAEC/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8A0MrVzfAUH//Z",
  },
  {
    src: "/photos/sample-02.jpg",
    width: 900,
    height: 1200,
    alt: "Placeholder frame — portrait",
    blurDataURL:
      "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAQAAwDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABAMF/8QAGBAAAgMAAAAAAAAAAAAAAAAAAAECAyH/xAAUAQEAAAAAAAAAAAAAAAAAAAAC/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8A0qkLisIVIVFYAn//2Q==",
  },
  {
    src: "/photos/sample-03.jpg",
    width: 1470,
    height: 630,
    alt: "Placeholder frame — panorama",
    blurDataURL:
      "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAFAAwDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAL/xAAaEAACAwEBAAAAAAAAAAAAAAAAAQIDcQQS/8QAFAEBAAAAAAAAAAAAAAAAAAAAAv/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/ALq6J+VhVt8nJYAMX//Z",
  },
  {
    src: "/photos/sample-04.jpg",
    width: 800,
    height: 1200,
    alt: "Placeholder frame — portrait",
    blurDataURL:
      "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAASAAwDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAABAD/xAAYEAEAAwEAAAAAAAAAAAAAAAAAAgMyQf/EABYBAQEBAAAAAAAAAAAAAAAAAAACA//EABURAQEAAAAAAAAAAAAAAAAAAAAB/9oADAMBAAIRAxEAPwBlHDoZBo4dDLOKoNHDoZSIP//Z",
  },
  {
    src: "/photos/sample-05.jpg",
    width: 1200,
    height: 675,
    alt: "Placeholder frame — landscape",
    blurDataURL:
      "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAHAAwDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAME/8QAGhAAAgIDAAAAAAAAAAAAAAAAAAMCkRFBYf/EABQBAQAAAAAAAAAAAAAAAAAAAAH/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCy3w5Rpi9eNUAAf//Z",
  },
  {
    src: "/photos/sample-06.jpg",
    width: 1200,
    height: 800,
    alt: "Placeholder frame — landscape",
    blurDataURL:
      "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAIAAwDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAT/xAAXEAEBAQEAAAAAAAAAAAAAAAAAAwIi/8QAFQEBAQAAAAAAAAAAAAAAAAAAAQL/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCmMluZcgVP/9k=",
  },
]
