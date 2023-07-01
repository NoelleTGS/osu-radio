function createSongIndex(id, song) {
    return {
        id,
        t: song.beatmapSetID + song.title + (song.titleUnicode ?? ''),
        a: song.artist + (song.artistUnicode ?? ''),
        c: song.creator,
        tags: song.tags,
        bpm: averageBPM(song.bpm, song.duration * 1_000)
    };
}
export function collectTagsAndIndexSongs(songs, fn) {
    const indexes = [];
    const tags = new Map();
    let i = 0;
    for (const id in songs) {
        i++;
        const song = songs[id];
        if (fn !== undefined) {
            fn(i, song.artist + " - " + song.title);
        }
        indexes.push(createSongIndex(id, song));
        if (song.tags === undefined) {
            continue;
        }
        for (let i = 0; i < song.tags.length; i++) {
            const key = song.tags[i].toLowerCase();
            const entry = tags.get(key);
            if (entry === undefined) {
                tags.set(key, [id]);
                continue;
            }
            entry.push(id);
        }
    }
    return [indexes, tags];
}
export function averageBPM(bpm, durationMS) {
    if (bpm.length === 0) {
        return NaN;
    }
    if (bpm.length === 1) {
        return bpm[0][1];
    }
    const lookup = new Map();
    let highestEntry = [-Infinity, NaN];
    for (let i = 0; i < bpm.length; i++) {
        const end = i + 1 === bpm.length
            ? durationMS
            : bpm[i + 1][0];
        const entry = lookup.get(bpm[i][1]);
        if (entry === undefined) {
            lookup.set(bpm[i][1], [end - bpm[i][0], bpm[i][1]]);
            continue;
        }
        entry[0] += end - bpm[i][0];
        if (entry[0] > highestEntry[0]) {
            highestEntry = entry;
        }
    }
    return highestEntry[1];
}