/* CLIx original recipes. Replace placeholders; examples do not execute in CLIx. */
(() => {
  const docs = {
    jq: 'https://jqlang.org/manual/',
    sqlite: 'https://www.sqlite.org/cli.html',
    duck: 'https://duckdb.org/docs/current/data/csv/overview',
    probe: 'https://ffmpeg.org/ffprobe.html',
    ffmpeg: 'https://ffmpeg.org/ffmpeg.html',
    rg: 'https://github.com/BurntSushi/ripgrep/blob/master/GUIDE.md',
    hash: 'https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/get-filehash'
  };
  const rows = [
    ['json-key-inventory', 'jq keys_unsorted', 'common', 'List the keys of each object in a JSON array. Uses POSIX-shell quoting.', `jq '.[] | keys_unsorted' "{{records.json}}"`, 'jq'],
    ['json-missing-fields', 'jq select missing fields', 'common', 'Show array records whose email field is missing or null. Empty strings are not included. POSIX-shell quoting.', `jq '.[] | select(.email == null)' "{{records.json}}"`, 'jq'],
    ['json-duplicate-ids', 'jq group_by duplicate IDs', 'common', 'Find repeated non-null IDs in a JSON array; output each repeated ID and its count. Uses POSIX-shell quoting.', `jq '[.[] | select(.id != null)] | group_by(.id) | map(select(length > 1) | {id: .[0].id, count: length})' "{{records.json}}"`, 'jq'],
    ['sqlite-inventory', 'sqlite3 -readonly .tables', 'common', 'List table and view names in an existing SQLite database without opening it for writes.', `sqlite3 -readonly "{{database.sqlite}}" ".tables"`, 'sqlite'],
    ['sqlite-schema', 'sqlite3 -readonly .schema', 'common', 'Inspect database schema definitions. Treat names and SQL from unfamiliar files as untrusted input.', `sqlite3 -readonly "{{database.sqlite}}" ".schema"`, 'sqlite'],
    ['sqlite-preview', 'sqlite3 -readonly -header -csv', 'common', 'Preview ten rows as CSV on stdout. Replace the table identifier with a known, trusted name.', `sqlite3 -readonly -header -csv "{{database.sqlite}}" "SELECT * FROM {{table_name}} LIMIT 10;"`, 'sqlite'],
    ['csv-text-preview', 'duckdb read_csv all_varchar', 'common', 'Preview CSV with every column read as text, preserving leading zeros in identifiers. Replace only the file path.', `duckdb -c "SELECT * FROM read_csv('{{data.csv}}', header=true, all_varchar=true) LIMIT 10;"`, 'duck'],
    ['csv-row-count', 'duckdb read_csv count', 'common', 'Count parsed CSV records, not physical lines. Quoted multiline fields are handled by the CSV reader.', `duckdb -c "SELECT count(*) AS rows FROM read_csv('{{data.csv}}', header=true, all_varchar=true);"`, 'duck'],
    ['csv-schema', 'duckdb DESCRIBE read_csv', 'common', 'Inspect column names and inferred types before analysis. Inference is a suggestion; confirm identifier and date columns.', `duckdb -c "DESCRIBE SELECT * FROM read_csv('{{data.csv}}', header=true);"`, 'duck'],
    ['media-duration', 'ffprobe -show_entries format', 'common', 'Print container duration, size and bitrate as JSON. Some formats may not provide all fields.', `ffprobe -v error -show_entries format=duration,size,bit_rate -of json "{{media-file}}"`, 'probe'],
    ['media-video-streams', 'ffprobe -select_streams v', 'common', 'Inspect video codec, dimensions and reported frame rate for each video stream.', `ffprobe -v error -select_streams v -show_entries stream=index,codec_name,width,height,r_frame_rate -of json "{{media-file}}"`, 'probe'],
    ['media-audio-streams', 'ffprobe -select_streams a', 'common', 'Inspect audio codec, sampling rate and channel count without converting the source.', `ffprobe -v error -select_streams a -show_entries stream=index,codec_name,sample_rate,channels -of json "{{media-file}}"`, 'probe'],
    ['media-first-frame', 'ffmpeg -frames:v 1', 'common', 'Save the first decoded video frame as a PNG. Refuse to overwrite an existing output file.', `ffmpeg -n -i "{{input-video}}" -map 0:v:0 -frames:v 1 "{{new-first-frame.png}}"`, 'ffmpeg'],
    ['media-audio-wav', 'ffmpeg -map 0:a:0', 'common', 'Convert the first audio stream to PCM WAV for local analysis. Requires an audio stream; existing output is protected.', `ffmpeg -n -i "{{input-media}}" -map 0:a:0 -c:a pcm_s16le "{{new-audio.wav}}"`, 'ffmpeg'],
    ['media-remux', 'ffmpeg -map 0 -c copy', 'common', 'Copy all streams into a new Matroska container without re-encoding. Unsupported stream types can cause failure; verify the output.', `ffmpeg -n -i "{{input-media}}" -map 0 -c copy "{{new-container.mkv}}"`, 'ffmpeg'],
    ['text-literal-context', 'rg -n -F -C', 'common', 'Find literal text with line numbers and two context lines. Ignore rules and hidden-file exclusions still apply.', `rg -n -F -C 2 -- "{{literal-text}}" "{{folder}}"`, 'rg'],
    ['text-matching-files', 'rg -l -F', 'common', 'List files containing a literal string without printing their matching contents. Ignored and hidden files are excluded by default.', `rg -l -F -- "{{literal-text}}" "{{folder}}"`, 'rg'],
    ['text-json-matches', 'rg --json -F', 'common', 'Emit machine-readable search events for a literal term. The JSON stream includes summary events as well as matches.', `rg --json -F -- "{{literal-text}}" "{{folder}}"`, 'rg'],
    ['file-sha512', 'Get-FileHash -Algorithm SHA512', 'windows', 'Calculate a SHA-512 digest using PowerShell. A digest detects changes only when compared with a trusted reference.', `Get-FileHash -LiteralPath '{{file-path}}' -Algorithm SHA512`, 'hash'],
    ['file-sha256-literal', 'Get-FileHash -LiteralPath -Algorithm SHA256', 'windows', 'Hash a file whose name may contain wildcard characters using a literal PowerShell path.', `Get-FileHash -LiteralPath '{{file-path}}' -Algorithm SHA256`, 'hash']
  ];
  const entries = rows.map(([slug, name, platform, description, code, key]) => ({
    id: 'pack-data/' + slug, name, platform, description, kind: 'recipe', topic: 'data',
    examples: [{description, code}], source: docs[key], docs: docs[key],
    attribution: 'CLIx original task recipe. Syntax checked against linked upstream documentation; check installed versions and shell quoting.'
  }));
  const guides = [
    {id:'data-review-csv',topic:'data',title:'Inspect a CSV before matching records',summary:'Check structure and identifiers before joining two exports.',prerequisites:'DuckDB CLI and local CSV files. Examples assume a header row; paths containing apostrophes require SQL escaping.',steps:[['Preview as text','Read a small sample with all_varchar=true to keep leading zeros. Confirm the delimiter and header before continuing.'],['Count records','Use the CSV reader count rather than line counts; quoted fields may contain line breaks.'],['Review types','Inspect the inferred schema, then explicitly choose types and a match key. Do not silently drop malformed rows.'],['Preserve originals','Run transformations on copies. Record duplicate keys and unmatched rows separately.']],references:['pack-data/csv-text-preview','pack-data/csv-row-count','pack-data/csv-schema'],outcome:'Confirmed column names, record count and a documented match key.',sources:[docs.duck]},
    {id:'data-review-media',topic:'data',title:'Inspect media before conversion',summary:'Choose the right streams and keep the original intact.',prerequisites:'FFmpeg and FFprobe installed; an authorised local media file. Use a maintained build when inspecting untrusted media.',steps:[['Read the container','Check duration and size. Missing fields are not proof of corruption.'],['Inspect streams','List video and audio streams separately; confirm which tracks the task requires.'],['Choose an output','Extract a still or audio track, or remux compatible streams. The recipes refuse to overwrite existing output.'],['Verify the result','Probe the new file and review it locally. Stream copying does not repair every damaged file.']],references:['pack-data/media-duration','pack-data/media-video-streams','pack-data/media-audio-streams','pack-data/media-first-frame','pack-data/media-audio-wav','pack-data/media-remux'],outcome:'A verified derivative with the source preserved.',sources:[docs.probe,docs.ffmpeg]},
    {id:'data-review-json',topic:'data',title:'Check a JSON export for missing and duplicate IDs',summary:'Inspect records before treating an export as a unique population.',prerequisites:'jq and a top-level JSON array of objects. Examples use POSIX-shell quoting; adapt quoting for your shell.',steps:[['Inspect fields','List object keys and confirm the intended identifier exists.'],['Check missing values','Review null or absent fields separately from empty strings.'],['Find duplicate keys','Group records by ID and review counts greater than one. Do not automatically delete records that may represent separate events.']],references:['pack-data/json-key-inventory','pack-data/json-missing-fields','pack-data/json-duplicate-ids'],outcome:'A clear separation of missing fields, repeated IDs and valid records.',sources:[docs.jq]}
  ];
  window.CLIX_PACKS = window.CLIX_PACKS || [];
  window.CLIX_PACKS.push({id:'data', label:'Data & files', prefixes:['jq','sqlite3','duckdb','ffprobe','ffmpeg','rg','sha256sum','sha512sum','get-filehash','file','tar','unzip'], entries, guides});
})();
